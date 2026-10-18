// SPDX-License-Identifier: GPL-2.0-only
// Fixed new package: native dispatch readiness checked before any private read.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,sha256,audioLauncher} from './doom-audio-r367.mjs';
import {prepareDoomAudio,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomAudioEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';import {assertLargeNativeDispatchReady} from './large-native-dispatch.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R367',id:'365219938',physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(file,max){const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||st.size>max)throw Error();return fs.readFileSync(file);}
try{
 const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomAudioEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:669980,manualStartOnly:true,wadIncluded:false}));
 else{
  const dir=path.join(root,'build/doom-audio-r367/package'),bytes=read(path.join(dir,'DoomAudio-id-only.face'),669980),plan=prepareDoomAudio(bytes);
  const review=JSON.parse(read(path.join(dir,'review.json'),65536)),elf=read(path.join(dir,'app/lua/doom.elf'),623320);
  const wad=read(path.join(root,'tools/local/doom-shareware/doom1.wad'),4196020),p=audioLauncher(elf,wad);
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||review.elfSha256!==sha256(elf)||!bytes.includes(Buffer.from(p.source))||!bytes.includes(elf)||!review.manualStartOnly||review.wadIncluded!==false)throw Error();
  reviewedLargeExecutable();
  if(action==='prepare'){
   const layout=uploadLayout(plan,{status:0,md5:createHash('md5').update(bytes).digest(),chunkSize:2048,resumePosition:0});
   console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:layout.total,journalCreated:false}));
  }else{
   assertLargeNativeDispatchReady();
   const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   try{const result=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address),plan,key);console.log(JSON.stringify({...result,checkpoint:'R367'}));process.exitCode=result.status==='RegisteredInactive'&&result.closeConfirmed&&result.workerExitConfirmed?0:1;}finally{key.fill(0);}
  }
 }
}catch(error){console.error(error.message==='NativeProfileNotReady'?'Native profile closed; stopped before private reads, journal or radio.':'DoomAudio refused; no fallback, retry, resume or raw private output.');process.exitCode=1;}
