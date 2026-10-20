// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {controlsLauncher,controlsAssets,root,sha256} from './doom-controls-r397.mjs';import {residentBytes} from './doom-fit-r386.mjs';import {crc32} from './static-watchface-transfer.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
const once=(source,from,to)=>{assert.equal(source.split(from).length,2,from);return source.replace(from,()=>to);};
export function intermissionLauncher(){
 const old=controlsLauncher(),dir=path.join(root,'build/doom-audio-r405/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8'));
 assert.equal(sha256(elf),review.elfSha256);assert.equal(review.checkpoint,'R405');assert.equal(review.controls.intermissionAdvance,true);
 const importer=Buffer.from(old.importer.toString().replaceAll('365220013','@R405_OLD@').replaceAll('365220014','365220015').replaceAll('@R405_OLD@','365220014').replaceAll('.import397','.import405'));
 const base='/data/app/watchface/market/365220015/lua/',resident=residentBytes(elf),minimum=Math.max(old.config.min_free,Math.ceil((old.config.min_free+resident-old.memory.resident)/4096)*4096);
 const config={...old.config,id:'365220015',base,ui_base:base,elf_base:base,assets_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii405',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum,import_base:'/data/app/watchface/market/365220014/lua/',import_bytes:importer.length,import_crc:crc32(importer)};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([key,value])=>key+'='+JSON.stringify(value)).join(',')+'}');
 source=once(source,'assert(config.min_free=='+old.config.min_free+' and config.min_largest==4194320)','assert(config.min_free=='+minimum+' and config.min_largest==4194320)');
 source=once(source,'local navigating=false\nlocal in_level=false\nlocal redraw_navigation','local navigating=false\nlocal in_level=false\nlocal menu_active=false\nlocal demo_playback=false\nlocal redraw_navigation');
 source=once(source,'local next_navigation=s[65]==1\nin_level=s[35]==0\nif next_navigation~=navigating then navigating=next_navigation;if redraw_navigation then redraw_navigation()end end',"local next_navigation=s[65]==1\nlocal next_menu_active=s[66]==1\nlocal next_demo_playback=s[67]==1\nin_level=s[35]==0\nif next_navigation~=navigating or next_menu_active~=menu_active or next_demo_playback~=demo_playback then\n navigating=next_navigation;menu_active=next_menu_active;demo_playback=next_demo_playback\n if redraw_navigation then redraw_navigation()end\nend");
 source=once(source,"local name=navigating and (key==8 and 'ok' or key==32 and 'menu_back') or p[1]", "local advancing=navigating and not in_level and not menu_active and not demo_playback\nlocal name=advancing and (key==8 and 'advance' or key==32 and 'use') or navigating and (key==8 and 'ok' or key==32 and 'menu_back') or p[1]");
 assert(Buffer.byteLength(source)<=32768);return{...old,source,config,importer,sourceSha256:sha256(source),memory:{...old.memory,resident,minimum,saved:old.memory.previousResident-resident},intermissionAdvance:true};
}
export function intermissionAssets(){
 const assets=controlsAssets();assets.pad_advance=(function(){const width=120,height=20,b=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const pixel=ownTextPixel('SIGUE',x-30,y,[0,0,0,0]);const at=y*(width*4+1)+1+x*4;b[at]=pixel[0];b[at+1]=pixel[1];b[at+2]=pixel[2];b[at+3]=pixel.length===4?pixel[3]:pixel[0]===255?255:0;}const z=deflateSync(b),chunk=(name,data)=>{const type=Buffer.from(name),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([type,data])));return Buffer.concat([size,type,data,crc]);},head=Buffer.alloc(13);head.writeUInt32BE(width);head.writeUInt32BE(height,4);head[8]=8;head[9]=6;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',head),chunk('IDAT',z),chunk('IEND',Buffer.alloc(0))]);})();return assets;
}
