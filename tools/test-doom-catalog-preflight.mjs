import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {firstCRoot as root} from './first-c-source.mjs';import {compareDoomCatalogs} from './doom-deployment-catalog.mjs';import {syntheticDoomUpload} from './doom-large-upload.mjs';import {createDoomUploadPcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const original=[{id:'123456789',active:true,canDelete:false},{id:'123456788',active:false,canDelete:true}],selected=original.map(r=>({...r,active:!r.active}));let cases=0;
function check(fn){fn();cases++;}
const dir=()=>path.join(root,'artifacts/doom-deployment-r286-'+randomUUID());
function copy(d){const n=dir();fs.mkdirSync(n);fs.copyFileSync(path.join(d,'transfer.jsonl'),path.join(n,'transfer.jsonl'));return n;}
const plan=syntheticDoomUpload(4827044);
async function run(d,scenario,catalogRows,retry=false){const endpoint=createDoomUploadPcPeer(plan,{scenario,catalogRows}),key=Buffer.alloc(16,37),r=await runDoomUploadPc(endpoint,plan,key,{deploymentDirectory:d,deploymentRetryWithoutData:retry});assert(key.every(x=>x===0));assert.equal(r.physicalEnabled,false);cases++;return {r,p:pcPeerSummary(endpoint)};}
check(()=>assert.deepEqual(compareDoomCatalogs(original,selected),{sameMembership:true,sameSelection:false}));
check(()=>assert(compareDoomCatalogs(original,[...selected].reverse()).sameMembership));
for(const changed of [[selected[0]],selected.map(r=>({...r,canDelete:true})),[...selected,{id:'123456787',active:false,canDelete:true}],[selected[0],selected[0]],selected.map(r=>({...r,active:false}))])check(()=>assert.equal(compareDoomCatalogs(original,changed).sameMembership,false));
const d=dir(),first=await run(d,'bad-chunk',original);assert.equal(first.p.massFrames,0);const saved=fs.readFileSync(path.join(d,'transfer.jsonl'),'utf8');
const removedDir=copy(d),second=await run(removedDir,'ok',[original[0]],true);assert.equal(second.r.phase,'CatalogPreflight');assert.equal(second.p.mutations,0);assert.equal(second.r.catalogPreflight.sameMembership,false);
const capped=copy(removedDir),thirdFailure=await run(capped,'ok',[original[0]],true);assert.equal(thirdFailure.p.mutations,0);
const fourthFailure=await run(capped,'ok',selected,true);assert.equal(fourthFailure.p.mutations,0);
const fifthFailure=await run(capped,'ok',selected,true);assert.equal(fifthFailure.p.sentFrames,0);
const third=await run(removedDir,'ok',selected,true);assert.equal(third.r.status,'RegisteredInactive');assert.equal(third.p.massFrames,2362);assert.equal(third.r.catalogPreflight.sameSelection,false);
check(()=>assert(fs.readFileSync(path.join(removedDir,'transfer.jsonl'),'utf8').startsWith(saved)));
const fourth=await run(removedDir,'ok',selected,true);assert.equal(fourth.p.sentFrames,0);
const altered=await run(copy(d),'ok',selected.map(r=>({...r,canDelete:true})),true);assert.equal(altered.p.mutations,0);
const normal=await run(d,'ok',[...selected].reverse(),true);assert.equal(normal.r.status,'RegisteredInactive');assert.equal(normal.p.massFrames,2362);assert.equal(normal.r.catalogPreflight.sameMembership,true);assert.equal(normal.r.catalogPreflight.sameSelection,false);
const result={checkpoint:'R289',passed:true,cases,currentSelectionPreserved:true,membershipAndDeletionFlagsStillRequired:true,fourthAttemptRequiresReviewedTwoRemovals:true,fifthAttemptBlocked:true,historyPreserved:true,physicalTransport:false};
fs.mkdirSync(path.join(root,'artifacts/doom-catalog-preflight-r288'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/doom-catalog-preflight-r288/result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
