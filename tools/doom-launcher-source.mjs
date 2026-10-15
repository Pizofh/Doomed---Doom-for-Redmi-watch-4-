// Fixed package identities and source composition; no execution/transport.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root,sha256};
export function launcherProfile(target){
 if(!['rw4','s3'].includes(target))throw Error('UnknownLauncherTarget');
 const id=target==='rw4'?'365219963':'365799913';
 return {target,id,base:'/data/app/watchface/market/'+id+'/lua/',module:target==='rw4'?'rw4doom282':'rw4doompc282',allow_native:target==='s3'};
}
export function launcherSource(target,elf,wad){
 const p=launcherProfile(target);
 const config={...p,elf_sha:sha256(elf),elf_bytes:elf.length,wad_bytes:wad.length,wad_lumps:wad.readUInt32LE(4),wad_directory:wad.readUInt32LE(8)};
 const controller=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/controller.lua'),'utf8');
 let source=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/main.lua'),'utf8');
 const serialized='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 for(const [token,value]of [['__CONFIG__',serialized],['__CONTROLLER__',controller]]){
  if(source.split(token).length!==2)throw Error('LauncherTemplateChanged');source=source.replace(token,()=>value);
 }
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__|\b(?:loadfile|dofile)\s*\(/.test(source))throw Error('LauncherSourceLimit');
 return {source,config,controller};
}
