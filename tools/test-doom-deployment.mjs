// Synthetic identities/keys only. Real journal and authenticated PC peer.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {firstCRoot as root} from './first-c-source.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {syntheticDoomUpload,prepareDoomLowMemory,prepareDoomLauncher,packageCopy} from './doom-large-upload.mjs';
import {createDoomUploadPcPeer,createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';
import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
const local=process.argv.length===3&&process.argv[2]==='--local-package';if(process.argv.length!==2&&!local)throw Error('NoArguments');
const plan=local?prepareDoomLowMemory(fs.readFileSync(path.join(root,'build/doom-low-memory-rw4-r285/DoomLauncher-rw4.face'))):syntheticDoomUpload(4827044);
const key=Buffer.alloc(16,37),target='rw4:'+Buffer.alloc(6,65).toString('hex'),identity=deploymentIdentity(target,key),dirs=[];let cases=0;
function dir(){const p=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());dirs.push(p);return p;}
function copied(p){const d=dir();fs.mkdirSync(d);fs.copyFileSync(path.join(p,'transfer.jsonl'),path.join(d,'transfer.jsonl'));return d;}
function test(fn){fn();cases++;}
async function run(scenario,d,options={},resume=false,ipc=false){
 const endpoint=(ipc?createDoomUploadIpcPeer:createDoomUploadPcPeer)(plan,{scenario,...options}),secret=Buffer.alloc(16,37);
 const result=await runDoomUploadPc(endpoint,plan,secret,{deploymentDirectory:d,deploymentResume:resume}),peer=pcPeerSummary(endpoint);
 assert(secret.every(x=>x===0));assert.equal(peer.closeCalls,1);assert.equal(result.physicalEnabled,false);assert.equal(result.bluetoothOperationRequested,false);assert.equal(result.watchCommandRequested,false);
 cases++;return{result,peer};
}
try{
 test(()=>assert.throws(()=>deploymentIdentity(target,Buffer.alloc(15))));
 test(()=>assert.throws(()=>new DoomDeploymentJournal({...plan},identity,{directory:dir()})));
 test(()=>assert.throws(()=>new DoomDeploymentJournal(plan,{...identity},{directory:dir()})));
 test(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:root})));
 const held=dir(),j=new DoomDeploymentJournal(plan,identity,{directory:held});
 test(()=>{const copy=j.record;copy.id='changed';assert.equal(j.record.id,plan.id);assert(!Object.keys(identity).includes('targetTag'));});
 test(()=>{assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:held}));assert(fs.existsSync(path.join(held,'watch.lock')));});
 const rotated=deploymentIdentity(target,Buffer.alloc(16,38));
 test(()=>assert.throws(()=>new DoomDeploymentJournal(plan,rotated,{directory:held})));disposeDeploymentIdentity(rotated);
 test(()=>assert.throws(()=>j.save({targetTag:'changed'})));
 test(()=>assert.throws(()=>j.save({status:'RegisteredInactive'})));
 j.close();test(()=>assert(!fs.existsSync(path.join(held,'watch.lock'))));
 test(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:held})));
 test(()=>assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:held,resume:true})));
 const stale=dir();fs.mkdirSync(stale);fs.writeFileSync(path.join(stale,'watch.lock'),'stale');
 test(()=>{assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:stale}));assert.equal(fs.readFileSync(path.join(stale,'watch.lock'),'utf8'),'stale');});
 const crash=dir(),child=spawnSync(process.execPath,['--input-type=module','-'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:5000,input:"import{DoomDeploymentJournal,deploymentIdentity}from'./tools/doom-deployment-journal.mjs';import{syntheticDoomUpload}from'./tools/doom-large-upload.mjs';new DoomDeploymentJournal(syntheticDoomUpload(4827044),deploymentIdentity('rw4:'+Buffer.alloc(6,65).toString('hex'),Buffer.alloc(16,37)),{directory:"+JSON.stringify(crash)+"});process.exit(0);"});
 test(()=>{assert.equal(child.status,0);assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:crash}));});
 const success=dir(),full=await run('ok',success);assert.equal(full.result.status,'RegisteredInactive');assert.equal(full.peer.massFrames,2362);assert(full.peer.wireVerified);
 const duplicate=await run('ok',success);assert.equal(duplicate.result.failureReason,'DoomJournalRefused');assert.equal(duplicate.peer.sentFrames,0);
 const disconnectDir=dir(),cut=await run('disconnect',disconnectDir);assert.equal(cut.peer.massFrames,11);assert.equal(cut.result.massPartsLocallyWritten,10);
 const peerIdentity=deploymentIdentity('pc:'+createHash('sha256').update('PC ONLY:fixture-one').digest('hex'),key);
 test(()=>assert.throws(()=>new DoomDeploymentJournal(syntheticDoomUpload(4807680),peerIdentity,{directory:copied(disconnectDir),resume:true})));
 disposeDeploymentIdentity(peerIdentity);
 const replay=await run('ok',disconnectDir);assert.equal(replay.peer.sentFrames,0);assert.equal(replay.result.failureReason,'DoomJournalRefused');
 const changedTarget=await run('ok',copied(disconnectDir),{target:'fixture-other',resumePosition:22462},true);assert.equal(changedTarget.peer.sentFrames,0);
 const alteredKey=dir(),one=new DoomDeploymentJournal(plan,identity,{directory:alteredKey});one.save({status:'Uncertain'});one.close();
 const wrong=deploymentIdentity(target,Buffer.alloc(16,38));test(()=>assert.throws(()=>new DoomDeploymentJournal(plan,wrong,{directory:alteredKey,resume:true})));disposeDeploymentIdentity(wrong);
 for(const mutation of ['partial','changed','reordered']){
  const p=copied(disconnectDir),f=path.join(p,'transfer.jsonl'),b=fs.readFileSync(f,'utf8');
  if(mutation==='partial')fs.appendFileSync(f,'{');
  else if(mutation==='changed')fs.writeFileSync(f,b.replace('"status":"Created"','"status":"Uncertain"'));
  else{const lines=b.trimEnd().split('\n');[lines[0],lines[1]]=[lines[1],lines[0]];fs.writeFileSync(f,lines.join('\n')+'\n');}
  const blocked=await run('ok',p,{resumePosition:22462},true);assert.equal(blocked.peer.sentFrames,0);assert.equal(blocked.result.failureReason,'DoomJournalRefused');
 }
 const badOffset=await run('ok',copied(disconnectDir),{resumePosition:70000},true);assert.equal(badOffset.peer.massFrames,0);
 const resumed=await run('ok',disconnectDir,{resumePosition:22462},true);assert.equal(resumed.result.status,'RegisteredInactive');assert.equal(resumed.result.resumeOffset,22462);assert.equal(resumed.peer.massFrames,2351);
 const completedAgain=await run('ok',disconnectDir,{resumePosition:22462},true);assert.equal(completedAgain.peer.sentFrames,0);
 const rejected=await run('wrong-fw',dir());assert.equal(rejected.peer.mutations,0);
 const closeFailed=await run('close-failure',dir());assert.equal(closeFailed.result.status,'StoppedNeedsReview');
 const foreignDir=dir(),foreign=new DoomDeploymentJournal(plan,identity,{directory:foreignDir});
 fs.writeFileSync(path.join(foreignDir,'watch.lock'),JSON.stringify({token:'another-owner'}));
 test(()=>assert.throws(()=>foreign.close()));
 test(()=>assert.equal(JSON.parse(fs.readFileSync(path.join(foreignDir,'watch.lock'),'utf8')).token,'another-owner'));
 test(()=>{const b=packageCopy(plan);b[100]^=1;assert.throws(()=>prepareDoomLowMemory(b));if(local)assert.throws(()=>prepareDoomLauncher(packageCopy(plan)));});
 if(local){const ipc=await run('ok',dir(),{},false,true);assert.equal(ipc.result.status,'RegisteredInactive');assert(ipc.peer.workerWireVerified);}
 const report={checkpoint:'R286',passed:true,cases,bytes:plan.size,localPackage:local,ipcIncluded:local,exclusiveLock:true,authenticatedHashChain:true,crashAndTamperBlocked:true,duplicateBlockedBeforeAuth:true,explicitBoundedResume:true,keysAndAddressesPrinted:false,physicalTransport:false};
 const folder=path.join(root,'artifacts/doom-deployment-tests-r286');fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'result-'+Date.now()+'.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{key.fill(0);disposeDeploymentIdentity(identity);}
