// Offline preparation. No Bluetooth/ADB/child-process backend exists here.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {uint,bytes} from './rw4-xiaomi-protocol.mjs';
import {isOwnedJournal} from './static-watchface-journal.mjs';
import {staticSpec} from './static-watchface-spec.mjs';
export const STATIC_ID=staticSpec().id;
export const STATIC_SHA=staticSpec().sha256;
const plans=new WeakSet(),receipts=new WeakSet();
const refused=()=>{throw Error('StaticTransferRefused');};
export function crc32(data){let crc=0xffffffff;for(const b of data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
export function prepareStatic(bytesValue,{variant = 'r167'} = {}){
  const spec=staticSpec(variant);
  if(!Buffer.isBuffer(bytesValue)||bytesValue.length!==spec.size||
    createHash('sha256').update(bytesValue).digest('hex')!==spec.sha256||
    bytesValue.subarray(0,4).toString('hex')!=='5aa53412'||bytesValue[5]!==0||
    bytesValue.subarray(40,49).toString('ascii')!==spec.id||bytesValue[49]!==0)refused();
  const owned=Buffer.from(bytesValue);
  const plan={variant:spec.variant,id:spec.id,size:owned.length,sha256:spec.sha256,
    copy:()=>Buffer.from(owned),md5:()=>createHash('md5').update(owned).digest()};
  Object.freeze(plan);plans.add(plan);return plan;
}
function validated(plan){if(!plans.has(plan))refused();}
const envelope=(type,subtype,field,body)=>Buffer.concat([uint(1,type),uint(2,subtype),bytes(field,body)]);
export function installStart(plan){validated(plan);return envelope(4,4,6,bytes(6,Buffer.concat([bytes(1,Buffer.from(plan.id)),uint(2,plan.size)])));}
export function uploadStart(plan){validated(plan);return envelope(22,0,24,bytes(1,Buffer.concat([uint(1,16),bytes(2,plan.md5()),uint(3,plan.size)])));}
function deleteOwn(plan){validated(plan);return envelope(4,2,6,bytes(2,Buffer.from(plan.id)));}
export function chunks(plan,chunkSize=2048){
  validated(plan);
  if(!Number.isInteger(chunkSize)||chunkSize<512||chunkSize>4080)refused();
  const body=Buffer.alloc(22+plan.size);body[0]=0;body[1]=16;plan.md5().copy(body,2);body.writeUInt32LE(plan.size,18);plan.copy().copy(body,22);
  const tail=Buffer.alloc(4);tail.writeUInt32LE(crc32(body));const stream=Buffer.concat([body,tail]);
  const partSize=chunkSize-4,total=Math.ceil(stream.length/partSize),result=[];
  if(total>64)refused();
  for(let i=0;i<total;i++){
    const segment=stream.subarray(i*partSize,Math.min((i+1)*partSize,stream.length)),chunk=Buffer.alloc(4+segment.length);
    chunk.writeUInt16LE(total);chunk.writeUInt16LE(i+1,2);segment.copy(chunk,4);result.push(chunk);
  }
  return result;
}
function preflight(api,plan){
  validated(plan);
  // Current read-only native worker has 16KiB TX and must NOT be used for this.
  if(api.scope!=='static-watchface-only'||api.authenticated!==true||api.protocolVersion!==1||
    !Number.isInteger(api.txBudgetBytes)||api.txBudgetBytes<32768)refused();
}
function faces(value){
  if(!value||value.unknownIdCount!==0||!Array.isArray(value.entries)||value.entries.length!==value.count||value.count>128)refused();
  const ids=new Set();for(const face of value.entries){
    if(!/^\d{1,10}$/.test(face.id)||ids.has(face.id)||typeof face.active!=='boolean'||typeof face.canDelete!=='boolean')refused();
    ids.add(face.id);
  }
  return value.entries;
}
export async function installStatic(api,plan,{journal = null,initialCountBelow = null} = {}){
  preflight(api,plan);
  const info=await api.info();if(info.modelRecognized!==true||info.firmware!=='2.2.86')refused();
  const before=faces(await api.faces());if(before.some(f=>f.id===plan.id))refused();
  if(before.filter(f=>f.active).length!==1)refused();
  if(initialCountBelow!==null&&(!Number.isInteger(initialCountBelow)||initialCountBelow<1||initialCountBelow>129||
    before.length>=initialCountBelow))refused();
  if(journal){if(!isOwnedJournal(journal)||!journal.matches(plan))refused();journal.begin(before);}
  const result={status:'PreflightPassed',writeRequested:false,bytesSent:0,selectedByClient:false,registeredVerified:false,
    transferAcceptanceVerified:false,removableFlagObserved:false};
  result.writeRequested=true;
  const start=await api.request(installStart(plan));if(start.installStatus!==0)refused();
  journal?.advance('InstallAck');
  const ack=await api.request(uploadStart(plan));
  if(ack.unknown2!==0||(ack.resumePosition??0)!==0||
    (ack.md5!==undefined&&(!Buffer.isBuffer(ack.md5)||!ack.md5.equals(plan.md5()))))refused();
  const parts=chunks(plan,ack.chunkSize??2048);journal?.advance('UploadReady');
  for(const [index,part] of parts.entries()){
    journal?.advance('Sending',{part:index+1});
    await api.mass(part);result.bytesSent+=part.length;
    journal?.advance('PartWritten');
  }
  // A local write/queue callback is NOT confirmation that the watch installed it.
  for(let attempt=0;attempt<6;attempt++){
    const after=faces(await api.faces());
    if(before.some(f=>!after.some(a=>a.id===f.id)))refused();
    const own=after.find(f=>f.id===plan.id);
    if(own){
      result.registeredVerified=true;result.removableFlagObserved=own.canDelete;
      result.previousFaceStillActive=after.some(f=>f.id===before.find(b=>b.active).id&&f.active);
      journal?.advance('Registered');
      result.status=own.active?'UnexpectedActivation':!result.previousFaceStillActive?'UnexpectedSelection':own.canDelete?'RegisteredInactive':'RegisteredNotRemovable';
      const receipt=Object.freeze({plan,before:Object.freeze(before.map(f=>Object.freeze({...f}))),registeredVerified:true});receipts.add(receipt);
      return {...result,receipt};
    }
    if(attempt<5)await api.wait(500);
  }
  return {...result,status:'SentNotVerified'};
}
export function restoreStaticReceipt(plan,journal){
  validated(plan);if(!isOwnedJournal(journal)||!journal.matches(plan))refused();
  const evidence=journal.evidence();
  const receipt=Object.freeze({plan,before:Object.freeze(evidence.before.map(f=>Object.freeze({...f}))),registeredVerified:true});
  receipts.add(receipt);return receipt;
}
export async function removeStatic(api,receipt,{journal = null} = {}){
  if(!receipts.has(receipt)||receipt.registeredVerified!==true)refused();
  const plan=receipt.plan;preflight(api,plan);
  const info=await api.info();if(info.modelRecognized!==true||info.firmware!=='2.2.86')refused();
  const current=faces(await api.faces()),own=current.find(f=>f.id===plan.id);
  if(!own||own.active||!own.canDelete)refused();
  if(receipt.before.some(f=>!current.some(c=>c.id===f.id)))refused();
  if(journal){if(!isOwnedJournal(journal)||!journal.matches(plan))refused();journal.evidence();journal.advance('DeleteIntent');}
  const ack=await api.request(deleteOwn(plan));if(ack.ack!==1)refused();
  const after=faces(await api.faces());
  if(after.some(f=>f.id===plan.id)||current.some(f=>f.id!==plan.id&&!after.some(a=>a.id===f.id)))refused();
  journal?.advance('Removed');
  return {status:'RemovedVerified',deletedId:plan.id,unrelatedEntriesPreserved:true};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  if(process.argv.length!==2)throw Error('Only offline inspection accepted');
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const file=path.join(root,'artifacts/static-watchface-r167/RW4Probe-id-only.face'),stat=fs.lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==25224)refused();
  const plan=prepareStatic(fs.readFileSync(file)),parts=chunks(plan);
  console.log(JSON.stringify({checkpoint:'R168',offlinePreparation:true,physicalEnabled:false,id:plan.id,size:plan.size,
    defaultParts:parts.length,requiredTxBudget:32768,currentReadOnlyWorkerBudget:16384,
    nativeTransportIntegrated:false,bluetoothOperationRequested:false,filesTransferred:false}));
}
