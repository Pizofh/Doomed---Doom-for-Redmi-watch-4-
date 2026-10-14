// Synthetic time/link/peer only. Same pinned ExitC bytes; no OS/radio backend.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import{createDecipheriv,randomUUID,createHash}from'node:crypto';import{spawnSync}from'node:child_process';
import{root}from'./exit-source-r265.mjs';import{prepareStatic,chunks,installStatic,crc32}from'./static-watchface-transfer.mjs';import{StaticWatchfaceSession}from'./static-watchface-session.mjs';import{StaticJournal}from'./static-watchface-journal.mjs';import{command,decodeCommand}from'./rw4-xiaomi-protocol.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const out=path.join(root,'artifacts/static-paced-r267-tests',randomUUID());fs.mkdirSync(out,{recursive:true});
const data=fs.readFileSync(path.join(root,'artifacts/exit-r265/ExitC-id-only.face')),plan=prepareStatic(data,{variant:'r265'}),parts=chunks(plan,2048),address='AABBCCDDEE11';
const key=Buffer.alloc(16,17),prefix=Buffer.alloc(4,23),nonce=Buffer.alloc(12);prefix.copy(nonce);const old={id:'123456789',active:true,canDelete:false},own={id:plan.id,active:false,canDelete:true};
const catalogue=entries=>({count:entries.length,unknownIdCount:0,entries});let scenarios=0;
async function simulate(profile,kind='slow'){
 let now=0,readyAt=Infinity,queryCount=0,infoCalls=0,closed=0;const frames=[],delays=[],mutations=[],events=[];
 const file=path.join(out,profile+'-'+kind+'.json'),journal=new StaticJournal(file,address,plan);
 const link={send:async frame=>{if(kind==='send_failure'&&frames.length===4)throw Error('TransportFailure');frames.push(Buffer.from(frame));events.push('part'+frames.length);}};
 const s=new StaticWatchfaceSession(link,plan,{pacingProfile:profile,sleep:async ms=>{delays.push(ms);events.push('wait'+ms);now+=ms;assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).phase,'PartWritten');}});
 s.authenticated=true;s.protocolVersion=1;s.keys={tx:key,txNonce:prefix};s.phase='Ready';
 const api={scope:s.scope,authenticated:true,protocolVersion:1,txBudgetBytes:32768,
 info:async()=>{infoCalls++;return{modelRecognized:true,firmware:'2.2.86'};},
 faces:async()=>{queryCount++;events.push('query'+queryCount);if(queryCount===1)return catalogue([old]);if(now<readyAt)throw Error('Timeout');return catalogue(kind==='missing'?[old]:[old,own]);},
 request:async payload=>{const c=decodeCommand(payload);mutations.push([c.type,c.subtype]);if(c.type===4){assert.equal(c.subtype,4);return{installStatus:kind==='reject'?3:0};}assert.equal(c.type,22);assert.equal(c.subtype,0);s.expectedParts=parts;s.phase='Uploading';return{unknown2:0,resumePosition:kind==='resume'?1:0,chunkSize:2048,md5:kind==='bad_md5'?Buffer.alloc(16):plan.md5()};},
 mass:async p=>{await s.mass(p);if(s.nextPart===parts.length)readyAt=now+(kind==='fast'?0:1000);},wait:async ms=>{await s.wait(ms);}};
 let result,error;
 try{result=await installStatic(api,plan,{journal,pacingProfile:profile});if(result.status==='SentNotVerified')journal.uncertain();}
 catch(e){error=e.message;journal.uncertain();}
 finally{closed++;journal.close();}
 assert.equal(closed,1);assert(!fs.existsSync(file+'.lock'));assert(s.massAttempts<=parts.length&&frames.length<=parts.length);
 for(const[f,i]of frames.map((f,i)=>[f,i])){assert.equal(f[3],5);assert.equal(f[4],128);assert.equal(f[7],2);assert.equal(f[9],1);assert.equal(f.at(-1),239);const payload=f.subarray(10,-1),cipher=createDecipheriv('aes-128-ccm',key,nonce,{authTagLength:4});cipher.setAuthTag(payload.subarray(-4));cipher.setAAD(Buffer.alloc(0),{plaintextLength:payload.length-4});const p=Buffer.concat([cipher.update(payload.subarray(0,-4)),cipher.final()]);assert(p.equals(parts[i]));}
 if(frames.length===parts.length){const stream=Buffer.concat(parts.map(p=>p.subarray(4)));assert(stream.subarray(22,-4).equals(data));assert.equal(stream.readUInt32LE(stream.length-4),crc32(stream.subarray(0,-4)));}
 scenarios++;return{result,error,frames,delays,mutations,queryCount,infoCalls,events,record:JSON.parse(fs.readFileSync(file,'utf8'))};
}
const defaultSlow=await simulate('default');assert.equal(defaultSlow.error,'Timeout');assert.equal(defaultSlow.frames.length,12);assert.equal(defaultSlow.queryCount,2);assert.deepEqual(defaultSlow.delays,[]);assert.equal(defaultSlow.record.phase,'Uncertain');
const defaultFast=await simulate('default','fast');assert.equal(defaultFast.result.status,'RegisteredInactive');assert.deepEqual(defaultFast.delays,[]);
const paced=await simulate('exit-r268');assert.equal(paced.result.status,'RegisteredInactive');assert.equal(paced.record.phase,'Registered');assert.equal(paced.queryCount,2);assert.equal(paced.frames.length,12);assert.deepEqual(paced.delays,[...Array(11).fill(100),1000]);assert.equal(paced.events.at(-2),'wait1000');assert.equal(paced.events.at(-1),'query2');assert(paced.frames.every((b,i)=>b.equals(defaultSlow.frames[i])),'pacing changed wire bytes');
for(const[k,reason]of[['reject','StaticTransferRefused'],['resume','StaticTransferRefused'],['bad_md5','StaticTransferRefused'],['send_failure','TransportFailure']]){const r=await simulate('exit-r268',k);assert.equal(r.error,reason);assert.equal(r.record.phase,'Uncertain');assert.equal(r.queryCount,1);assert.equal(r.frames.length,k==='send_failure'?4:0);assert(!r.delays.includes(1000));}
const missing=await simulate('exit-r268','missing');assert.equal(missing.result.status,'SentNotVerified');assert.equal(missing.record.phase,'Uncertain');assert.equal(missing.frames.length,12);assert.equal(missing.queryCount,7);assert.deepEqual(missing.delays,[...Array(11).fill(100),1000,...Array(5).fill(500)]);
const noop={scope:'static-watchface-only',authenticated:true,protocolVersion:1,txBudgetBytes:32768,info:()=>{throw Error('must not inspect');}};
await assert.rejects(installStatic(noop,plan,{pacingProfile:'arbitrary'}));scenarios++;
const other=prepareStatic(fs.readFileSync(path.join(root,'artifacts/state-match-r261/StateMatch-id-only.face')),{variant:'r261'});await assert.rejects(installStatic(noop,other,{pacingProfile:'exit-r268'}));scenarios++;
assert.throws(()=>new StaticWatchfaceSession({},other,{pacingProfile:'exit-r268'}));assert.throws(()=>new StaticWatchfaceSession({},plan,{action:'remove',pacingProfile:'exit-r268'}));scenarios++;
await assert.rejects(new StaticWatchfaceSession({},plan).wait(100));await assert.rejects(new StaticWatchfaceSession({},plan,{pacingProfile:'exit-r268'}).wait(101));scenarios++;
for(const action of ['plan-paced-retry','install-paced-retry']){const r=spawnSync(process.execPath,[path.join(root,'tools/pc-static-watchface.mjs'),action,'r265'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});assert.equal(r.status,action==='plan-paced-retry'?0:2);const j=JSON.parse(r.stdout);assert.equal(j.checkpoint,'R268');assert.equal(j.physicalEnabled,false);assert.equal(j.bluetoothOperationRequested,false);assert.equal(j.watchCommandRequested,false);scenarios++;}
const invalid=spawnSync(process.execPath,[path.join(root,'tools/pc-static-watchface.mjs'),'install-paced-retry','r261'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});assert.equal(invalid.status,1);assert(!invalid.stdout);scenarios++;
const report={checkpoint:'R267',scenariosPassed:scenarios,samePackageSha256:createHash('sha256').update(data).digest('hex'),parts:12,betweenPartWaits:11,betweenPartsMs:100,settleBeforeVerificationMs:1000,extraWaitTotalMs:2100,syntheticDelayedPeerVerified:true,encryptedWireBytesUnchanged:true,noPartRetries:true,uncertainFailureAndClosureVerified:true,newCliGateClosed:true,nativeSocketCalls:0,physicalWatchUsed:false,bluetoothOperationRequested:false};fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
