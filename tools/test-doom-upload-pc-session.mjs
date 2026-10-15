// Public CI: owned synthetic 4.8MB fixture, virtual time, real durable PC journal.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {syntheticDoomUpload} from './doom-large-upload.mjs';
import {createDoomUploadPcPeer,pcPeerSummary,pcPeerAccess} from './doom-upload-pc-simulator.mjs';
import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('No arguments accepted');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const plan=syntheticDoomUpload(),results=[];
async function run(scenario,options={},sessionOptions={}){
 const endpoint=createDoomUploadPcPeer(plan,{scenario,...options}),key=Buffer.alloc(16,37);
 const result=await runDoomUploadPc(endpoint,plan,key,sessionOptions),peer=pcPeerSummary(endpoint);
 assert(key.every(b=>b===0));assert.equal(peer.closeCalls,1);
 assert.equal(result.physicalEnabled,false);assert.equal(result.bluetoothOperationRequested,false);assert.equal(result.watchCommandRequested,false);assert.equal(result.contentVerified,false);assert.equal(result.selectedByClient,false);
 const serialized=JSON.stringify(result);assert(!serialized.includes('PRIVATE-CANARY'));assert(!serialized.includes(Buffer.alloc(16,37).toString('hex')));
 const records=result.journal?fs.readFileSync(path.join(root,result.journal),'utf8').trimEnd().split('\n').map(s=>JSON.parse(s)):[];
 for(const record of records){assert.equal(record.targetTag.length,64);assert.equal(record.id,plan.id);assert.equal(record.sha256,plan.sha256);}
 const intents=records.filter(r=>r.upload?.status==='Intent');
 if(peer.massFrames)assert(intents.length>0);
 if(result.status==='RegisteredInactive'){
  assert(peer.wireVerified);assert(peer.commandAfterWrap);assert.equal(result.registeredVerified,true);
  assert.equal(result.massPartsLocallyWritten,peer.massFrames);assert.equal(result.txBytes,peer.bytes);
 }
 results.push({scenario,chunkSize:options.chunkSize??2048,status:result.status,parts:peer.massFrames,txBytes:result.txBytes,resumeOffset:result.resumeOffset});
 return{result,peer,records};
}
for(const chunkSize of [2048,4080])assert.equal((await run('ok',{chunkSize})).result.status,'RegisteredInactive');
for(const scenario of ['bad-key','v2','wrong-model','wrong-fw','collision','clear-response','reject','bad-md5','bad-offset','bad-chunk']){
 const {result,peer}=await run(scenario);assert.equal(result.status,'StoppedNeedsReview');assert.equal(peer.massFrames,0);
 if(['bad-key','v2','wrong-model','wrong-fw','collision','clear-response'].includes(scenario))assert.equal(peer.mutations,0);
}
const disconnected=await run('disconnect');
assert.equal(disconnected.result.status,'StoppedNeedsReview');assert.equal(disconnected.peer.massFrames,11);
assert.equal(disconnected.result.massPartsLocallyWritten,10);assert.equal(disconnected.peer.highestReceivedOffset,22462);
const parent=path.join(root,disconnected.result.journal);
const resumed=await run('ok',{resumePosition:22462},{resumeFrom:parent});
assert.equal(resumed.result.status,'RegisteredInactive');assert.equal(resumed.result.resumeOffset,22462);assert.equal(resumed.peer.massFrames,2342);
// Unknown/out-of-bound offsets and a different target cannot borrow a journal.
for(const options of [{resumePosition:70000},{resumePosition:22462,target:'fixture-other'}]){
 const {result,peer}=await run('ok',options,{resumeFrom:parent});assert.equal(result.status,'StoppedNeedsReview');assert.equal(peer.massFrames,0);
 if(options.target)assert.equal(peer.sentFrames,0);
}
assert.equal((await run('missing')).result.status,'SentNotVerified');
assert.equal((await run('active')).result.status,'UnexpectedActivation');
assert.equal((await run('protected')).result.status,'RegisteredNotRemovable');
assert.equal((await run('unrelated-lost')).result.status,'StoppedNeedsReview');
assert.equal((await run('close-failure')).result.status,'StoppedNeedsReview');
const deadline=await run('deadline');assert.equal(deadline.result.status,'StoppedNeedsReview');assert.equal(deadline.peer.massFrames,1);
// Brands are non-copyable, endpoint capabilities immutable, single-use.
const forgedKey=Buffer.alloc(16,37),forged=await runDoomUploadPc({kind:'owned-pc-xiaomi-peer',physicalEnabled:false},plan,forgedKey);
assert.equal(forged.phase,'BeforeConnection');assert(forgedKey.every(b=>b===0));
const endpoint=createDoomUploadPcPeer(plan),access=pcPeerAccess(endpoint);
assert(Object.isFrozen(access)&&Object.isFrozen(access.link));assert.throws(()=>{access.link.send=()=>{};});assert.throws(()=>pcPeerAccess(endpoint));
// No source path to any real transport; inherited 96-frame client cap unchanged.
const source=fs.readFileSync(path.join(root,'tools/doom-upload-pc-session.mjs'),'utf8');
assert(!source.includes('new PrivatePipe'));assert(!source.includes('node:child_process'));assert(!source.includes('createConnection('));
const output=path.join(root,'artifacts/doom-upload-session-r280/result-'+Date.now()+'.json');
fs.writeFileSync(output,JSON.stringify({checkpoint:'R280',passed:true,scenarios:results,physicalEnabled:false,bluetoothOperationRequested:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R280',passed:true,scenarios:results.length,fullParts:2353,resumeParts:2342,serialWrapAndPostUploadQueries:true,durableJournal:true,physicalEnabled:false,bluetoothOperationRequested:false,result:path.relative(root,output).replaceAll('\\','/')}));
