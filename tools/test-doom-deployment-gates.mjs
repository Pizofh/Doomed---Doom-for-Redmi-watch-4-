// Closed entry checks only: no real identity, keys or radio supplied.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root} from './first-c-source.mjs';
import {physicalDoomDeploymentEnabled,physicalDoomResumeEnabled,createReviewedDoomEndpoint} from './doom-deployment-physical.mjs';
import {uploadToReviewedAdapter,syntheticDoomUpload} from './doom-large-upload.mjs';import {runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
assert.equal(physicalDoomDeploymentEnabled(),false);assert.equal(physicalDoomResumeEnabled(),false);
assert.throws(()=>createReviewedDoomEndpoint('not-a-target'));
assert.throws(()=>createReviewedDoomEndpoint('not-a-target',{resume:true}));
await assert.rejects(uploadToReviewedAdapter(syntheticDoomUpload(),null,{scope:'reviewed-doom-deployment',peer:{physical:true}}));
const secret=Buffer.alloc(16,37),r=await runReviewedDoomDeployment({},syntheticDoomUpload(),secret);
assert(secret.every(x=>x===0));assert.equal(r.bluetoothOperationRequested,false);assert.equal(r.watchCommandRequested,false);
const privateDirectory=path.join(root,'tools/local/pc-rfcomm/doom-deployment'),before=fs.existsSync(privateDirectory);
for(const action of ['install','resume']){
 const result=spawnSync(process.execPath,['tools/pc-doom-deployment.mjs',action],{cwd:root,encoding:'utf8',shell:false,windowsHide:true,timeout:3000,maxBuffer:4096});
 assert.equal(result.status,2);assert.equal(result.stderr,'');const report=JSON.parse(result.stdout);
 assert.equal(report.status,'PhysicalGateClosed');assert.equal(report.bluetoothOperationRequested,false);assert.equal(report.watchCommandRequested,false);assert.equal(report.filesTransferred,false);
}
assert.equal(fs.existsSync(privateDirectory),before);
const native=spawnSync(path.join(root,'artifacts/pc-rfcomm/Rw4PcRfcomm.exe'),['session-large-r281'],{cwd:root,input:'',encoding:'utf8',shell:false,windowsHide:true,timeout:3000,maxBuffer:4096});
assert.equal(native.status,2);assert.equal(native.stdout.trim(),'E:GateClosed');assert.equal(native.stderr,'');
console.log(JSON.stringify({checkpoint:'R286',passed:true,cliInstallAndResumeClosed:true,nativeEntryClosed:true,forgedCapabilityRejected:true,privateJournalNotCreated:true,physicalTransport:false}));
