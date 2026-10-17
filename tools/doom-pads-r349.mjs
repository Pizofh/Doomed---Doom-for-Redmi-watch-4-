import fs from 'node:fs';import path from 'node:path';import {deflateSync} from 'node:zlib';
import {wideLauncher,wideAssets,root,sha256} from './doom-wide-r347.mjs';import {once} from './doom-pads-source-r349.mjs';
import {ownTextPixel} from './native-info-legend.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};export const padsId='365219941';
export const padsLayout=[['up',1,92,260,60,50],['left',2,28,302,60,50],['right',4,156,302,60,50],['back',16,92,344,60,50],['fire',8,278,270,86,60],['use',32,278,340,86,60]];
function rgba(w,h,pixel){const chunk=(n,d)=>{const t=Buffer.from(n),a=Buffer.alloc(4),c=Buffer.alloc(4);a.writeUInt32BE(d.length);c.writeUInt32BE(crc32(Buffer.concat([t,d])));return Buffer.concat([a,t,d,c]);};const b=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)Buffer.from(pixel(x,y)).copy(b,y*(w*4+1)+1+x*4);const h0=Buffer.alloc(13);h0.writeUInt32BE(w);h0.writeUInt32BE(h,4);h0[8]=8;h0[9]=6;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',h0),chunk('IDAT',deflateSync(b)),chunk('IEND',Buffer.alloc(0))]);}
export function padsAssets(){
 const a=wideAssets();for(const[name,label]of Object.entries({fire:'FIRE',use:'USAR',pause:'PAUSA',resume:'SEGUIR',exit:'SALIR'}))a['pad_'+name]=rgba(120,20,(x,y)=>ownTextPixel(label,x-Math.floor((120-label.length*12)/2),y,[0,0,0])[0]===255?[255,255,255,210]:[0,0,0,0]);
 for(const[name,turn]of [['up',0],['back',2],['left',3],['right',1]])a['pad_'+name]=rgba(120,20,(x,y)=>{let dx=x-60,dy=y-10;for(let i=0;i<turn;i++)[dx,dy]=[dy,-dx];const on=dy>=-7&&dy<=-1&&Math.abs(dx)<=dy+7||dy>=-1&&dy<=6&&Math.abs(dx)<=2;return on?[255,255,255,210]:[0,0,0,0];});
 a.preview=rgba(390,450,(x,y)=>((x>=100&&x<140&&y>=150&&y<270)||(x>=60&&x<180&&y>=190&&y<230)||(x>=255&&x<315&&y>=165&&y<215)||(x>=255&&x<315&&y>=235&&y<285))?[0,230,250,255]:[16,32,48,255]);return a;
}
export function padsLauncher(elf,wad){
 const old=wideLauncher(elf,wad),base='/data/app/watchface/market/'+padsId+'/lua/',config={...old.config,id:padsId,base,ui_base:base,module:'rw4pads349'};
 let controller=old.parts.controller.replaceAll('/dev/rw4doomdirect','/dev/rw4doompads').replaceAll('0x34445752','0x35445752');
 controller=once(controller,'s[2]==4','s[2]==5');controller=once(controller,"value==8,'input mask'","value==8 or value==16 or value==32,'input mask'");
 const factory=`local native=(function()\n${controller}\nend)()\nlocal memory=(function()\n${old.parts.parser}\nend)()\nlocal crc=(function()\n${old.parts.crc}\nend)()\nlocal wrapper=(function()\n${old.parts.wrapper}\nend)()\nreturn {new=function(config,files,system,view)return wrapper.new(config,files,system,view,native,memory,crc)end}`;
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/pads-main-r349.lua'),'utf8');
 const render=(configuration,implementation)=>main.replace('__CONFIG__','{'+Object.entries(configuration).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}').replace('__FACTORY__',()=>implementation);
 const source=render(config,factory);if(Buffer.byteLength(source)>32768||/__[A-Z_]+__/.test(source))throw Error('SourceLimit');
 return {config,source,sourceSha256:sha256(source),render,parts:{...old.parts,controller}};
}
