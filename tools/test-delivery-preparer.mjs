// SPDX-License-Identifier: GPL-2.0-only
// Public CI checks using synthetic data only; no WAD, tools or hardware needed.
import test from 'node:test';import assert from 'node:assert/strict';import {inflateRawSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {crc32,packWad,inspectWad,assemble} from './delivery/prepare.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
test('CRC32 matches the standard known vector',()=>assert.equal(crc32(Buffer.from('123456789')),0xcbf43926));
test('packed pages reconstruct synthetic data exactly',()=>{
 for(const size of [1,65536,65537,196643]){const input=Buffer.alloc(size);for(let i=0;i<size;i++)input[i]=(i*31+(i>>8))&255;const b=packWad(input),pages=b.readUInt32LE(20),out=[];assert.equal(b.readUInt32LE(36),crc32(b.subarray(0,36)));assert.equal(b.readUInt32LE(24),crc32(b.subarray(40,40+pages*16)));
  for(let i=0;i<pages;i++){const at=40+i*16,start=b.readUInt32LE(at),field=b.readUInt32LE(at+4),stored=b.subarray(start,start+(field&0x7fffffff)),raw=field&0x80000000?stored:inflateRawSync(stored);assert.equal(raw.length,b.readUInt32LE(at+8));assert.equal(crc32(raw),b.readUInt32LE(at+12));out.push(raw);}assert(Buffer.concat(out).equals(input));
 }
});
test('assembler verifies identity, bounds, blank payload and final hash',()=>{
 const payload=Buffer.from('synthetic data'),template=Buffer.alloc(200);template.writeUInt32LE(0x1234a55a);template.write('365220017',40);const filled=Buffer.from(template);payload.copy(filled,80);
 const m={schema:1,id:'365220017',model:'M2315W1',firmware:'2.2.86',wadOffset:80,packedBytes:payload.length,faceBytes:template.length,templateSha256:hash(template),packedSha256:hash(payload),privateFaceSha256:hash(filled)};
 assert(assemble(template,payload,m).equals(filled));assert.throws(()=>assemble(template,payload,{...m,wadOffset:-1}));assert.throws(()=>assemble(template,payload,{...m,wadOffset:200}));assert.throws(()=>assemble(template,payload,{...m,firmware:'other'}));assert.throws(()=>assemble(template,payload,{...m,privateFaceSha256:'0'.repeat(64)}));assert.throws(()=>assemble(filled,payload,{...m,templateSha256:hash(filled)}));assert.throws(()=>assemble(template,Buffer.from('altered'),m));
});
test('invalid WAD directories and unsupported game data are refused',()=>{
 assert.throws(()=>inspectWad(Buffer.alloc(0)));const bad=Buffer.alloc(44);bad.write('IWAD');bad.writeUInt32LE(1,4);bad.writeUInt32LE(40,8);assert.throws(()=>inspectWad(bad));bad.writeUInt32LE(12,8);bad.writeUInt32LE(1000,12);assert.throws(()=>inspectWad(bad));bad.writeUInt32LE(0,12);assert.throws(()=>inspectWad(bad));
});
