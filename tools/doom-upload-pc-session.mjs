// Shared authenticated transfer core. PC peer and reviewed physical capability
// have distinct branded entries; physical creation remains gated in its module.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {XiaomiSession} from './pc-rfcomm-session.mjs';
import {command,uint,bytes,fields,one,readDeviceInfo,readWatchfaces} from './rw4-xiaomi-protocol.mjs';
import {packageCopy,uploadLayout,uploadToPcAdapter,uploadToReviewedAdapter} from './doom-large-upload.mjs';
import {pcPeerAccess} from './doom-upload-pc-simulator.mjs';
import {DoomDeploymentJournal,deploymentIdentity,disposeDeploymentIdentity} from './doom-deployment-journal.mjs';
import {claimReviewedDoomEndpoint,physicalDoomRamPngEnabled,physicalDoomReadersEnabled,physicalDoomFaultEnabled,physicalDoomRefsEnabled,physicalDoomLeaseEnabled,physicalDoomHoldEnabled,physicalDoomFastEnabled,physicalDoomPaletteEnabled,physicalDoomBenchEnabled,physicalDoomDemandEnabled,physicalDoomDirectEnabled,physicalDoomTouchEnabled,physicalDoomWideEnabled,physicalDoomPadsEnabled,physicalDoomReadyEnabled} from './doom-deployment-physical.mjs';
import {parseDoomUploadAck} from './doom-upload-ack.mjs';
import {physicalDoomSoundEnabled} from './doom-deployment-physical.mjs';
import {compareDoomCatalogs,reviewedTwoRemovals} from './doom-deployment-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'artifacts/doom-upload-session-r280');
const digest=b=>createHash('md5').update(b).digest();
const refuse=()=>{throw Error('LargeSessionRefused');};
const envelope=(type,subtype,field,body)=>Buffer.concat([uint(1,type),uint(2,subtype),bytes(field,body)]);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function catalog(value){
 if(value.unknownIdCount!==0||value.activeCount!==1||value.count!==value.entries.length)refuse();
 return value.entries;
}
function parentRecord(file,plan,targetTag){
 if(typeof file!=='string'||path.dirname(path.resolve(file))!==directory)refuse();
 const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>1048576)refuse();
 const lines=fs.readFileSync(file,'utf8').trimEnd().split('\n');
 const records=lines.map(line=>JSON.parse(line)),last=records.at(-1);
 if(!last||last.schema!==1||last.targetTag!==targetTag||last.id!==plan.id||last.sha256!==plan.sha256||last.size!==plan.size||last.status!=='Uncertain'||last.upload?.status!=='Uncertain'||!Array.isArray(last.before))refuse();
 return last;
}
class PcJournal{
 constructor(plan,targetTag,parent){
  fs.mkdirSync(directory,{recursive:true});
  this.file=path.join(directory,randomUUID()+'.jsonl');
  this.fd=fs.openSync(this.file,'wx');
  this.record={schema:1,targetTag,id:plan.id,sha256:plan.sha256,size:plan.size,status:'Created',before:null,upload:null,parent:parent?path.basename(parent):null};
  try{this.save({});}catch(error){fs.closeSync(this.fd);throw error;}
 }
 save(patch){Object.assign(this.record,patch);fs.writeSync(this.fd,JSON.stringify(this.record)+'\n');fs.fsyncSync(this.fd);}
 close(){fs.closeSync(this.fd);}
}
class PcLargeSession extends XiaomiSession{
 constructor(peer,plan){
  super(peer.link,{clock:peer.clock,sleep:peer.wait,...(peer.physical===true?{}:{phoneNonce:()=>Buffer.alloc(16,71)})});
  this.plan=plan;this.txBytes=0;this.txLimit=0;this.massPhase=false;
  // Initial auth/queries/ACKs plus bounded post-upload catalogue polling.
  this.commandFrames=0;this.massFrames=0;this.phase='New';
 }
 async send(frame){
  if(!Buffer.isBuffer(frame)||frame.length>4096||this.txBytes+frame.length>this.txLimit)refuse();
  if(frame[3]===5){if(!this.massPhase||++this.massFrames>4096)refuse();}
  else if(this.massPhase||++this.commandFrames>32)refuse();
  this.sentFrames++;this.txBytes+=frame.length;await this.link.send(frame);
 }
 encode(payload,auth=false){
  // The serial is an 8-bit wire field shared by PROTO/MASS; the encrypted
  // command nonce counter remains independent and monotonically increasing.
  this.serial&=255;return super.encode(payload,auth);
 }
 async query(type,subtype){
  await this.send(this.encode(command(type,subtype)));
  const reply=await this.waitCommand(type,subtype);if(!reply.encrypted)refuse();return reply;
 }
 async exchange(payload,type,subtype){
  await this.send(this.encode(payload));
  const reply=await this.waitCommand(type,subtype);if(!reply.encrypted)refuse();return reply;
 }
 dispose(){if(this.keys)for(const key of Object.values(this.keys))key.fill(0);this.authenticated=false;}
}

