import fs from 'node:fs';import path from 'node:path';
import {root,sha256,traceAssets} from './doom-trace-source.mjs';import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
export function residentInfoSource(){
 const collector=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/resident-info.lua'),'utf8');
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/resident-info-main.lua'),'utf8');
 if(main.split('__COLLECT__').length!==2)throw Error('TemplateChanged');
 const source=main.replace('__COLLECT__',()=>collector);
 if(/\b(?:execute|remove|write|flush|Timer|rmmod|insmod)\b/.test(source))throw Error('ReadOnlyContractChanged');
 return{source,collector,sourceSha256:sha256(source),config:{id:'365219955'}};
}
export function residentInfoAssets(){
 const digits=traceAssets(),assets={};for(let n=0;n<10;n++)assets['d'+n]=digits['d'+n];
 const extra={J:[7,2,2,2,18,18,12],Q:[14,17,17,17,21,18,13],Y:[17,17,10,4,4,4,4]};
 const textPixel=(text,x,y,bg)=>{
  const bits=extra[text[Math.floor(x/12)]];
  if(!bits)return ownTextPixel(text,x,y,bg);
  const gx=Math.floor(x%12/2),gy=Math.floor(y/2);
  return gx<5&&gy<7&&(bits[gy]&(1<<(4-gx)))?[255,255,255]:bg;
 };
 const names=['REG OWN','LEASE','CAPTURE','C OPEN','C READ','C CLOSE','SEQUENCE','STARTED','READY','FINISHED','JOINED','ERROR','REASON','CODE','PEAK','ALLOC','FREED','CLEANUP'];
 for(let i=0;i<names.length;i++)assets['l'+(i+1)]=png(180,20,(x,y)=>textPixel(names[i],x,y,[16,32,48]));
 for(const [name,text,width]of [['title','C INFO',168],['read','READ C',118],['mode','MODE',118]])assets[name]=png(width,20,(x,y)=>ownTextPixel(text,x,y,name==='title'?[16,32,48]:[36,92,128]));
 assets.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=168&&y<246&&(y-168)%26<16?[255,255,0]:[16,32,48]);return assets;
}
