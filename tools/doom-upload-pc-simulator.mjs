// Synthetic Xiaomi receiver. Never imports a native transport or opens radio.
import assert from 'node:assert/strict';
import {createHash,createHmac,hkdfSync,createCipheriv,createDecipheriv} from 'node:crypto';
import {FrameReader,v1Frame,command,fields,one,uint,bytes} from './rw4-xiaomi-protocol.mjs';
import {packageCopy} from './doom-large-upload.mjs';
import {LargeUploadPcPipe} from './doom-upload-pc-pipe.mjs';
import {retailPlan,uploadLimits} from './doom-retail-limits-r374.mjs';
const peers=new WeakMap(),digest=(b,a='md5')=>createHash(a).update(b).digest();
function ccm(key,nonce,input,decrypt=false){
 const c=decrypt?createDecipheriv('aes-128-ccm',key,nonce,{authTagLength:4}):createCipheriv('aes-128-ccm',key,nonce,{authTagLength:4});
 const body=decrypt?input.subarray(0,-4):input;if(decrypt)c.setAuthTag(input.subarray(-4));
 c.setAAD(Buffer.alloc(0),{plaintextLength:body.length});
 return Buffer.concat([c.update(body),c.final(),...(decrypt?[]:[c.getAuthTag()])]);
}
function referenceCrc(b){let crc=0xffffffff;for(const value of b){crc^=value;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
const scenarios=new Set(['ok','bad-key','v2','wrong-model','wrong-fw','collision','clear-response','reject','bad-md5','bad-offset','bad-chunk','disconnect','native-send-timeout','missing','active','protected','unrelated-lost','close-failure','deadline']);
export function createDoomUploadPcPeer(plan,{scenario='ok',chunkSize=2048,resumePosition=0,target='fixture-one',ackShape='complete',catalogRows=null}={}){
 if(!scenarios.has(scenario)||![2048,4080].includes(chunkSize)||!Number.isInteger(resumePosition)||resumePosition<0||resumePosition>=plan.size||!/^fixture-[a-z]+$/.test(target)||!['complete','stock-minimal','defaults'].includes(ackShape)||ackShape!=='complete'&&(chunkSize!==2048||resumePosition!==0||scenario!=='ok'))throw Error('PcPeerRefused');
 if(catalogRows!==null&&(!Array.isArray(catalogRows)||catalogRows.length>64||catalogRows.filter(r=>r.active).length!==1||catalogRows.some(r=>!/^\d{9}$/.test(r.id)||typeof r.active!=='boolean'||typeof r.canDelete!=='boolean')||new Set(catalogRows.map(r=>r.id)).size!==catalogRows.length))throw Error('PcPeerRefused');
 const initialCatalog=catalogRows?.map(r=>({...r}));
 const data=packageCopy(plan),reader=new FrameReader(),queue=[],parts=[],secret=Buffer.alloc(16,37);
 const stats={mutations:0,massFrames:0,sentFrames:0,bytes:0,closeCalls:0,wireVerified:false,commandAfterWrap:false,highestReceivedOffset:resumePosition,commandCounters:[]};
 let now=0,material=null,rx,tx,rxNonce,txNonce,uploaded=false,expectSerial=0,authReceived=false,installReceived=false,uploadReceived=false;
 const reply=(payload,encrypted=false)=>{
  const frame=v1Frame(2,encrypted?ccm(rx,rxNonce,payload):payload,{dataType:encrypted?1:2});frame[3]=1;
  for(let at=0;at<frame.length;at+=7)queue.push(frame.subarray(at,at+7));
 };
 const link={
  async opened(){},
  async read(){return queue.shift()??Buffer.alloc(0);},
  async close(){stats.closeCalls++;for(const b of [material,secret])b?.fill(0);return{closeConfirmed:scenario!=='close-failure',...(scenario==='native-send-timeout'?{workerExitConfirmed:true,workerExitCode:1,nativeError:true,nativeOutcome:'Deadline',nativeErrorCode:null,failureStage:'Send',supervisor:null}:{})};},
  async send(buffer){
   assert(buffer.length<=4096);stats.sentFrames++;stats.bytes+=buffer.length;assert(stats.bytes<=uploadLimits(plan).wireBytes);assert(stats.sentFrames<=uploadLimits(plan).parts+32);
   reader.push(buffer);const f=reader.next();assert(f);assert.equal(reader.next(),null);
   if(f.channel===0){queue.push(v1Frame(0,Buffer.from([scenario==='v2'?2:1]),{dataType:0}));return;}
   assert.equal(f.serial,expectSerial++&255);
   if(f.channel===5){
    assert(authReceived&&uploadReceived);assert.equal(f.flags,128);assert.equal(f.op,2);assert.equal(f.dataType,1);
    const part=ccm(tx,txNonce,f.payload,true);assert.equal(part.readUInt16LE(2),parts.length+1);
    assert(part.length<=chunkSize);parts.push(part);stats.massFrames++;
    const streamBytes=parts.reduce((n,p)=>n+p.length-4,0);
    stats.highestReceivedOffset=Math.min(data.length,resumePosition+Math.max(0,streamBytes-22));
    if(['disconnect','native-send-timeout'].includes(scenario)&&stats.massFrames===11)throw Error('PRIVATE-CANARY');
    if(parts.length===part.readUInt16LE()){
     assert(parts.every(p=>p.readUInt16LE()===parts.length));
     const stream=Buffer.concat(parts.map(p=>p.subarray(4)));
     assert.equal(stream[0],0);assert.equal(stream[1],16);assert.equal(stream.readUInt32LE(18),data.length);
     assert(stream.subarray(2,18).equals(digest(data)));assert(stream.subarray(22,-4).equals(data.subarray(resumePosition)));
     assert.equal(stream.readUInt32LE(stream.length-4),referenceCrc(stream.subarray(0,-4)));
     stats.wireVerified=true;uploaded=true;
    }
    return;
   }
   assert.equal(f.channel,2);let payload=f.payload;
   if(f.dataType===1){
    assert(authReceived);const counter=payload.readUInt16LE();assert.equal(counter,stats.commandCounters.length+1);stats.commandCounters.push(counter);
    const nonce=Buffer.from(txNonce);nonce.writeUInt32LE(counter,8);payload=ccm(tx,nonce,payload.subarray(2),true);
    if(stats.massFrames>255)stats.commandAfterWrap=true;
   }
   const parsed=fields(payload),type=one(parsed,1,0),subtype=one(parsed,2,0);
   if(type===1&&subtype===26){
    const phone=one(fields(one(fields(one(parsed,3,2)),30,2)),1,2),watch=Buffer.alloc(16,53);
    material=Buffer.from(hkdfSync('sha256',scenario==='bad-key'?Buffer.alloc(16):secret,Buffer.concat([phone,watch]),Buffer.from('miwear-auth'),64));
    rx=material.subarray(0,16);tx=material.subarray(16,32);rxNonce=Buffer.alloc(12);txNonce=Buffer.alloc(12);
    material.subarray(32,36).copy(rxNonce);material.subarray(36,40).copy(txNonce);
    reply(command(1,26,bytes(31,Buffer.concat([bytes(1,watch),bytes(2,createHmac('sha256',rx).update(Buffer.concat([watch,phone])).digest())]))));return;
   }
   if(type===1&&subtype===27){
    const auth=fields(one(fields(one(parsed,3,2)),32,2));
    assert(one(auth,1,2).equals(createHmac('sha256',tx).update(Buffer.concat([Buffer.alloc(16,71),Buffer.alloc(16,53)])).digest()));
    assert(ccm(tx,txNonce,one(auth,2,2),true).length>0);
    authReceived=true;reply(command(1,27,bytes(33,uint(1,1))));return;
   }
   const response=(field,body)=>reply(Buffer.concat([uint(1,type),uint(2,subtype),bytes(field,body)]),scenario!=='clear-response');
   if(type===2&&subtype===2){response(4,bytes(3,Buffer.concat([bytes(2,Buffer.from(scenario==='wrong-fw'?'2.2.87':'2.2.86')),bytes(4,Buffer.from(scenario==='wrong-model'?'OTHER':'M2315W1'))])));return;}
   if(type===4&&subtype===0){
    const rows=[];if(!(uploaded&&scenario==='unrelated-lost')){
     if(initialCatalog)for(const r of initialCatalog)rows.push(bytes(1,Buffer.concat([bytes(1,Buffer.from(r.id)),uint(3,uploaded&&scenario==='active'?0:r.active?1:0),uint(4,r.canDelete?1:0)])));
     else rows.push(bytes(1,Buffer.concat([bytes(1,Buffer.from('123456789')),uint(3,uploaded&&scenario==='active'?0:1),uint(4,0)])));
    }
    if((uploaded&&scenario!=='missing')||scenario==='collision')rows.push(bytes(1,Buffer.concat([bytes(1,Buffer.from(plan.id)),uint(3,scenario==='active'?1:0),uint(4,scenario==='protected'?0:1)])));
    response(6,bytes(1,Buffer.concat(rows)));return;
   }
   stats.mutations++;
   if(type===4&&subtype===4){
    assert(!installReceived);const start=fields(one(fields(one(parsed,6,2)),6,2));
    assert.equal(one(start,1,2).toString(),plan.id);assert.equal(one(start,2,0),data.length);installReceived=true;
    response(6,uint(5,scenario==='reject'?3:0));return;
   }
   assert.equal(type,22);assert.equal(subtype,0);assert(installReceived&&!uploadReceived);uploadReceived=true;
   const start=fields(one(fields(one(parsed,24,2)),1,2));assert.equal(one(start,1,0),16);
   assert(one(start,2,2).equals(digest(data)));assert.equal(one(start,3,0),data.length);
   response(24,bytes(2,ackShape==='stock-minimal'?uint(2,0):ackShape==='defaults'?Buffer.alloc(0):Buffer.concat([bytes(1,scenario==='bad-md5'?Buffer.alloc(16):digest(data)),uint(2,0),uint(4,scenario==='bad-offset'?data.length-1:resumePosition),uint(5,scenario==='bad-chunk'?4096:chunkSize)])));
  }
 };
 const endpoint=Object.freeze({kind:'owned-pc-xiaomi-peer',physicalEnabled:false});
 let claimed=false;
 peers.set(endpoint,{access:Object.freeze({link:Object.freeze(link),clock:()=>now,wait:async ms=>{now+=scenario==='deadline'?600001:ms;},targetTag:digest(Buffer.from('PC ONLY:'+target),'sha256').toString('hex')}),stats,
  claim(){if(claimed)throw Error('PcPeerRefused');claimed=true;}});
 return endpoint;
}
export function pcPeerAccess(endpoint){const p=peers.get(endpoint);if(!p)throw Error('PcPeerRefused');p.claim();return p.access;}
export function pcPeerSummary(endpoint){const p=peers.get(endpoint);if(!p)throw Error('PcPeerRefused');return{...p.stats,commandCounters:[...p.stats.commandCounters]};}

// Native executable IPC, but still an owned synthetic peer and no radio. Both
// transmitted frames and injected synthetic replies cross the C# worker loop.
export function createDoomUploadIpcPeer(plan,options={}){
 const endpoint=createDoomUploadPcPeer(plan,options),p=peers.get(endpoint),base=p.access;
 const pipe=new LargeUploadPcPipe('bridge',{retail:retailPlan(plan)});let integrity=false;
 const link=Object.freeze({
  opened:()=>pipe.opened(),
  send:async b=>{await pipe.send(b);await base.link.send(b);},
  read:async()=>pipe.readSynthetic(await base.link.read()),
  close:async()=>{
   try{integrity=await pipe.summary();}catch{}
   const closed=await pipe.close();await base.link.close();
   p.stats.workerWireVerified=integrity;
   return{...closed,wireIntegrityVerified:integrity};
  }
 });
 p.access=Object.freeze({...base,link});return endpoint;
}
