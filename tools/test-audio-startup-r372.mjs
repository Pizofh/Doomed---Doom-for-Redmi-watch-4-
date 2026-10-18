// SPDX-License-Identifier: GPL-2.0-only
// Execute baseline loss and candidate scheduling/fault vectors in owned S3.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-ready-source-r351.mjs';
import {session} from './doom-ui-emulator.mjs';
import {startupSfx,startupWorker} from './doom-audio-startup-r372.mjs';
import {doom2Sfx,doom2Worker} from './doom2-source-r384.mjs';import {ultimateSfx} from './doom-ultimate-source-r374.mjs';
const doom2=process.argv[2]==='--doom2-r384';assert(process.argv.length===2||doom2&&process.argv.length===3);
const out=path.join(root,doom2?'build/audio-startup-r384':'build/audio-startup-r372');assert(!fs.existsSync(path.join(out,'result.json')));fs.mkdirSync(out,{recursive:true});
const tc=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-');
function run(tool,args){const r=spawnSync(tc+tool+'.exe',args,{cwd:root,encoding:'utf8',windowsHide:true,shell:false,timeout:15000});assert(!r.error&&r.status===0,r.stderr);return r.stdout;}
const verify=spawnSync(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],{cwd:root,encoding:'utf8',windowsHide:true,shell:false,timeout:15000});assert.equal(verify.status,0);
const sfx=fs.readFileSync(path.join(root,'doom/platform-rw4/audio/doom-sfx.c'),'utf8'),worker=fs.readFileSync(path.join(root,'doom/platform-rw4/audio/sink-worker.c'),'utf8');
fs.writeFileSync(path.join(out,'sfx.c'),startupSfx(doom2?doom2Sfx(ultimateSfx(sfx)):sfx));fs.writeFileSync(path.join(out,'worker.c'),doom2?doom2Worker(worker):startupWorker(worker));
let fixture='experiments/audio/startup-r372.c';
if(doom2){let text=fs.readFileSync(path.join(root,fixture),'utf8').replace('writes<=4','writes<=16').replace('writes==5','writes==(scenario==4?18u:19u)').replace('metric(3)==4','metric(3)==16').replace('metric(0)==1&&','metric(0)==(scenario==4?2u:3u)&&');
 text=text.replace('  rw4_audio_sink_stop();\n }','  if(positive)rw4_audio_sink_stop();else{now+=5;doomed_sfx_update(now);}\n }');fixture=path.join(out,'fixture.c');fs.writeFileSync(fixture,text);}
const flags=['-mthumb','-mfloat-abi=soft','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=4','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4/audio','-Idoom/platform-rw4/device'];
const sources=['doom/platform-rw4/audio/pcm-core.c',path.join(out,'sfx.c'),path.join(out,'worker.c'),'doom/platform-rw4/audio/startup-r372.c',fixture];
const targets=[];
for(const baseline of doom2?[false]:[true,false]){
 const name=baseline?'baseline':'candidate',objects=[];
 const inputs=baseline?[sources[0],'doom/platform-rw4/audio/doom-sfx.c',sources[4]]:sources;
 for(let i=0;i<inputs.length;i++){
  const object=path.join(out,name+'-'+i+'.o');
  run('gcc',['-mcpu=cortex-a7',...flags,...(baseline?['-DTEST_BASELINE']:[]),'-c',inputs[i],'-o',object]);objects.push(object);
  if(!baseline)run('gcc',['-march=armv8-m.main',...flags,'-c',inputs[i],'-o',path.join(out,'rw4-'+i+'.o')]);
 }
 const elf=path.join(out,name+'.elf');run('ld',['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_audio_startup_test_init',...objects,'-o',elf]);
 const meta=run('readelf',['-W','-s','-r',elf]);assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(meta));
 assert([...meta.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].every(m=>m[0]==='R_ARM_ABS32'));targets.push({name,elf});
}
const vm=session('audio-startup'),before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
for(const {name,elf} of targets){
 const remote='/tmp/doomed-startup-r372-'+name+'.elf',module='a372'+name;
 assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
 vm.adb(['push',elf,remote],'push-'+name);
 const copy=path.join(vm.folder,name+'.elf');vm.adb(['pull',remote,copy],'readback-'+name);assert.equal(sha256(fs.readFileSync(copy)),sha256(fs.readFileSync(elf)));
 const loaded=vm.adb(['shell','insmod',remote,module],'run-'+name);assert(!/failed|error/i.test(loaded),loaded);
 assert(vm.adb(['shell','lsmod'],'loaded-'+name).includes(module),'C scheduling assertion failed: '+name);
 vm.adb(['shell','rmmod',module],'unload-'+name);assert.equal(vm.adb(['shell','lsmod'],'after-'+name),before);vm.adb(['shell','rm',remote],'remove-own');
}
const result={passed:true,baselineFirstEffectLostReproduced:!doom2,candidateFirstEffectPreserved:true,exactFirstEffectSamples:64,
 continuousSilenceWhenIdle:doom2,primingBlocks:doom2?16:4,
 cases:['delayed-open','open-error','prime-write-error','stop-during-prime','pause-resume','stop-before-worker','close-quarantine'],
 deterministicScheduling:true,realThreads:false,realEngine:false,rw4Compiled:true,devicePlayback:false,physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
