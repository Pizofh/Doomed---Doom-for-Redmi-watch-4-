// Package pins and bounded upload algorithm. No connection is opened here.
// Do not relax the existing probe/session/native-worker limits to use this.
import {createHash} from 'node:crypto';
import {crc32} from './static-watchface-transfer.mjs';
import {ccmEncrypt,packetNonce} from './rw4-xiaomi-protocol.mjs';
import {isReviewedDoomPeer} from './doom-deployment-physical.mjs';
import {uploadLimits} from './doom-retail-limits-r374.mjs';
const owned=new WeakMap(),hash=(b,a='sha256')=>createHash(a).update(b).digest('hex');
const refuse=()=>{throw Error('DoomLargeUploadRefused');};
function mint(b,id,kind){
 const nativeLauncher=['review-start-r383-manual','review-lean-r382-manual','review-boot-r381-manual','review-ultimate-r374-manual','review-packed-r378-manual','review-ram-png-manual','review-readers-r318-manual','review-fault-r321-manual','review-refs-r325-manual','review-lease-r327-manual','review-hold-r329-manual','review-fast-r331-manual','review-palette-r333-manual','review-bench-r335-manual','review-demand-r337-manual','review-direct-r343-manual','review-touch-r345-manual','review-wide-r347-manual','review-pads-r349-manual','review-ready-r351-manual','review-sound-r365-manual','review-audio-r367-manual','review-voice-r369-manual','review-menu-r370-manual'].includes(kind);
 const p=Object.freeze({id,size:b.length,sha256:hash(b),kind,nativeLauncher,physicalEnabled:false});owned.set(p,b);return p;
}
export function prepareDoomAssets(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==4807680||hash(raw)!=='387e6c80616296ca7c8727e1a356e169c5b3575e1f2c33d4c9e9a32729ffa7c9'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='167210065'||raw[49]!==0)refuse();
 const b=Buffer.from(raw);b.write('365219963',40,9,'ascii');
 return mint(b,'365219963','review-carrier');
}
// Separate pin: do not broaden the older inert carrier's acceptance rules.
export function prepareDoomLauncher(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==4827012||hash(raw)!=='1d6df25e064336122ce56449856d828dd1e30532d4b8fcb0c1467a4343db799b'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219963'||raw[49]!==0)refuse();
 // RW4 candidate still has allow_native=false. This factory opens no transport.
 return mint(Buffer.from(raw),'365219963','review-launcher-native-disabled');
}
export function prepareDoomLowMemory(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==4827044||hash(raw)!=='d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219963'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219963','review-low-memory-native-disabled');
}
// Independent reviewed native+UI update. No WAD included; manual START only.
export function prepareDoomRamPng(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==634212||hash(raw)!=='98d0c6c54a16e4c1575e170d6add896df742d26cbff445a6d4a38bfa31338326'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219957'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219957','review-ram-png-manual');
}
// New C/ID/hash and a separate gate/journal. Older pins remain immutable.
export function prepareDoomReaders(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==637108||hash(raw)!=='5fb7ec0b289a7492a0d97b3ef798de9aeba0003f2510be8c58b6d331d909a823'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219953'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219953','review-readers-r318-manual');
}
// Lua-only first/last-fault recorder, referencing the installed R318 ELF.
export function prepareDoomFault(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==35060||hash(raw)!=='836cb01accfaf7a403c9629757ea8d5620586c140cd0cf8af4ae52d679718106'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219952'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219952','review-fault-r321-manual');
}
// Protocol2 C diagnostics and UI, with independent ID/hash/gate/journal.
export function prepareDoomRefs(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==644796||hash(raw)!=='f514f46706ec100481af51453dcf3b54f63b24383145fce17fdd81f1a136a8c0'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219951'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219951','review-refs-r325-manual');
}
// Explicit presentation reservation; independent package, gate and journal.
export function prepareDoomLease(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==645404||hash(raw)!=='502dbc6b9081ad7f61da0d7377e6809ee7a6f957b24138d77a854cb1a0e63a95'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219950'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219950','review-lease-r327-manual');
}
export function prepareDoomHold(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==645476||hash(raw)!=='be5f8cf0568fa6868c1477822fc3ef2611c8e4788f2d3a9d2b87b987887836b1'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219949'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219949','review-hold-r329-manual');
}
export function prepareDoomFast(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==645588||hash(raw)!=='7dbecda4486d1f9314dffcceacf2c82abc726d6260ac1f5c056f97e329af38fd'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219948'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219948','review-fast-r331-manual');
}
export function prepareDoomPalette(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==645952||hash(raw)!=='ebb889227feafa8fd7cf1fa820d2170723847dfc49c5642911b9673f3a19c26f'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219947'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219947','review-palette-r333-manual');
}
export function prepareDoomBench(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==649256||hash(raw)!=='4ab579c492a51f5743d5c5f71b362f2d96f56ca43fdc24b306562a59a904ac38'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219946'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219946','review-bench-r335-manual');
}
export function prepareDoomDemand(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==645148||hash(raw)!=='149d7a2ac8bdeaebfb4a36f090f747c5d7b26c77807d17dd32e5674a9cde7071'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219945'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219945','review-demand-r337-manual');
}
export function prepareDoomDirect(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==640508||hash(raw)!=='a0ddd3fce496c88cebb6d3ceea6fef18e8aa54fd65734b5ecf01357baf013bd6'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219944'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219944','review-direct-r343-manual');
}
export function prepareDoomTouch(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==644560||hash(raw)!=='c686a9b4d5c13ae004a452866939c19539119ecb5cc792b71831c4c303ec1a0c'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219943'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219943','review-touch-r345-manual');
}
export function prepareDoomWide(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==646628||hash(raw)!=='275e1aa7383f021af2cbb549ad170991d38f2b25912f99f18bfe59234b8c96b3'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219942'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219942','review-wide-r347-manual');
}
export function prepareDoomPads(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==646764||hash(raw)!=='e2290d4225e208c6c2e398b499b3c37af80fc96942dd5764d83e319487f2ff38'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219941'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219941','review-pads-r349-manual');
}
export function prepareDoomReady(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==660896||hash(raw)!=='fa2146fde2cb9bba9a7637779c747fdbbb24faf62e7b56386c66e575f3ead5c8'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219940'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219940','review-ready-r351-manual');
}
export function prepareDoomSound(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==669676||hash(raw)!=='26fd403d01e2ac79120d2102bd49ca7f3272a61ff05a24ee623fbc7137235ad6'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219939'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219939','review-sound-r365-manual');
}
export function prepareDoomAudio(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==669980||hash(raw)!=='1b7887eddc2a609460fb521a29c7f8a57476c0c301bc9cf261286fa5fdb38f05'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219938'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219938','review-audio-r367-manual');
}
export function prepareDoomVoice(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==672372||hash(raw)!=='dca5c7cdb2c21da337275e85841b54286b56d10e267fe35d403d7a28d1ecc348'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219937'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219937','review-voice-r369-manual');
}
export function prepareDoomMenu(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==673488||hash(raw)!=='f95a8d3bf5882aa5d7af5dca089a0ecd8841546df876d6f8da36685a8f3bf4a8'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365219936'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365219936','review-menu-r370-manual');
}
export function prepareDoomUltimate(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==13090600||hash(raw)!=='dfd89cd54542142a3cddb5dd444f6553fbd648b6e9d7dd1140f9b67b464ad8ca'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365220001'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365220001','review-ultimate-r374-manual');
}
export function syntheticRetailUpload(){const b=Buffer.alloc(13090600);for(let i=0;i<b.length;i++)b[i]=(i*29+(i>>>8))&255;Buffer.from('PC ONLY RETAIL FIXTURE').copy(b);return mint(b,'365799997','synthetic-retail-r374');}
export function prepareDoomPacked(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==6165808||hash(raw)!=='069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365220002'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365220002','review-packed-r378-manual');
}
export function prepareDoomBoot(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==41900||hash(raw)!=='fa971e356a2d7d79757eb9deae49e3475285d1b24ed83cb13101ab070c6cca9a'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365220003'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365220003','review-boot-r381-manual');
}
export function prepareDoomLean(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==42312||hash(raw)!=='49e2e10535cbca4466248b10bf77d96c64a679774cb2b21486489ea083bb7901'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365220004'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365220004','review-lean-r382-manual');
}
export function prepareDoomStart(raw){
 if(!Buffer.isBuffer(raw)||raw.length!==47200||hash(raw)!=='4f81e1a07f9ab9044236adbb2adf8c647ec32341c569662070c57a63f50e257a'||raw.subarray(0,4).toString('hex')!=='5aa53412'||raw[5]!==0||raw.subarray(40,49).toString('ascii')!=='365220005'||raw[49]!==0)refuse();
 return mint(Buffer.from(raw),'365220005','review-start-r383-manual');
}
// Reproducible, owned non-game bytes for public CI. Never an installable face.
export function syntheticDoomUpload(size=4807680){if(![4807680,4827012,4827044].includes(size))refuse();const b=Buffer.alloc(size);for(let i=0;i<b.length;i++)b[i]=(i*29+(i>>>8))&255;Buffer.from('PC ONLY UPLOAD FIXTURE').copy(b);return mint(b,'365799998','synthetic-only');}
export function packageCopy(plan){const b=owned.get(plan);if(!b)refuse();return Buffer.from(b);}
export function uploadStream(plan,offset=0){
 const b=owned.get(plan);if(!b||!Number.isInteger(offset)||offset<0||offset>=b.length)refuse();
 const body=Buffer.alloc(22+b.length-offset);body[1]=16;Buffer.from(hash(b,'md5'),'hex').copy(body,2);body.writeUInt32LE(b.length,18);b.copy(body,22,offset);
 const tail=Buffer.alloc(4);tail.writeUInt32LE(crc32(body));return Buffer.concat([body,tail]);
}
function validatePrevious(p,plan){
 if(!p||p.schema!==1||p.id!==plan.id||p.sha256!==plan.sha256||p.size!==plan.size||p.status!=='Uncertain'||
  !Number.isInteger(p.highestPossibleOffset)||p.highestPossibleOffset<1||p.highestPossibleOffset>plan.size||
  !Number.isInteger(p.offset)||p.offset<0||p.offset>=plan.size||p.highestPossibleOffset<p.offset)refuse();
}
export function uploadLayout(plan,ack,previous=null){
 const b=owned.get(plan);if(!b||!ack||ack.status!==0||!Buffer.isBuffer(ack.md5)||ack.md5.length!==16||ack.md5.toString('hex')!==hash(b,'md5')||![2048,4080].includes(ack.chunkSize)||!Number.isInteger(ack.resumePosition)||ack.resumePosition<0||ack.resumePosition>=b.length)refuse();
 if(previous){validatePrevious(previous,plan);if(ack.resumePosition<previous.offset||ack.resumePosition>previous.highestPossibleOffset)refuse();}
 else if(ack.resumePosition!==0)refuse();
 const stream=uploadStream(plan,ack.resumePosition),partBytes=ack.chunkSize-4,total=Math.ceil(stream.length/partBytes);
 if(total<1||total>uploadLimits(plan).parts)refuse();
 return {stream,partBytes,total,offset:ack.resumePosition,chunkSize:ack.chunkSize,
  wireBytes:stream.length+total*19, // per-part LE16/LE16 + CCM4 + outer11
  part(index){if(!Number.isInteger(index)||index<1||index>total)refuse();const p=Buffer.alloc(4+Math.min(partBytes,stream.length-(index-1)*partBytes));p.writeUInt16LE(total);p.writeUInt16LE(index,2);stream.copy(p,4,(index-1)*partBytes,Math.min(index*partBytes,stream.length));return p;}};
}
export function massFrame(part,key,prefix,serial){
 if(!Buffer.isBuffer(part)||part.length<5||part.length>4080||!Buffer.isBuffer(key)||key.length!==16||!Buffer.isBuffer(prefix)||prefix.length!==4||!Number.isSafeInteger(serial)||serial<0)refuse();
 const cipher=ccmEncrypt(key,packetNonce(prefix),part),b=Buffer.alloc(cipher.length+11);
 Buffer.from('badcfe','hex').copy(b);b[3]=5;b[4]=128;b.writeUInt16LE(cipher.length+3,5);b[7]=2;b[8]=serial&255;b[9]=1;cipher.copy(b,10);b[b.length-1]=239;return b;
}
export async function uploadToPcAdapter(plan,ack,api,previous=null){
 if(api?.scope!=='pc-upload-simulator')refuse();
 return uploadWithAdapter(plan,ack,api,previous);
}
export async function uploadToReviewedAdapter(plan,ack,api,previous=null){
 if(api?.scope!=='reviewed-doom-deployment'||!isReviewedDoomPeer(api.peer))refuse();
 return uploadWithAdapter(plan,ack,api,previous);
}
async function uploadWithAdapter(plan,ack,api,previous=null){
 const layout=uploadLayout(plan,ack,previous);
 // Transport authority is checked by the separate entry points above.
 if(typeof api.send!=='function'||typeof api.checkpoint!=='function'||typeof api.wait!=='function'||typeof api.clock!=='function'||!Number.isSafeInteger(api.initialSerial)||api.initialSerial<0||api.txBudgetBytes!==layout.wireBytes||!Buffer.isBuffer(api.key)||api.key.length!==16||!Buffer.isBuffer(api.noncePrefix)||api.noncePrefix.length!==4)refuse();
 const record={schema:1,id:plan.id,sha256:plan.sha256,size:plan.size,status:'Ready',offset:layout.offset,chunkSize:layout.chunkSize,totalParts:layout.total,locallyWritten:0,wireBytes:0,highestPossibleOffset:layout.offset,remoteInstallationVerified:false};
 const began=api.clock();
 const snapshot=()=>Object.freeze({...record});
 try{
  for(let first=1;first<=layout.total;first+=32){
   const last=Math.min(first+31,layout.total);
   record.status='Intent';record.batchFirst=first;record.batchLast=last;
   record.highestPossibleOffset=Math.min(plan.size,layout.offset+Math.max(0,last*layout.partBytes-22));
   // Persist intent before ANY bytes in this bounded batch. A crash can leave
   // up to32 possible writes; local queue completion is never a remote ACK.
   await api.checkpoint(snapshot());
   for(let i=first;i<=last;i++){
    if(api.clock()-began>uploadLimits(plan).uploadMs)throw Error('DoomUploadDeadline');
    const frame=massFrame(layout.part(i),api.key,api.noncePrefix,api.initialSerial+i-1);
    if(record.wireBytes+frame.length>api.txBudgetBytes)refuse();
    await api.send(frame);record.locallyWritten=i;record.wireBytes+=frame.length;
    if(i<layout.total)await api.wait(100);
   }
   record.status='LocallyWritten';await api.checkpoint(snapshot());
  }
  record.status='SentNotVerified';await api.checkpoint(snapshot());return snapshot();
 }catch(error){
  record.status='Uncertain';let journalSaved=true;try{await api.checkpoint(snapshot());}catch{journalSaved=false;}
  return {...record,journalSaved,error:error.message==='DoomUploadDeadline'?'Deadline':'AdapterOrJournalFailure'};
 }
}
