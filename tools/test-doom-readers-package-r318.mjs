// Fixed payload/pins and end-to-end simulated Bluetooth protocol; no radio.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {root,sha256,readersLauncher} from './doom-readers-source-r318.mjs';import {prepareDoomReaders,uploadLayout,packageCopy} from './doom-large-upload.mjs';
import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc,runReviewedDoomDeployment} from './doom-upload-pc-session.mjs';
import {physicalDoomReadersEnabled} from './doom-deployment-physical.mjs';import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const dir=path.join(root,'build/doom-readers-r318/package'),bytes=fs.readFileSync(path.join(dir,'DoomIO-id-only.face')),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'))),plan=prepareDoomReaders(bytes);
const elf=fs.readFileSync(path.join(dir,'app/lua/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),p=readersLauncher(elf,wad);assert.equal(p.sourceSha256,review.sourceSha256);assert(bytes.includes(Buffer.from(p.source)));assert.equal(plan.nativeLauncher,true);assert.equal(review.wadIncluded,false);
for(const r of review.entries){const original=fs.readFileSync(path.join(dir,'app/lua',r.name));assert.equal(sha256(original),r.sha256);assert(bytes.subarray(r.offset,r.offset+r.size).equals(original));}assert(!review.entries.some(r=>r.name==='doom1.wad'));
for(const pos of [0,5,40,bytes.length-1]){const b=Buffer.from(bytes);b[pos]^=1;assert.throws(()=>prepareDoomReaders(b));}
assert.equal(physicalDoomReadersEnabled(),false);const cli=spawnSync(process.execPath,['tools/pc-doom-readers-r318.mjs','install'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});assert.equal(cli.status,2);assert.equal(JSON.parse(cli.stdout).status,'PhysicalGateClosed');
const key=Buffer.alloc(16,37),blocked=await runReviewedDoomDeployment({},plan,key);assert(key.every(x=>x===0));assert.equal(blocked.bluetoothOperationRequested,false);
let cases=0;
for(const scenario of ['ok','reject','disconnect','bad-key','unrelated-lost','missing','no-carrier']){
 const d=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());fs.mkdirSync(d);
 const legacy=path.join(d,'transfer.jsonl');fs.writeFileSync(legacy,'UNCHANGED SYNTHETIC OLD JOURNAL\n');
 const priorPng=path.join(d,'ram-png-r304.jsonl');fs.writeFileSync(priorPng,'UNCHANGED SYNTHETIC PNG JOURNAL\n');
 const endpoint=createDoomUploadPcPeer(plan,{scenario:scenario==='no-carrier'?'ok':scenario,catalogRows:[{id:'365110003',active:true,canDelete:false},...(scenario==='no-carrier'?[]:[{id:'365219963',active:false,canDelete:true}])]}),secret=Buffer.alloc(16,37),r=await runDoomUploadPc(endpoint,plan,secret,{deploymentDirectory:d}),summary=pcPeerSummary(endpoint);
 assert(secret.every(x=>x===0));assert.equal(summary.closeCalls,1);assert.equal(r.physicalEnabled,false);assert.equal(r.bluetoothOperationRequested,false);assert.equal(fs.readFileSync(legacy,'utf8'),'UNCHANGED SYNTHETIC OLD JOURNAL\n');
 assert.equal(fs.readFileSync(priorPng,'utf8'),'UNCHANGED SYNTHETIC PNG JOURNAL\n');
 if(scenario==='ok'){assert.equal(r.status,'RegisteredInactive');assert.equal(summary.wireVerified,true);assert.equal(summary.massFrames,312);assert(r.journal.endsWith('/readers-r318.jsonl'));}
 else assert.notEqual(r.status,'RegisteredInactive');
 const identity=deploymentIdentity('rw4:'+Buffer.alloc(6,65).toString('hex'),Buffer.alloc(16,37));assert.throws(()=>new DoomDeploymentJournal(plan,identity,{directory:d}));disposeDeploymentIdentity(identity);cases++;
}
const md5=createHash('md5').update(packageCopy(plan)).digest(),layout=uploadLayout(plan,{status:0,md5,chunkSize:2048,resumePosition:0});
const result={checkpoint:'R318',passed:true,resources:review.entries.length,bytes:bytes.length,sha256:plan.sha256,protocolScenarios:cases,parts:layout.total,wireBytes:layout.wireBytes,nativePayloadPinned:true,wadNotDuplicated:true,oldJournalPreserved:true,physicalGateClosed:true,physicalTransport:false};
fs.writeFileSync(path.join(root,'artifacts/doom-readers-r318/package-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

