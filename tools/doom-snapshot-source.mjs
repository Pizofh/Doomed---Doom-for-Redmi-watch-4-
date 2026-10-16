// One paused image; no new ELF, binding, native image format or engine change.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,firstRunSource} from './doom-first-run-source.mjs';import {launcherAssets} from './doom-launcher-assets.mjs';import {png} from './first-c-assets.mjs';
export {root,sha256};
export function snapshotSource(){
 const old=firstRunSource(),config={...old.config,id:'365219959',ui_base:'/data/app/watchface/market/365219959/lua/'};
 const before="if not paused and s[10]>0 then\n            detach();view.frame(image_path);status('PLAYING')\n        end",original=old.parts.controller.replaceAll('\r\n','\n');
 if(original.split(before).length!==2)throw Error('SnapshotControllerChanged');
 const controller=original.replace(before,"if not paused and s[10]>0 then\n            command(3);paused=true;mask=0\n            detach();view.frame(image_path);status('PAUSED')\n        end");
 const a=controller.indexOf('    function b.pause()\n'),b=controller.indexOf('    function b.stop()\n');
 if(a<0||b<a||controller.split('function b.pause()').length!==2)throw Error('PauseContractChanged');
 const frozen=controller.slice(0,a)+'    function b.pause()end\n'+controller.slice(b);
 const parts={...old.parts,controller:frozen};
 const factory='local native=(function()\n'+frozen+'\nend)()\nlocal memory=(function()\n'+parts.parser+'\nend)()\nlocal crc=(function()\n'+parts.crc+'\nend)()\nlocal launcher=(function()\n'+parts.first+'\nend)()\nreturn {new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end}';
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/snapshot-main.lua'),'utf8');
 if(main.split('__CONFIG__').length!==2||main.split('__FACTORY__').length!==2)throw Error('SnapshotTemplateChanged');
 const serialized='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 const source=main.replace('__CONFIG__',()=>serialized).replace('__FACTORY__',()=>factory).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__|\b(?:loadfile|dofile)\s*\(/.test(source))throw Error('SnapshotSourceLimit');
 return{source,config,parts,sourceSha256:sha256(Buffer.from(source))};
}
export function snapshotAssets(){
 const assets=launcherAssets({firstRun:true});
 assets.reference=png(320,200,(x,y)=>{
  if(x<3||x>=317||y<3||y>=197||x%40<2||y%25<2)return[255,255,255];
  return x<160?(y<100?[220,20,20]:[20,40,220]):(y<100?[20,200,40]:[230,150,20]);
 });
 assets.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=168&&y<272&&(y-168)%26<16?[220,40,220]:[16,32,48]);
 return assets;
}
