// Real4.8MB carrier, synthetic key/peer, durable private PC journal. No radio.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createDecipheriv,createHash} from 'node:crypto';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
import {prepareDoomAssets,syntheticDoomUpload,packageCopy,uploadLayout,massFrame,uploadToPcAdapter} from './doom-large-upload.mjs';
const synthetic=process.argv.length===3&&process.argv[2]==='--synthetic';
if(process.argv.length!==2&&!synthetic)throw Error('FixedPcTestOnly');
const raw=synthetic?null:fs.readFileSync(path.join(root,'build/doom-assets-r278/output/DoomAssets.face')),plan=synthetic?syntheticDoomUpload():prepareDoomAssets(raw),data=packageCopy(plan),md5=createHash('md5').update(data).digest();
const out=path.join(root,'artifacts/doom-large-upload-r279-'+Date.now());fs.mkdirSync(out,{recursive:true});
const key=Buffer.alloc(16,37),prefix=Buffer.from([4,3,2,1]),cases=[];
const ack={status:0,md5,chunkSize:2048,resumePosition:0};
// Independent reference CRC implementation, checked against the standard vector.
function referenceCrc(b){let c=0xffffffff;for(const x of b){c^=x;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
assert.equal(referenceCrc(Buffer.from('123456789')),0xcbf43926);
function decode(frame){assert(frame.subarray(0,3).equals(Buffer.from('badcfe','hex')));assert.equal(frame[3],5);assert.equal(frame[4],128);assert.equal(frame[7],2);assert.equal(frame[9],1);assert.equal(frame.at(-1),239);assert.equal(frame.readUInt16LE(5)+8,frame.length);
 const cipher=frame.subarray(10,-1),nonce=Buffer.alloc(12);prefix.copy(nonce);const d=createDecipheriv('aes-128-ccm',key,nonce,{authTagLength:4});d.setAuthTag(cipher.subarray(-4));d.setAAD(Buffer.alloc(0),{plaintextLength:cipher.length-4});return Buffer.concat([d.update(cipher.subarray(0,-4)),d.final()]);}
async function simulate(name,currentAck=ack,previous=null,failPart=0,failCheckpoint=0,deadline=false){
 let now=0,sent=0,checkpoints=0,clocks=0,last=null;const layout=uploadLayout(plan,currentAck,previous),parts=[],j=fs.openSync(path.join(out,name+'.jsonl'),'wx');
 const result=await uploadToPcAdapter(plan,currentAck,{scope:'pc-upload-simulator',initialSerial:250,key,noncePrefix:prefix,txBudgetBytes:layout.wireBytes,clock:()=>deadline?(clocks++?600001:0):now,wait:async ms=>{assert.equal(ms,100);now+=ms;},
  checkpoint:async record=>{if(++checkpoints===failCheckpoint)throw Error('DiskFailure');last={...record};fs.writeSync(j,JSON.stringify(record)+'\n');fs.fsyncSync(j);},
  send:async frame=>{assert.equal(last.status,'Intent');assert(last.batchFirst<=sent+1&&last.batchLast>=sent+1);const b=decode(frame);sent++;assert.equal(frame[8],(249+sent)&255);assert.equal(b.readUInt16LE(2),sent);assert.equal(b.readUInt16LE(0),layout.total);parts.push(b.subarray(4));if(sent===failPart)throw Error('DisconnectAfterPossibleDelivery');}},previous);
 fs.closeSync(j);const stream=Buffer.concat(parts);
 if(!failPart&&!failCheckpoint&&!deadline){assert.equal(result.status,'SentNotVerified');assert.equal(result.remoteInstallationVerified,false);assert.equal(result.wireBytes,layout.wireBytes);assert.equal(stream[0],0);assert.equal(stream[1],16);assert(stream.subarray(2,18).equals(md5));assert.equal(stream.readUInt32LE(18),data.length);assert(stream.subarray(22,-4).equals(data.subarray(currentAck.resumePosition)));assert.equal(stream.readUInt32LE(stream.length-4),referenceCrc(stream.subarray(0,-4)));}
 else {assert.equal(result.status,'Uncertain');assert(sent<=failPart||failCheckpoint);}
 cases.push({name,status:result.status,frames:sent,checkpoints,virtualMs:now});return {result,stream};
}
// More than8 wire-serial wraps, full payload roundtrip and actual durable journal.
const full=await simulate('full');assert.equal(full.result.totalParts,2353);
await simulate('max-chunk',{...ack,chunkSize:4080});
const interrupted=await simulate('interrupted',ack,null,11);assert.equal(interrupted.result.locallyWritten,10);
const offset=interrupted.stream.length-22;assert.equal(offset,22462);
const resumed=await simulate('resumed',{...ack,resumePosition:offset},interrupted.result);
assert(Buffer.concat([data.subarray(0,offset),resumed.stream.subarray(22,-4)]).equals(data));
await simulate('journal-failure',ack,null,0,1);
await simulate('after-batch-journal-failure',ack,null,0,2);
const timed=await simulate('deadline',ack,null,0,0,true);assert.equal(timed.result.error,'Deadline');assert.equal(timed.result.locallyWritten,0);
let rejected=0;for(const bad of [{...ack,status:1},{...ack,md5:Buffer.alloc(16)},{...ack,md5:null},{...ack,chunkSize:512},{...ack,resumePosition:1},{...ack,resumePosition:data.length},{...ack,resumePosition:-1}]){assert.throws(()=>uploadLayout(plan,bad));rejected++;}
assert.throws(()=>uploadLayout(plan,{...ack,resumePosition:interrupted.result.highestPossibleOffset+1},interrupted.result));rejected++;
assert.throws(()=>uploadLayout(plan,{...ack,resumePosition:offset},{...interrupted.result,sha256:'0'.repeat(64)}));rejected++;
const changed=Buffer.from(raw??data);changed[100]^=1;assert.throws(()=>prepareDoomAssets(changed));rejected++;
assert.throws(()=>uploadLayout({...plan},ack));rejected++;
assert.throws(()=>massFrame(Buffer.alloc(4081),key,prefix,0));rejected++;
const before=data[100];const copy=packageCopy(plan);copy[100]^=1;assert.equal(packageCopy(plan)[100],before);
const report={checkpoint:'R279',passed:true,syntheticOnly:synthetic,packageSha256:plan.sha256,bytes:plan.size,cases,rejectedCases:rejected,durablePcJournal:true,wireSerialWrapTested:true,completePayloadRoundtrip:true,resumeAfterAmbiguousWrite:true,physicalAdapterImplemented:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
