// SPDX-License-Identifier: GPL-2.0-only
// Private, lossless, independently compressed 64 KiB pages; never expanded on flash.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {deflateRawSync,inflateRawSync} from 'node:zlib';
import {root,sha256} from './doom-ready-source-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';
import {ultimateProfile as p} from './doom-ultimate-source-r374.mjs';
export const pageBytes=65536,headerBytes=40;
export function packWad(b){
 const count=Math.ceil(b.length/pageBytes),index=Buffer.alloc(count*16),parts=[];let offset=headerBytes+index.length;
 for(let i=0;i<count;i++){
  const raw=b.subarray(i*pageBytes,Math.min((i+1)*pageBytes,b.length)),deflated=deflateRawSync(raw,{level:9});
  const plain=deflated.length>=raw.length,stored=plain?raw:deflated;
  assert((plain?stored:inflateRawSync(stored)).equals(raw));
  index.writeUInt32LE(offset,i*16);index.writeUInt32LE((stored.length|(plain?0x80000000:0))>>>0,i*16+4);
  index.writeUInt32LE(raw.length,i*16+8);index.writeUInt32LE(crc32(raw),i*16+12);parts.push(stored);offset+=stored.length;
 }
 const header=Buffer.alloc(headerBytes);[0x31435752,1,b.length,crc32(b),pageBytes,count,crc32(index),offset,0].forEach((v,i)=>header.writeUInt32LE(v,i*4));
 header.writeUInt32LE(crc32(header.subarray(0,36)),36);return Buffer.concat([header,index,...parts]);
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(root,'tools/pack-ultimate-r378.mjs')){
 assert.equal(process.argv.length,2);const b=fs.readFileSync(path.join(root,'tools/local/doom-ultimate/doom.wad'));
 assert.equal(sha256(b),p.wadSha256);const packed=packWad(b),out=path.join(root,'build/doom-packed-r378');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'doom.rwc'),packed,{flag:'wx'});
 const result={originalBytes:b.length,originalSha256:sha256(b),originalCrc32:crc32(b),packedBytes:packed.length,packedSha256:sha256(packed),
  pages:packed.readUInt32LE(20),pageBytes,indexCrc32:packed.readUInt32LE(24),headerCrc32:packed.readUInt32LE(36),allPagesRoundTrip:true,physicalWatchUsed:false};
 fs.writeFileSync(path.join(out,'packed.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}
