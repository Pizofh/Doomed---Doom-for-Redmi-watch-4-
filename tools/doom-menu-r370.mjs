// SPDX-License-Identifier: GPL-2.0-only
import {deflateSync} from 'node:zlib';
import {root,sha256,once} from './doom-ready-source-r351.mjs';
import {readyLauncher} from './doom-ready-r351.mjs';import {voiceLauncher,voiceAssets} from './doom-voice-r369.mjs';
import {recoveryController} from './doom-audio-recovery-r368.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};export const menuId='365219936';
export function menuController(source){
 let s=once(source,'s[2]==7','s[2]==8');
 s=once(s,'f:read(256)','f:read(288)');s=once(s,'#value==256','#value==288');s=once(s,"string.rep('I4',64)","string.rep('I4',72)");
 return once(s,"value==32,'input mask'","value==32 or value==64,'input mask'");
}
function label(text){
 const w=120,h=20,bytes=Buffer.alloc((w*4+1)*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const white=ownTextPixel(text,x-(w-text.length*12)/2,y,[0,0,0])[0]===255;
  if(white)Buffer.from([255,255,255,210]).copy(bytes,y*(w*4+1)+1+x*4);
 }
 const chunk=(name,data)=>{const tag=Buffer.from(name),n=Buffer.alloc(4),crc=Buffer.alloc(4);n.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([n,tag,data,crc]);};
 const head=Buffer.alloc(13);head.writeUInt32BE(w);head.writeUInt32BE(h,4);head[8]=8;head[9]=6;
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',head),chunk('IDAT',deflateSync(bytes)),chunk('IEND',Buffer.alloc(0))]);
}
export function menuAssets(){const a=voiceAssets();
 a.pad_ok=label('OK');a.pad_menu_back=label('ATRAS');a.pad_menu=label('MENU');
 a.preview=png(390,450,(x,y)=>x>=80&&x<310&&[135,180,225,270].some(at=>y>=at&&y<at+15)?[100,255,70]:[16,32,48]);return a;
}
export function menuLauncher(elf,wad){
 const old=readyLauncher(elf,wad),voice=voiceLauncher(elf,wad),controller=recoveryController(old.parts.controller);
 let source=once(voice.source,controller,menuController(controller));
 source=source.replaceAll('365219937',menuId).replaceAll('rw4voice369','rw4menu370');
 source=once(source,'local view={}','local view={}\nlocal navigating=false\nlocal in_level=false\nlocal redraw_navigation');
 source=once(source,'function view.native(s)',`function view.native(s)
local next_navigation=s[65]==1
in_level=s[35]==0
if next_navigation~=navigating then navigating=next_navigation;if redraw_navigation then redraw_navigation()end end`);
 source=once(source,'local b=pad(p[1],p[3],p[4],p[5],p[6],nil)',
 "local name=navigating and (key==8 and 'ok' or key==32 and 'menu_back') or p[1]\nlocal b=pad(name,p[3],p[4],p[5],p[6],nil)");
 source=once(source,'local pause_hit',`if phase=='PLAYING' then
local menu_hit=pad('menu',18,402,60,34,nil)
menu_hit:onevent(E.PRESSED,function()safe(function()backend.input(64)end)end)
for _,event in ipairs({E.RELEASED,E.PRESS_LOST,E.CANCEL,E.DEFOCUSED})do
menu_hit:onevent(event,function()safe(function()backend.release(64)end)end)
end
end
local pause_hit`);
 source=once(source,'function view.status(name)',`redraw_navigation=function()
if phase=='PLAYING' and overlay then remove_overlay();show_overlay()end
end
function view.status(name)`);
 source=once(source,"pad('save',28,300,156,60,backend.save)","if in_level then pad('save',28,300,156,60,backend.save)end");
 const config={...voice.config,id:menuId,module:'rw4menu370',base:'/data/app/watchface/market/'+menuId+'/lua/',ui_base:'/data/app/watchface/market/'+menuId+'/lua/'};
 if(Buffer.byteLength(source)>32768)throw Error('Lua limit');return {config,source,sourceSha256:sha256(source)};
}
