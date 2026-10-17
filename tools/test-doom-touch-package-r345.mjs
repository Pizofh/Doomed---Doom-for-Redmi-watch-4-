// Fixed payload/pins and end-to-end simulated Bluetooth protocol; no radio.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root,sha256,touchLauncher as directLauncher} from './doom-touch-r345.mjs';import {prepareDoomTouch,uploadLayout,packageCopy} from './doom-large-upload.mjs';
import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc,runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {physicalDoomTouchEnabled} from './doom-deployment-physical.mjs';import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const dir=path.join(root,'build/doom-touch-r345/package'),bytes=fs.readFileSync(path.join(dir,'DoomTouch-id-only.face')),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'))),plan=prepareDoomTouch(bytes);
const elf=fs.readFileSync(path.join(dir,'app/lua/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),p=directLauncher(elf,wad);assert.equal(p.sourceSha256,review.sourceSha256);assert(bytes.includes(Buffer.from(p.source)));assert.equal(plan.nativeLauncher,true);assert.equal(review.wadIncluded,false);
for(const r of review.entries){const original=fs.readFileSync(path.join(dir,'app/lua',r.name));assert.equal(sha256(original),r.sha256);assert(bytes.subarray(r.offset,r.offset+r.size).equals(original));}assert(!review.entries.some(r=>r.name==='doom1.wad'));
for(const pos of [0,5,40,bytes.length-1]){const b=Buffer.from(bytes);b[pos]^=1;assert.throws(()=>prepareDoomTouch(b));}
assert.equal(physicalDoomTouchEnabled(),false);const cli=spawnSync(process.execPath,['tools/pc-doom-touch-r345.mjs','install'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});assert.equal(cli.status,2);assert.equal(JSON.parse(cli.stdout).status,'PhysicalGateClosed');
assert.equal(sha256(elf),'cb7d0c4c0322c9b1c9c827fb67511705262caf988beb04075c66f9c887a16de3');
const key=Buffer.alloc(16,37),blocked=await runReviewedDoomDeployment({},plan,key);assert(key.every(x=>x===0));assert.equal(blocked.bluetoothOperationRequested,false);
let cases=0;
for(const scenario of ['ok','reject','disconnect','bad-key','unrelated-lost','missing','no-carrier']){
 const d=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());fs.mkdirSync(d);
 const legacy=path.join(d,'transfer.jsonl');fs.writeFileSync(legacy,'UNCHANGED SYNTHETIC OLD JOURNAL\n');
 const priorBench=path.join(d,'bench-r335.jsonl');fs.writeFileSync(priorBench,'UNCHANGED BENCH\n');
 const priorPalette=path.join(d,'palette-r333.jsonl');fs.writeFileSync(priorPalette,'UNCHANGED PALETTE\n');
 const priorFast=path.join(d,'fast-r331.jsonl');fs.writeFileSync(priorFast,'UNCHANGED FAST\n');
 const priorHold=path.join(d,'hold-r329.jsonl');fs.writeFileSync(priorHold,'UNCHANGED HOLD\n');
 const priorLease=path.join(d,'lease-r327.jsonl');fs.writeFileSync(priorLease,'UNCHANGED LEASE\n');
 const priorRefs=path.join(d,'refs-r325.jsonl');fs.writeFileSync(priorRefs,'UNCHANGED REFS\n');
 const priorPng=path.join(d,'ram-png-r304.jsonl');fs.writeFileSync(priorPng,'UNCHANGED SYNTHETIC PNG JOURNAL\n');
 const priorReaders=path.join(d,'readers-r318.jsonl'),priorFault=path.join(d,'fault-r321.jsonl');fs.writeFileSync(priorReaders,'UNCHANGED READERS\n');fs.writeFileSync(priorFault,'UNCHANGED FAULT\n');
 const endpoint=createDoomUploadPcPeer(plan,{scenario:scenario==='no-carrier'?'ok':scenario,catalogRows:[{id:'365110003',active:true,canDelete:false},...(scenario==='no-carrier'?[]:[{id:'365219963',active:false,canDelete:true}])]}),secret=Buffer.alloc(16,37),r=await runDoomUploadPc(endpoint,plan,secret,{deploymentDirectory:d}),summary=pcPeerSummary(endpoint);
 assert(secret.every(x=>x===0));assert.equal(summary.closeCalls,1);assert.equal(r.physicalEnabled,false);assert.equal(r.bluetoothOperationRequested,false);assert.equal(fs.readFileSync(legacy,'utf8'),'UNCHANGED SYNTHETIC OLD JOURNAL\n');
 assert.equal(fs.readFileSync(priorBench,'utf8'),'UNCHANGED BENCH\n');
 assert.equal(fs.readFileSync(priorPalette,'utf8'),'UNCHANGED PALETTE\n');
 assert.equal(fs.readFileSync(priorFast,'utf8'),'UNCHANGED FAST\n');
 assert.equal(fs.readFileSync(priorHold,'utf8'),'UNCHANGED HOLD\n');
 assert.equal(fs.readFileSync(priorLease,'utf8'),'UNCHANGED LEASE\n');
 assert.equal(fs.readFileSync(priorRefs,'utf8'),'UNCHANGED REFS\n');
 assert.equal(fs.readFileSync(priorPng,'utf8'),'UNCHANGED SYNTHETIC PNG JOURNAL\n');
 assert.equal(fs.readFileSync(priorReaders,'utf8'),'UNCHANGED READERS\n');assert.equal(fs.readFileSync(priorFault,'utf8'),'UNCHANGED FAULT\n');
 if(scenario==='ok'){assert.equal(r.status,'RegisteredInactive');assert.equal(summary.wireVerified,true);assert.equal(summary.massFrames,316);assert(r.journal.endsWith('/touch-r345.jsonl'));}
 else assert.notEqual(r.status,'RegisteredInactive');
 const identity=deploymentIdentity('rw4:'+Buffer.alloc(6,65).toString('hex'),Buffer.alloc(16,37));assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:d}));disposeDeploymentIdentity(identity);cases++;
}
const md5=createHash('md5').update(packageCopy(plan)).digest(),layout=uploadLayout(plan,{status:0,md5,chunkSize:2048,resumePosition:0});
const result={checkpoint:'R345',passed:true,resources:review.entries.length,bytes:bytes.length,sha256:plan.sha256,protocolScenarios:cases,parts:layout.total,wireBytes:layout.wireBytes,nativePayloadPinned:true,wadNotDuplicated:true,oldJournalPreserved:true,physicalGateClosed:true,physicalTransport:false};
fs.mkdirSync(path.join(root,'artifacts/doom-touch-r345'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/doom-touch-r345/package-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
