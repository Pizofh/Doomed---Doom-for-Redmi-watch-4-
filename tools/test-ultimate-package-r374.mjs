// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {root,sha256,ultimateLauncher} from './doom-ultimate-r374.mjs';
import {prepareDoomUltimate,syntheticRetailUpload,syntheticDoomUpload,packageCopy,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomUltimateEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {assertRetailNativeDispatchReady} from './large-native-dispatch.mjs';
import {createDoomUploadIpcPeer,createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';
import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
import {LargeUploadPcPipe,reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
import {uploadLimits} from './doom-retail-limits-r374.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
const dir=path.join(root,'build/doom-audio-r374/package'),raw=fs.readFileSync(path.join(dir,'DoomUltimate-id-only.face'));
const review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8')),plan=prepareDoomUltimate(raw);
const launcher=ultimateLauncher(fs.readFileSync(path.join(dir,'app/lua/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
assert.equal(launcher.sourceSha256,review.sourceSha256);assert(plan.nativeLauncher&&review.wadIncluded);
assert.equal(sha256(raw),review.sha256);
for(const e of review.entries){const b=fs.readFileSync(path.join(dir,'app/lua',e.name));assert.equal(sha256(b),e.sha256);assert(raw.subarray(e.offset,e.offset+e.size).equals(b));}
for(const at of [0,5,40,review.entries.find(e=>e.name==='doom.wad').offset+1000,raw.length-1]){const b=Buffer.from(raw);b[at]^=1;assert.throws(()=>prepareDoomUltimate(b));}
assert.throws(()=>prepareDoomUltimate(raw.subarray(1)));
const ack=(p,size)=>({status:0,md5:createHash('md5').update(packageCopy(p)).digest(),chunkSize:size,resumePosition:0});
const layout=uploadLayout(plan,ack(plan,2048));assert.equal(layout.total,6405);assert(layout.wireBytes<13400000);
assert(uploadLayout(plan,ack(plan,4080)).total<4096);
assert.deepEqual(uploadLimits(syntheticDoomUpload()),{parts:4096,wireBytes:4900000,uploadMs:600000});
assert(!physicalDoomUltimateEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true}));
assert.throws(()=>assertRetailNativeDispatchReady(),/NativeProfileNotReady/);
for(const action of ['prepare','install']){
 const r=spawnSync(process.execPath,['tools/pc-doom-ultimate-r374.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
 assert.equal(r.status,action==='install'?2:0,r.stderr);assert.equal(JSON.parse(r.stdout).status,action==='install'?'PhysicalGateClosed':'OfflinePrepared');
}
const where=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const d=where(),identity=deploymentIdentity('pc:'+'0'.repeat(64),Buffer.alloc(16));
const j=new DoomDeploymentJournal(plan,identity,{directory:d});assert.equal(path.basename(j.file),'ultimate-r374.jsonl');j.close();disposeDeploymentIdentity(identity);
const results=[];
// Complete 13 MB encrypted/fragmented transfer through the compiled worker;
// all radio endpoints are replaced with an in-process synthetic receiver.
for(const [name,p,ipc,chunkSize]of [['retail-ipc',plan,true,2048],['retail-4080',syntheticRetailUpload(),false,4080],['old-profile',syntheticDoomUpload(),false,2048]]){
 const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(p,{chunkSize});
 const key=Buffer.alloc(16,37),r=await runDoomUploadPc(peer,p,key,{deploymentDirectory:where()}),s=pcPeerSummary(peer);
 assert.equal(r.status,'RegisteredInactive',JSON.stringify(r));assert(r.closeConfirmed&&s.wireVerified);assert(key.every(b=>b===0));
 if(ipc)assert(r.workerExitConfirmed&&r.workerWireVerified);results.push({name,parts:s.massFrames,wireBytes:s.bytes});
}
for(const scenario of ['reject','bad-md5','bad-offset','disconnect','wrong-fw','collision']){
 const peer=createDoomUploadPcPeer(plan,{scenario}),r=await runDoomUploadPc(peer,plan,Buffer.alloc(16,37),{deploymentDirectory:where()});
 assert.equal(r.status,'StoppedNeedsReview');const s=pcPeerSummary(peer);assert.equal(s.massFrames,scenario==='disconnect'?11:0);assert(r.closeConfirmed);
}
// Native partial writes preserve every byte at retail size. Per-call supervision
// still terminates a hung fake service, without waiting the 21-minute session.
const partial=new LargeUploadPcPipe('partial',{retail:true});await partial.opened();
const frame=Buffer.alloc(4096,0x5a);for(let n=0;n<3200;n++)await partial.send(frame);
assert(await partial.summary());assert((await partial.close()).closeConfirmed);
for(const scenario of ['send-zero','idle-timeout','session-timeout','send-hang']){
 const pipe=new LargeUploadPcPipe(scenario,{retail:true,operationMs:200,limitMs:2000});await pipe.opened();
 await assert.rejects(pipe.send(Buffer.alloc(10)));const closed=await pipe.close();assert(closed.workerExitConfirmed);
}
// Dispatch must remain closed even for a syntactically valid target: no lookup.
const gate=spawnSync(reviewedLargeExecutable(),['session-retail-r374'],{input:'AABBCCDDEE01\n',encoding:'utf8',windowsHide:true,timeout:3000});
assert.equal(gate.stdout.trim(),'E:GateClosed');assert.equal(gate.status,2);
const result={passed:true,resources:review.entries.length,tamperRejected:6,transferResults:results,preflightAndTransferFailures:6,partialWriteBytes:3200*4096,
 nativeFailures:4,oldLimitsPreserved:true,installGateClosed:true,physicalWatchUsed:false};
fs.writeFileSync(path.join(root,'build/doom-audio-r374/package-test.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
