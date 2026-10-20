// SPDX-License-Identifier: GPL-2.0-only
// Fixed package dispatcher. Physical gate is checked BEFORE package/private reads.
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {root,config,identitySource,sha} from './touch-identity-r404.mjs';
import {prepareTouchIdentity404,uploadLayout} from './doom-large-upload.mjs';
import {physicalTouchIdentity404Enabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';import {assertLargeNativeDispatchReady} from './large-native-dispatch.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';import {validateAuth} from './pc-rfcomm-session.mjs';
const base={checkpoint:'R404',id:config.id,physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
function read(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)throw Error('InputRefused');return fs.readFileSync(file);}
try {
  const action=process.argv[2]??'plan';if(process.argv.length>3||!['plan','prepare','install'].includes(action))throw Error('ActionRefused');
  if(action==='install'&&!physicalTouchIdentity404Enabled()) {
    console.log(JSON.stringify({...base,status:'PhysicalGateClosed'}));process.exitCode=2;
  }else if(action==='plan') {
    console.log(JSON.stringify({...base,status:'OfflineReviewOnly',bytes:28348,manualStartOnly:true,requiredFirmware:'2.2.86',retryAllowed:false}));
  }else {
    const dir=path.join(root,'build/touch-id-r404/package'),b=read(path.join(dir,'TouchID-id-only.face'),28348),plan=prepareTouchIdentity404(b);
    const review=JSON.parse(read(path.join(dir,'review.json'),65536));
    if(review.sha256!==plan.sha256||review.sourceSha256!==sha(Buffer.from(identitySource()))||!review.manualStartOnly||review.newNativeExecutableIncluded!==false||review.gameOrSaveDataIncluded!==false||review.requiredFirmware!=='2.2.86')throw Error('PackageChanged');
    if(action==='prepare') {
      const layout=uploadLayout(plan,{status:0,md5:createHash('md5').update(b).digest(),chunkSize:2048,resumePosition:0});
      console.log(JSON.stringify({...base,status:'OfflinePrepared',bytes:plan.size,sha256:plan.sha256,parts:layout.total,journalCreated:false}));
    }else {
      assertLargeNativeDispatchReady();
      const priv=path.join(root,'tools/local/pc-rfcomm'),address=validateTarget(JSON.parse(read(path.join(priv,'target.json'),4096))),key=validateAuth(JSON.parse(read(path.join(priv,'auth.json'),4096)));
      try {
        const result=await runReviewedDoomDeployment(createReviewedDoomEndpoint(address),plan,key);
        console.log(JSON.stringify({...result,checkpoint:'R404'}));
        process.exitCode=result.status==='RegisteredInactive'&&result.closeConfirmed&&result.workerExitConfirmed?0:1;
      }finally{key.fill(0);}
    }
  }
}catch(error) {
  console.error(error.message==='NativeProfileNotReady'?'Native profile closed; no private inputs, journal or radio.':'TouchID refused; no retry, resume or private output.');process.exitCode=1;
}
