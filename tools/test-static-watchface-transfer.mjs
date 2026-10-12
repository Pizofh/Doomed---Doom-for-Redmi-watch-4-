// Local owned image fixture and fake APIs. No OS/radio/phone/guest operations.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {STATIC_ID,prepareStatic,crc32,installStart,uploadStart,chunks,installStatic,removeStatic} from './static-watchface-transfer.mjs';
import {fields,one,decodeCommand} from './rw4-xiaomi-protocol.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=fs.readFileSync(path.join(root,'artifacts/static-watchface-r167/RW4Probe-id-only.face'));
const plan=prepareStatic(data);
assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);
const damaged=Buffer.from(data);damaged[0]^=1;assert.throws(()=>prepareStatic(damaged));
assert.throws(()=>installStart({...plan}));assert.throws(()=>uploadStart({...plan}));
const start=decodeCommand(installStart(plan));assert.equal(start.type,4);assert.equal(start.subtype,4);
const item=fields(one(fields(one(start.parsed,6,2)),6,2));assert.equal(one(item,1,2).toString(),STATIC_ID);assert.equal(one(item,2,0),25224);
const upload=decodeCommand(uploadStart(plan));assert.equal(upload.type,22);assert.equal(upload.subtype,0);
const request=fields(one(fields(one(upload.parsed,24,2)),1,2));assert.equal(one(request,1,0),16);assert.equal(one(request,2,2).length,16);
for(const size of [512,2048,4080]){
  const parts=chunks(plan,size);const body=Buffer.concat(parts.map((part,i)=>{assert.equal(part.readUInt16LE(),parts.length);assert.equal(part.readUInt16LE(2),i+1);assert(part.length<=size);return part.subarray(4);}));
  assert.equal(body[0],0);assert.equal(body[1],16);assert.equal(body.readUInt32LE(18),data.length);
  assert(body.subarray(22,-4).equals(data));assert.equal(body.readUInt32LE(body.length-4),crc32(body.subarray(0,-4)));
}
for(const size of [0,511,4081,65535])assert.throws(()=>chunks(plan,size));
function fake(scenario='ok'){
  const original={id:'123456789',active:true,canDelete:false},own={id:STATIC_ID,active:false,canDelete:true};
  let uploaded=false,deleted=false;
  const api={scope:'static-watchface-only',authenticated:true,protocolVersion:1,txBudgetBytes:32768,mutations:[],parts:[],
    info:async()=>({modelRecognized:true,firmware:scenario==='wrong-fw'?'other':'2.2.86'}),
    faces:async()=>{
      const rows=deleted?(scenario==='other-lost'?[]:[original]):uploaded&&scenario!=='missing'?[original,{...own,active:scenario==='activated',canDelete:scenario!=='protected'}]:[original];
      if(scenario==='collision'&&!uploaded)rows.push(own);
      if(scenario==='no-active')rows[0]={...original,active:false};
      return {count:rows.length,unknownIdCount:0,entries:rows};
    },request:async buffer=>{
      const cmd=decodeCommand(buffer);api.mutations.push([cmd.type,cmd.subtype]);
      if(cmd.type===4&&cmd.subtype===4)return {installStatus:scenario==='start-rejected'?2:0};
      if(cmd.type===22)return {unknown2:0,resumePosition:scenario==='resume'?100:0,chunkSize:2048};
      assert.equal(cmd.type,4);assert.equal(cmd.subtype,2);
      assert.equal(one(fields(one(cmd.parsed,6,2)),2,2).toString(),STATIC_ID);deleted=true;return {ack:1};
    },mass:async part=>{api.parts.push(part);uploaded=true;},wait:async()=>{}};
  return api;
}
const ok=fake();const installed=await installStatic(ok,plan);assert.equal(installed.status,'RegisteredInactive');
assert.equal(installed.selectedByClient,false);assert.equal(installed.registeredVerified,true);assert.equal(installed.transferAcceptanceVerified,false);
const removed=await removeStatic(ok,installed.receipt);assert.equal(removed.status,'RemovedVerified');
assert.deepEqual(ok.mutations,[[4,4],[22,0],[4,2]]);assert.equal(ok.parts.length,13);
for(const scenario of ['wrong-fw','collision','no-active']){const api=fake(scenario);await assert.rejects(installStatic(api,plan));assert.deepEqual(api.mutations,[]);}
const lowBudget=fake();lowBudget.txBudgetBytes=16384;await assert.rejects(installStatic(lowBudget,plan));assert.deepEqual(lowBudget.mutations,[]);
const resume=fake('resume');await assert.rejects(installStatic(resume,plan));assert.equal(resume.parts.length,0);
const rejected=fake('start-rejected');await assert.rejects(installStatic(rejected,plan));assert.equal(rejected.parts.length,0);assert.deepEqual(rejected.mutations,[[4,4]]);
for(const scenario of ['activated','protected']){const api=fake(scenario),result=await installStatic(api,plan);await assert.rejects(removeStatic(api,result.receipt));assert.deepEqual(api.mutations,[[4,4],[22,0]]);}
const missing=await installStatic(fake('missing'),plan);assert.equal(missing.status,'SentNotVerified');assert.equal(missing.registeredVerified,false);
const otherLost=fake('other-lost'),otherResult=await installStatic(otherLost,plan);await assert.rejects(removeStatic(otherLost,otherResult.receipt));
await assert.rejects(removeStatic(fake(),{plan,registeredVerified:true}));
console.log(JSON.stringify({checkpoint:'R168',offlineTransferTestsPassed:true,scenarioChecks:12,
  nativeTransportIntegrated:false,bluetoothOperationRequested:false,physicalFilesTransferred:false}));
