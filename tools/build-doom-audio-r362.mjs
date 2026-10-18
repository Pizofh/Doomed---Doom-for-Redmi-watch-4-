// SPDX-License-Identifier: GPL-2.0-only
// Local sound integration. S3 uses modeled audio; physical bindings are separate.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {audioBindings} from './audio-bindings-r363.mjs';
import {recoveryTransport} from './doom-audio-recovery-r368.mjs';
import {menuAdapter,menuTransport,menuEngineSource} from './doom-menu-source-r370.mjs';
import {startupSfx,startupWorker} from './doom-audio-startup-r372.mjs';
import {ultimateProfile,ultimateWadPath,ultimateAdapter,ultimateSlot,ultimateSfx} from './doom-ultimate-source-r374.mjs';
import {packedConfig} from './doom-packed-source-r378.mjs';
import {doom2Profile,doom2Adapter,doom2Slot,doom2Sfx,doom2Worker,doom2PackedConfig} from './doom2-source-r384.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),mode=process.argv[2];
const doom2=process.argv[3]==='--doom2-r384';
const packed=doom2||process.argv[3]==='--packed-r378';
const ultimate=packed||process.argv[3]==='--ultimate-r374';
const startup=ultimate||process.argv[3]==='--startup-r372';
const menu=startup||process.argv[3]==='--menu-r370';
const corrected=menu||process.argv[3]==='--recovery-r369';
const recovery=process.argv[3]==='--recovery-r368'||corrected;
assert((process.argv.length===3||(process.argv.length===4&&recovery))&&['rw4','s3-model','s3-hold'].includes(mode),'Fixed targets');
assert(mode!=='s3-hold'||recovery);
const baselineMode=mode==='s3-hold'?'s3-model':mode;
const checkpoint=doom2?'R384':packed?'R378':ultimate?'R374':startup?'R372':menu?'R370':corrected?'R369':recovery?'R368':'R367';
const out=path.join(root,'build/doom-audio-'+checkpoint.toLowerCase(),mode),old=path.join(root,'build/doom-ready-r351',baselineMode);
assert(!fs.existsSync(path.join(out,'review.json')),'Reviewed output exists');fs.mkdirSync(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const log=[];function run(tool,args,label){const r=spawnSync(tool,args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:2097152});
 log.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(log,null,2));
 assert(!r.error&&r.status===0,label+': '+r.stderr);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'verify');
const baseline=JSON.parse(fs.readFileSync(path.join(old,'review.json'),'utf8'));
assert.equal(hash(fs.readFileSync(path.join(old,'doom.elf'))),baseline.elfSha256);
const recipe=JSON.parse(fs.readFileSync(path.join(old,'build-log.json'),'utf8'));
const args=[...recipe.find(x=>x.label==='link').args];
const gcc=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-gcc.exe');
const ld=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-ld.exe');
const packedData=packed?(doom2?doom2PackedConfig:packedConfig)(mode):null;
if(packed)fs.writeFileSync(path.join(out,'packed-config.h'),packedData.header);
function flags(label){const a=recipe.find(x=>x.label===label).args;return a.slice(0,a.indexOf('-c')).map(v=>ultimate&&v.startsWith('-DRW4_GAME_WAD=')?'-DRW4_GAME_WAD="'+(packed?packedData.gamePath:ultimateWadPath(mode))+'"':v);}
const engineFlags=[...flags('compile-0'),'-Idoom/platform-rw4/audio','-DFEATURE_SOUND'];
const portFlags=[...flags('compile-1'),'-Idoom/platform-rw4/audio',...(mode==='s3-hold'?['-DRW4_AUDIO_HOLD_TEST']:[])];
function compile(source,name,engine=false){const obj=path.join(out,name+'.o');run(gcc,[...(engine?engineFlags:portFlags),...(name==='m_menu'?['-Wno-error=unused-parameter','-Wno-error=unused-but-set-parameter','-Wno-error=enum-conversion']:[]),'-c',source,'-o',obj],name);return obj;}
function once(s,a,b){assert.equal(s.split(a).length,2,a);return s.replace(a,()=>b);}
const input=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/i_sound.c'),'utf8');
let sound=once(input,'#include <SDL_mixer.h>','/* PCM backend needs no SDL. */');
sound=once(sound,'    extern int use_libsamplerate;','');
sound=once(sound,'    extern float libsamplerate_scale;','');
sound=once(sound,'    M_BindVariable("use_libsamplerate",   &use_libsamplerate);','');
sound=once(sound,'    M_BindVariable("libsamplerate_scale", &libsamplerate_scale);','');
fs.writeFileSync(path.join(out,'i_sound.c'),sound);
const soundObject=compile(path.join(out,'i_sound.c'),'i_sound',true);
let adapter=fs.readFileSync(path.join(old,'adapter.c'),'utf8');
adapter=once(adapter,'"-mb","4"','"-mb","3"');
adapter=once(adapter,'#include "platform.h"','#include "platform.h"\n#include "doom-sfx.h"\n#include "sink-worker.h"');
adapter=once(adapter,'waiting=1;paused_at=raw_ticks();','doomed_sfx_pause(1);rw4_audio_sink_pause(1);waiting=1;paused_at=raw_ticks();');
adapter=once(adapter,'paused_ms+=raw_ticks()-paused_at;waiting=0;','paused_ms+=raw_ticks()-paused_at;waiting=0;doomed_sfx_pause(0);rw4_audio_sink_pause(0);');
if(menu)adapter=menuAdapter(adapter);
if(ultimate)adapter=ultimateAdapter(adapter);
if(doom2)adapter=doom2Adapter(adapter);
fs.writeFileSync(path.join(out,'adapter.c'),adapter);
let transport=fs.readFileSync(path.join(old,'transport.c'),'utf8');
transport=once(transport,'#include "platform.h"','#include "platform.h"\n#include "doom-sfx.h"\n#include "sink-worker.h"');
transport=once(transport,'atomic_store(&accepting,0);atomic_store(&applied,0);atomic_store(&requested,0);',
 'doomed_sfx_end();rw4_audio_sink_stop();\n    while(!rw4_audio_sink_quiet())(void)rw4_host_usleep(20000);\n    if(rw4_audio_sink_join())atomic_store(&error,1);\n    atomic_store(&accepting,0);atomic_store(&applied,0);atomic_store(&requested,0);');
