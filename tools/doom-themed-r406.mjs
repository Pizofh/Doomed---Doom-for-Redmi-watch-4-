// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {intermissionLauncher,intermissionAssets,root,sha256} from './doom-intermission-r405.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,a);return s.replace(a,()=>b);};
export function launchArt(){return png(390,196,(x,y)=>{
 const noise=((x*17+y*31)^(x*y))&7,glow=Math.max(0,1-Math.abs(x-195)/210);
 let c=[12+noise+Math.floor(y/15),9+noise,10+noise];
 if(y>125)c=[Math.floor(55+glow*65+(y-125)/3),18+noise,10];
 const ridge=147+Math.floor(12*Math.sin(x/24)+9*Math.sin(x/9));if(y>ridge)c=[18+noise,12,13];
 for(const side of [0,1]){const k=side?390-x:x;if(k<63&&y>91+(k%17))c=[20+noise,17,19];if(k>17&&k<30&&y>103&&y<137)c=[109,32,18];}
 const text='DOOM',ox=51,oy=30,scale=6;
 const ink=(dx,dy)=>ownTextPixel(text,Math.floor((x-ox+dx)/scale),Math.floor((y-oy+dy)/scale),[0,0,0])[0]===255;
 if(ink(-4,-6))c=[3,3,4];if(ink(2,2))c=[110,52,23];if(ink(0,0)){const t=Math.min(1,Math.max(0,(y-oy)/80));c=[Math.floor(245-t*100),Math.floor(212-t*146),Math.floor(139-t*110)];if(y%6===0)c=c.map(v=>Math.max(0,v-16));}
 if(ownTextPixel('II',Math.floor((x-161)/3),Math.floor((y-126)/3),[0,0,0])[0]===255)c=[227,155,73];
 if(y===181&&x>71&&x<319)c=[101,36,24];return c;
});}
export function themedAssets(){const a=intermissionAssets();a.launch=launchArt();for(const name of ['ready','checking','loading','closed','stopping','recovering','error'])a[name]=png(200,20,(x,y)=>ownTextPixel(({ready:'LISTO',checking:'CHECKING',loading:'CARGANDO',closed:'CERRADO',stopping:'SALIENDO',recovering:'CARGANDO',error:'ERROR'})[name],x,y,[16,12,13]));a.start=png(96,20,(x,y)=>{const lx=x-18;let ink=false;if(lx>=0&&lx<10){const rows=[7,2,2,2,18,18,12],gx=Math.floor(lx/2),gy=Math.floor(y/2);ink=gy<7&&(rows[gy]&(1<<(4-gx)));}else if(lx>=12)ink=ownTextPixel('UGAR',lx-12,y,[0,0,0])[0]===255;return ink?[255,232,195]:[143,27,20];});return a;}
export function themedLauncher(){
 const old=intermissionLauncher(),dir=path.join(root,'build/doom-audio-r406/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));assert.equal(r.checkpoint,'R406');assert.equal(sha256(elf),r.elfSha256);
 const importer=Buffer.from(old.importer.toString().replaceAll('365220014','@OLD@').replaceAll('365220015','365220016').replaceAll('@OLD@','365220015').replaceAll('.import405','.import406'));
 const base='/data/app/watchface/market/365220016/lua/',config={...old.config,id:'365220016',base,ui_base:base,assets_base:base,elf_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii406',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),import_base:old.config.base,import_bytes:importer.length,import_crc:crc32(importer)};
 let s=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 s=once(s,"local title=bitmap(root,'title',171,7)","root:set{bg_color=0x100c0d}\nlocal title=bitmap(root,'launch',0,20)");
 s=once(s,"if name=='CHECKING' then details=false;", "if name=='CHECKING' then if title then title:delete();title=nil end;details=false;");
 s=once(s,'title:add_flag(F.HIDDEN)','if title then title:add_flag(F.HIDDEN)end');
 s=once(s,"else slot_image:add_flag(F.HIDDEN);title:clear_flag(F.HIDDEN);", "else slot_image:add_flag(F.HIDDEN);if name=='CLOSED' and not title then title=bitmap(root,'launch',0,20)end;if title then title:clear_flag(F.HIDDEN)end;");
 s=once(s,"start=button(root,'start',140,220,110,40,100,backend.start,false)","start=button(root,'start',65,216,260,52,100,backend.start,false)\nstart:set{bg_color=0x8f1b14}");
 s=once(s,"local status_image=bitmap(root,'ready',20,270)","local status_image=bitmap(root,'ready',20,280)");
 s=once(s,'status_image:set{x=20,y=270}','status_image:set{x=20,y=280}');
 s=once(s,"button(root,'mode',265,267,110,28","button(root,'mode',265,274,110,26");
 // Remove full-line research comments to retain the existing Lua byte limit.
 s=s.split('\n').filter(line=>!line.trimStart().startsWith('--')).join('\n');assert(Buffer.byteLength(s)<=32768,Buffer.byteLength(s));
 return{...old,source:s,sourceSha256:sha256(s),config,importer,themedStartup:true};
}
