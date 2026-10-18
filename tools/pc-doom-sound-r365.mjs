// SPDX-License-Identifier: GPL-2.0-only
// Exact sound package. Gate checked before any private file or radio operation.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,sha256,soundLauncher} from './doom-sound-r365.mjs';
import {prepareDoomSound,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomSoundEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R365',id:'365219939',physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(file,max){const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||st.size>max)throw Error();return fs.readFileSync(file);}
try{
 const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install','retry-local'].includes(action))throw Error();
 if(['install','retry-local'].includes(action)&&!physicalDoomSoundEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:669676,manualStartOnly:true,wadIncluded:false}));
 else{
  const dir=path.join(root,'build/doom-audio-r365/package'),bytes=read(path.join(dir,'DoomSound-id-only.face'),669676),plan=prepareDoomSound(bytes);
  const review=JSON.parse(read(path.join(dir,'review.json'),65536)),elf=read(path.join(dir,'app/lua/doom.elf'),623096);
  const wad=read(path.join(root,'tools/local/doom-shareware/doom1.wad'),4196020),p=soundLauncher(elf,wad);
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||review.elfSha256!==sha256(elf)||!bytes.includes(Buffer.from(p.source))||!bytes.includes(elf)||!review.manualStartOnly||review.wadIncluded!==false)throw Error();
  reviewedLargeExecutable();
  if(action==='prepare'){
   const layout=uploadLayout(plan,{status:0,md5:createHash('md5').update(bytes).digest(),chunkSize:2048,resumePosition:0});
   console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:layout.total,journalCreated:false}));
  }else{
   const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   const retryWithoutData=action==='retry-local';
   try{const result=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address,{retryWithoutData}),plan,key,{retryWithoutData});console.log(JSON.stringify({...result,checkpoint:'R365'}));process.exitCode=result.status==='RegisteredInactive'&&result.closeConfirmed&&result.workerExitConfirmed?0:1;}finally{key.fill(0);}
  }
 }
}catch{console.error('DoomSound refused; no fallback, retry, resume or raw private output.');process.exitCode=1;}
