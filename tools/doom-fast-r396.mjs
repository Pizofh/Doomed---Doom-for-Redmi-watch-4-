// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {quickLauncher,root,sha256} from './doom-quick-r393.mjs';import {residentBytes} from './doom-fit-r386.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};
export function fastLauncher(){
 const old=quickLauncher(),dir=path.join(root,'build/doom-audio-r396/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json'))),prototype=JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r395/rw4/review.json')));
 assert.equal(sha256(elf),r.elfSha256);assert.deepEqual(r.metadata,prototype.metadata);assert.equal(r.packed.gamePath,'/data/app/watchface/market/365220013/lua/doom2-r384.wad');
 for(const key of ['transport','menu','doom-sfx','sink-worker'])assert.equal(r.generatedHashes[key],prototype.generatedHashes[key]);
 for(const key of ['readerSha256','runtimeSha256'])assert.equal(r.packed[key],prototype.packed[key]);
 const importer=Buffer.from(old.importer.toString().replace(/365220011|365220010/g,v=>v==='365220011'?'365220013':'365220011').replaceAll('.import393','.import396'));
 const base='/data/app/watchface/market/365220013/lua/',resident=residentBytes(elf),minimum=Math.ceil((old.config.min_free+resident-old.memory.resident)/4096)*4096;assert(minimum>=old.config.min_free);
 const config={...old.config,id:'365220013',base,ui_base:base,elf_base:base,assets_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii396',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum,import_base:old.config.base,import_bytes:importer.length,import_crc:crc32(importer)};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');source=source.replace('config.min_free=='+old.config.min_free,'config.min_free=='+minimum);assert(Buffer.byteLength(source)<=32768);
 return{...old,source,config,importer,sourceSha256:sha256(source),memory:{...old.memory,resident,minimum,saved:old.memory.previousResident-resident}};
}
