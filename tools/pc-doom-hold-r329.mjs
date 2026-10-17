// One separately pinned native+UI payload. Closed before private data or radio.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,holdLauncher} from './doom-hold-source-r329.mjs';import {prepareDoomHold,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomHoldEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';import {createHash} from 'node:crypto';
const base={checkpoint:'R329',id:'365219949',physicalEnabled:false,bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false};
function read(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(file);}
try{
 const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomHoldEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:645476,manualStartOnly:true,nativeCodeIncluded:true,wadIncluded:false}));
 else{
  const dir=path.join(root,'build/doom-hold-r329/package'),bytes=read(path.join(dir,'DoomHold-id-only.face'),645476),plan=prepareDoomHold(bytes),review=JSON.parse(read(path.join(dir,'review.json'),65536));
  const elf=read(path.join(dir,'app/lua/doom.elf'),605796),wad=read(path.join(root,'tools/local/doom-shareware/doom1.wad'),4196020),p=holdLauncher(elf,wad);
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||!bytes.includes(Buffer.from(p.source))||review.elfSha256!==sha256(elf)||!bytes.includes(elf)||!review.manualStartOnly||!review.nativeExecutableIncluded||review.wadIncluded!==false)throw Error();
  reviewedLargeExecutable();
  if(action==='prepare'){
   const layout=uploadLayout(plan,{status:0,md5:createHash('md5').update(bytes).digest(),chunkSize:2048,resumePosition:0});
   console.log(JSON.stringify({...base,status:'OfflinePrepared',sha256:plan.sha256,bytes:plan.size,parts:layout.total,wireBytes:layout.wireBytes,manualStartOnly:true,nativeCodeIncluded:true,wadIncluded:false,journalCreated:false}));
  }else{
   const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   try{const result=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address),plan,key);console.log(JSON.stringify({...result,checkpoint:'R329'}));process.exitCode=result.status==='RegisteredInactive'&&result.closeConfirmed&&result.workerExitConfirmed?0:1;}finally{key.fill(0);}
  }
 }
}catch{console.error('DoomHold refused; no fallback, retry, resume or raw private output.');process.exitCode=1;}


