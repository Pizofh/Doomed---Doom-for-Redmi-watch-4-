// SPDX-License-Identifier: GPL-2.0-only
// Exact private compressed package, manual start, single inactive installation.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,sha256,packedLauncher} from './doom-packed-r378.mjs';
import {prepareDoomPacked,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomPackedEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
import {assertRetailNativeDispatchReady} from './large-native-dispatch.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R378',id:'365220002',physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(file);}
try{
 const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomPackedEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:6165808,manualStartOnly:true,compressedWad:true}));
 else{
  const dir=path.join(root,'build/doom-audio-r378/package'),b=read(path.join(dir,'DoomPacked-id-only.face'),6165808),plan=prepareDoomPacked(b);
  const review=JSON.parse(read(path.join(dir,'review.json'),65536)),elf=read(path.join(dir,'app/lua/doom.elf'),629904);
  const p=packedLauncher(elf,read(path.join(root,'tools/local/doom-shareware/doom1.wad'),4196020));
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||review.elfSha256!==sha256(elf)||!b.includes(Buffer.from(p.source))||!b.includes(elf)||!review.manualStartOnly||review.wadIncluded!==true)throw Error();
  reviewedLargeExecutable();
  if(action==='prepare'){
   const l=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});
   console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:l.total,wireBytes:l.wireBytes,originalWadBytes:12408292,compressedWadBytes:5482926,journalCreated:false}));
  }else{
   assertRetailNativeDispatchReady();
   const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   try{const r=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address,{retail:true,packed:true}),plan,key);console.log(JSON.stringify({...r,checkpoint:'R378'}));process.exitCode=r.status==='RegisteredInactive'&&r.closeConfirmed&&r.workerExitConfirmed?0:1;}finally{key.fill(0);}
  }
 }
}catch(error){console.error(error.message==='NativeProfileNotReady'?'Native retail profile closed; stopped before private reads, journal or radio.':'DoomPacked refused; no retry, resume or raw private output.');process.exitCode=1;}
