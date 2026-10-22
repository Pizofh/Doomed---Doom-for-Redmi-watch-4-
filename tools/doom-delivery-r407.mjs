// SPDX-License-Identifier: GPL-2.0-only
// Independent first installation: never imports a previous watchface.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {themedLauncher,themedAssets,root,sha256} from './doom-themed-r406.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256,themedAssets};
export function deliveryLauncher(){
 const old=themedLauncher(),dir=path.join(root,'build/doom-audio-r407/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));
 assert.equal(review.checkpoint,'R407');assert.equal(sha256(elf),review.elfSha256);assert.equal(review.packed.gamePath,'/data/app/watchface/market/365220017/lua/doom2-r384.wad');
 const base='/data/app/watchface/market/365220017/lua/',config={...old.config,id:'365220017',base,ui_base:base,assets_base:base,elf_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii407',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf)};
 for(const key of ['import_base','import_bytes','import_crc'])delete config[key];
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 // The wrapper's following state varies across older source transforms. Match
 // the complete bounded importer block instead of editing the native runtime.
 const block=/local importing,imported=nil,false\nlocal function cancel_import\(\)[\s\S]*?\nreturn imported\nend/;
 assert.equal([...source.matchAll(new RegExp(block.source,'g'))].length,1);
 source=source.replace(block,'local imported=true\nlocal function cancel_import()end\nlocal function import_tick()return true end');
 assert(!source.includes('config.import_')&&!source.includes('import.lua'));
 assert(!source.includes('365220016')&&!source.includes('365220015'));assert(Buffer.byteLength(source)<=32768);
 return{...old,source,sourceSha256:sha256(source),config,importer:null,firstInstall:true};
}
