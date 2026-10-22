// SPDX-License-Identifier: GPL-2.0-only
// Exact bundle and synthetic transport validation; no radio or device input.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {root,sha256,themedLauncher} from './doom-themed-r406.mjs';import {prepareDoomThemed406} from './doom-large-upload.mjs';
import {physicalDoomThemed406Enabled} from './doom-deployment-physical.mjs';import {createDoomUploadIpcPeer,createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
const dir=path.join(root,'build/doom-themed-r406'),b=fs.readFileSync(path.join(dir,'package/DoomThemed-id-only.face')),plan=prepareDoomThemed406(b),p=themedLauncher(),r=JSON.parse(fs.readFileSync(path.join(dir,'package/review.json')));
assert.equal(r.sha256,sha256(b));assert.equal(r.sourceSha256,p.sourceSha256);assert.equal(r.entries.length,81);assert(!r.wadIncluded);assert.equal(p.config.import_base,'/data/app/watchface/market/365220015/lua/');assert(!physicalDoomThemed406Enabled());
for(const e of r.entries){const raw=fs.readFileSync(path.join(dir,'package/app/lua',e.name));assert.equal(sha256(raw),e.sha256);assert(b.subarray(e.offset,e.offset+e.size).equals(raw));}
for(const index of [0,5,40,100,b.length-1]){const bad=Buffer.from(b);bad[index]^=1;assert.throws(()=>prepareDoomThemed406(bad));}
const where=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),catalog=[{id:'365220015',active:false,canDelete:true},{id:'123456789',active:true,canDelete:false}];
const peer=createDoomUploadIpcPeer(plan,{catalogRows:catalog}),result=await runDoomUploadPc(peer,plan,Buffer.alloc(16,37),{deploymentDirectory:where()});assert.equal(result.status,'RegisteredInactive',JSON.stringify(result));assert(result.closeConfirmed&&result.workerExitConfirmed&&result.workerWireVerified);assert.equal(pcPeerSummary(peer).massFrames,530);
const missing=createDoomUploadPcPeer(plan,{catalogRows:catalog.slice(1)}),refused=await runDoomUploadPc(missing,plan,Buffer.alloc(16,37),{deploymentDirectory:where()});assert.equal(refused.status,'StoppedNeedsReview');assert.equal(pcPeerSummary(missing).massFrames,0);
const report={passed:true,packageSha256:plan.sha256,fullIpcParts:530,importCarrierRequired:true,physicalGateClosed:true,physicalWatchUsed:false};fs.writeFileSync(path.join(dir,'test-result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
