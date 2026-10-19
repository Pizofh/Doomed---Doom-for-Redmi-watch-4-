// SPDX-License-Identifier: GPL-2.0-only
// Update-only ELF/Lua: retain the installed Doom II WAD, UI assets and slots.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {doom2Launcher,root,sha256} from './doom2-r384.mjs';import {once} from './doom-ready-source-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';import {png} from './first-c-assets.mjs';
export {root,sha256};
export function residentBytes(b){assert.equal(b.readUInt16LE(18),40);const groups=[0,0];for(let i=0;i<b.readUInt16LE(48);i++){
 const at=b.readUInt32LE(32)+i*b.readUInt16LE(46),flags=b.readUInt32LE(at+8);if(!(flags&2))continue;
 const which=flags&1?1:0,alignment=Math.max(4,b.readUInt32LE(at+32));assert(alignment<=4096&&(alignment&(alignment-1))===0);
 groups[which]=Math.ceil(groups[which]/alignment)*alignment;groups[which]+=Math.ceil(b.readUInt32LE(at+20)/4)*4;
 }return groups.reduce((a,b)=>a+b,0);}
export function fitLauncher(){
 const old=doom2Launcher(),elf=fs.readFileSync(path.join(root,'build/doom-audio-r386/rw4/doom.elf')),prior=fs.readFileSync(path.join(root,'build/doom-audio-r384/rw4/doom.elf'));
 assert.equal(sha256(prior),old.config.elf_sha);const reviewed=JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r386/rw4/review.json'),'utf8'));
 assert.equal(sha256(elf),reviewed.elfSha256);assert.equal(reviewed.adpcm.cacheBytes,327680);
 for(const [f,h]of Object.entries(reviewed.adpcm.sourceHashes))assert.equal(sha256(fs.readFileSync(path.join(root,f))),h);
 const previousResident=residentBytes(prior),resident=residentBytes(elf),saved=previousResident-resident;assert(saved>300000);
 // Preserve the prior planning reserve: deduct only measured resident savings,
 // then round the requirement UP to a 4KiB boundary. Not a new heap guarantee.
 const minimum=Math.ceil((old.config.min_free-saved)/4096)*4096;
 const config={...old.config,id:'365220007',ui_base:'/data/app/watchface/market/365220007/lua/',elf_base:'/data/app/watchface/market/365220007/lua/',
  module:'rw4doomii386',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=once(source,'opened(base..\'doom.elf\'','opened(config.elf_base..\'doom.elf\'');
 source=once(source,"capture('insmod '..base..'doom.elf '","capture('insmod '..config.elf_base..'doom.elf '");
 source=once(source,"files.open(config.base..'doom.elf'","files.open(config.elf_base..'doom.elf'");
 source=once(source,'config.min_free==7366211','config.min_free=='+minimum);
 source=once(source,"(page>=5 and config.ui_base or asset_base)..names[page][row]",'asset_base..names[page][row]');
 assert.equal(config.base,'/data/app/watchface/market/365220006/lua/');assert.equal(config.min_largest,4194320);assert(Buffer.byteLength(source)<=32768);
 return{source,config,sourceSha256:sha256(source),memory:{previousResident,resident,saved,previousMinimum:old.config.min_free,minimum,roundUp:4096}};
}
export function fitPreview(){return png(390,450,(x,y)=>((x>=65&&x<325&&y>=90&&y<345&&(x<80||x>=310||y<105||y>=330))||(y>=145&&y<290&&[150,215].some(at=>x>=at&&x<at+25)))?[180,90,255]:[16,32,48]);}
