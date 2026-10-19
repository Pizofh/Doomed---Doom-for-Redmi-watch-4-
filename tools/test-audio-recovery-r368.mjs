// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';
import {session} from './doom-ui-emulator.mjs';
const tune=process.argv[2]==='--doom2-tune-r387',adpcm=tune||process.argv[2]==='--doom2-adpcm-r386',doom2=adpcm||process.argv[2]==='--doom2-r384',packed=doom2||process.argv[2]==='--packed-r378',ultimate=packed||process.argv[2]==='--ultimate-r374',corrected=process.argv[2]==='--r369';assert(process.argv.length===2||(process.argv.length===3&&(corrected||ultimate)));
const out=path.join(root,tune?'build/doom-audio-r387/s3-hold':adpcm?'build/doom-audio-r386/s3-hold':doom2?'build/doom-audio-r384/s3-hold':packed?'build/doom-audio-r378/s3-hold':ultimate?'build/doom-audio-r374/s3-hold':corrected?'build/doom-audio-r369/s3-hold':'build/doom-audio-r368/s3-hold'),elf=path.join(out,'doom.elf');
const review=JSON.parse(fs.readFileSync(path.join(out,'review.json'),'utf8'));
assert.equal(sha256(fs.readFileSync(elf)),review.elfSha256);assert.equal(review.mode,'s3-hold');
assert(!fs.existsSync(path.join(out,'test-result.json')));
const vm=session('audio-held-recovery'),remote='/tmp/doomed-held-r368.elf',script='/tmp/doomed-held-r368.lua';
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
for(const p of [remote,script,'/dev/rw4doomready'])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'absence')));
let fixture=fs.readFileSync(path.join(root,'experiments/audio/held-service-r368.lua'),'utf8');
if(ultimate)fixture=fixture.replaceAll('read(256)','read(288)').replaceAll('#data==256','#data==288').replaceAll("rep('I4',64)","rep('I4',72)").replaceAll('s[2]==7','s[2]==8');
if(packed)fixture=fixture.replace('for _=1,80 do','for _=1,400 do');
const local=path.join(out,'held-fixture.lua');fs.writeFileSync(local,fixture);
vm.adb(['push',elf,remote],'module');vm.adb(['push',local,script],'fixture');
const resultText=vm.adb(['shell','lua',script],'test');
assert(resultText.includes('HELD_SERVICE_R368_OK')&&!resultText.includes('stack traceback'),'Inspect owned guest recovery log');
assert.equal(vm.adb(['shell','lsmod'],'after'),before);
for(const p of [remote,script])vm.adb(['shell','rm',p],'remove-own');
const result={passed:true,realDoom:true,realThreads:true,heldCalls:['prepare','close'],
 imageRemovedBeforeGameJoin:true,gameJoinsWhileAudioBlocked:true,unloadRefusedWhileAudioBlocked:true,
 cleanupAfterExplicitFakeServiceRelease:true,graphics:'modeled',deviceAudio:false,physicalWatchUsed:false,
 elfSha256:review.elfSha256};
fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
