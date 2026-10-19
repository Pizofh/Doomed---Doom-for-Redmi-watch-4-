// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {deflateSync} from 'node:zlib';
import {fastLauncher,root,sha256} from './doom-fast-r396.mjs';import {residentBytes} from './doom-fit-r386.mjs';import {crc32} from './static-watchface-transfer.mjs';import {doom2Assets} from './doom2-r384.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,a);return s.replace(a,()=>b);};
export function controlsLauncher(){
 const old=fastLauncher(),dir=path.join(root,'build/doom-audio-r397/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));assert.equal(sha256(elf),r.elfSha256);assert(r.controls.quietNormalConsole);assert.equal(r.packed.gamePath,'/data/app/watchface/market/365220014/lua/doom2-r384.wad');
 const importer=Buffer.from(old.importer.toString().replace(/365220013|365220011/g,v=>v==='365220013'?'365220014':'365220013').replaceAll('.import396','.import397'));
 const base='/data/app/watchface/market/365220014/lua/',resident=residentBytes(elf),minimum=Math.max(old.config.min_free,Math.ceil((old.config.min_free+resident-old.memory.resident)/4096)*4096);
 const config={...old.config,id:'365220014',base,ui_base:base,elf_base:base,assets_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii397',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum,import_base:old.config.base,import_bytes:importer.length,import_crc:crc32(importer)};
 let s=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');s=once(s,'config.min_free=='+old.config.min_free,'config.min_free=='+minimum);
 s=once(s,"value==64,'input mask'","value==64 or value==128 or value==256,'input mask'");
 s=once(s,'local bytes,why=current:read(8192);assert(why==nil)','local bytes,why=current:read(16384);assert(why==nil)');
 s=once(s,"assert(type(bytes)=='string' and #bytes<=8192)","assert(type(bytes)=='string' and #bytes<=16384)");
 s=once(s,'-- All pads are below the transformed game bounds: no HUD coverage or per-frame blending.','-- Only MENU/PAUSA overlap the upper game region; weapon keys stay below the HUD.');
 s=once(s,"pad('menu',18,402,60,34,nil)","pad('menu',48,42,92,30,nil)");
 const at=s.indexOf('local pause_hit\npause_hit,pause_label=');const end=s.indexOf('\nend\nredraw_navigation=',at);assert(at>0&&end>at);
 s=s.slice(0,at)+`local pause_hit
if phase=='PLAYING'then
pause_hit,pause_label=pad('pause',230,42,112,30,backend.pause)
if in_level and not navigating then
for _,p in ipairs({{'weapon_prev',128,26},{'weapon_next',256,208}})do
local key=p[2];local b=pad(p[1],p[3],402,156,34,nil)
b:onevent(E.PRESSED,function()safe(function()backend.input(key)end)end)
for _,event in ipairs({E.RELEASED,E.PRESS_LOST,E.CANCEL,E.DEFOCUSED})do b:onevent(event,function()safe(function()backend.release(key)end)end)end
end
end
else
pause_hit,pause_label=pad('pause',26,388,156,40,backend.pause)
pad('exit',208,388,156,40,backend.stop)
end`+s.slice(end);
 s=once(s,'local page,digits,labels=1,{},{}','local page,digits,labels=1,{},{}\nlocal details=false');
 s=once(s,"if name=='CHECKING' then if panel", "if name=='CHECKING' then details=false;if panel");
 s=once(s,"if name=='ERROR' or name=='CLOSED' then page=name=='ERROR' and 5 or 1;record();panel:clear_flag(F.HIDDEN);ensure_mode();mode:clear_flag(F.HIDDEN)","if name=='ERROR' or name=='CLOSED' then page=name=='ERROR' and 5 or 1;details=name=='ERROR';if details then record();panel:clear_flag(F.HIDDEN)elseif panel then panel:delete();panel=nil;digits={};labels={}end;ensure_mode();mode:clear_flag(F.HIDDEN)");
 s=once(s,'function()page=page%8+1;record()end,false)','function()if details then page=page%8+1 else details=true end;record();panel:clear_flag(F.HIDDEN)end,false)');
 assert(Buffer.byteLength(s)<=32768,Buffer.byteLength(s));
 return{...old,source:s,config,importer,sourceSha256:sha256(s),memory:{...old.memory,resident,minimum,saved:old.memory.previousResident-resident},weaponButtons:true,normalCloseDiagnosticsHidden:true,elfReadChunk:16384};
}
function rgba(w,h,pixel){const chunk=(n,d)=>{const t=Buffer.from(n),a=Buffer.alloc(4),c=Buffer.alloc(4);a.writeUInt32BE(d.length);c.writeUInt32BE(crc32(Buffer.concat([t,d])));return Buffer.concat([a,t,d,c]);};const b=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)Buffer.from(pixel(x,y)).copy(b,y*(w*4+1)+1+x*4);const hd=Buffer.alloc(13);hd.writeUInt32BE(w);hd.writeUInt32BE(h,4);hd[8]=8;hd[9]=6;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',hd),chunk('IDAT',deflateSync(b)),chunk('IEND',Buffer.alloc(0))]);}
export function controlsAssets(){
 const a=doom2Assets();
 for(const[name,plus]of [['weapon_prev',false],['weapon_next',true]])a['pad_'+name]=rgba(120,20,(x,y)=>{if(x>=82&&x<94&&((y>=6&&y<9)||(plus&&x>=87&&x<90&&y>=2&&y<13)))return[255,255,255,255];const p=ownTextPixel('ARMA',x-24,y,[0,0,0,0]);return p.length===3?[...p,255]:p;});
 a.mode=rgba(96,20,(x,y)=>{const p=ownTextPixel('INFO',x-24,y,[0,0,0,0]);return p.length===3?[...p,255]:p;});return a;
}
