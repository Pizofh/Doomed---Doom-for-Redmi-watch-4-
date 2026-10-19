// SPDX-License-Identifier: GPL-2.0-only
// Offline only: reuse the pinned R394 S3 engine and replace instrumented objects.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-monster-r390.mjs';import {session} from './doom-ui-emulator.mjs';
import {textureHeaders,spriteHeaders,cachedTextureHeaders} from './doom-texture-headers-r395.mjs';
const variant=process.argv[2]??'baseline';assert(['baseline','headers','sprites','metadata','baseline-check','metadata-check'].includes(variant));assert(process.argv.length===(variant==='baseline'?2:3));const checking=variant.endsWith('-check'),optimized=variant.startsWith('metadata');
const out=path.join(root,'build/doom-init-r395'+(variant==='baseline'?'':'-'+variant)),base=path.join(root,'build/doom-audio-r394/s3-model');
assert(!fs.existsSync(path.join(out,'result.json')));fs.mkdirSync(out,{recursive:true});
const recipe=JSON.parse(fs.readFileSync(path.join(base,'build-log.json'))),review=JSON.parse(fs.readFileSync(path.join(base,'review.json')));
assert.equal(sha256(fs.readFileSync(path.join(base,'doom.elf'))),review.elfSha256);
const gcc=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-gcc.exe'),ld=gcc.replace('gcc.exe','ld.exe'),logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:1048576});logs.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));assert(!r.error&&r.status===0,label+': '+r.stderr);}
function once(s,a,b){assert.equal(s.split(a).length,2,a);return s.replace(a,()=>b);}
const header=`#include <stdatomic.h>\n#include <stdint.h>\nextern uint64_t rw4_host_clock_ticks(void);\nextern atomic_uint init_profile395[8];\nstatic uint32_t init_clock395(void){return (uint32_t)(rw4_host_clock_ticks()/10u);}\n`;
const replacements=new Map();
function object(name,source,template,original){const file=path.join(out,name+'.c'),obj=path.join(out,name+'.o');fs.writeFileSync(file,source);const a=recipe.find(r=>r.label===template).args;run(gcc,[...a.slice(0,a.indexOf('-c')),'-Wno-error=unused-function','-Wno-error=sign-compare','-c',file,'-o',obj],name);replacements.set(original??path.join(base,name+'.o'),obj);}
let main=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/d_main.c'),'utf8');
for(const [call,slot]of [['R_Init ();',0],['S_Init (sfxVolume * 8, musicVolume * 8);',1]])main=once(main,call,`{uint32_t t=init_clock395();${call}atomic_store(&init_profile395[${slot}],init_clock395()-t);}`);
object('d_main',header+main,'adapter',path.join(root,'build/doom-ram-s3/d_main.o'));
if(variant!=='baseline'){
 let data=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/r_data.c'),'utf8');
 if(variant==='headers'||variant==='sprites')data=textureHeaders(data);
 if(variant==='sprites'||optimized){const wad=fs.readFileSync(path.join(root,'build/doom2-r384/doom2.wad'));assert.equal(sha256(wad),'10d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255');if(optimized)data=cachedTextureHeaders(data,wad).source;data=spriteHeaders(data,wad).source;}
 if(checking){
 data=once(data,'void R_InitData (void)',`extern atomic_uint init_digest395[2];
static uint32_t fold395(uint32_t h,uint32_t v){for(unsigned i=0;i<4;i++){h=(h^(v&255u))*16777619u;v>>=8;}return h;}
static void digest395(void){
 uint32_t h=fold395(2166136261u,(unsigned)numtextures);
 for(int i=0;i<numtextures;i++){
  h=fold395(h,(unsigned)textures[i]->width);h=fold395(h,(unsigned)textures[i]->height);h=fold395(h,(unsigned)texturecompositesize[i]);
  for(int x=0;x<textures[i]->width;x++){h=fold395(h,(unsigned)texturecolumnlump[i][x]);h=fold395(h,(unsigned)texturecolumnofs[i][x]);}
 }atomic_store(&init_digest395[0],h);h=fold395(2166136261u,(unsigned)numspritelumps);
 for(int i=0;i<numspritelumps;i++){h=fold395(h,(unsigned)spritewidth[i]);h=fold395(h,(unsigned)spriteoffset[i]);h=fold395(h,(unsigned)spritetopoffset[i]);}
 atomic_store(&init_digest395[1],h);
}
void R_InitData (void)`);
 data=once(data,'    R_InitColormaps ();','    R_InitColormaps ();digest395();');data=header+data;
 }
 object('r_data',data,'adapter',path.join(root,'build/doom-ram-s3/r_data.o'));
}
let sound=fs.readFileSync(path.join(root,'doom/platform-rw4/audio/doom-module.c'),'utf8');
sound=once(sound,'void *data=W_CacheLumpNum(index,PU_STATIC);','uint32_t t=init_clock395();void *data=W_CacheLumpNum(index,PU_STATIC);atomic_fetch_add(&init_profile395[2],init_clock395()-t);t=init_clock395();');
sound=once(sound,'(void)doomed_sfx_cache((unsigned)i,data,(unsigned)length);','(void)doomed_sfx_cache((unsigned)i,data,(unsigned)length);atomic_fetch_add(&init_profile395[3],init_clock395()-t);');
object('doom-module',header+sound,'doom-module');
let reader=fs.readFileSync(path.join(base,'packed-reader.c'),'utf8');
reader=once(reader,'if(which>=RW4_PACK_PAGES)return -1;','uint32_t t=init_clock395();atomic_fetch_add(&init_profile395[5],1);if(which>=RW4_PACK_PAGES)return -1;');
reader=once(reader,'if(crc(page[slot],raw)!=u32(e+12))return -1;','atomic_fetch_add(&init_profile395[6],n);if(crc(page[slot],raw)!=u32(e+12))return -1;atomic_fetch_add(&init_profile395[4],init_clock395()-t);');
object('packed-reader',header+reader,'packed-reader');
let adapter=fs.readFileSync(path.join(base,'adapter.c'),'utf8');
adapter=once(adapter,'doomgeneric_Create(5,argv);uint32_t load_created=raw_ticks();','doomgeneric_Create(5,argv);uint32_t load_created=raw_ticks();atomic_store(&init_profile395[7],load_created-load_checked);');
object('adapter',header+'atomic_uint init_profile395[8],init_digest395[2];\n'+adapter,'adapter');
let transport=fs.readFileSync(path.join(base,'transport.c'),'utf8');
transport=once(transport,'snapshot[64+i]=atomic_load(&menu_metrics[i]);','snapshot[64+i]=atomic_load(&init_profile395[i]);');if(checking)transport=once(transport,'rw4_direct_backend_stats(snapshot+48);','extern atomic_uint init_digest395[2];snapshot[60]=atomic_load(&init_digest395[0]);snapshot[61]=atomic_load(&init_digest395[1]);rw4_direct_backend_stats(snapshot+48);');object('transport',header+transport,'transport');
const elf=path.join(out,'doom.elf'),link=recipe.find(r=>r.label==='link').args.map(a=>replacements.get(a)??(a===path.join(base,'doom.elf')?elf:a));for(const p of replacements.keys())assert(recipe.find(r=>r.label==='link').args.includes(p));run(ld,link,'link');
const vm=session('init-profile'),before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
const carrier='/data/app/watchface/market/365220011',remote='/tmp/rw4-init395.elf',script='/tmp/rw4-init395.lua';
for(const p of [carrier,remote,script])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'absence')));
for(const p of [carrier,carrier+'/lua'])vm.adb(['shell','mkdir',p],'own-dir');
const wad=path.join(root,'build/doom2-r384/doom.rwc');assert.equal(sha256(fs.readFileSync(wad)),'15db36b4806b99138ed4c2d1fd31b7b594470a778f52e51a760be9c8397a7ece');vm.adb(['push',wad,carrier+'/lua/doom2-r384.wad'],'own-wad');vm.adb(['push',elf,remote],'own-elf');
const code=`local seq=0
local function state()local f=assert(io.open('/dev/rw4doomready','rb'));f:setvbuf('no');local b=assert(f:read(288));assert(f:close());local s={string.unpack('<'..string.rep('I4',72),b)};seq=s[3];return s end
local function cmd(op)local f=assert(io.open('/dev/rw4doomready','r+b'));f:setvbuf('no');assert(f:write(string.pack('<I4I4I4I4',0x36445752,seq+1,op,0)));assert(f:close());seq=seq+1 end
for cycle=1,2 do
 assert(os.execute('insmod ${remote} init395'));state();cmd(1);local ready
 for _=1,1600 do local s=state();if s[5]==1 then ready=s;break end;if s[6]==1 then break end;assert(os.execute('usleep 20000'))end
 cmd(10);cmd(4);for _=1,500 do local s=state();if s[6]==1 and s[47]==1 then if s[7]~=1 then cmd(5)end;break end;assert(os.execute('usleep 20000'))end
 local closed=state();assert(closed[7]==1 and closed[20]==0 and closed[18]==closed[19]);assert(os.execute('rmmod init395'));assert(ready and ready[8]==0)
 local v={};for i=65,72 do v[#v+1]=ready[i]end;print('INIT_PROFILE395',cycle,table.concat(v,','));print('INIT_DIGEST395',ready[61],ready[62])
end
print('INIT_PROFILE395_CLOSED')`;
const local=path.join(out,'probe.lua');fs.writeFileSync(local,code);vm.adb(['push',local,script],'probe');const text=vm.adb(['shell','lua',script],'measure',{timeoutMs:45000});assert(text.includes('INIT_PROFILE395_CLOSED')&&!text.includes('stack traceback'),text.slice(-2000));assert.equal(vm.adb(['shell','lsmod'],'after'),before);
const fields=['renderMs','soundInitMs','soundReadMs','soundEncodeMs','pageLoadMs','pageMisses','compressedPageBytes','createMs'];const runs=[...text.matchAll(/INIT_PROFILE395\s+(\d+)\s+([\d,]+)/g)].map(m=>({cycle:+m[1],...Object.fromEntries(m[2].split(',').map((n,i)=>[fields[i],+n]))}));assert.equal(runs.length,2);
for(const p of [remote,script,carrier+'/lua/doom2-r384.wad'])vm.adb(['shell','rm',p],'own-remove');for(const p of [carrier+'/lua',carrier])vm.adb(['shell','rmdir',p],'own-empty-dir');
const digests=[...text.matchAll(/INIT_DIGEST395\s+(\d+)\s+(\d+)/g)].map(m=>[+m[1],+m[2]]);if(checking){assert.equal(digests.length,2);assert.deepEqual(digests[0],digests[1]);if(optimized)assert.deepEqual(digests,JSON.parse(fs.readFileSync(path.join(root,'build/doom-init-r395-baseline-check/result.json'))).digests);}
const result={passed:true,physicalWatchUsed:false,modeledAudioAndGraphics:true,runs,digests:checking?digests:undefined,elfSha256:sha256(fs.readFileSync(elf)),baselineSha256:review.elfSha256};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

