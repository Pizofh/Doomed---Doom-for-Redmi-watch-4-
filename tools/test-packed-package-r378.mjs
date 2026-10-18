// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';import {root,sha256,packedLauncher} from './doom-packed-r378.mjs';
import {prepareDoomPacked,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomPackedEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';import {assertRetailNativeDispatchReady} from './large-native-dispatch.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {createDoomUploadIpcPeer,createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
const dir=path.join(root,'build/doom-audio-r378/package'),raw=fs.readFileSync(path.join(dir,'DoomPacked-id-only.face')),plan=prepareDoomPacked(raw);
const review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8'));
const p=packedLauncher(fs.readFileSync(path.join(dir,'app/lua/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
assert(plan.nativeLauncher&&review.wadIncluded);assert.equal(p.sourceSha256,review.sourceSha256);
for(const e of review.entries){const b=fs.readFileSync(path.join(dir,'app/lua',e.name));assert.equal(sha256(b),e.sha256);assert(raw.subarray(e.offset,e.offset+e.size).equals(b));}
for(const at of [0,5,40,review.entries.find(e=>e.name==='doom-r378.wad').offset+5000,raw.length-1]){const b=Buffer.from(raw);b[at]^=1;assert.throws(()=>prepareDoomPacked(b));}
assert.throws(()=>prepareDoomPacked(raw.subarray(1)));
const layout=uploadLayout(plan,{status:0,md5:createHash('md5').update(raw).digest(),chunkSize:2048,resumePosition:0});assert.equal(layout.total,3017);
const where=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const d=where(),identity=deploymentIdentity('pc:'+'0'.repeat(64),Buffer.alloc(16,37)),j=new DoomDeploymentJournal(plan,identity,{directory:d});
assert.equal(path.basename(j.file),'packed-r378.jsonl');j.close();
for(const option of ['resume','retryWithoutData','afterSpace','afterCatalog'])assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:where(),[option]:true}));
disposeDeploymentIdentity(identity);
assert(!physicalDoomPackedEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,packed:true}));assert.throws(()=>assertRetailNativeDispatchReady(),/NativeProfileNotReady/);
for(const action of ['prepare','install']){
 const r=spawnSync(process.execPath,['tools/pc-doom-packed-r378.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
 assert.equal(r.status,action==='install'?2:0,r.stderr);assert.equal(JSON.parse(r.stdout).status,action==='install'?'PhysicalGateClosed':'OfflinePrepared');
}
// Default synthetic catalog has no shareware carrier: this package is standalone.
const endpoint=createDoomUploadIpcPeer(plan),key=Buffer.alloc(16,37),r=await runDoomUploadPc(endpoint,plan,key,{deploymentDirectory:where()}),s=pcPeerSummary(endpoint);
assert.equal(r.status,'RegisteredInactive',JSON.stringify(r));assert(r.closeConfirmed&&r.workerExitConfirmed&&r.workerWireVerified&&s.wireVerified);assert(key.every(b=>b===0));
for(const scenario of ['wrong-fw','collision','reject','bad-md5','disconnect']){
 const peer=createDoomUploadPcPeer(plan,{scenario}),failed=await runDoomUploadPc(peer,plan,Buffer.alloc(16,37),{deploymentDirectory:where()});
 assert.equal(failed.status,'StoppedNeedsReview');assert.equal(pcPeerSummary(peer).massFrames,scenario==='disconnect'?11:0);assert(failed.closeConfirmed);
}
const result={passed:true,resources:review.entries.length,tamperRejected:6,ipcParts:s.massFrames,wireBytes:s.bytes,selfContainedWithoutCarrier:true,
 journalIsolated:true,retryModesRejected:4,negativeTransfers:5,physicalGateClosed:true,physicalWatchUsed:false};
fs.writeFileSync(path.join(root,'build/doom-audio-r378/package-test.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
