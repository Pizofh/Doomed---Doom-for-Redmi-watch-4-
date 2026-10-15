// Fixed R285 package. Install/resume stop at the closed gate before secrets/I/O.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
import {prepareDoomLowMemory} from './doom-large-upload.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
import {deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {physicalDoomDeploymentEnabled,physicalDoomResumeEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
const action=process.argv[2]??'plan';
function read(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(file);}
const base={checkpoint:'R286',id:'365219963',physicalEnabled:false,bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false};
try{
 if(process.argv.length>3||!['plan','prepare','install','resume'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomDeploymentEnabled()||action==='resume'&&!physicalDoomResumeEnabled()){
  console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;
 }else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:4827044,nativeLauncherEnabled:false,exclusiveJournal:true,resumeRequiresSeparateReview:true}));
 else{
  const out=path.join(root,'build/doom-low-memory-rw4-r285'),b=read(path.join(out,'DoomLauncher-rw4.face'),4827044),plan=prepareDoomLowMemory(b);
  const review=JSON.parse(read(path.join(out,'package.json'),65536)),source=read(path.join(out,'app/lua/main.lua'),24576);
  if(review.sha256!==plan.sha256||review.sourceSha256!==sha256(source)||!b.includes(source)||review.nativeLoadEnabled!==false||review.config.allow_native!==false)throw Error();
  reviewedLargeExecutable();
  const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
  let identity;
  try{
   identity=deploymentIdentity('rw4:'+address,key);
   if(action==='prepare')console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,targetAndKeyFormatVerified:true,privateBindingPrepared:true,journalCreated:false,nativeLauncherEnabled:false,defaultParts:2362,automaticRetry:false}));
   else{
    const result=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address,{resume:action==='resume'}),plan,key,{resume:action==='resume'});
    console.log(JSON.stringify(result));process.exitCode=result.status==='RegisteredInactive'&&result.closeConfirmed&&result.workerExitConfirmed?0:1;
   }
  }finally{key.fill(0);disposeDeploymentIdentity(identity);}
 }
}catch{console.error('Doom deployment refused; no fallback, automatic retry or raw private output.');process.exitCode=1;}
