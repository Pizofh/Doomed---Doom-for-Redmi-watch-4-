// One combined UI/performance profile; the physically proven C binary is unchanged.
import fs from 'node:fs';import path from 'node:path';import {deflateSync} from 'node:zlib';
import {directLauncher,directAssets,root,sha256} from './doom-direct-launcher-r343.mjs';
import {ownTextPixel} from './native-info-legend.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};export const touchId='365219943';
const once=(s,a,b)=>{if(s.split(a).length!==2)throw Error('TouchTemplateChanged:'+a);return s.replace(a,()=>b);};
function rgba(w,h,pixel){
 const chunk=(name,data)=>{const t=Buffer.from(name),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);};
 const b=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)Buffer.from(pixel(x,y)).copy(b,y*(w*4+1)+1+x*4);
 const head=Buffer.alloc(13);head.writeUInt32BE(w);head.writeUInt32BE(h,4);head[8]=8;head[9]=6;
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',head),chunk('IDAT',deflateSync(b)),chunk('IEND',Buffer.alloc(0))]);
}
export function touchAssets(){
 const a=directAssets();
 for(const label of ['UP','LEFT','RIGHT','FIRE','PAUSE','EXIT'])a['pad_'+label.toLowerCase()]=rgba(64,20,(x,y)=>{const c=ownTextPixel(label,x-Math.floor((64-label.length*12)/2),y,[0,0,0]);return c[0]===255?[255,255,255,210]:[0,0,0,0];});
 // A single cyan cross distinguishes this face from the six-bar fallback.
 a.preview=rgba(390,450,(x,y)=>(x>=175&&x<215&&y>=140&&y<290)||(x>=120&&x<270&&y>=195&&y<235)?[0,240,220,255]:[16,32,48,255]);return a;
}
export function touchLauncher(elf,wad){
 const old=directLauncher(elf,wad),base='/data/app/watchface/market/'+touchId+'/lua/';
 const config={...old.config,id:touchId,base,ui_base:base,run_ticks:750};
 let controller=old.parts.controller;
 controller=once(controller,"local function status(value)phase=value;if not closing then view.status(value)end end","local function status(value)if phase==value then return end;phase=value;if not closing then view.status(value)end end");
 controller=once(controller,"command(7);s=state();if s[23]>0 then status('PLAYING')end","command(7);if s[23]>0 then status('PLAYING')end -- next tick checks the resulting native snapshot");
 const wrapper=once(old.parts.wrapper,'config.run_ticks==600','config.run_ticks==750');
 const factory=`local native=(function()\n${controller}\nend)()\nlocal memory=(function()\n${old.parts.parser}\nend)()\nlocal crc=(function()\n${old.parts.crc}\nend)()\nlocal wrapper=(function()\n${wrapper}\nend)()\nreturn {new=function(config,files,system,view)return wrapper.new(config,files,system,view,native,memory,crc)end}`;
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/touch-main-r345.lua'),'utf8');
 const render=(configuration,implementation)=>main.replace('__CONFIG__','{'+Object.entries(configuration).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}').replace('__FACTORY__',()=>implementation);
 const source=render(config,factory);if(Buffer.byteLength(source)>32768||/__[A-Z_]+__/.test(source))throw Error('SourceLimit');
 return {config,source,sourceSha256:sha256(source),render,parts:{...old.parts,controller,wrapper}};
}
