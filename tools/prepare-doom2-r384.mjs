// SPDX-License-Identifier: GPL-2.0-only
// Import only the exact user-provided Doom II ZIP, into ignored private storage.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';
import {inspectArchive} from './inspect-doom-archives-r373.mjs';import {packWad} from './pack-ultimate-r378.mjs';
import {doom2Profile as p} from './doom2-source-r384.mjs';
assert.equal(process.argv.length,3);const stat=fs.lstatSync(process.argv[2]);assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<8*1024*1024);
const zip=fs.readFileSync(process.argv[2]);assert.equal(sha256(zip),p.archiveSha256);
let data;const report=inspectArchive(zip,(name,b)=>{assert.equal(name,'DOOM2.WAD');assert(!data);data=b;});
assert.equal(report.entries.length,1);assert.equal(sha256(data),p.wadSha256);assert.equal(data.length,p.wadBytes);
assert.equal(report.wads[0].mapCount,p.maps);assert.equal(report.wads[0].crc32,p.wadCrc32);
const out=path.join(root,'build/doom2-r384');fs.mkdirSync(out,{recursive:true});assert(!fs.lstatSync(out).isSymbolicLink());
assert(!fs.existsSync(path.join(out,'packed.json')),'refuse overwrite');const b=packWad(data);
const result={originalBytes:data.length,originalSha256:sha256(data),originalCrc32:crc32(data),packedBytes:b.length,packedSha256:sha256(b),
 pages:b.readUInt32LE(20),indexCrc32:b.readUInt32LE(24),headerCrc32:b.readUInt32LE(36),allPagesRoundTrip:true,physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'doom2.wad'),data,{flag:'wx'});fs.writeFileSync(path.join(out,'doom.rwc'),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'packed.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(out,'inspection.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
