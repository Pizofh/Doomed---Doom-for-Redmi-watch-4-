// Isolated variant. Preserve sources/objects used by all previous physical trials.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root,sha256};
export const ramPngId='365219957',ramPngBase='/data/app/watchface/market/365219957/lua/',sharedWad='/data/app/watchface/market/365219963/lua/doom1.wad';
function once(source,old,next){if(source.split(old).length!==2)throw Error('RamPngTemplateChanged');return source.replace(old,()=>next);}
export function pngTransport(){
 let s=fs.readFileSync(path.join(root,'doom/platform-rw4/device/transport.c'),'utf8').replaceAll('\r\n','\n');
 s=once(s,'#include "image-view.h"','#include "png-view.h"');
 s=once(s,'"/dev/rw4doomimage.bin"','"/dev/rw4doomimage.png"');
 return once(s,'if(image_slot==2)return -11;','if(image_slot==2)return -11;\n        rw4_image_prepare(frames[image_slot].bytes+32);');
}
export function ramPngLauncher(elf,wad){
 const folder=path.join(root,'doom/platform-rw4/launcher');
 let controller=fs.readFileSync(path.join(folder,'controller.lua'),'utf8').replaceAll('\r\n','\n');
 controller=controller.replaceAll('/dev/rw4doomimage.bin','/dev/rw4doomimage.png');
 controller=once(controller,"opened(base..'doom1.wad'","opened(config.wad_path");
 // A stale old image node must also block loading this variant.
 controller=once(controller,"name~='rw4doomimage.bin','node retained'","name~='rw4doomimage.bin' and name~='rw4doomimage.png','node retained'");
 let wrapper=fs.readFileSync(path.join(folder,'reusable.lua'),'utf8').replaceAll('\r\n','\n');
 wrapper=once(wrapper,"path=config.base..'doom1.wad'","path=config.wad_path");
 // CRC checks for the first run of this live Lua instance; subsequent runs in
 // the SAME instance recheck size/header/RAM through native.start. No durable
 // verification bypass and no assumption that hashes survive app reopening.
 wrapper=once(wrapper,"local checking,running,closing=false,false,false","local checking,running,closing=false,false,false\n    local verified=false");
 wrapper=once(wrapper,"checking=true;status('CHECKING')","if verified then ram();native.start();running=true;ticks=0;return end\n        checking=true;status('CHECKING')");
 wrapper=once(wrapper,"checking=false;ram();native.start();running=true;ticks=0","checking=false;ram();native.start();verified=true;running=true;ticks=0");
 let main=fs.readFileSync(path.join(folder,'reusable-main.lua'),'utf8');
 const config={target:'rw4',id:ramPngId,ui_base:ramPngBase,base:ramPngBase,module:'rw4png304',allow_native:true,wad_path:sharedWad,elf_sha:sha256(elf),elf_bytes:elf.length,wad_bytes:wad.length,wad_lumps:wad.readUInt32LE(4),wad_directory:wad.readUInt32LE(8),elf_crc:crc32(elf),wad_crc:crc32(wad),min_free:6467285,min_largest:4194320,run_ticks:300};
 const parser=fs.readFileSync(path.join(root,'experiments/memory-preflight/parser.lua'),'utf8');
 const crc=fs.readFileSync(path.join(folder,'crc32.lua'),'utf8');
 const factory='local native=(function()\n'+controller+'\nend)()\nlocal memory=(function()\n'+parser+'\nend)()\nlocal crc=(function()\n'+crc+'\nend)()\nlocal launcher=(function()\n'+wrapper+'\nend)()\nreturn {new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end}';
 const serial='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 main=once(main,'__CONFIG__',serial);main=once(main,'__FACTORY__',factory);
 const source=main.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('RamPngSourceLimit');
 return{source,config,parts:{controller,wrapper,parser,crc},sourceSha256:sha256(source)};
}
function crc32(b){let c=0xffffffff;for(const v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
