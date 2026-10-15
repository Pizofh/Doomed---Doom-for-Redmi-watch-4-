import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';
import {firstCRoot as root} from './first-c-source.mjs';import {fields,bytes,uint} from './rw4-xiaomi-protocol.mjs';import {parseDoomUploadAck} from './doom-upload-ack.mjs';
import {syntheticDoomUpload,packageCopy,uploadLayout} from './doom-large-upload.mjs';import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const plan=syntheticDoomUpload(4827044),md5=createHash('md5').update(packageCopy(plan)).digest();let cases=0;
function reply(body){return {encrypted:true,type:22,subtype:0,parsed:fields(bytes(24,bytes(2,body)))};}
const values=[bytes(1,md5),uint(2,0),uint(4,0),uint(5,2048)];
for(let mask=0;mask<16;mask++){
 const a=parseDoomUploadAck(reply(Buffer.concat(values.filter((_,i)=>mask&(1<<i)))),md5);
 assert.equal(a.chunkSize,2048);assert.equal(a.resumePosition,0);assert.equal(a.evidence.present.md5,!!(mask&1));assert.equal(a.evidence.md5EchoMatches,mask&1?true:null);assert.equal(uploadLayout(plan,a).total,2362);cases++;
}
for(const b of [bytes(1,Buffer.alloc(0)),bytes(1,Buffer.alloc(16)),uint(1,0),Buffer.concat([uint(2,0),uint(2,0)]),bytes(2,Buffer.alloc(1)),uint(2,3),uint(4,0x100000000),uint(5,0),uint(5,512),uint(5,4096),bytes(4,Buffer.alloc(1)),bytes(5,Buffer.alloc(1))]){
 assert.throws(()=>parseDoomUploadAck(reply(b),md5));cases++;
}
for(const r of [{...reply(Buffer.alloc(0)),encrypted:false},{...reply(Buffer.alloc(0)),type:4},{encrypted:true,type:22,subtype:0,parsed:new Map()},reply(bytes(2,Buffer.alloc(0)))]){assert.throws(()=>parseDoomUploadAck(r,md5));cases++;}
for(const b of [Buffer.alloc(0),bytes(1,md5),uint(4,22462)]){assert.throws(()=>parseDoomUploadAck(reply(b),md5,{resuming:true}));cases++;}
const resumed=parseDoomUploadAck(reply(Buffer.concat([bytes(1,md5),uint(4,22462)])),md5,{resuming:true});assert.equal(resumed.resumePosition,22462);cases++;
assert.throws(()=>uploadLayout(plan,parseDoomUploadAck(reply(uint(4,1)),md5)));cases++;
for(const ackShape of ['stock-minimal','defaults']){
 const peer=createDoomUploadPcPeer(plan,{ackShape}),secret=Buffer.alloc(16,37),directory=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
 const report=await runDoomUploadPc(peer,plan,secret,{deploymentDirectory:directory});
 assert.equal(report.status,'RegisteredInactive');assert.equal(report.uploadAck.md5EchoMatches,null);assert.equal(report.uploadAck.present.offset,false);assert.equal(pcPeerSummary(peer).massFrames,2362);assert(pcPeerSummary(peer).wireVerified);cases++;
}
const result={checkpoint:'R287',passed:true,cases,allOptionalFieldCombinations:true,wrongEncodingAndHashRejected:true,resumeStillRequiresEchoAndOffset:true,freshOffsetStillZero:true,fullPcSessionsWithAbsentFields:2,rawResponsesPrinted:false,physicalTransport:false};
fs.mkdirSync(path.join(root,'artifacts/doom-upload-ack-r287'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/doom-upload-ack-r287/result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
