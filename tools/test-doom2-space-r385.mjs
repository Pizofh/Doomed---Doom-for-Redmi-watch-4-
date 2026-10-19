// SPDX-License-Identifier: GPL-2.0-only
// Exact unchanged package; synthetic retry histories, no physical watch access.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash,randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root} from './doom2-r384.mjs';import {prepareDoomII} from './doom-large-upload.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {reviewedDoom2SpaceHistory,reviewedDoom2Removals} from './doom2-space-r385.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc,runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {physicalDoomIIEnabled,physicalDoomIIAfterSpaceEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
const plan=prepareDoomII(fs.readFileSync(path.join(root,'build/doom2-r384/package/DoomII-id-only.face'))),filename='doom2-r384.jsonl',where=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const baseline=['365210037','365210129','365210030','365210122','365220048','365210006','365210218','365230174','365210175','365220002'].map(id=>({id,active:id==='365210175',canDelete:true})),remaining=baseline.slice(-2);
let cases=0;const check=fn=>{fn();cases++;};
const key=Buffer.alloc(16,37),identity=deploymentIdentity('pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),key);
const read=d=>fs.readFileSync(path.join(d,filename)),history=d=>read(d).toString().trim().split('\n').map(s=>JSON.parse(s).record);
function copy(d){const out=where();fs.mkdirSync(out);fs.copyFileSync(path.join(d,filename),path.join(out,filename));return out;}
async function run(d,rows,{afterSpace=false,scenario='ok',ipc=false}={}){const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(plan,{catalogRows:rows,scenario});const secret=Buffer.alloc(16,37),r=await runDoomUploadPc(peer,plan,secret,{deploymentDirectory:d,deploymentAfterSpace:afterSpace});assert(secret.every(x=>x===0));cases++;return{r,s:pcPeerSummary(peer)};}
try{
 const initial=where(),first=await run(initial,baseline,{scenario:'reject'}),original=read(initial);assert.equal(first.r.installStatus,3);assert.equal(first.s.massFrames,0);assert.equal(first.r.phase,'InstallIntent');
 check(()=>assert(reviewedDoom2SpaceHistory(history(initial))));check(()=>assert(reviewedDoom2Removals(baseline,remaining)));
 for(const option of [{},{resume:true},{retryWithoutData:true},{restartPacked:true},{resumePacked:true},{afterCatalog:true},{afterSpace:true,resume:true},{afterSpace:true,retryWithoutData:true}])check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:copy(initial),...option})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:where(),afterSpace:true})));
 const other=deploymentIdentity('pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),Buffer.alloc(16,38));check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,other,{directory:copy(initial),afterSpace:true})));disposeDeploymentIdentity(other);
 const tampered=copy(initial);fs.appendFileSync(path.join(tampered,filename),'{}\n');check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:tampered,afterSpace:true})));
 const claimed=copy(initial),j=new DoomDeploymentJournal(plan,identity,{directory:claimed,afterSpace:true});check(()=>assert.equal(j.record.attemptKind,'retry-doom2-space-r385'));j.close();check(()=>assert(read(claimed).subarray(0,original.length).equals(original)));check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:claimed,afterSpace:true})));
 for(const rows of [baseline,baseline.slice(1),remaining.slice(0,1),remaining.concat({id:'365799991',active:false,canDelete:true}),remaining.map(r=>({...r,active:r.id==='365220002'})),remaining.map(r=>({...r,canDelete:false}))]){
  check(()=>assert(!reviewedDoom2Removals(baseline,rows)));const failed=await run(copy(initial),rows,{afterSpace:true});assert.equal(failed.r.status,'StoppedNeedsReview');assert.equal(failed.s.mutations,0);assert.equal(failed.s.massFrames,0);
 }
 for(const scenario of ['disconnect','bad-key','bad-chunk']){const d=where();await run(d,baseline,{scenario});check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:d,afterSpace:true})));}
 const good=copy(initial),sent=await run(good,remaining,{afterSpace:true,ipc:true});assert.equal(sent.r.status,'RegisteredInactive',JSON.stringify(sent.r));assert.equal(sent.s.massFrames,3534);assert(sent.r.closeConfirmed&&sent.r.workerExitConfirmed&&sent.r.workerWireVerified&&sent.r.catalogPreflight.reviewedSpaceRemovals);
 check(()=>assert(read(good).subarray(0,original.length).equals(original)));const again=await run(good,remaining,{afterSpace:true});check(()=>{assert.equal(again.s.sentFrames,0);assert.equal(again.r.failureReason,'DoomJournalRefused');});
 check(()=>{assert(!physicalDoomIIEnabled()&&!physicalDoomIIAfterSpaceEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,doom2:true,afterSpace:true}));});
 const denied=await runReviewedDoomDeployment({},plan,Buffer.alloc(16,37),{afterSpace:true});check(()=>assert.equal(denied.sentFrames,0));
 for(const action of ['prepare-after-space','install-after-space']){const r=spawnSync(process.execPath,['tools/pc-doom2-r384.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});check(()=>{assert.equal(r.status,action.startsWith('install')?2:0,r.stderr);const p=JSON.parse(r.stdout);assert.equal(p.checkpoint,'R385');assert.equal(p.status,action.startsWith('install')?'PhysicalGateClosed':'OfflinePrepared');});}
 const result={passed:true,cases,samePackage:true,priorZeroDataRequired:true,originalHistoryPreserved:true,onlyReviewedRemovals:true,currentSelectionPreserved:true,oneRetryOnly:true,fullIpcParts:3534,physicalGateClosed:true,physicalWatchUsed:false};
 const out=path.join(root,'build/doom2-space-r385');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{key.fill(0);disposeDeploymentIdentity(identity);}
