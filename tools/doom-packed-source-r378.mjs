// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';
export function packedConfig(mode){
 const p=JSON.parse(fs.readFileSync(path.join(root,'build/doom-packed-r378/packed.json'),'utf8'));
 assert.equal(p.packedSha256,'f177618dd0da2ba304b9d12049832607d39904ee0b36536a3d83037f6afec38c');
 assert.equal(sha256(fs.readFileSync(path.join(root,'build/doom-packed-r378/doom.rwc'))),p.packedSha256);
 // W_AddFile dispatches on the suffix, even though the reader virtualizes bytes.
 const gamePath='/data/app/watchface/market/'+(mode==='rw4'?'365220002':'365799913')+'/lua/doom-r378.wad';
 const defines={RW4_PACK_ORIGINAL_BYTES:p.originalBytes,RW4_PACK_ORIGINAL_CRC:p.originalCrc32,RW4_PACK_PAGES:p.pages,
  RW4_PACK_INDEX_CRC:p.indexCrc32,RW4_PACK_HEADER_CRC:p.headerCrc32,RW4_PACK_BYTES:p.packedBytes};
 const header=Object.entries(defines).map(([k,v])=>'#define '+k+' '+v+'u').join('\n')+'\n';
 const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/packed/tinf-r378.lock.json'),'utf8'));
 for(const [name,hash]of Object.entries(lock.files))assert.equal(sha256(fs.readFileSync(path.join(root,'third_party/tinf-r378',path.basename(name)))),hash);
 return {p,gamePath,header,lock};
}
