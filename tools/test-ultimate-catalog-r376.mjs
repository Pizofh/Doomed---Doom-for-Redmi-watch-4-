// SPDX-License-Identifier: GPL-2.0-only
// Reproduces R374 storage rejection + R375 catalog refusal, with synthetic IDs.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root} from './doom-ultimate-r374.mjs';import {prepareDoomUltimate} from './doom-large-upload.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {reviewedUltimateCatalogRetry,reviewedUltimateSpaceRemovals} from './doom-deployment-catalog.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';
import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
import {physicalDoomUltimateAfterCatalogEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
const plan=prepareDoomUltimate(fs.readFileSync(path.join(root,'build/doom-audio-r374/package/DoomUltimate-id-only.face')));
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),name='ultimate-r374.jsonl';let cases=0;
const baseline=[{id:'365110003',active:false,canDelete:false},...Array.from({length:9},(_,i)=>({id:String(365700000+i),active:i===8,canDelete:true})),
 ...['365219963','365219940','365219937','365219936'].map(id=>({id,active:false,canDelete:true}))];
const current=baseline.filter(r=>!['365110003','365219940','365219937','365219936'].includes(r.id));
const identity=deploymentIdentity('pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),Buffer.alloc(16,37));
const check=fn=>{fn();cases++;};
const copy=d=>{const where=dir();fs.mkdirSync(where);fs.copyFileSync(path.join(d,name),path.join(where,name));return where;};
async function run(d,rows,{scenario='ok',afterSpace=false,afterCatalog=false,ipc=false}={}){
 const peer=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(plan,{scenario,catalogRows:rows}),key=Buffer.alloc(16,37);
 const r=await runDoomUploadPc(peer,plan,key,{deploymentDirectory:d,deploymentAfterSpace:afterSpace,deploymentAfterCatalog:afterCatalog});
 assert(key.every(x=>x===0));cases++;return{r,s:pcPeerSummary(peer)};
}
try{
 const d=dir(),first=await run(d,baseline,{scenario:'reject'});assert.equal(first.r.installStatus,3);assert.equal(first.s.massFrames,0);
 const onlyFirst=copy(d),second=await run(d,current,{afterSpace:true});
 assert.equal(second.r.phase,'CatalogPreflight');assert.equal(second.s.mutations,0);assert.equal(second.s.massFrames,0);
 const prefix=fs.readFileSync(path.join(d,name));
 check(()=>{assert(!reviewedUltimateSpaceRemovals(baseline,current));assert(reviewedUltimateCatalogRetry(baseline,current));});
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:onlyFirst,afterCatalog:true})));
 for(const extra of [{},{resume:true},{retryWithoutData:true},{afterSpace:true},{afterCatalog:true,afterSpace:true},{afterCatalog:true,resume:true}])
  check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:copy(d),...extra})));
 const corrupt=copy(d);fs.appendFileSync(path.join(corrupt,name),'{}\n');
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:corrupt,afterCatalog:true})));
 const wrong=deploymentIdentity('pc:'+'0'.repeat(64),Buffer.alloc(16,37));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,wrong,{directory:copy(d),afterCatalog:true})));disposeDeploymentIdentity(wrong);
 const claimed=copy(d),j=new DoomDeploymentJournal(plan,identity,{directory:claimed,afterCatalog:true});
 check(()=>{assert.equal(j.record.attempt,3);assert.equal(j.record.attemptKind,'retry-catalog-r376');assert.equal(j.resumeRecord.before.length,14);assert.equal(j.resumeRecord.upload,null);});j.close();
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:claimed,afterCatalog:true})));
 check(()=>assert(!reviewedUltimateCatalogRetry(baseline.map(r=>r.id==='365700000'?{...r,canDelete:false}:r),current.filter(r=>r.id!=='365700000'))));
 for(const rows of [baseline,current.filter(r=>r.id!=='365219963'),current.concat({id:'365700099',active:false,canDelete:true}),
  current.map(r=>r.id==='365700000'?{...r,canDelete:false}:r)]){
  const failed=await run(copy(d),rows,{afterCatalog:true});assert.equal(failed.r.status,'StoppedNeedsReview');assert.equal(failed.s.mutations,0);assert.equal(failed.s.massFrames,0);
 }
 const next=copy(d),changedSelection=current.map(r=>({...r,active:r.id==='365700002'})),sent=await run(next,changedSelection,{afterCatalog:true,ipc:true});
 assert.equal(sent.r.status,'RegisteredInactive',JSON.stringify(sent.r));assert(sent.r.catalogPreflight.reviewedCatalogR376&&sent.r.closeConfirmed&&sent.r.workerExitConfirmed&&sent.r.workerWireVerified);
 assert.equal(sent.s.massFrames,6405);check(()=>assert(fs.readFileSync(path.join(next,name)).subarray(0,prefix.length).equals(prefix)));
 const fourth=await run(next,current,{afterCatalog:true});assert.equal(fourth.s.sentFrames,0);assert.equal(fourth.r.failureReason,'DoomJournalRefused');
 const uploadStage=copy(onlyFirst),u=new DoomDeploymentJournal(plan,identity,{directory:uploadStage,afterSpace:true});
 u.save({status:'InstallIntent',before:current});u.save({status:'UploadIntent'});u.save({status:'Uncertain'});u.close();
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:uploadStage,afterCatalog:true})));
 check(()=>{assert(!physicalDoomUltimateAfterCatalogEnabled());assert.throws(()=>createReviewedDoomEndpoint('AABBCCDDEE01',{retail:true,afterCatalog:true}));});
 for(const action of ['prepare-after-catalog','install-after-catalog']){
  const r=spawnSync(process.execPath,['tools/pc-doom-ultimate-r374.mjs',action],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
  check(()=>{assert.equal(r.status,action.startsWith('install')?2:0,r.stderr);const output=JSON.parse(r.stdout);assert.equal(output.checkpoint,'R376');assert.equal(output.status,action.startsWith('install')?'PhysicalGateClosed':'OfflinePrepared');});
 }
 const result={checkpoint:'R376',passed:true,cases,priorFailuresReproduced:true,knownAbsentEntryOnly:true,historyAndPackageBound:true,
  fourthAttemptBlocked:true,currentSelectionPreserved:true,fullIpcParts:sent.s.massFrames,physicalGateClosed:true,physicalWatchUsed:false};
 const out=path.join(root,'artifacts/research/ultimate-catalog-r376');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{disposeDeploymentIdentity(identity);}
