// SPDX-License-Identifier: GPL-2.0-only
// Cosmetic revision with the proven one-face importer retargeted from009 to010.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {finalLauncher,root,sha256} from './doom-final-r388.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};
export function monsterLauncher(){
 const old=finalLauncher(),dir=path.join(root,'build/doom-audio-r390/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));
 assert.equal(sha256(elf),r.elfSha256);assert.equal(r.packed.gamePath,'/data/app/watchface/market/365220010/lua/doom2-r384.wad');
 const before=JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r388/rw4/review.json')));
 // Only the compiler's IWAD path define changes; generated sources stay identical.
 for(const [n,h]of Object.entries(before.generatedHashes))assert.equal(r.generatedHashes[n],h,n);
 const priorElf=fs.readFileSync(path.join(root,'build/doom-audio-r388/rw4/doom.elf'));
 const oldPath=Buffer.from(old.config.wad_path),newPath=Buffer.from(r.packed.gamePath),expected=Buffer.from(priorElf);let paths=0;
 for(let at=expected.indexOf(oldPath);at>=0;at=expected.indexOf(oldPath,at+oldPath.length)){newPath.copy(expected,at);paths++;}
 assert.equal(paths,3);assert(expected.equals(elf),'Only the three embedded game paths may differ from accepted ELF');
 const importer=Buffer.from(old.importer.toString().replaceAll('365220009','365220010').replaceAll('365220006','365220009').replaceAll('.import388','.import390'));
 const base='/data/app/watchface/market/365220010/lua/';
 const config={...old.config,id:'365220010',base,ui_base:base,elf_base:base,assets_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii390',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),import_base:old.config.base,import_bytes:importer.length,import_crc:crc32(importer)};
 const source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 assert.equal(elf.length,old.config.elf_bytes);assert(Buffer.byteLength(source)<=32768);
 return{...old,source,config,importer,sourceSha256:sha256(source)};
}
