// SPDX-License-Identifier: GPL-2.0-only
// Synthetic peers only: the same reviewed bytes, one retry after lost registration.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash,randomUUID} from 'node:crypto';
import {root} from './doom-controls-r397.mjs';import {prepareDoomControls397} from './doom-large-upload.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
assert.equal(process.argv.length,2);
const plan=prepareDoomControls397(fs.readFileSync(path.join(root,'build/doom-controls-r397/package/DoomControls-id-only.face'))),name='controls-r397.jsonl';
const baseline=[{id:'365220013',active:false,canDelete:true},{id:'123456789',active:true,canDelete:false}],current=baseline.map(r=>({...r,active:r.id==='365220013'}));
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());let cases=0;
function check(fn){fn();cases++;}
function copy(d){const out=dir();fs.mkdirSync(out);fs.copyFileSync(path.join(d,name),path.join(out,name));return out;}
async function run(d,{retry=false,catalog=baseline,scenario='ok',ipc=false}={}){
 const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(plan,{catalogRows:catalog,scenario}),key=Buffer.alloc(16,37);
 const report=await runDoomUploadPc(peer,plan,key,{deploymentDirectory:d,deploymentRetryControlsLoss:retry});assert(key.every(x=>x===0));cases++;return{report,summary:pcPeerSummary(peer)};
}
const original=dir(),first=await run(original);assert.equal(first.report.status,'RegisteredInactive');const saved=fs.readFileSync(path.join(original,name),'utf8');
const identity=deploymentIdentity('pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),Buffer.alloc(16,37));
try{
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:dir(),retryControlsLoss:true})));
 for(const opt of ['resume','retryWithoutData','afterSpace','afterCatalog','restartPacked','resumePacked'])check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:copy(original),retryControlsLoss:true,[opt]:true})));
 const tamper=copy(original);fs.appendFileSync(path.join(tamper,name),'!');check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:tamper,retryControlsLoss:true})));
 const badId=deploymentIdentity('pc:'+'a'.repeat(64),Buffer.alloc(16,37));check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,badId,{directory:copy(original),retryControlsLoss:true})));disposeDeploymentIdentity(badId);
 const good=copy(original),sent=await run(good,{retry:true,catalog:current,ipc:true});assert.equal(sent.report.status,'RegisteredInactive',JSON.stringify(sent.report));assert.equal(sent.report.registrationObservations,4);assert.equal(sent.report.durabilityVerified,false);assert.equal(sent.summary.massFrames,524);assert(sent.report.workerWireVerified&&sent.report.closeConfirmed&&sent.report.workerExitConfirmed);check(()=>assert(fs.readFileSync(path.join(good,name),'utf8').startsWith(saved)));
 const third=await run(good,{retry:true,catalog:current});assert.equal(third.summary.sentFrames,0);assert.equal(third.report.failureReason,'DoomJournalRefused');
 for(const catalog of [[...current,{id:plan.id,active:false,canDelete:true}],current.slice(0,1),[...current,{id:'987654321',active:false,canDelete:true}]]){const failed=await run(copy(original),{retry:true,catalog});assert.equal(failed.report.status,'StoppedNeedsReview');assert.equal(failed.summary.mutations,0);}
 const transient=await run(copy(original),{retry:true,catalog:current,scenario:'registration-lost'});assert.equal(transient.report.status,'StoppedNeedsReview');assert.equal(transient.report.registrationObservations,1);assert(transient.report.closeConfirmed);
 const disconnected=dir();await run(disconnected,{scenario:'disconnect'});const invalid=await run(disconnected,{retry:true});assert.equal(invalid.summary.sentFrames,0);assert.equal(invalid.report.failureReason,'DoomJournalRefused');
 const result={passed:true,cases,samePackage:true,originalJournalPreserved:true,singleRetryOnly:true,currentSelectionPreserved:true,fullIpcParts:524,registrationObservations:4,transientLossRejected:true,durabilityVerified:false,physicalWatchUsed:false};fs.writeFileSync(path.join(root,'build/doom-controls-r397/persistence-test-r398.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{disposeDeploymentIdentity(identity);}
