// SPDX-License-Identifier: GPL-2.0-only
// Prior R397 registration/retry through the shared JS simulator, no native worker.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {root} from './touch-identity-r404.mjs';import {prepareDoomControls397} from './doom-large-upload.mjs';
import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
assert.equal(process.argv.length,2);
const plan=prepareDoomControls397(fs.readFileSync(path.join(root,'build/doom-controls-r397/package/DoomControls-id-only.face')));
const directory=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
const rows=[{id:'365220013',active:false,canDelete:true},{id:'123456789',active:true,canDelete:false}];
const peer=createDoomUploadPcPeer(plan,{catalogRows:rows});
const first=await runDoomUploadPc(peer,plan,Buffer.alloc(16,37),{deploymentDirectory:directory});assert.equal(first.status,'RegisteredInactive');
const original=fs.readFileSync(path.join(directory,'controls-r397.jsonl'),'utf8');
const secondPeer=createDoomUploadPcPeer(plan,{catalogRows:rows});
const second=await runDoomUploadPc(secondPeer,plan,Buffer.alloc(16,37),{deploymentDirectory:directory,deploymentRetryControlsLoss:true});
assert.equal(second.status,'RegisteredInactive');assert.equal(second.registrationObservations,4);
assert(fs.readFileSync(path.join(directory,'controls-r397.jsonl'),'utf8').startsWith(original));
assert.equal(pcPeerSummary(peer).massFrames,524);assert.equal(pcPeerSummary(secondPeer).massFrames,524);
assert(!first.bluetoothOperationRequested&&!second.bluetoothOperationRequested);
const thirdPeer=createDoomUploadPcPeer(plan,{catalogRows:rows});
const third=await runDoomUploadPc(thirdPeer,plan,Buffer.alloc(16,37),{deploymentDirectory:directory,deploymentRetryControlsLoss:true});
assert.equal(third.status,'StoppedNeedsReview');assert.equal(pcPeerSummary(thirdPeer).sentFrames,0);
const report={checkpoint:'R404',passed:true,priorR397RegistrationAndSingleRetryPreserved:true,thirdAttemptRejected:true,partsPerTransfer:524,nativeWorkerExecuted:false,physicalTransport:false};
fs.writeFileSync(path.join(root,'build/touch-id-r404/upload-regression.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
