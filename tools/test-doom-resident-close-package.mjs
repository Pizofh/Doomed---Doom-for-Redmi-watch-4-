import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256,residentCloseSource,residentCloseAssets} from './doom-resident-close-source.mjs';import {staticSpec} from './static-watchface-spec.mjs';import {prepareStatic,chunks} from './static-watchface-transfer.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const spec=staticSpec('r313'),b=fs.readFileSync(path.join(root,spec.artifact)),review=JSON.parse(fs.readFileSync(path.join(root,'artifacts/doom-resident-close-r313/package-final/review.json'))),p=residentCloseSource();
assert.equal(p.sourceSha256,spec.sourceSha256);assert.equal(review.sourceSha256,p.sourceSha256);assert(b.includes(Buffer.from(p.source)));
const plan=prepareStatic(b,{variant:'r313'}),parts=chunks(plan),wireBytes=parts.reduce((n,c)=>n+c.length+15,0);
assert(wireBytes+512<=32768);assert.equal(parts.length,12);assert.equal(review.entries.length,32);
const originals=new Map([['main.lua',Buffer.from(p.source)],...Object.entries(residentCloseAssets()).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])]);
for(const r of review.entries){const expected=originals.get(r.name);assert(expected);assert.equal(r.sha256,sha256(expected));assert(b.subarray(r.offset,r.offset+r.size).equals(expected));}
for(const pos of [0,5,40,b.length-1]){const altered=Buffer.from(b);altered[pos]^=1;assert.throws(()=>prepareStatic(altered,{variant:'r313'}));}
const cli=spawnSync(process.execPath,['tools/pc-static-watchface.mjs','install','r313'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:5000});
assert.equal(cli.status,2);assert.equal(JSON.parse(cli.stdout).status,'PhysicalGateClosed');
console.log(JSON.stringify({checkpoint:'R313',passed:true,resources:32,massParts:parts.length,wireBytes,controlAllowance:512,physicalGateClosed:true,sourceAndPayloadPinned:true,physicalTransport:false}));
