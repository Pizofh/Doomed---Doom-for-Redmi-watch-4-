// SPDX-License-Identifier: GPL-2.0-only
// Reproduce both observed attempts, then transfer only the exact remaining tail.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root} from './doom-packed-r378.mjs';import {prepareDoomPacked} from './doom-large-upload.mjs';import {reviewedPackedResumeHistory} from './doom-packed-restart-r379.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';import {physicalDoomPackedResumeEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
const plan=prepareDoomPacked(fs.readFileSync(path.join(root,'build/doom-audio-r378/package/DoomPacked-id-only.face'))),name='packed-r378.jsonl';
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),rows=Array.from({length:10},(_,i)=>({id:String(365700000+i),active:i===0,canDelete:true}));
const copy=d=>{const out=dir();fs.mkdirSync(out);fs.copyFileSync(path.join(d,name),path.join(out,name));return out;};let cases=0;const check=fn=>{fn();cases++;};
async function run(d,{scenario='ok',resumePosition=0,restartPacked=false,resumePacked=false,catalogRows=rows,ipc=false}={}){
 const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(plan,{scenario,resumePosition,catalogRows}),key=Buffer.alloc(16,37);
 const r=await runDoomUploadPc(peer,plan,key,{deploymentDirectory:d,deploymentRestartPacked:restartPacked,deploymentResumePacked:resumePacked});assert(key.every(v=>v===0));cases++;return{r,s:pcPeerSummary(peer)};
}
const d=dir(),first=await run(d,{scenario:'packed-interruption'}),second=await run(d,{restartPacked:true,resumePosition:3378710});
check(()=>{assert.equal(first.r.massPartsLocallyWritten,1687);assert.equal(second.s.massFrames,0);assert.equal(second.r.uploadAck.resumePosition,3378710);assert.equal(second.r.phase,'UploadIntent');});
const prefix=fs.readFileSync(path.join(d,name)),history=prefix.toString().trim().split('\n').map(s=>JSON.parse(s).record);check(()=>assert(reviewedPackedResumeHistory(history)));
for(const mutate of [h=>h.pop(),h=>h.push(h.at(-1)),h=>h[112].attempt=3,h=>h[113].attemptKind='resume',h=>h[114].upload={},h=>h[115].status='RegisteredInactive',h=>h[113].before[0].canDelete=false,h=>h[111].upload.locallyWritten++]){
 const h=structuredClone(history);mutate(h);check(()=>assert(!reviewedPackedResumeHistory(h)));
}
const target='pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),identity=deploymentIdentity(target,Buffer.alloc(16,37));
try{
 for(const opts of [{},{restartPacked:true},{resume:true},{retryWithoutData:true},{resumePacked:true,resume:true},{resumePacked:true,restartPacked:true},{resumePacked:true,afterCatalog:true}])check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:copy(d),...opts})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:dir(),resumePacked:true})));
 const bad=copy(d);fs.appendFileSync(path.join(bad,name),'{}\n');check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:bad,resumePacked:true})));
 const wrong=deploymentIdentity(target,Buffer.alloc(16,38));try{check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,wrong,{directory:copy(d),resumePacked:true})));}finally{disposeDeploymentIdentity(wrong);}
 const claimed=copy(d),j=new DoomDeploymentJournal(plan,identity,{directory:claimed,resumePacked:true});check(()=>{assert.equal(j.record.attempt,3);assert.equal(j.record.attemptKind,'resume-packed-r380');assert.equal(j.resumeRecord.upload.locallyWritten,1687);assert.equal(j.resumeRecord.upload.highestPossibleOffset,3466602);});j.close();
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:claimed,resumePacked:true})));
 for(const opts of [{resumePosition:0},{resumePosition:3378709},{resumePosition:3378711},{resumePosition:3466602},{resumePosition:3466603},
  {scenario:'bad-md5'},{scenario:'resume-missing-md5'},{scenario:'resume-missing-offset'},{scenario:'reject'},
  {catalogRows:rows.slice(0,-1)},{catalogRows:rows.concat({id:'365220002',active:false,canDelete:true})}]){
  const failed=await run(copy(d),{resumePosition:3378710,...opts,resumePacked:true});check(()=>{assert.equal(failed.r.status,'StoppedNeedsReview');assert.equal(failed.s.massFrames,0);});
 }
 const full=copy(d),sent=await run(full,{resumePacked:true,resumePosition:3378710,ipc:true,catalogRows:rows.map((r,i)=>({...r,active:i===1}))});
 check(()=>{assert.equal(sent.r.status,'RegisteredInactive',JSON.stringify(sent.r));assert(sent.r.closeConfirmed&&sent.r.workerExitConfirmed&&sent.r.workerWireVerified);assert.equal(sent.r.resumeOffset,3378710);assert.equal(sent.s.massFrames,1364);assert.equal(sent.r.catalogPreflight.sameSelection,false);assert(fs.readFileSync(path.join(full,name)).subarray(0,prefix.length).equals(prefix));});
 const fourth=await run(full,{resumePacked:true,resumePosition:3378710});check(()=>{assert.equal(fourth.s.sentFrames,0);assert.equal(fourth.r.failureReason,'DoomJournalRefused');});
 check(()=>{assert(!physicalDoomPackedResumeEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,packed:true,resumePacked:true}));});
 for(const action of ['prepare-resume','install-resume']){const r=spawnSync(process.execPath,['tools/pc-doom-packed-r378.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});check(()=>{assert.equal(r.status,action.startsWith('install')?2:0,r.stderr);assert.equal(JSON.parse(r.stdout).checkpoint,'R380');});}
 const result={checkpoint:'R380',passed:true,cases,bothPriorAttemptsReproduced:true,exactOffset:3378710,md5AndOffsetRequired:true,hmacAndPackageBound:true,originalPrefixPreserved:true,remainingIpcParts:1364,fourthAttemptBlocked:true,currentSelectionPreserved:true,physicalWatchUsed:false};
 const out=path.join(root,'artifacts/research/packed-resume-r380');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{disposeDeploymentIdentity(identity);}
