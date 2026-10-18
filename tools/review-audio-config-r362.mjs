// SPDX-License-Identifier: GPL-2.0-only
// Read only pinned local firmware. Private metadata only; no execution or IO on watch.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
assert.equal(process.argv.length,2);
const root=fileURLToPath(new URL('../',import.meta.url));
const folder=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193');
const sources=[['rw4-stock-2.2.86-candidate.bin','d9dee6871ca6dc893000214d04ef6f5429a1b0f9ea57c79d8db9caf83cff6321'],
 ['vela-ap-inspection-only.bin','2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db']];
const report=[];
for(const [name,pin] of sources){const b=fs.readFileSync(path.join(folder,name));
 assert.equal(createHash('sha256').update(b).digest('hex'),pin);
 const hits=[];
 for(const marker of ['-rom1fs-','media_focus.conf','media_graph.conf','pcm2p','music','SO_RCVTIMEO']){
  const offsets=[];for(let i=b.indexOf(marker);i>=0;i=b.indexOf(marker,i+1)){offsets.push(i);assert(offsets.length<10000);}
  hits.push({marker,offsets});
 }
 report.push({name,sha256:pin,hits});
}
const zip=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/rw4-firmware-containers-r193.json'),'utf8'));
assert.equal(zip.inputSha256,sources[0][1]);
const names=zip.zipCandidates.flatMap(z=>z.entries??[]).filter(e=>/media|focus|audio|config|romfs|system|\.conf$/i.test(e.name));
const result={sources:report,matchingZipEntries:names,physicalWatchUsed:false};
const out=path.join(root,'artifacts/research/audio-config-r362.json');
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
