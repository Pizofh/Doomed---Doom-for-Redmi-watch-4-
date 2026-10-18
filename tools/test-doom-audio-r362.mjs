// SPDX-License-Identifier: GPL-2.0-only
// Real engine/save-load/threads; modeled audio consumer, no sound device opened.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {session} from './doom-ui-emulator.mjs';import {verifyShareware} from './wad-data.mjs';
assert.equal(process.argv.length,2);
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'build/doom-audio-r365/s3-model');
const review=JSON.parse(fs.readFileSync(path.join(out,'review.json'),'utf8')),elf=path.join(out,'doom.elf');
assert.equal(review.mode,'s3-model');assert.equal(review.rw4Executable,false);
assert.equal(createHash('sha256').update(fs.readFileSync(elf)).digest('hex'),review.elfSha256);
assert(!fs.existsSync(path.join(out,'test-result.json')));
const vm=session('doom-audio'),remote='/tmp/rw4-doom-audio-r365.elf',script='/tmp/rw4-doom-audio-r365.lua';
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
for(const p of [remote,script,'/dev/rw4doomready'])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'absence')));
const wad=path.join(vm.folder,'doom1.wad');vm.adb(['pull','/data/app/watchface/market/365799913/lua/doom1.wad',wad],'wad');verifyShareware(fs.readFileSync(wad));
let lua=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/ready-engine-r351.lua'),'utf8');
lua=lua.replaceAll('/tmp/rw4-doom-ready-r351.elf',remote).replaceAll('rw4ready351','rw4audio362');
lua=lua.replace("shell('rmmod rw4audio362')",`assert(s[61]>0 and s[62]>0 and s[63]==532927 and s[64]==0,'audio pipeline/full WAD cache')
print('AUDIO_PCM_STATS',s[61],s[62],s[63],s[64])
shell('rmmod rw4audio362')`);
assert(lua.includes('AUDIO_PCM_STATS'));const local=path.join(vm.folder,'test.lua');fs.writeFileSync(local,lua);
vm.adb(['push',elf,remote],'module');vm.adb(['push',local,script],'fixture');
const cycles=[];
for(let i=0;i<2;i++){
 const text=vm.adb(['shell','lua',script],'cycle-'+i),m=text.match(/AUDIO_PCM_STATS\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
 assert(text.includes('READY_ENGINE_R351_OK')&&m,'Inspect own emulator test log');
 assert.equal(vm.adb(['shell','lsmod'],'after-'+i),before);
 cycles.push({blocks:+m[1],nonSilentBlocks:+m[2],cachedSampleBytes:+m[3],error:+m[4]});
}
for(const p of [remote,script])vm.adb(['shell','rm',p],'remove-own');
const result={passed:true,realDoom:true,realThreads:true,saveLoad:true,pauseResume:true,
 twoCyclesJoinedAndUnloaded:true,modeledAudio:true,devicePlayback:false,physicalWatchUsed:false,cycles};
fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
