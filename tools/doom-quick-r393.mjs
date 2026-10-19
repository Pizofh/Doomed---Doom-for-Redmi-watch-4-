// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {monsterLauncher,root,sha256} from './doom-monster-r390.mjs';import {residentBytes} from './doom-fit-r386.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};
export function quickLauncher(){
 const old=monsterLauncher(),dir=path.join(root,'build/doom-audio-r393/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));
 assert.equal(sha256(elf),r.elfSha256);assert(r.loading.fullStoredFileScan&&!r.loading.profile);assert.equal(r.packed.gamePath,'/data/app/watchface/market/365220011/lua/doom2-r384.wad');
 const prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r390/rw4/review.json')));
 for(const n of ['transport','menu','doom-sfx','sink-worker'])assert.equal(r.generatedHashes[n],prior.generatedHashes[n],n);
 assert.equal(r.loading.sourceSha256,sha256(fs.readFileSync(path.join(root,'tools/doom-load-profile-r391.mjs'))));assert.equal(r.loading.verifySourceSha256,sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/packed/verify-physical-r392.c'))));
 const importer=Buffer.from(old.importer.toString().replaceAll('365220010','365220011').replaceAll('365220009','365220010').replaceAll('.import390','.import393'));
 const base='/data/app/watchface/market/365220011/lua/',resident=residentBytes(elf),saved=old.memory.previousResident-resident,minimum=Math.ceil((old.memory.previousMinimum-saved)/4096)*4096;
 assert(minimum>=old.config.min_free);const config={...old.config,id:'365220011',base,ui_base:base,elf_base:base,assets_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii393',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum,import_base:old.config.base,import_bytes:importer.length,import_crc:crc32(importer)};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=source.replace('config.min_free=='+old.config.min_free,'config.min_free=='+minimum);assert(Buffer.byteLength(source)<=32768);
 return{...old,source,config,importer,sourceSha256:sha256(source),memory:{...old.memory,resident,saved,minimum}};
}
