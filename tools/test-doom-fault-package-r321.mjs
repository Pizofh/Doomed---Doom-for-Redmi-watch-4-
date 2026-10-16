// Fixed payload/pins and end-to-end simulated Bluetooth protocol; no radio.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root,sha256,faultLauncher} from './doom-fault-source-r321.mjs';import {prepareDoomFault,uploadLayout,packageCopy} from './doom-large-upload.mjs';
import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc,runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {physicalDoomFaultEnabled} from './doom-deployment-physical.mjs';import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const dir=path.join(root,'build/doom-fault-r321/package'),bytes=fs.readFileSync(path.join(dir,'DoomFault-id-only.face')),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'))),plan=prepareDoomFault(bytes);
const elf=fs.readFileSync(path.join(root,'build/doom-png-readers-r317/final/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),p=faultLauncher(elf,wad);assert.equal(p.sourceSha256,review.sourceSha256);assert(bytes.includes(Buffer.from(p.source)));assert.equal(plan.nativeLauncher,true);assert.equal(review.wadIncluded,false);
assert.equal(review.nativeExecutableIncluded,false);assert(!bytes.includes(elf));assert(!review.entries.some(r=>r.name==='doom.elf'));
for(const r of review.entries){const original=fs.readFileSync(path.join(dir,'app/lua',r.name));assert.equal(sha256(original),r.sha256);assert(bytes.subarray(r.offset,r.offset+r.size).equals(original));}assert(!review.entries.some(r=>r.name==='doom1.wad'));
for(const pos of [0,5,40,bytes.length-1]){const b=Buffer.from(bytes);b[pos]^=1;assert.throws(()=>prepareDoomFault(b));}
assert.equal(physicalDoomFaultEnabled(),false);const cli=spawnSync(process.execPath,['tools/pc-doom-fault-r321.mjs','install'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});assert.equal(cli.status,2);assert.equal(JSON.parse(cli.stdout).status,'PhysicalGateClosed');
const key=Buffer.alloc(16,37),blocked=await runReviewedDoomDeployment({},plan,key);assert(key.every(x=>x===0));assert.equal(blocked.bluetoothOperationRequested,false);
let cases=0;
for(const scenario of ['ok','reject','disconnect','bad-key','unrelated-lost','missing','no-carrier','no-elf-carrier']){
 const d=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());fs.mkdirSync(d);
 const legacy=path.join(d,'transfer.jsonl');fs.writeFileSync(legacy,'UNCHANGED SYNTHETIC OLD JOURNAL\n');
 const priorPng=path.join(d,'ram-png-r304.jsonl');fs.writeFileSync(priorPng,'UNCHANGED SYNTHETIC PNG JOURNAL\n');
 const priorReaders=path.join(d,'readers-r318.jsonl');fs.writeFileSync(priorReaders,'UNCHANGED SYNTHETIC READERS JOURNAL\n');
 const endpoint=createDoomUploadPcPeer(plan,{scenario:['no-carrier','no-elf-carrier'].includes(scenario)?'ok':scenario,catalogRows:[{id:'365110003',active:true,canDelete:false},...(scenario==='no-carrier'?[]:[{id:'365219963',active:false,canDelete:true}]),...(scenario==='no-elf-carrier'?[]:[{id:'365219953',active:false,canDelete:true}])]}),secret=Buffer.alloc(16,37),r=await runDoomUploadPc(endpoint,plan,secret,{deploymentDirectory:d}),summary=pcPeerSummary(endpoint);
 assert(secret.every(x=>x===0));assert.equal(summary.closeCalls,1);assert.equal(r.physicalEnabled,false);assert.equal(r.bluetoothOperationRequested,false);assert.equal(fs.readFileSync(legacy,'utf8'),'UNCHANGED SYNTHETIC OLD JOURNAL\n');
 assert.equal(fs.readFileSync(priorPng,'utf8'),'UNCHANGED SYNTHETIC PNG JOURNAL\n');
 assert.equal(fs.readFileSync(priorReaders,'utf8'),'UNCHANGED SYNTHETIC READERS JOURNAL\n');
 if(scenario==='ok'){assert.equal(r.status,'RegisteredInactive');assert.equal(summary.wireVerified,true);assert.equal(summary.massFrames,18);assert(r.journal.endsWith('/fault-r321.jsonl'));}
 else assert.notEqual(r.status,'RegisteredInactive');
 const identity=deploymentIdentity('rw4:'+Buffer.alloc(6,65).toString('hex'),Buffer.alloc(16,37));assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:d}));disposeDeploymentIdentity(identity);cases++;
}
const md5=createHash('md5').update(packageCopy(plan)).digest(),layout=uploadLayout(plan,{status:0,md5,chunkSize:2048,resumePosition:0});
const result={checkpoint:'R321',passed:true,resources:review.entries.length,bytes:bytes.length,sha256:plan.sha256,protocolScenarios:cases,parts:layout.total,wireBytes:layout.wireBytes,existingElfPinned:true,nativeExecutableIncluded:false,wadNotDuplicated:true,oldJournalPreserved:true,physicalGateClosed:true,physicalTransport:false};
fs.writeFileSync(path.join(root,'artifacts/doom-fault-r321/package-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));


