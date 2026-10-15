import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {firstCRoot as root} from './first-c-source.mjs';import {reviewedTwoRemovals} from './doom-deployment-catalog.mjs';import {syntheticDoomUpload} from './doom-large-upload.mjs';import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const original=Array.from({length:13},(_,i)=>({id:String(123456700+i),active:i===0,canDelete:i!==0})),current=original.slice(0,11).map((r,i)=>({...r,active:i===1}));let cases=0;
for(const [rows,expected] of [[current,true],[[...current].reverse(),true],[original,false],[original.slice(0,12),false],[original.slice(0,10),false],[current.map((r,i)=>i===0?{...r,id:'987654321'}:r),false],[current.map((r,i)=>i===0?{...r,canDelete:true}:r),false],[original.slice(2),false],[current.map(r=>({...r,active:false})),false]]){assert.equal(reviewedTwoRemovals(original,rows),expected);cases++;}
const d=path.join(root,'artifacts/doom-deployment-r286-'+randomUUID()),plan=syntheticDoomUpload(4827044);
async function run(scenario,rows,retry){const ep=createDoomUploadPcPeer(plan,{scenario,catalogRows:rows}),key=Buffer.alloc(16,37),r=await runDoomUploadPc(ep,plan,key,{deploymentDirectory:d,deploymentRetryWithoutData:retry});assert(key.every(x=>x===0));assert.equal(r.physicalEnabled,false);cases++;return{r,p:pcPeerSummary(ep)};}
assert.equal((await run('bad-chunk',original,false)).p.massFrames,0);
for(let i=0;i<2;i++){const a=await run('ok',current,true);assert.equal(a.r.phase,'CatalogPreflight');assert.equal(a.p.mutations,0);}
const saved=fs.readFileSync(path.join(d,'transfer.jsonl'),'utf8'),fourth=await run('ok',current,true);assert.equal(fourth.r.status,'RegisteredInactive');assert.equal(fourth.r.catalogPreflight.reviewedTwoRemovals,true);assert.equal(fourth.p.massFrames,2362);assert(fs.readFileSync(path.join(d,'transfer.jsonl'),'utf8').startsWith(saved));
assert.equal((await run('ok',current,true)).p.sentFrames,0);
console.log(JSON.stringify({checkpoint:'R289',passed:true,cases,onlyTwoDeletableRemovalsAccepted:true,currentSelectionPreserved:true,historyPreserved:true,fifthAttemptBlocked:true,physicalTransport:false}));
