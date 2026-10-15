// Layout of the exact original PNGs, synthetic values; NOT a live LVGL render.
import fs from 'node:fs';import path from 'node:path';import {inflateSync} from 'node:zlib';
import {root,memoryAssets} from './memory-preflight-source.mjs';import {png} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const images=new Map(memoryAssets().records.map(([name,b])=>{
 const w=b.readUInt32BE(16),h=b.readUInt32BE(20),chunks=[];
 if(b[24]!==8||b[25]!==2||b[28]!==0)throw Error('Format');
 for(let p=8;p<b.length;){const n=b.readUInt32BE(p);if(b.subarray(p+4,p+8).toString()==='IDAT')chunks.push(b.subarray(p+8,p+8+n));p+=12+n;}
 const rows=inflateSync(Buffer.concat(chunks));if(rows.length!==(w*3+1)*h)throw Error('Rows');
 for(let y=0;y<h;y++)if(rows[y*(w*3+1)]!==0)throw Error('Filter');return[name,{w,h,rows}];
}));
const pixels=Buffer.alloc(390*450*3,32);
function rect(x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)for(let i=0;i<3;i++)pixels[(yy*390+xx)*3+i]=c[i];}
function image(n,x,y){const a=images.get(n);if(!a||x<0||y<0||x+a.w>390||y+a.h>450)throw Error('Layout');for(let yy=0;yy<a.h;yy++)a.rows.copy(pixels,((y+yy)*390+x)*3,yy*(a.w*3+1)+1,(yy+1)*(a.w*3+1));}
function text(s,x,y){for(let i=0;i<s.length;i++)image('g'+s.charCodeAt(i).toString(16)+'.png',x+i*12,y);}
image('title.png',135,12);rect(330,15,14,14,[0,255,0]);text('UMEM',55,56);text('2 2',165,82);
image('total.png',55,118);text('129704956',175,120);image('free.png',55,166);text('111117236',175,168);
text('MAXFREE',55,216);text('110616512',175,216);image('bytes.png',135,254);image('snapshot.png',75,284);
rect(30,340,155,62,[36,92,128]);rect(205,340,155,62,[36,92,128]);image('read.png',48,360);image('mode.png',223,360);
const file=path.join(root,'artifacts/memory-preflight-r283/layout.png');fs.writeFileSync(file,png(390,450,(x,y)=>[...pixels.subarray((y*390+x)*3,(y*390+x)*3+3)]));
console.log(JSON.stringify({checkpoint:'R283',preview:path.relative(root,file),syntheticValues:true,liveLvglRender:false}));
