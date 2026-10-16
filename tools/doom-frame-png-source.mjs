import fs from 'node:fs';import path from 'node:path';
import {root,sha256,snapshotSource,snapshotAssets} from './doom-snapshot-source.mjs';
import {png} from './first-c-assets.mjs';
export {root,sha256};
export function framePngSource(){
 const old=snapshotSource(),parts={...old.parts,png:fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/frame-png.lua'),'utf8')},config={...old.config,id:'365219958',ui_base:'/data/app/watchface/market/365219958/lua/'};
 const modules={native:parts.controller,memory:parts.parser,crc:parts.crc,encoder:parts.png,launcher:parts.first};
 const factory=Object.entries(modules).map(([n,s])=>'local '+n+'=(function()\n'+s+'\nend)()\n').join('')+'return {new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end,capture=function(f,p)return encoder.new(f,crc,p)end}';
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/png-main.lua'),'utf8');
 if(main.split('__CONFIG__').length!==2||main.split('__FACTORY__').length!==2)throw Error('PngTemplateChanged');
 const serialized='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 const source=main.replace('__CONFIG__',()=>serialized).replace('__FACTORY__',()=>factory).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__|\b(?:loadfile|dofile)\s*\(/.test(source))throw Error('PngSourceLimit');
 return{source,config,parts,sourceSha256:sha256(Buffer.from(source))};
}
export function framePngAssets(){
 const assets=snapshotAssets();for(const n of ['up','left','right','fire','pause'])delete assets[n];
 // Preview distinct from DoomStill: retain grid asset; use three cyan bars.
 assets.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=181&&y<259&&(y-181)%26<16?[0,220,220]:[16,32,48]);
 return assets;
}
