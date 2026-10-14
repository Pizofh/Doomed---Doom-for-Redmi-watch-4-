// Synthetic SPP peer with a staged prefix, using the real client and fake IPC.
class ResumePeer extends Peer {
 constructor({offset=22462,md5='correct',chunk=2048,unknown=0,prefixCorrupt=false}={}){super('ok',chunk);this.offset=offset;this.md5=md5;this.unknown=unknown;this.prefixCorrupt=prefixCorrupt;}
 reply(payload,encrypted=false){
  const c=decodeCommand(payload);
  if(c.type===22&&c.subtype===0)payload=Buffer.concat([uint(1,22),uint(2,0),bytes(24,bytes(2,Buffer.concat([
   ...(this.md5==='missing'?[]:[bytes(1,this.md5==='wrong'?Buffer.alloc(16):plan.md5())]),uint(2,this.unknown),uint(4,this.offset),uint(5,this.chunkSize)
  ])))]); // field24 DataUploadAck envelope.
  return super.reply(payload,encrypted);
 }
 async send(buffer){
  const reader=new FrameReader();reader.push(buffer);const f=reader.next();assert(f);
  if(f.channel!==5)return super.send(buffer);
  this.sentBytes+=buffer.length;this.sentFrames++;assert(this.sentBytes<=32768);
  const p=ccm(this.tx,this.txNonce,f.payload,true);
  assert.equal(p.readUInt16LE(),1);assert.equal(p.readUInt16LE(2),1);assert.equal(this.parts.length,0);
  const disk=JSON.parse(fs.readFileSync(this.journalFile,'utf8'));assert.equal(disk.phase,'Sending');assert.equal(disk.partsWritten,0);
  const body=p.subarray(4);assert.equal(body.length,1912);assert.equal(body[0],0);assert.equal(body[1],16);
  assert(body.subarray(2,18).equals(plan.md5()));assert.equal(body.readUInt32LE(18),24348);
  assert(body.subarray(22,-4).equals(data.subarray(22462)));assert.equal(body.readUInt32LE(body.length-4),crc32(body.subarray(0,-4)));
  const prefix=Buffer.from(data.subarray(0,22462));if(this.prefixCorrupt)prefix[0]^=1;
  const whole=Buffer.concat([prefix,body.subarray(22,-4)]);assert.equal(whole.length,data.length);
  this.uploaded=createHash('md5').update(whole).digest().equals(plan.md5());this.parts.push(p);
 }
}
let checks=0;
const resumed=chunks(plan,2048,22462);assert.equal(resumed.length,1);assert.equal(resumed[0].length,1916);assert.equal((2048-4)*11-22,22462);checks++;
for(const bad of[-1,1,22461,22463,24348,NaN,'22462',null]){assert.throws(()=>chunks(plan,2048,bad));checks++;}
assert.throws(()=>chunks(plan,1024,22462));checks++;
const otherPlan=prepareStatic(fs.readFileSync(path.join(root,'artifacts/state-match-r261/StateMatch-id-only.face')),{variant:'r261'});assert.throws(()=>chunks(otherPlan,2048,22462));checks++;
for(const[label,params,profile,want]of[
 ['success',{},'exit-resume-r270','RegisteredInactive'],
 ['zero',{offset:0},'exit-resume-r270','StoppedNeedsReview'],
 ['different',{offset:22300},'exit-resume-r270','StoppedNeedsReview'],
 ['end',{offset:24348},'exit-resume-r270','StoppedNeedsReview'],
 ['md5missing',{md5:'missing'},'exit-resume-r270','StoppedNeedsReview'],
 ['md5wrong',{md5:'wrong'},'exit-resume-r270','StoppedNeedsReview'],
 ['chunkwrong',{chunk:1024},'exit-resume-r270','StoppedNeedsReview'],
 ['unknown',{unknown:1},'exit-resume-r270','StoppedNeedsReview'],
 ['default-refuses',{},'default','StoppedNeedsReview'],
 ['paced-refuses',{},'exit-r268','StoppedNeedsReview'],
 ['prefix-corrupt',{prefixCorrupt:true},'exit-resume-r270','SentNotVerified']
]){
 const file=journalFile(label),peer=new ResumePeer(params),journal=new StaticJournal(file,address,plan),key=Buffer.from(secret),delays=[];peer.journalFile=file;
 const result=await runStaticSession(pipe(peer),plan,key,journal,{pacingProfile:profile,sleep:async ms=>{delays.push(ms);}});
 assert.equal(result.status,want,label);assert(result.closeConfirmed&&result.workerExitConfirmed);assert(key.every(b=>b===0));assert.equal(peer.closeCalls,1);
 assert.equal(peer.parts.length,want==='RegisteredInactive'||want==='SentNotVerified'?1:0);
 assert.deepEqual(delays,want==='RegisteredInactive'?[1000]:want==='SentNotVerified'?[1000,...Array(5).fill(500)]:[]);
 assert.equal(result.transferAcceptanceVerified,false);journal.close();assert(!fs.existsSync(file+'.lock'));checks++;
}
let opened=0;const invalidJournal=new StaticJournal(journalFile('wrong-scope'),address,otherPlan);
const invalid=await runStaticSession(()=>{opened++;throw Error('must not open');},otherPlan,Buffer.from(secret),invalidJournal,{pacingProfile:'exit-resume-r270'});assert.equal(invalid.status,'StoppedNeedsReview');assert.equal(opened,0);invalidJournal.close();checks++;
const resumeReport={checkpoint:'R269',scenariosPassed:checks,realClientFakeIpc:true,expectedResumePosition:22462,fileBytesRemaining:1886,massParts:1,partBytes:1916,packetBytes:1931,fullSizeAndMd5Retained:true,resumedCrcVerified:true,stagedPrefixReconstructed:true,unexpectedOffsetsRefusedBeforeMass:true,missingOrDifferentMd5Refused:true,legacyProfilesStillRefuseResume:true,corruptPrefixNotDeclaredInstalled:true,nativeSocketCalls:0,bluetoothOperationRequested:false,physicalFilesTransferred:false};
fs.writeFileSync(path.join(directory,'resume-summary.json'),JSON.stringify(resumeReport,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(resumeReport));