// The only accepted endpoint is minted by the in-process simulator. Passing
// PrivatePipe, a link factory, a hostname or a copied scope string is refused.
export async function runDoomUploadPc(endpoint,plan,secret,{resumeFrom=null,deploymentDirectory=null,deploymentResume=false,deploymentRetryWithoutData=false}={}){
 return runLargeUpload(()=>pcPeerAccess(endpoint),plan,secret,{resumeFrom,deploymentDirectory,deploymentResume,deploymentRetryWithoutData});
}
export async function runReviewedDoomDeployment(endpoint,plan,secret,{resume=false,retryWithoutData=false}={}){
 return runLargeUpload(()=>{
  if(plan?.kind==='review-ram-png-manual'){
   if(!physicalDoomRamPngEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-readers-r318-manual'){
   if(!physicalDoomReadersEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-fault-r321-manual'){
   if(!physicalDoomFaultEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-refs-r325-manual'){
   if(!physicalDoomRefsEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-lease-r327-manual'){
   if(!physicalDoomLeaseEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-hold-r329-manual'){
   if(!physicalDoomHoldEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-fast-r331-manual'){
   if(!physicalDoomFastEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-palette-r333-manual'){
   if(!physicalDoomPaletteEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-bench-r335-manual'){
   if(!physicalDoomBenchEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-demand-r337-manual'){
   if(!physicalDoomDemandEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-sound-r365-manual'){
   if(!physicalDoomSoundEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-ready-r351-manual'){
   if(!physicalDoomReadyEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-pads-r349-manual'){
   if(!physicalDoomPadsEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-wide-r347-manual'){
   if(!physicalDoomWideEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-touch-r345-manual'){
   if(!physicalDoomTouchEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind==='review-direct-r343-manual'){
   if(!physicalDoomDirectEnabled()||resume||retryWithoutData)refuse();
  }else if(plan?.kind!=='review-low-memory-native-disabled')refuse();
  return claimReviewedDoomEndpoint(endpoint,{resume,retryWithoutData});
 },plan,secret,{deploymentResume:resume,deploymentRetryWithoutData:retryWithoutData});
}
async function runLargeUpload(acquire,plan,secret,{resumeFrom=null,deploymentDirectory=null,deploymentResume=false,deploymentRetryWithoutData=false}={}){
 let peer,client,journal,parent,identity,upload=null,report={checkpoint:'R280',simulated:true,physicalEnabled:false,status:'StoppedNeedsReview',registeredVerified:false,contentVerified:false,selectedByClient:false,bluetoothOperationRequested:false,watchCommandRequested:false};
 try{
  peer=acquire();const data=packageCopy(plan),md5=digest(data);
  if(peer.physical)Object.assign(report,{checkpoint:'R286',simulated:false,physicalEnabled:true});
  if(!Buffer.isBuffer(secret)||secret.length!==16)refuse();
  if(deploymentDirectory!==null||peer.physical){
   if(resumeFrom!==null)refuse();
   identity=deploymentIdentity(peer.physical?peer.journalTarget:'pc:'+peer.targetTag,secret);
   journal=new DoomDeploymentJournal(plan,identity,{...(deploymentDirectory!==null?{directory:deploymentDirectory}:{}),resume:deploymentResume,retryWithoutData:deploymentRetryWithoutData});
   parent=journal.resumeRecord;
  }else{
   if(deploymentResume||deploymentRetryWithoutData)refuse();
   if(resumeFrom)parent=parentRecord(resumeFrom,plan,peer.targetTag);
   journal=new PcJournal(plan,peer.targetTag,resumeFrom);
  }
  client=new PcLargeSession(peer,plan);
  // Worst-case supported 2048-byte parts, plus <=32 small control frames.
  client.txLimit=uploadLayout(plan,{status:0,md5,chunkSize:2048,resumePosition:0}).wireBytes+8192;
  if(peer.physical)report.bluetoothOperationRequested=true;
  await peer.link.opened();client.phase='Authenticating';
  if(peer.physical)report.watchCommandRequested=true;
  await client.authenticate(secret,[1]);
  client.phase='DeviceInfo';
  const info=readDeviceInfo(await client.query(2,2));
  report.devicePreflight={expectedModel:info.modelRecognized===true,expectedFirmware:info.firmware==='2.2.86'};
  if(info.modelRecognized!==true||info.firmware!=='2.2.86')refuse();
  client.phase='CatalogPreflight';
  const before=catalog(readWatchfaces(await client.query(4,0)));
  if(plan.nativeLauncher&&!before.some(f=>f.id==='365219963'))refuse();
  if(plan.kind==='review-fault-r321-manual'&&!before.some(f=>f.id==='365219953'))refuse();
  const comparison=parent?compareDoomCatalogs(parent.before,before):null;
  const removalReview=deploymentRetryWithoutData&&parent?.attempt===3;
  const acceptedRemovals=removalReview&&reviewedTwoRemovals(parent.before,before);
  report.catalogPreflight={ownIdAbsent:!before.some(f=>f.id===plan.id),currentCount:before.length,...(comparison??{}),...(removalReview?{reviewedTwoRemovals:acceptedRemovals}:{})};
  if(before.some(f=>f.id===plan.id)||parent&&!(deploymentRetryWithoutData?(removalReview?acceptedRemovals:comparison.sameMembership):equal(parent.before,before)))refuse();
  journal.save({status:'InstallIntent',before});client.phase='InstallIntent';
  const install=envelope(4,4,6,bytes(6,Buffer.concat([bytes(1,Buffer.from(plan.id)),uint(2,plan.size)])));
  const installAck=await client.exchange(install,4,4);
  const installStatus=one(fields(one(installAck.parsed,6,2)),5,0);
  report.installStatus=installStatus;if(installStatus!==0)refuse();
  journal.save({status:'UploadIntent'});client.phase='UploadIntent';
  const request=envelope(22,0,24,bytes(1,Buffer.concat([uint(1,16),bytes(2,md5),uint(3,plan.size)])));
  report.uploadAck={stage:'Waiting'};
  const reply=await client.exchange(request,22,0);
  const ack=parseDoomUploadAck(reply,md5,{resuming:!!parent?.upload,diagnostic:value=>{report.uploadAck=value;}});
  const layout=uploadLayout(plan,ack,parent?.upload??null);
  if(client.txBytes+layout.wireBytes+6*32>client.txLimit)refuse();
  journal.save({status:'Uploading'});client.phase='Uploading';client.massPhase=true;
  const initialSerial=client.serial;
  upload=await (peer.physical?uploadToReviewedAdapter:uploadToPcAdapter)(plan,ack,{
   scope:peer.physical?'reviewed-doom-deployment':'pc-upload-simulator',...(peer.physical?{peer}:{}),key:client.keys.tx,noncePrefix:client.keys.txNonce,
   initialSerial,txBudgetBytes:layout.wireBytes,clock:peer.clock,wait:peer.wait,
   checkpoint:record=>journal.save({upload:record}),send:frame=>client.send(frame)
  },parent?.upload??null);
  client.serial=(initialSerial+client.massFrames)&255;client.massPhase=false;
  if(upload.status!=='SentNotVerified')refuse();
  journal.save({status:'SentNotVerified',upload});client.phase='Verifying';
  await peer.wait(1000);
  report.status='SentNotVerified';
  for(let i=0;i<6;i++){
   const after=catalog(readWatchfaces(await client.query(4,0)));
   if(before.some(f=>!after.some(a=>a.id===f.id)))refuse();
   const own=after.find(f=>f.id===plan.id);
   if(own){
    report.registeredVerified=true;
    report.status=own.active?'UnexpectedActivation':!after.some(f=>f.id===before.find(b=>b.active).id&&f.active)?'UnexpectedSelection':!own.canDelete?'RegisteredNotRemovable':'RegisteredInactive';
    break;
   }
   if(i<5)await peer.wait(500);
  }
  journal.save({status:report.status,upload});client.phase='Finished';
 }catch(error){
  report.status='StoppedNeedsReview';
  report.failureReason=new Set(['LargeSessionRefused','DoomLargeUploadRefused','DoomJournalRefused','DoomPhysicalGateClosed','AuthHmacMismatch','UnsupportedProtocol','Timeout','MalformedProtocol','DecryptionFailed','AuthOrQueryRejected','UploadAckEnvelope','UploadAckFieldEncoding','UploadAckHashMismatch','UploadAckResumeIdentityMissing','UploadAckRejected','UploadAckChunkUnsupported','UploadAckOffsetInvalid']).has(error?.message)?error.message:'LocalFailure';
  if(journal){
   // No automatic retry. Preserve the last pre-write bound if delivery is
   // ambiguous, including failures after local MASS completion.
   const prior=upload??journal.record.upload;
   const uncertain=prior?{...prior,status:'Uncertain'}:null;
   try{journal.save({status:'Uncertain',upload:uncertain});}catch{report.journalSaved=false;}
  }
 }finally{
  if(Buffer.isBuffer(secret))secret.fill(0);
  if(peer){
   try{const closed=await peer.link.close();report.closeConfirmed=closed.closeConfirmed;
    if(closed.workerExitConfirmed!==undefined)Object.assign(report,{workerExitConfirmed:closed.workerExitConfirmed,workerExitCode:closed.workerExitCode,workerWireVerified:closed.wireIntegrityVerified});
    if(!closed.closeConfirmed||closed.workerExitConfirmed===false||closed.nativeError||closed.workerExitCode!==undefined&&closed.workerExitCode!==0||closed.wireIntegrityVerified===false){report.status='StoppedNeedsReview';journal?.save({status:'Uncertain',upload:upload?{...upload,status:'Uncertain'}:null});}
   }catch{
    report.closeConfirmed=false;report.status='StoppedNeedsReview';
    try{const prior=upload??journal?.record.upload;journal?.save({status:'Uncertain',upload:prior?{...prior,status:'Uncertain'}:null});}catch{report.journalSaved=false;}
   }
  }
  client?.dispose();
  try{journal?.close();}catch{report.status='StoppedNeedsReview';report.journalCloseConfirmed=false;}
  disposeDeploymentIdentity(identity);
 }
 return {...report,phase:client?.phase??'BeforeConnection',journal:journal?path.relative(root,journal.file).replaceAll('\\','/'):null,
  sentFrames:client?.sentFrames??0,txBytes:client?.txBytes??0,massPartsLocallyWritten:upload?.locallyWritten??0,
  resumeOffset:upload?.offset??null};
}
