// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,sha256,tuneLauncher} from './doom-tune-r387.mjs';import {prepareDoomTune,uploadLayout} from './doom-large-upload.mjs';
import {physicalDoomTuneEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {assertLargeNativeDispatchReady} from './large-native-dispatch.mjs';import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R387',id:'365220008',physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(f,max){const s=fs.lstatSync(f);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(f);}
try{const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!physicalDoomTuneEnabled()){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',manualStartOnly:true,existingDoomIIRequired:true}));
 else{const dir=path.join(root,'build/doom-tune-r387/package'),b=read(path.join(dir,'DoomTune-id-only.face'),676120),plan=prepareDoomTune(b),review=JSON.parse(read(path.join(dir,'review.json'),65536)),p=tuneLauncher(),elf=read(path.join(dir,'app/lua/doom.elf'),631972);
  if(review.sourceSha256!==p.sourceSha256||review.sha256!==plan.sha256||review.elfSha256!==sha256(elf)||!b.includes(elf)||!b.includes(Buffer.from(p.source))||!review.manualStartOnly||review.wadIncluded!==false)throw Error();
  if(action==='prepare'){const l=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:l.total,journalCreated:false}));}
  else{assertLargeNativeDispatchReady();const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
   try{const r=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address),plan,key);console.log(JSON.stringify({...r,checkpoint:'R387'}));process.exitCode=r.status==='RegisteredInactive'&&r.closeConfirmed&&r.workerExitConfirmed?0:1;}finally{key.fill(0);}}
 }
}catch(error){console.error(error.message==='NativeProfileNotReady'?'Native profile closed; no private inputs, journal or radio.':'DoomTune refused; no retry, resume or private output.');process.exitCode=1;}