transport=once(transport,'snapshot[44]=atomic_load(&tick_cost);',
 'snapshot[60]=rw4_audio_sink_metric(0);snapshot[61]=rw4_audio_sink_metric(1);snapshot[62]=doomed_sfx_cache_bytes();snapshot[63]=rw4_audio_sink_metric(2);\n        snapshot[44]=atomic_load(&tick_cost);');
if(recovery)transport=recoveryTransport(transport);
if(menu)transport=menuTransport(transport);
if(mode==='s3-hold'){
 transport=once(transport,'op>10','op>11');
 transport=once(transport,'if(op==10){','if(op==11){extern void rw4_audio_model_release(void);rw4_audio_model_release();}else if(op==10){');
}
fs.writeFileSync(path.join(out,'transport.c'),transport);
const replacements=new Map([[path.join(old,'ready-0.o'),compile(path.join(out,'adapter.c'),'adapter',true)],
 [path.join(old,'ready-1.o'),compile(path.join(out,'transport.c'),'transport')]]);
const extras=['pcm-core','doom-sfx','doom-module','sink-worker','media-sink'].map(n=>{
 let source='doom/platform-rw4/audio/'+n+'.c';
 if(startup&&(n==='doom-sfx'||n==='sink-worker')){
  let text=fs.readFileSync(path.join(root,source),'utf8');if(ultimate&&n==='doom-sfx')text=ultimateSfx(text);
  source=path.join(out,n+'.c');fs.writeFileSync(source,n==='doom-sfx'?startupSfx(doom2?doom2Sfx(text):text):doom2?doom2Worker(text):startupWorker(text));
 }
 return compile(source,n,n==='doom-module');
});
if(startup)extras.push(compile('doom/platform-rw4/audio/startup-r372.c','startup'));
if(ultimate){
 const source=path.join(out,'slot.c');let slot=ultimateSlot(fs.readFileSync(path.join(root,'doom/platform-rw4/device/slot-r351.c'),'utf8'));if(doom2)slot=doom2Slot(slot);fs.writeFileSync(source,slot);
 replacements.set(path.join(old,'ready-3.o'),compile(source,'slot'));
}
let runtimeObject=path.join(old,'ready-2.o');
if(packed){
 const source=path.join(out,'runtime.c');fs.copyFileSync(path.join(old,'runtime.c'),source);
 const obj=path.join(out,'runtime.o'),io=['fopen','fclose','fread','fseek','ftell','feof','ferror','clearerr'];
 const options=flags('compile-2').map(v=>io.reduce((a,n)=>a==='-D'+n+'=rw4_host_'+n?'-D'+n+'=rw4_packed_'+n:a,v));
 run(gcc,[...options,'-c',source,'-o',obj],'runtime');runtimeObject=obj;
 if(mode!=='rw4')replacements.set(path.join(old,'ready-2.o'),obj);
 for(const [src,name]of [['doom/platform-rw4/packed/reader-r378.c','packed-reader'],['third_party/tinf-r378/tinflate.c','tinflate']]){
  const object=path.join(out,name+'.o');run(gcc,[...portFlags,'-DNDEBUG',...(name==='tinflate'?['-Wno-error=sign-compare']:[]),'-I'+out,'-Idoom/platform-rw4/packed','-Ithird_party/tinf-r378','-c',src,'-o',object],name);extras.push(object);
 }
}
let menuObject;
if(menu){
 const input=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/m_menu.c'),'utf8');
 fs.writeFileSync(path.join(out,'m_menu.c'),menuEngineSource(input));menuObject=compile(path.join(out,'m_menu.c'),'m_menu',true);
}
if(recovery)extras.push(compile('doom/platform-rw4/device/direct-detach-r368.c','direct-detach'));
if(mode!=='rw4'){
 replacements.set(path.join(root,'build/doom-ram-s3/i_sound.o'),soundObject);
 if(menu)replacements.set(path.join(root,'build/doom-ram-s3/m_menu.o'),menuObject);
 extras.push(compile('doom/platform-rw4/audio/media-model.c','media-model'));
}else{
 const generated=audioBindings(root);fs.writeFileSync(path.join(out,'audio-bindings.c'),generated.source);
 fs.writeFileSync(path.join(out,'audio-bindings.json'),JSON.stringify(generated.records,null,2)+'\n');
 extras.push(compile(path.join(out,'audio-bindings.c'),'audio-bindings'));
 const names=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8').match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).filter(n=>n!=='doomgeneric_xlib.o');
 assert.equal(names.length,80);
 const objects=names.map(n=>n==='i_sound.o'?soundObject:n==='m_menu.o'&&menu?menuObject:path.join(root,'build/doom-rw4-engine',n));
 const engine=path.join(out,'engine-libc.o'),libraries=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-libc/review.json'),'utf8')).libraries;
 for(const l of libraries){l.file=run(gcc,['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-print-file-name='+l.name],l.name).trim();assert.equal(hash(fs.readFileSync(l.file)),l.sha256);}
 run(ld,['-r','-d','-T','doom/platform-rw4/device/module.ld',...objects,
  runtimeObject,path.join(root,'build/doom-rw4-engine/jump.o'),path.join(root,'build/doom-rw4-libc/glue.o'),
  '--start-group',...libraries.map(l=>l.file),'--end-group','-o',engine],'engine');
 replacements.set(path.join(old,'engine-libc.o'),engine);
}
const elf=path.join(out,'doom.elf'),link=args.map(p=>replacements.get(p)??(p===path.join(old,'doom.elf')?elf:p));
for(const p of replacements.keys())assert(args.includes(p),'Missing replacement '+p);
link.splice(link.indexOf('--start-group'),0,...extras);run(ld,link,'link');
const readelf=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-readelf.exe');
const meta=run(readelf,['-W','-h','-A','-s','-r',elf],'readelf');
assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(meta));fs.writeFileSync(path.join(out,'readelf.txt'),meta);
const sources=['pcm-core.c','doom-sfx.c','doom-module.c','sink-worker.c','media-sink.c',mode==='rw4'?'media-sink.h':'media-model.c'];
const result={checkpoint,mode,elfBytes:fs.statSync(elf).size,elfSha256:hash(fs.readFileSync(elf)),
 doom2:doom2?{profile:doom2Profile,sourceSha256:hash(fs.readFileSync(path.join(root,'tools/doom2-source-r384.mjs')))}:null,
 packed:packed?{...packedData,readerSha256:hash(fs.readFileSync(path.join(root,'doom/platform-rw4/packed/reader-r378.c'))),runtimeSha256:hash(fs.readFileSync(path.join(out,'runtime.c')))}:null,
 ultimate:ultimate?{profile:ultimateProfile,wadPath:packed?packedData.gamePath:ultimateWadPath(mode),slotSourceSha256:hash(fs.readFileSync(path.join(out,'slot.c'))),sourceSha256:hash(fs.readFileSync(path.join(root,'tools/doom-ultimate-source-r374.mjs')))}:null,
 baselineSha256:baseline.elfSha256,audio:mode==='rw4'?'candidate managed media':'modeled managed media service, not playback',realEngine:true,
 sourceHashes:Object.fromEntries(sources.map(p=>[p,hash(fs.readFileSync(path.join(root,'doom/platform-rw4/audio',p)))])),
 generatedHashes:{adapter:hash(adapter),transport:hash(transport),...(menu?{menu:hash(fs.readFileSync(path.join(out,'m_menu.c')))}:{}),...(startup?Object.fromEntries(['doom-sfx','sink-worker'].map(n=>[n,hash(fs.readFileSync(path.join(out,n+'.c')))])):{})},
 startupSourceHashes:startup?Object.fromEntries(['tools/doom-audio-startup-r372.mjs','doom/platform-rw4/audio/startup-r372.c','doom/platform-rw4/audio/startup-r372.h'].map(p=>[p,hash(fs.readFileSync(path.join(root,p)))])):{},
 menuSourceHashes:menu?Object.fromEntries(['tools/doom-menu-source-r370.mjs','doom/platform-rw4/device/menu-input-r370.c','third_party/doomgeneric/doomgeneric/m_menu.c'].map(p=>[p,hash(fs.readFileSync(path.join(root,p)))])):{},
 recoverySourceHashes:recovery?Object.fromEntries(['doom/platform-rw4/device/direct-detach-r368.c','doom/platform-rw4/device/direct-detach-r368.h','tools/doom-audio-recovery-r368.mjs'].map(p=>[p,hash(fs.readFileSync(path.join(root,p)))])):{},zoneMiB:3,
 rw4Executable:mode==='rw4',physicalDeploymentAuthorized:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
