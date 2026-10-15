import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
import {procViewAssets} from './proc-view-assets-r246.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
export function memorySource(){
 const folder=path.join(root,'experiments/memory-preflight');
 const parser=fs.readFileSync(path.join(folder,'parser.lua'),'utf8');
 const normalizer=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/path-r201.lua'),'utf8');
 if(sha256(Buffer.from(normalizer))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('NormalizerChanged');
 let source=fs.readFileSync(path.join(folder,'main.lua'),'utf8');
 for(const [token,value]of [['__MEMORY_PARSER__',parser],['__PATH_SOURCE__',normalizer]]){
  if(source.split(token).length!==2)throw Error('TemplateChanged');source=source.replace(token,()=>value);
 }
 if(Buffer.byteLength(source)>20000||/\b(?:execute|remove|insmod|rmmod|loadfile|dofile|write|flush)\s*\(|\/dev\/|['"]w[ab+]*['"]/.test(source))throw Error('ScopeChanged');
 return source;
}
export function memoryAssets(){
 const records=procViewAssets().records.filter(([n])=>/^g[0-9a-f]+\.png$/.test(n));
 for(const [name,label,w]of [['title','MEMINFO',120],['total','TOTAL',120],['free','FREE',120],['bytes','OCTETS',120],['snapshot','ONE SNAPSHOT',240],['read','READ RAM',120],['mode','MODE',120]])
  records.push([name+'.png',png(w,20,(x,y)=>ownTextPixel(label,x,y,['read','mode'].includes(name)?[36,92,128]:[32,32,32]))]);
 return {records,preview:png(390,450,(x,y)=>x>=145&&x<245&&y>=160&&y<238&&(y-160)%26<16?[255,160,0]:[0,0,0])};
}
