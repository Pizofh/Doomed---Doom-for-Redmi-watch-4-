// SPDX-License-Identifier: GPL-2.0-only
// Exact private standalone package. One inactive install; no resume or retry.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,sha256,doom2Launcher} from './doom2-r384.mjs';import {doom2Profile} from './doom2-source-r384.mjs';
import {prepareDoomII,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomIIEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
import {assertRetailNativeDispatchReady} from './large-native-dispatch.mjs';import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R384',id:doom2Profile.id,physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(f,max){const s=fs.lstatSync(f);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(f);}
try{
 const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomIIEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',manualStartOnly:true,compressedWad:true,selfContained:true}));
 else{
  const dir=path.join(root,'build/doom2-r384/package'),b=read(path.join(dir,'DoomII-id-only.face'),7400000),plan=prepareDoomII(b),review=JSON.parse(read(path.join(dir,'review.json'),65536)),p=doom2Launcher();
  const elf=read(path.join(dir,'app/lua/doom.elf'),700000),wad=read(path.join(dir,'app/lua/doom2-r384.wad'),6600000);
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||review.elfSha256!==sha256(elf)||review.packedWadSha256!==sha256(wad)||!b.includes(elf)||!b.includes(wad)||!b.includes(Buffer.from(p.source))||!review.manualStartOnly||!review.wadIncluded)throw Error();
  reviewedLargeExecutable();
  if(action==='prepare'){const l=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:l.total,wireBytes:l.wireBytes,journalCreated:false}));}
  else{
   assertRetailNativeDispatchReady();const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   try{const r=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address,{retail:true,doom2:true}),plan,key);console.log(JSON.stringify({...r,checkpoint:'R384'}));process.exitCode=r.status==='RegisteredInactive'&&r.closeConfirmed&&r.workerExitConfirmed?0:1;}finally{key.fill(0);}
  }
 }
}catch(error){console.error(error.message==='NativeProfileNotReady'?'Native retail profile closed; no private inputs, journal or radio.':'DoomII refused; no retry, resume or private output.');process.exitCode=1;}
