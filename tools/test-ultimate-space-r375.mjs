// SPDX-License-Identifier: GPL-2.0-only
// Synthetic identities/catalogs only; unchanged R374 payload and no radio.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root} from './doom-ultimate-r374.mjs';
import {prepareDoomUltimate,syntheticRetailUpload} from './doom-large-upload.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {reviewedUltimateSpaceRemovals} from './doom-deployment-catalog.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';
import {runDoomUploadPc,runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {physicalDoomUltimateAfterSpaceEnabled,physicalDoomUltimateEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
const raw=fs.readFileSync(path.join(root,'build/doom-audio-r374/package/DoomUltimate-id-only.face')),plan=prepareDoomUltimate(raw);
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const filename='ultimate-r374.jsonl';let cases=0;
const baseline=[{id:'365110003',active:false,canDelete:false},...Array.from({length:9},(_,i)=>({id:String(365700000+i),active:i===8,canDelete:true})),
 ...['365219963','365219940','365219937','365219936'].map(id=>({id,active:false,canDelete:true}))];
const remaining=baseline.filter(r=>!['365219940','365219937','365219936','365700000'].includes(r.id));
const check=fn=>{fn();cases++;};
const key=Buffer.alloc(16,37),target='pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),identity=deploymentIdentity(target,key);
async function run(d,rows,{afterSpace=false,scenario='ok',ipc=false,p=plan}={}){
 const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(p,{scenario,catalogRows:rows}),secret=Buffer.alloc(16,37);
 const r=await runDoomUploadPc(peer,p,secret,{deploymentDirectory:d,deploymentAfterSpace:afterSpace});
 assert(secret.every(b=>b===0));cases++;return{r,s:pcPeerSummary(peer)};
}
function copy(d){const where=dir();fs.mkdirSync(where);fs.copyFileSync(path.join(d,filename),path.join(where,filename));return where;}
try{
 const initial=dir(),rejected=await run(initial,baseline,{scenario:'reject'});
 assert.equal(rejected.r.installStatus,3);assert.equal(rejected.s.massFrames,0);assert.equal(rejected.r.phase,'InstallIntent');
 const original=fs.readFileSync(path.join(initial,filename));
 for(const options of [{},{resume:true},{retryWithoutData:true},{afterSpace:true,resume:true},{afterSpace:true,retryWithoutData:true}])
  check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:copy(initial),...options})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:dir(),afterSpace:true})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(syntheticRetailUpload(),identity,{directory:copy(initial),afterSpace:true})));
 const other=deploymentIdentity(target,Buffer.alloc(16,38));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,other,{directory:copy(initial),afterSpace:true})));disposeDeploymentIdentity(other);
 const bad=copy(initial);fs.appendFileSync(path.join(bad,filename),'{}\n');
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:bad,afterSpace:true})));
 const claimed=copy(initial),j=new DoomDeploymentJournal(plan,identity,{directory:claimed,afterSpace:true});
 check(()=>{assert.equal(j.record.attempt,2);assert.equal(j.record.attemptKind,'retry-after-space-r375');assert.equal(j.resumeRecord.upload,null);});j.close();
 check(()=>assert(fs.readFileSync(path.join(claimed,filename)).subarray(0,original.length).equals(original)));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:claimed,afterSpace:true})));
 // Catalog must shrink, preserve all survivor flags and retain the carrier.
 check(()=>assert(reviewedUltimateSpaceRemovals(baseline,remaining)));
 for(const rows of [baseline,remaining.concat({id:'365700099',active:false,canDelete:true}),
  remaining.filter(r=>r.canDelete),remaining.filter(r=>r.id!=='365219963'),
  remaining.map(r=>r.id==='365700001'?{...r,canDelete:false}:r)]){
  check(()=>assert(!reviewedUltimateSpaceRemovals(baseline,rows)));
  const d=copy(initial),failed=await run(d,rows,{afterSpace:true});assert.equal(failed.r.status,'StoppedNeedsReview');assert.equal(failed.s.mutations,0);assert.equal(failed.s.massFrames,0);
  check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:d,afterSpace:true})));
 }
 const changedSelection=remaining.map(r=>({...r,active:r.id==='365700001'}));
 check(()=>assert(reviewedUltimateSpaceRemovals(baseline,changedSelection)));
 // The complete, unchanged payload crosses the real C# IPC after the guard.
 const good=copy(initial),sent=await run(good,changedSelection,{afterSpace:true,ipc:true});
 assert.equal(sent.r.status,'RegisteredInactive',JSON.stringify(sent.r));assert(sent.r.workerWireVerified&&sent.r.workerExitConfirmed&&sent.r.closeConfirmed);
 assert.equal(sent.s.massFrames,6405);assert(sent.r.catalogPreflight.reviewedSpaceRemovals);
 check(()=>assert(fs.readFileSync(path.join(good,filename)).subarray(0,original.length).equals(original)));
 const twice=await run(good,changedSelection,{afterSpace:true});assert.equal(twice.s.sentFrames,0);assert.equal(twice.r.failureReason,'DoomJournalRefused');
 // A prior data attempt, auth failure, or upload negotiation cannot use R375.
 for(const scenario of ['disconnect','bad-key','bad-chunk']){
  const d=dir();await run(d,baseline,{scenario});
  check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:d,afterSpace:true})));
 }
 check(()=>{assert(!physicalDoomUltimateAfterSpaceEnabled()&&!physicalDoomUltimateEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,afterSpace:true}));});
 const physical=await runReviewedDoomDeployment({},plan,Buffer.alloc(16,37),{afterSpace:true});check(()=>assert.equal(physical.sentFrames,0));
 for(const action of ['prepare-after-space','install-after-space']){
  const r=spawnSync(process.execPath,['tools/pc-doom-ultimate-r374.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
  check(()=>{assert.equal(r.status,action.startsWith('install')?2:0,r.stderr);const output=JSON.parse(r.stdout);assert.equal(output.checkpoint,'R375');assert.equal(output.status,action.startsWith('install')?'PhysicalGateClosed':'OfflinePrepared');});
 }
 const result={checkpoint:'R375',passed:true,cases,samePackage:true,priorZeroDataHistoryRequired:true,previousHistoryPreserved:true,
  onlyDeletableRemovals:true,currentSelectionPreserved:true,oneRetryOnly:true,fullIpcParts:sent.s.massFrames,physicalGateClosed:true,physicalWatchUsed:false};
 const out=path.join(root,'artifacts/research/ultimate-space-r375');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{key.fill(0);disposeDeploymentIdentity(identity);}
