import fs from 'node:fs';import path from 'node:path';
import {root,sha256,residentInfoAssets} from './doom-resident-info-source.mjs';import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
export function residentCloseSource(){
 const info=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/resident-info.lua'),'utf8');
 const collector=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/resident-close.lua'),'utf8').replace('__INFO__',()=>info);
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/resident-info-main.lua'),'utf8').replaceAll('365219955','365219954').replace('collect.collect(io,report)','collect.collect(io,report,os)');
 const source=main.replace('__COLLECT__',()=>collector).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'');
 if(/__INFO__|__COLLECT__|\binsmod\b|\bTimer\b/.test(source)||Buffer.byteLength(source)>24576)throw Error('CloseSourceContract');
 return{source,collector,sourceSha256:sha256(source),config:{id:'365219954'}};
}
export function residentCloseAssets(){
 const assets=residentInfoAssets();
 for(const [name,text,width]of [['title','C CLOSE',168],['read','CLOSE C',118],['l3','EXIT CODE',180],['l14','IO ERR',180]])assets[name]=png(width,20,(x,y)=>ownTextPixel(text,x,y,name==='read'?[36,92,128]:[16,32,48]));
 assets.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=168&&y<272&&(y-168)%26<16?[255,128,0]:[16,32,48]);return assets;
}
