// SPDX-License-Identifier: GPL-2.0-only
// Full C# pipe transfer against a synthetic watch, never Bluetooth.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {createHash,randomUUID} from 'node:crypto';
import {root,sha256,doom2Launcher} from './doom2-r384.mjs';import {prepareDoomII,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomIIEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';import {assertRetailNativeDispatchReady} from './large-native-dispatch.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {createDoomUploadIpcPeer,createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
const dir=path.join(root,'build/doom2-r384/package'),b=fs.readFileSync(path.join(dir,'DoomII-id-only.face')),plan=prepareDoomII(b),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8'));
const p=doom2Launcher();assert(plan.nativeLauncher&&review.wadIncluded&&review.manualStartOnly);assert.equal(p.sourceSha256,review.sourceSha256);
assert.equal(p.config.base,p.config.ui_base);assert.equal(p.config.assets_base,p.config.base);
for(const e of review.entries){const data=fs.readFileSync(path.join(dir,'app/lua',e.name));assert.equal(sha256(data),e.sha256);assert(b.subarray(e.offset,e.offset+e.size).equals(data));}
for(const at of [0,5,40,review.entries.find(e=>e.name==='doom2-r384.wad').offset+5000,b.length-1]){const bad=Buffer.from(b);bad[at]^=1;assert.throws(()=>prepareDoomII(bad));}assert.throws(()=>prepareDoomII(b.subarray(1)));
const layout=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});
const where=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),identity=deploymentIdentity('pc:'+'0'.repeat(64),Buffer.alloc(16,37));
const journal=new DoomDeploymentJournal(plan,identity,{directory:where()});assert.equal(path.basename(journal.file),'doom2-r384.jsonl');journal.close();
for(const opt of ['resume','retryWithoutData','afterSpace','afterCatalog','restartPacked','resumePacked'])assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:where(),[opt]:true}));disposeDeploymentIdentity(identity);
assert(!physicalDoomIIEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,doom2:true}));assert.throws(()=>assertRetailNativeDispatchReady(),/NativeProfileNotReady/);
for(const action of ['prepare','install']){const r=spawnSync(process.execPath,['tools/pc-doom2-r384.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(r.status,action==='install'?2:0,r.stderr);assert.equal(JSON.parse(r.stdout).status,action==='install'?'PhysicalGateClosed':'OfflinePrepared');}
const peer=createDoomUploadIpcPeer(plan),key=Buffer.alloc(16,37),r=await runDoomUploadPc(peer,plan,key,{deploymentDirectory:where()}),s=pcPeerSummary(peer);
assert.equal(r.status,'RegisteredInactive',JSON.stringify(r));assert(r.closeConfirmed&&r.workerExitConfirmed&&r.workerWireVerified&&s.wireVerified);assert.equal(s.massFrames,layout.total);assert(key.every(x=>x===0));
for(const scenario of ['wrong-fw','collision','reject','bad-md5','disconnect']){const end=createDoomUploadPcPeer(plan,{scenario}),failed=await runDoomUploadPc(end,plan,Buffer.alloc(16,37),{deploymentDirectory:where()});assert.equal(failed.status,'StoppedNeedsReview');assert.equal(pcPeerSummary(end).massFrames,scenario==='disconnect'?11:0);assert(failed.closeConfirmed);}
const result={passed:true,resources:review.entries.length,tamperRejected:6,fullIpcParts:s.massFrames,wireBytes:s.bytes,selfContainedWithoutCarrier:true,
 journalIsolated:true,retryModesRejected:6,negativeTransfers:5,physicalGateClosed:true,physicalWatchUsed:false};
fs.writeFileSync(path.join(root,'build/doom2-r384/package-test.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
