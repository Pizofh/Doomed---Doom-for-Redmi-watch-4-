// SPDX-License-Identifier: GPL-2.0-only
// Static composition of packaged launch assets, not a hardware screenshot.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {inflateSync} from 'node:zlib';
import {root,sha256,themedLauncher,themedAssets} from './doom-themed-r406.mjs';import {png} from './first-c-assets.mjs';
const out=path.join(root,'build/doom-themed-r406'),assets=themedAssets(),p=themedLauncher();
function decode(b){const width=b.readUInt32BE(16),height=b.readUInt32BE(20);assert.equal(b[25],2);const chunks=[];for(let i=8;i<b.length;){const n=b.readUInt32BE(i);if(b.toString('ascii',i+4,i+8)==='IDAT')chunks.push(b.subarray(i+8,i+8+n));i+=n+12;}const raw=inflateSync(Buffer.concat(chunks)),stride=width*3+1;for(let y=0;y<height;y++)assert.equal(raw[y*stride],0);return{x:0,y:0,width,height,raw,stride};}
const layers=[{...decode(assets.launch),x:0,y:20},{...decode(assets.start),x:147,y:232},{...decode(assets.ready),x:20,y:280}];
const preview=png(390,450,(x,y)=>{let c=x>=65&&x<325&&y>=216&&y<268?[143,27,20]:[16,12,13];for(const a of layers)if(x>=a.x&&x<a.x+a.width&&y>=a.y&&y<a.y+a.height){const at=(y-a.y)*a.stride+1+(x-a.x)*3;c=[...a.raw.subarray(at,at+3)];}return c;});
fs.writeFileSync(path.join(out,'launcher-preview.png'),preview);
const review=JSON.parse(fs.readFileSync(path.join(out,'package/review.json'))),face=fs.readFileSync(path.join(out,'package/DoomThemed-id-only.face'));
assert.equal(sha256(face),review.sha256);assert.equal(review.sourceSha256,p.sourceSha256);assert.equal(review.entries.length,81);assert.equal(review.config.import_base,'/data/app/watchface/market/365220015/lua/');
for(const e of review.entries){const b=fs.readFileSync(path.join(out,'package/app/lua',e.name));assert.equal(sha256(b),e.sha256);assert(face.subarray(e.offset,e.offset+e.size).equals(b));}
console.log(JSON.stringify({packageVerified:true,resources:81,sourceBytes:Buffer.byteLength(p.source),preview:path.join(out,'launcher-preview.png'),physicalWatchUsed:false}));
