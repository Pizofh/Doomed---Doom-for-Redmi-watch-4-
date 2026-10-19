// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {fitLauncher,residentBytes,root,sha256} from './doom-fit-r386.mjs';import {once} from './doom-ready-source-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';import {png} from './first-c-assets.mjs';
import {tuneView} from './doom-tune-source-r387.mjs';
export {root,sha256};
export function tuneLauncher(){
 const old=fitLauncher(),dir=path.join(root,'build/doom-audio-r387/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));
 assert.equal(sha256(elf),r.elfSha256);assert(r.tune.workerOwnedMixer&&r.tune.pacedWrites&&r.tune.zoom===288&&r.tune.y===39);
 for(const [f,h]of Object.entries({...r.tune.sourceHashes,...r.adpcm.sourceHashes}))assert.equal(sha256(fs.readFileSync(path.join(root,f))),h);
 assert.equal(sha256(fs.readFileSync(path.join(dir,'direct-wide.c'))),sha256(tuneView()));
 assert.equal(sha256(fs.readFileSync(path.join(dir,'direct-scale-r347.h'))),'88a7909a563f6ccc929758cb86ff4782d5fe17e69156c2636c615dac10f15cae');
 const previousResident=old.memory.previousResident,resident=residentBytes(elf),saved=previousResident-resident;
 const minimum=Math.ceil((old.memory.previousMinimum-saved)/4096)*4096;
 const config={...old.config,id:'365220008',ui_base:'/data/app/watchface/market/365220008/lua/',elf_base:'/data/app/watchface/market/365220008/lua/',module:'rw4doomii387',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=once(source,'config.min_free=='+old.config.min_free,'config.min_free=='+minimum);
 source=once(source,'hits=object(root,0,0,390,440,0)','hits=object(root,0,0,390,450,0);hits:add_flag(F.CLICKABLE);hits:add_flag(F.PRESS_LOCK)');
 source=once(source,'remove_overlay();root:add_flag(F.SCROLL_CHAIN_HOR);','remove_overlay();root:clear_flag(F.CLICKABLE);root:clear_flag(F.PRESS_LOCK);root:add_flag(F.SCROLL_CHAIN_HOR);');
 source=once(source,'root:clear_flag(F.SCROLL_CHAIN_HOR);root:clear_flag(F.SCROLL_CHAIN_VER);start:add_flag(F.HIDDEN)',
 'root:add_flag(F.CLICKABLE);root:add_flag(F.PRESS_LOCK);root:clear_flag(F.SCROLL_CHAIN_HOR);root:clear_flag(F.SCROLL_CHAIN_VER);start:add_flag(F.HIDDEN)');
 assert.equal(config.base,'/data/app/watchface/market/365220006/lua/');assert.equal(config.min_largest,4194320);assert(Buffer.byteLength(source)<=32768);
 return{source,config,sourceSha256:sha256(source),memory:{previousResident,resident,saved,previousMinimum:old.memory.previousMinimum,minimum,roundUp:4096},display:{zoom:288,positionY:39,bounds:{x:15,y:26.5,w:360,h:225},source:[320,200]}};
}
export function tunePreview(){return png(390,450,(x,y)=>((x>=65&&x<325&&y>=90&&y<345&&(x<80||x>=310||y<105||y>=330))||([145,195,245].some(at=>x>=at&&x<at+20)&&y>=165&&y<280))?[70,230,180]:[16,32,48]);}
