// SPDX-License-Identifier: GPL-2.0-only
// Import ONLY the pinned user-supplied IWAD into ignored private workspace data.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';
import {inspectArchive} from './inspect-doom-archives-r373.mjs';
assert.equal(process.argv.length,3,'One user-supplied Ultimate Doom ZIP required');
const profile=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/ultimate-profile-r374.json'),'utf8'));
const stat=fs.lstatSync(process.argv[2]);assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<8*1024*1024);
const zip=fs.readFileSync(process.argv[2]);assert.equal(sha256(zip),profile.archiveSha256);
let data;const report=inspectArchive(zip,(name,bytes)=>{assert.equal(name,'DOOM.WAD');assert(!data);data=bytes;});
assert.equal(report.entries.length,1);assert.equal(report.wads.length,1);assert.equal(data.length,profile.wadBytes);
assert.equal(sha256(data),profile.wadSha256);assert.equal(report.wads[0].crc32,profile.wadCrc32);
assert.equal(report.wads[0].mapCount,36);assert.equal(report.wads[0].dmxEffects.usefulSampleBytes,profile.audioSampleBytes);
const dir=path.join(root,'tools/local/doom-ultimate');fs.mkdirSync(dir,{recursive:true});assert(!fs.lstatSync(dir).isSymbolicLink());
const file=path.join(dir,'doom.wad');if(fs.existsSync(file))assert.equal(sha256(fs.readFileSync(file)),profile.wadSha256);
else fs.writeFileSync(file,data,{flag:'wx'});
fs.writeFileSync(path.join(dir,'inspection.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({imported:true,bytes:data.length,sha256:sha256(data),maps:36,contentExecuted:false,physicalTransport:false}));
