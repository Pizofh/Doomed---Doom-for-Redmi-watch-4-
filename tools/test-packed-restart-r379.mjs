// SPDX-License-Identifier: GPL-2.0-only
// No radio: reproduce the precise partial history, then restart the complete
// pinned package over real executable IPC with a synthetic receiver.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root} from './doom-packed-r378.mjs';import {prepareDoomPacked} from './doom-large-upload.mjs';
import {reviewedPackedInterruption} from './doom-packed-restart-r379.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {physicalDoomPackedRestartEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
const plan=prepareDoomPacked(fs.readFileSync(path.join(root,'build/doom-audio-r378/package/DoomPacked-id-only.face'))),name='packed-r378.jsonl';
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const rows=Array.from({length:10},(_,i)=>({id:String(365700000+i),active:i===0,canDelete:true}));
const copy=d=>{const out=dir();fs.mkdirSync(out);fs.copyFileSync(path.join(d,name),path.join(out,name));return out;};
let cases=0;const check=fn=>{fn();cases++;};
async function run(d,{scenario='ok',catalogRows=rows,restartPacked=false,resumePosition=0,ipc=false}={}){
 const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(plan,{scenario,catalogRows,resumePosition}),key=Buffer.alloc(16,37);
 const r=await runDoomUploadPc(peer,plan,key,{deploymentDirectory:d,deploymentRestartPacked:restartPacked});assert(key.every(v=>v===0));cases++;return{r,s:pcPeerSummary(peer)};
}
const d=dir(),first=await run(d,{scenario:'packed-interruption'});
assert.equal(first.r.massPartsLocallyWritten,1687);assert.equal(first.r.workerExitCode,1);assert(first.r.closeConfirmed);
const prefix=fs.readFileSync(path.join(d,name)),history=prefix.toString().trim().split('\n').map(s=>JSON.parse(s).record);
check(()=>assert(reviewedPackedInterruption(history)));
for(const mutate of [h=>h.pop(),h=>h.push(h.at(-1)),h=>h[0].attempt=2,h=>h[0].sha256='0'.repeat(64),h=>h[0].id='365220001',
 h=>h[1].before.pop(),h=>h[20].before[0].canDelete=false,h=>h[4].upload.offset=1,h=>h[4].upload.totalParts=3016,
 h=>h[4].upload.locallyWritten=32,h=>h[5].upload.batchLast=33,h=>h[109].upload.locallyWritten=1688,
 h=>h[110].status='SentNotVerified',h=>h[111].upload.highestPossibleOffset++,h=>h[111].upload.wireBytes++,h=>h[111].upload.remoteInstallationVerified=true]){
 const changed=structuredClone(history);mutate(changed);check(()=>assert(!reviewedPackedInterruption(changed)));
}
const target='pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),identity=deploymentIdentity(target,Buffer.alloc(16,37));
try{
 for(const opts of [{},{resume:true},{retryWithoutData:true},{afterSpace:true},{afterCatalog:true},{restartPacked:true,resume:true},{restartPacked:true,afterSpace:true}])
  check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:copy(d),...opts})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:dir(),restartPacked:true})));
 const bad=copy(d);fs.appendFileSync(path.join(bad,name),'{}\n');check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:bad,restartPacked:true})));
 const wrong=deploymentIdentity(target,Buffer.alloc(16,38));try{check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,wrong,{directory:copy(d),restartPacked:true})));}finally{disposeDeploymentIdentity(wrong);}
 const claimed=copy(d),j=new DoomDeploymentJournal(plan,identity,{directory:claimed,restartPacked:true});
 check(()=>{assert.equal(j.record.attempt,2);assert.equal(j.record.attemptKind,'restart-packed-r379');assert.equal(j.resumeRecord.upload,null);assert.deepEqual(j.resumeRecord.before,rows);});j.close();
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:claimed,restartPacked:true})));
 for(const opts of [{catalogRows:rows.slice(0,-1)},{catalogRows:rows.concat({id:'365220002',active:false,canDelete:true})},
  {catalogRows:rows.map((r,i)=>i===2?{...r,canDelete:false}:r)},{resumePosition:3466602},{scenario:'reject'}]){
  const failed=await run(copy(d),{...opts,restartPacked:true});check(()=>{assert.equal(failed.r.status,'StoppedNeedsReview');assert.equal(failed.s.massFrames,0);});
 }
 const full=copy(d),sent=await run(full,{catalogRows:rows.map((r,i)=>({...r,active:i===1})),restartPacked:true,ipc:true});
 check(()=>{assert.equal(sent.r.status,'RegisteredInactive',JSON.stringify(sent.r));assert(sent.r.closeConfirmed&&sent.r.workerExitConfirmed&&sent.r.workerWireVerified);assert.equal(sent.r.resumeOffset,0);assert.equal(sent.s.massFrames,3017);assert.equal(sent.r.catalogPreflight.sameMembership,true);assert.equal(sent.r.catalogPreflight.sameSelection,false);assert(fs.readFileSync(path.join(full,name)).subarray(0,prefix.length).equals(prefix));});
 const third=await run(full,{restartPacked:true});check(()=>{assert.equal(third.s.sentFrames,0);assert.equal(third.r.failureReason,'DoomJournalRefused');});
 check(()=>{assert(!physicalDoomPackedRestartEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,packed:true,restartPacked:true}));});
 for(const action of ['prepare-restart','install-restart']){const r=spawnSync(process.execPath,['tools/pc-doom-packed-r378.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});check(()=>{assert.equal(r.status,action.startsWith('install')?2:0,r.stderr);assert.equal(JSON.parse(r.stdout).checkpoint,'R379');});}
 const result={checkpoint:'R379',passed:true,cases,partialHistoryReproduced:true,hmacAndPackageBound:true,originalPrefixPreserved:true,fullIpcParts:3017,nonzeroOffsetRejected:true,thirdAttemptBlocked:true,currentSelectionPreserved:true,physicalWatchUsed:false};
 const out=path.join(root,'artifacts/research/packed-restart-r379');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{disposeDeploymentIdentity(identity);}
