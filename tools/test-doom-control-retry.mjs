// Synthetic identity only. A second fresh send needs evidence of zero MASS.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';
import {firstCRoot as root} from './first-c-source.mjs';import {syntheticDoomUpload} from './doom-large-upload.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const plan=syntheticDoomUpload(4827044),secret=Buffer.alloc(16,37),tag='pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),id=deploymentIdentity(tag,secret);let cases=0;
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
function copy(source){const d=dir();fs.mkdirSync(d);fs.copyFileSync(path.join(source,'transfer.jsonl'),path.join(d,'transfer.jsonl'));return d;}
function check(fn){fn();cases++;}
async function run(scenario,d,options={},retry=false){
 const endpoint=createDoomUploadPcPeer(plan,{scenario,...options}),key=Buffer.alloc(16,37);
 const r=await runDoomUploadPc(endpoint,plan,key,{deploymentDirectory:d,deploymentRetryWithoutData:retry});assert(key.every(x=>x===0));assert.equal(r.physicalEnabled,false);cases++;return{r,p:pcPeerSummary(endpoint)};
}
try{
 const d=dir(),first=await run('bad-chunk',d);assert.equal(first.p.massFrames,0);assert.equal(first.r.phase,'UploadIntent');
 const original=fs.readFileSync(path.join(d,'transfer.jsonl'),'utf8');
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:copy(d)})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:copy(d),resume:true})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:copy(d),resume:true,retryWithoutData:true})));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(syntheticDoomUpload(4807680),id,{directory:copy(d),retryWithoutData:true})));
 const other=deploymentIdentity(tag,Buffer.alloc(16,38));check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,other,{directory:copy(d),retryWithoutData:true})));disposeDeploymentIdentity(other);
 const tampered=copy(d);fs.appendFileSync(path.join(tampered,'transfer.jsonl'),'{');check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:tampered,retryWithoutData:true})));
 const marked=copy(d),j=new DoomDeploymentJournal(plan,id,{directory:marked,retryWithoutData:true});
 check(()=>{assert.equal(j.record.attempt,2);assert.equal(j.record.attemptKind,'retry-no-data');assert.equal(j.resumeRecord.upload,null);});j.close();
 check(()=>assert(fs.readFileSync(path.join(marked,'transfer.jsonl'),'utf8').startsWith(original)));
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:marked,retryWithoutData:true})));
 const sentDir=dir(),sent=await run('disconnect',sentDir);assert.equal(sent.p.massFrames,11);check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:sentDir,retryWithoutData:true})));
 const authDir=dir();await run('bad-key',authDir);check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:authDir,retryWithoutData:true})));
 const uploadingDir=copy(d),u=new DoomDeploymentJournal(plan,id,{directory:uploadingDir,retryWithoutData:true});
 u.save({status:'InstallIntent',before:u.resumeRecord.before});u.save({status:'UploadIntent'});u.save({status:'Uploading'});u.save({status:'Uncertain'});u.close();
 check(()=>assert.throws(()=>new DoomDeploymentJournal(plan,id,{directory:uploadingDir,retryWithoutData:true})));
 const good=await run('ok',d,{ackShape:'stock-minimal'},true);assert.equal(good.r.status,'RegisteredInactive');assert.equal(good.p.massFrames,2362);assert.equal(good.r.uploadAck.md5EchoMatches,null);
 check(()=>assert(fs.readFileSync(path.join(d,'transfer.jsonl'),'utf8').startsWith(original)));
 const twice=await run('ok',d,{},true);assert.equal(twice.p.sentFrames,0);assert.equal(twice.r.failureReason,'DoomJournalRefused');
 const result={checkpoint:'R287',passed:true,cases,zeroDataControlRetryOnce:true,previousHistoryPreserved:true,anyMassOrUncertainBatchBlocksFreshRetry:true,sameTargetKeyAndPackageRequired:true,stockOptionalAckIntegrated:true,physicalTransport:false};
 fs.mkdirSync(path.join(root,'artifacts/doom-control-retry-r287'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/doom-control-retry-r287/result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{secret.fill(0);disposeDeploymentIdentity(id);}
