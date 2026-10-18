// SPDX-License-Identifier: GPL-2.0-only
// Private, exact pinned package. No automatic activation, resume or retry.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,sha256,ultimateLauncher} from './doom-ultimate-r374.mjs';
import {prepareDoomUltimate,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomUltimateEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
import {assertRetailNativeDispatchReady} from './large-native-dispatch.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R374',id:'365220001',physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(file);}
try{
 const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomUltimateEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:13090600,manualStartOnly:true,wadIncluded:true}));
 else{
  const dir=path.join(root,'build/doom-audio-r374/package'),b=read(path.join(dir,'DoomUltimate-id-only.face'),13090600),plan=prepareDoomUltimate(b);
  const review=JSON.parse(read(path.join(dir,'review.json'),65536)),elf=read(path.join(dir,'app/lua/doom.elf'),624976);
  const p=ultimateLauncher(elf,read(path.join(root,'tools/local/doom-shareware/doom1.wad'),4196020));
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||review.elfSha256!==sha256(elf)||!b.includes(Buffer.from(p.source))||!b.includes(elf)||!review.manualStartOnly||review.wadIncluded!==true)throw Error();
  reviewedLargeExecutable();
  if(action==='prepare'){
   const l=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});
   console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:l.total,wireBytes:l.wireBytes,journalCreated:false}));
  }else{
   assertRetailNativeDispatchReady();
   const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   try{const r=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address,{retail:true}),plan,key);console.log(JSON.stringify({...r,checkpoint:'R374'}));process.exitCode=r.status==='RegisteredInactive'&&r.closeConfirmed&&r.workerExitConfirmed?0:1;}finally{key.fill(0);}
  }
 }
}catch(error){console.error(error.message==='NativeProfileNotReady'?'Native retail profile closed; stopped before private reads, journal or radio.':'DoomUltimate refused; no retry, resume or raw private output.');process.exitCode=1;}
