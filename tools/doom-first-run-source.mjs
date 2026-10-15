// Offline composition: own small launcher, existing fixed carrier resources.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256} from './doom-launcher-source.mjs';import {verifyShareware} from './wad-data.mjs';
export {root,sha256};
export function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
export function firstRunSource(){
 const dir=path.join(root,'build/doom-low-memory-rw4-r285'),elf=fs.readFileSync(path.join(dir,'doom.elf')),wad=fs.readFileSync(path.join(dir,'app/lua/doom1.wad'));
 if(elf.length!==603760||sha256(elf)!=='980e13cc85813d463d229aec93b4b2000654b188b3c80a36bdcf30eaa3a3c8a5')throw Error('CarrierElfChanged');verifyShareware(wad);
 const config={target:'rw4',id:'365219961',ui_base:'/data/app/watchface/market/365219961/lua/',base:'/data/app/watchface/market/365219963/lua/',module:'rw4doom282',allow_native:true,elf_sha:sha256(elf),elf_bytes:elf.length,wad_bytes:wad.length,wad_lumps:wad.readUInt32LE(4),wad_directory:wad.readUInt32LE(8),elf_crc:crc32(elf),wad_crc:crc32(wad),min_free:6467285,min_largest:4194320,run_ticks:300};
 const folder=path.join(root,'doom/platform-rw4/launcher'),read=n=>fs.readFileSync(path.join(folder,n+'.lua'),'utf8');
 const controller=read('controller'),first=read('first-run'),crc=read('crc32'),parser=fs.readFileSync(path.join(root,'experiments/memory-preflight/parser.lua'),'utf8');
 const factory='local native_factory=(function()\n'+controller+'\nend)()\nlocal memory=(function()\n'+parser+'\nend)()\nlocal crc=(function()\n'+crc+'\nend)()\nlocal first=(function()\n'+first+'\nend)()\nreturn {new=function(c,f,s,v)return first.new(c,f,s,v,native_factory,memory,crc)end}';
 let main=read('main');
 const pause="function pageOnPause()if backend.phase()=='PLAYING' then safe(backend.pause)end end";
 if(main.split(pause).length!==2)throw Error('PauseTemplateChanged');main=main.replace(pause,'function pageOnPause()safe(backend.stop)end');
 for(const old of ["raw:gsub('/+','/')==config.base","src=config.base..name..'.png'","src=config.base..name:lower()..'.png'"]){if(main.split(old).length!==2)throw Error('MainTemplateChanged');main=main.replace(old,old.replace('config.base','config.ui_base'));}
 const serialized='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 const source=main.replace('__CONFIG__',()=>serialized).replace('__CONTROLLER__',()=>factory).replace(/^--[^\r\n]*\r?\n/gm,'');
 if(Buffer.byteLength(source)>32768||/__[A-Z_]+__|\b(?:loadfile|dofile)\s*\(/.test(source))throw Error('FirstRunSourceLimit');
 return{source,config,parts:{controller,first,crc,parser},sourceSha256:sha256(Buffer.from(source))};
}
