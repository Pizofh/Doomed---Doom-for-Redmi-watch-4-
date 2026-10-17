import fs from 'node:fs';import path from 'node:path';import {deflateSync} from 'node:zlib';
import {padsLauncher,padsAssets,root,sha256} from './doom-pads-r349.mjs';import {once} from './doom-ready-source-r351.mjs';
import {ownTextPixel} from './native-info-legend.mjs';import {crc32} from './static-watchface-transfer.mjs';import {png} from './first-c-assets.mjs';
export {root,sha256};export const readyId='365219940';
function rgba(w,h,pixel){const chunk=(n,d)=>{const t=Buffer.from(n),a=Buffer.alloc(4),c=Buffer.alloc(4);a.writeUInt32BE(d.length);c.writeUInt32BE(crc32(Buffer.concat([t,d])));return Buffer.concat([a,t,d,c]);};const b=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)Buffer.from(pixel(x,y)).copy(b,y*(w*4+1)+1+x*4);const h0=Buffer.alloc(13);h0.writeUInt32BE(w);h0.writeUInt32BE(h,4);h0[8]=8;h0[9]=6;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',h0),chunk('IDAT',deflateSync(b)),chunk('IEND',Buffer.alloc(0))]);}
export function readyAssets(){
 const a=padsAssets();for(const[name,label]of Object.entries({save:'GUARDAR',load:'CARGAR'}))a['pad_'+name]=rgba(120,20,(x,y)=>ownTextPixel(label,x-(120-label.length*12)/2,y,[0,0,0])[0]===255?[255,255,255,210]:[0,0,0,0]);
 for(const[name,label]of Object.entries({slot_idle:'',scanning:'LEER SLOT',saving:'GUARDANDO',saved:'GUARDADO',loading:'CARGANDO',loaded:'CARGADO',no_save:'SIN PARTIDA',save_error:'ERROR SLOT'}))a[name]=png(156,20,(x,y)=>ownTextPixel(label,x-(156-label.length*12)/2,y,[16,32,48]));
 a.preview=png(390,450,(x,y)=>((x>=55&&x<335&&y>=130&&y<310&&(x<68||x>=322||y<143||y>=297))||x>=165&&x<225&&y>=185&&y<255)?[100,255,70]:[16,32,48]);return a;
}
export function readyLauncher(elf,wad){
 const old=padsLauncher(elf,wad),base='/data/app/watchface/market/'+readyId+'/lua/';
 const config={...old.config,id:readyId,base,ui_base:base,module:'rw4ready351',min_free:6956611,run_ticks:45000};
 let controller=old.parts.controller.replaceAll('/dev/rw4doompads','/dev/rw4doomready').replaceAll('0x35445752','0x36445752');
 controller=once(controller,'s[2]==5','s[2]==6');controller=once(controller,"local phase='READY'","local phase='READY'\n    local last_state=nil");
 controller=once(controller,"s[15]==1 and s[16]==0 and 'CLOSED'","(s[15]==1 or s[15]==2) and s[16]==0 and 'CLOSED'");
 controller=once(controller,'sequence=s[3];return s','last_state=s;sequence=s[3];return s');
 controller=once(controller,"name~='rw4doomdirect' and","name~='rw4doomslot' and name~='rw4doompads' and name~='rw4doomready' and name~='rw4doomdirect' and");
 controller=once(controller,'function b.phase()return phase end',"function b.slot_request(op)assert(phase=='PAUSED' and (op==8 or op==9));command(op)end\n    function b.cached_state()return last_state end\n    function b.phase()return phase end");
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),wrapper=read('doom/platform-rw4/launcher/ready-wrapper-r351.lua'),store=read('doom/platform-rw4/launcher/slot-store-r351.lua');
 const factory=`local native=(function()\n${controller}\nend)()\nlocal memory=(function()\n${old.parts.parser}\nend)()\nlocal crc=(function()\n${old.parts.crc}\nend)()\nlocal store=(function()\n${store}\nend)()\nlocal wrapper=(function()\n${wrapper}\nend)()\nreturn {new=function(config,files,system,view)return wrapper.new(config,files,system,view,native,memory,crc,store)end}`;
 const main=read('doom/platform-rw4/launcher/ready-main-r351.lua');
 const render=(configuration,implementation)=>main.replace('__CONFIG__','{'+Object.entries(configuration).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}').replace('__FACTORY__',()=>implementation);
 const source=render(config,factory);if(Buffer.byteLength(source)>32768||/__[A-Z_]+__/.test(source))throw Error('SourceLimit');
 return {config,source,sourceSha256:sha256(source),render,factory,parts:{...old.parts,controller,wrapper,store}};
}
