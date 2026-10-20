// SPDX-License-Identifier: GPL-2.0-only
// Synthetic peer only. Never invokes a Bluetooth worker or reads target/auth.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root,sha} from './touch-identity-r404.mjs';import {prepareTouchIdentity404} from './doom-large-upload.mjs';
import {physicalTouchIdentity404Enabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc,runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
assert.equal(process.argv.length,2);
const b=fs.readFileSync(path.join(root,'build/touch-id-r404/package/TouchID-id-only.face')),plan=prepareTouchIdentity404(b);
assert.equal(plan.sha256,sha(b));assert(plan.nativeLauncher);assert.equal(plan.kind,'review-touch-id-r404-manual');
for(const at of [0,5,40,100,b.length-1]){const bad=Buffer.from(b);bad[at]^=1;assert.throws(()=>prepareTouchIdentity404(bad));}
assert.throws(()=>prepareTouchIdentity404(b.subarray(1)));
assert(!physicalTouchIdentity404Enabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01'));
const where=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const key=Buffer.alloc(16,37),identity=deploymentIdentity('pc:'+'0'.repeat(64),key),dir=where();
const j=new DoomDeploymentJournal(plan,identity,{directory:dir});assert.equal(path.basename(j.file),'touch-id-r404.jsonl');j.close();
// Existing history is retained; a second ordinary attempt cannot overwrite it.
assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:dir}));
for(const option of ['resume','retryWithoutData','afterSpace','afterCatalog','restartPacked','resumePacked','retryControlsLoss'])assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:where(),[option]:true}));
disposeDeploymentIdentity(identity);
for(const [action,code,status] of [['plan',0,'OfflineReviewOnly'],['prepare',0,'OfflinePrepared'],['install',2,'PhysicalGateClosed']]) {
  const r=spawnSync(process.execPath,['tools/pc-touch-id-r404.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
  assert.equal(r.status,code,r.stderr);const result=JSON.parse(r.stdout);assert.equal(result.status,status);assert(!result.bluetoothOperationRequested&&!result.filesTransferred);
  if(action==='prepare')assert.equal(result.parts,14);
}
const catalog=[{id:'365220014',active:false,canDelete:true},{id:'123456789',active:true,canDelete:false}];
const peer=createDoomUploadPcPeer(plan,{catalogRows:catalog}),success=await runDoomUploadPc(peer,plan,Buffer.from(key),{deploymentDirectory:where()}),summary=pcPeerSummary(peer);
assert.equal(success.status,'RegisteredInactive',JSON.stringify(success));assert(summary.wireVerified&&summary.massFrames===14);
assert(success.closeConfirmed);assert(!success.bluetoothOperationRequested);
let scenarios=1;
for(const scenario of ['wrong-model','wrong-fw','collision','reject','bad-md5','bad-offset','bad-chunk','disconnect','active','unrelated-lost','missing','close-failure']) {
  const p=createDoomUploadPcPeer(plan,{scenario,catalogRows:catalog}),result=await runDoomUploadPc(p,plan,Buffer.from(key),{deploymentDirectory:where()}),stats=pcPeerSummary(p);
  const expected=scenario==='active'?'UnexpectedActivation':scenario==='missing'?'SentNotVerified':'StoppedNeedsReview';
  assert.equal(result.status,expected,scenario+': '+JSON.stringify(result));
  assert(!result.selectedByClient);
  if(['wrong-model','wrong-fw','collision','reject','bad-md5','bad-offset','bad-chunk'].includes(scenario))assert.equal(stats.massFrames,0,scenario);
  if(scenario==='disconnect')assert.equal(stats.massFrames,11);
  assert(!result.bluetoothOperationRequested);scenarios++;
}
// A forged endpoint/closed profile is rejected before any native connection.
const closed=await runReviewedDoomDeployment({},plan,Buffer.from(key));assert.equal(closed.status,'StoppedNeedsReview');assert(!closed.bluetoothOperationRequested);
key.fill(0);
const report={checkpoint:'R404',passed:true,scenarios,parts:14,packageSha256:plan.sha256,tamperedPacketsRejected:6,
  dedicatedJournal:true,allRetryModesBlocked:true,fullWireVerified:true,inactiveRegistrationVerified:true,
  modelFirmwareAndCatalogPreflightTested:true,physicalGateClosed:true,privateTargetOrAuthRead:false,nativeWorkerExecuted:false,physicalTransport:false};
const file=path.join(root,'build/touch-id-r404/upload-test.json');fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
