// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,bootLauncher} from './doom-boot-r381.mjs';import {prepareDoomBoot,uploadLayout} from './doom-large-upload.mjs';import {physicalDoomBootEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';import {assertLargeNativeDispatchReady} from './large-native-dispatch.mjs';import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
import {leanLauncher} from './doom-lean-r382.mjs';import {prepareDoomLean} from './doom-large-upload.mjs';import {physicalDoomLeanEnabled} from './doom-deployment-physical.mjs';
import {startLauncher} from './doom-start-r383.mjs';import {prepareDoomStart} from './doom-large-upload.mjs';import {physicalDoomStartEnabled} from './doom-deployment-physical.mjs';
const start=process.argv[3]==='--start-r383',lean=start||process.argv[3]==='--lean-r382',product=start?'DoomStart':lean?'DoomLean':'DoomBoot',packetBytes=start?47200:lean?42312:41900;
const base={checkpoint:start?'R383':lean?'R382':'R381',id:start?'365220005':lean?'365220004':'365220003',physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error();return fs.readFileSync(file);}
try{
 const action=process.argv[2]??'plan';if((process.argv.length>3&&!(lean&&process.argv.length===4))||!['plan','prepare','install'].includes(action))throw Error();
 if(action==='install'&&!(start?physicalDoomStartEnabled():lean?physicalDoomLeanEnabled():physicalDoomBootEnabled())){console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;}
 else if(action==='plan')console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:packetBytes,manualStartOnly:true,existingPackedRequired:true}));
 else{
  const dir=path.join(root,start?'build/doom-start-r383/package':lean?'build/doom-lean-r382/package':'build/doom-boot-r381/package'),b=read(path.join(dir,product+'-id-only.face'),packetBytes),plan=(start?prepareDoomStart:lean?prepareDoomLean:prepareDoomBoot)(b),review=JSON.parse(read(path.join(dir,'review.json'),65536)),p=(start?startLauncher:lean?leanLauncher:bootLauncher)();
  if(review.sha256!==plan.sha256||review.sourceSha256!==p.sourceSha256||!b.includes(Buffer.from(p.source))||!review.manualStartOnly||review.nativeExecutableIncluded!==false||review.wadIncluded!==false)throw Error();reviewedLargeExecutable();
  if(action==='prepare'){const l=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:l.total,journalCreated:false}));}
  else{assertLargeNativeDispatchReady();const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));try{const r=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address),plan,key);console.log(JSON.stringify({...r,checkpoint:base.checkpoint}));process.exitCode=r.status==='RegisteredInactive'&&r.closeConfirmed&&r.workerExitConfirmed?0:1;}finally{key.fill(0);}}
 }
}catch(error){console.error(error.message==='NativeProfileNotReady'?'Native profile closed; stopped before private reads, journal or radio.':'DoomBoot refused; no retry, resume or private output.');process.exitCode=1;}
