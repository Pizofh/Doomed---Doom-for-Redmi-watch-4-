import fs from 'node:fs';import path from 'node:path';
import {root,sha256,firstRunSource} from './doom-first-run-source.mjs';
export {root,sha256};
export function reusableSource(){
 const old=firstRunSource(),folder=path.join(root,'doom/platform-rw4/launcher');
 const config={...old.config,id:'365219960',ui_base:'/data/app/watchface/market/365219960/lua/'};
 const reusable=fs.readFileSync(path.join(folder,'reusable.lua'),'utf8'),main=fs.readFileSync(path.join(folder,'reusable-main.lua'),'utf8');
 const parts={...old.parts,reusable,main};
 const factory='local native=(function()\n'+parts.controller+'\nend)()\nlocal memory=(function()\n'+parts.parser+'\nend)()\nlocal crc=(function()\n'+parts.crc+'\nend)()\nlocal launcher=(function()\n'+reusable+'\nend)()\nreturn {new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end}';
 const serialized='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 if(main.split('__CONFIG__').length!==2||main.split('__FACTORY__').length!==2)throw Error('ReusableTemplateChanged');
 const source=main.replace('__CONFIG__',()=>serialized).replace('__FACTORY__',()=>factory).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__|\b(?:loadfile|dofile)\s*\(/.test(source))throw Error('ReusableSourceLimit');
 return{source,config,parts,sourceSha256:sha256(Buffer.from(source))};
}
