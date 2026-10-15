// Stock optional fields, verified against the locally reviewed xiaomi.proto
// and XiaomiDataUploadService.java. Never captures raw response bytes or MD5.
import {fields,one} from './rw4-xiaomi-protocol.mjs';
const fail=code=>{throw Error(code);};
export function parseDoomUploadAck(reply,expectedMd5,{resuming=false,diagnostic=()=>{}}={}){
 if(!reply||reply.encrypted!==true||reply.type!==22||reply.subtype!==0||!Buffer.isBuffer(expectedMd5)||expectedMd5.length!==16)fail('UploadAckEnvelope');
 diagnostic({stage:'Envelope'});let ack;
 try{ack=fields(one(fields(one(reply.parsed,24,2)),2,2));}catch{fail('UploadAckEnvelope');}
 const present={md5:ack.has(1),status:ack.has(2),offset:ack.has(4),chunk:ack.has(5)};
 diagnostic({stage:'Fields',present});
 let md5,status,offset,chunk;
 try{md5=one(ack,1,2,false);status=one(ack,2,0,false)??0;offset=one(ack,4,0,false)??0;chunk=one(ack,5,0,false)??2048;}catch{fail('UploadAckFieldEncoding');}
 if(md5!==null&&(md5.length!==16||!md5.equals(expectedMd5)))fail('UploadAckHashMismatch');
 if(resuming&&(!present.md5||!present.offset))fail('UploadAckResumeIdentityMissing');
 if(status!==0)fail('UploadAckRejected');
 if(![2048,4080].includes(chunk))fail('UploadAckChunkUnsupported');
 if(!Number.isInteger(offset)||offset<0||offset>0xffffffff)fail('UploadAckOffsetInvalid');
 const evidence={stage:'Parsed',present,md5EchoMatches:md5===null?null:true,status,resumePosition:offset,chunkSize:chunk};diagnostic(evidence);
 // The uploader always embeds LOCAL expected MD5 in the request and stream.
 // Absence of an echo is explicitly reported; it is NOT remote hash validation.
 return {status,md5:Buffer.from(md5??expectedMd5),resumePosition:offset,chunkSize:chunk,evidence};
}
