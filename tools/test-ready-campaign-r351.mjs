// All nine shareware maps, real S3 engine/threads and bounded save/load.
// Test-only adapter changes the initial -warp argument; never packaged.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-ready-r351.mjs';import {session} from './doom-ui-emulator.mjs';
assert(process.argv.length===2);const dir=path.join(root,'build/doom-ready-r351/s3-model'),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'))),logs=JSON.parse(fs.readFileSync(path.join(dir,'build-log.json'))),tc=path.join(root,'tools/local/arm-14.3-review/bin');
assert.equal(sha256(fs.readFileSync(path.join(dir,'doom.elf'))),review.elfSha256);
const adapter=fs.readFileSync(path.join(dir,'adapter.c'),'utf8');assert.equal(sha256(adapter),review.generatedHashes.adapter);
const out=path.join(root,'artifacts/research/ready-campaign-r351');assert(!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
const s=session('ready-campaign-tests'),remote='/tmp/rw4-ready351-map.elf',script='/tmp/rw4-ready351-map.lua',node='/dev/rw4doomready';
const absent=p=>/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',p],'absence'));
const before=s.adb(['shell','lsmod'],'before');assert(before.trim().split(/\r?\n/).length===1);for(const p of [remote,script,node,'/dev/rw4doomslot'])assert(absent(p));
function run(name,args){const r=spawnSync(path.join(tc,'arm-none-eabi-'+name+'.exe'),args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:8388608});assert(!r.error&&r.status===0,r.stderr);}
const prelude=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/ready-engine-r351.lua'),'utf8').split("shell('insmod")[0];const maps=[];
for(let map=1;map<=9;map++){
 const src=path.join(out,'adapter-'+map+'.c'),obj=path.join(out,'adapter-'+map+'.o'),elf=path.join(out,'map-'+map+'.elf');assert.equal(adapter.split('"1","1","-skill"').length,2);fs.writeFileSync(src,adapter.replace('"1","1","-skill"','"1","'+map+'","-skill"'));
 run('gcc',logs.find(x=>x.label==='compile-0').args.map(p=>p===path.join(dir,'adapter.c')?src:p===path.join(dir,'ready-0.o')?obj:p));
 run('ld',logs.find(x=>x.label==='link').args.map(p=>p===path.join(dir,'doom.elf')?elf:p===path.join(dir,'ready-0.o')?obj:p));
 const code=prelude+`shell('insmod ${remote} rw4ready351map')
state();command(1);local ready
for _=1,80 do local v=state();if v[5]==1 then ready=v;break end;if v[6]==1 then error('worker stopped before map')end;wait()end
assert(ready and ready[36]==1 and ready[37]==${map},'map startup');present();wait();command(3);for _=1,3 do wait()end
command(8);local saved
for _=1,30 do wait();local v=state();if v[56]==0 and v[55]==8 then assert(v[57]==0 and v[58]==1);saved=v;break end end
assert(saved,'map save');command(9)
local loaded=false;for _=1,30 do wait();local v=state();if v[56]==0 and v[55]==9 then assert(v[57]==0 and v[37]==${map});loaded=true;break end end;assert(loaded,'map load timeout')
command(4);local ended
for _=1,30 do local v=state();if v[6]==1 then ended=v;break end;wait()end
assert(ended);command(5);local v=state();assert(v[7]==1 and v[30]==1 and v[27]==2 and v[18]==v[19] and v[20]==0 and v[15]==1)
print('MAP_READY_OK',${map},saved[59],v[17],v[18],v[19]);shell('rmmod rw4ready351map')
`;
 const file=path.join(out,'map-'+map+'.lua');fs.writeFileSync(file,code);s.adb(['push',elf,remote],'map-elf');s.adb(['push',file,script],'map-script');const text=s.adb(['shell','lua',script],'map-'+map),m=text.match(/MAP_READY_OK\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);assert(m&&!text.includes('stack traceback'),text.slice(-1000));assert.equal(s.adb(['shell','lsmod'],'after-map'),before);assert(absent(node)&&absent('/dev/rw4doomslot'));
 maps.push({map:+m[1],saveBytes:+m[2],peak:+m[3],allocated:+m[4],freed:+m[5]});for(const p of [remote,script])s.adb(['shell','rm',p],'remove-own');console.log('Map',map,'passed');
}
const result={passed:true,maps,realEngine:true,allSharewareMapsStartSaveLoad:true,wholeCampaignPlaythrough:false,physicalTransport:false};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
