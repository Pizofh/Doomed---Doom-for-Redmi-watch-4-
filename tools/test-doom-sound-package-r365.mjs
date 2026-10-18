// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {soundLauncher,root,sha256} from './doom-sound-r365.mjs';
import {prepareDoomSound} from './doom-large-upload.mjs';import {physicalDoomSoundEnabled} from './doom-deployment-physical.mjs';
import {session} from './doom-ui-emulator.mjs';
import {audioLauncher} from './doom-audio-r367.mjs';import {prepareDoomAudio} from './doom-large-upload.mjs';
import {physicalDoomAudioEnabled} from './doom-deployment-physical.mjs';import {assertLargeNativeDispatchReady} from './large-native-dispatch.mjs';
import {randomUUID} from 'node:crypto';import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
const corrected=process.argv.length===3&&process.argv[2]==='--r367';assert(process.argv.length===2||corrected);
const version=corrected?'r367':'r365',prepare=corrected?prepareDoomAudio:prepareDoomSound;
const dir=path.join(root,'build/doom-audio-'+version+'/package');
const bytes=fs.readFileSync(path.join(dir,(corrected?'DoomAudio':'DoomSound')+'-id-only.face')),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8'));
const plan=prepare(bytes),elf=fs.readFileSync(path.join(dir,'app/lua/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));
const p=(corrected?audioLauncher:soundLauncher)(elf,wad);assert.equal(p.sourceSha256,review.sourceSha256);assert.equal(p.config.id,corrected?'365219938':'365219939');assert.equal(plan.nativeLauncher,true);
assert(bytes.includes(Buffer.from(p.source)));assert.equal(review.wadIncluded,false);
for(const e of review.entries){const b=fs.readFileSync(path.join(dir,'app/lua',e.name));assert.equal(sha256(b),e.sha256);assert(bytes.subarray(e.offset,e.offset+e.size).equals(b));}
for(const at of [0,5,40,bytes.length-1]){const b=Buffer.from(bytes);b[at]^=1;assert.throws(()=>prepare(b));}
assert.throws(()=>prepare(bytes.subarray(1)));assert.equal((corrected?physicalDoomAudioEnabled:physicalDoomSoundEnabled)(),false);
if(corrected){
 assert.throws(()=>assertLargeNativeDispatchReady(),/NativeProfileNotReady/);
 const where=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),identity=deploymentIdentity('pc:'+'0'.repeat(64),Buffer.alloc(16));
 const j=new DoomDeploymentJournal(plan,identity,{directory:where});assert.equal(path.basename(j.file),'audio-r367.jsonl');j.close();disposeDeploymentIdentity(identity);
 assert(!fs.existsSync(path.join(where,'watch.lock')));assert(!fs.existsSync(path.join(where,'transfer.jsonl')));
}
for(const action of ['install','prepare']){const r=spawnSync(process.execPath,[corrected?'tools/pc-doom-audio-r367.mjs':'tools/pc-doom-sound-r365.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
 assert.equal(r.status,action==='install'?2:0,r.stderr);const output=JSON.parse(r.stdout);assert.equal(output.status,action==='install'?'PhysicalGateClosed':'OfflinePrepared');assert.equal(output.filesTransferred,false);}
const vm=session('sound-lua-syntax'),remote='/tmp/doomed-sound-main-r365.lua',script='/tmp/doomed-sound-syntax-r365.lua';
for(const f of [remote,script])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',f],'absence')));
const syntax=path.join(vm.folder,'syntax.lua');fs.writeFileSync(syntax,"assert(loadfile('"+remote+"'));print('SOUND_LUA_SYNTAX_OK')\n");
vm.adb(['push',path.join(dir,'app/lua/main.lua'),remote],'main');vm.adb(['push',syntax,script],'syntax');
assert(vm.adb(['shell','lua',script],'parse-only').includes('SOUND_LUA_SYNTAX_OK'));
for(const f of [remote,script])vm.adb(['shell','rm',f],'remove-own');
console.log(JSON.stringify({passed:true,resources:review.entries.length,tamperRejected:5,luaParsed:true,installGateClosed:true,offlinePrepare:true,physicalWatchUsed:false}));
