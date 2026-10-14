import {deflateSync} from 'node:zlib';
import {ownTextPixel} from './native-info-legend.mjs';
function crc(b){let n=0xffffffff;for(const c of b){n^=c;for(let i=0;i<8;i++)n=(n&1)?(n>>>1)^0xedb88320:n>>>1;}return (n^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),length=Buffer.alloc(4),sum=Buffer.alloc(4);length.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([length,t,data,sum]);}
function png(width,height,pixel){
  const rows=Buffer.alloc((width*3+1)*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const at=y*(width*3+1)+1+x*3,color=pixel(x,y);for(let c=0;c<3;c++)rows[at+c]=color[c];}
  const h=Buffer.alloc(13);h.writeUInt32BE(width);h.writeUInt32BE(height,4);h[8]=8;h[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
export function firstCAssets(){
  const names=['FILE','MARK','LOAD','UNLOAD','END'];
  return {legend:png(180,160,(x,y)=>ownTextPixel(names[Math.floor(y/32)]??'',x,y%32)),
    run:png(96,20,(x,y)=>ownTextPixel('RUN C',x,y,[36,92,128])),
    preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<290&&(y-160)%26<16?[255,255,255]:[0,0,0])};
}
// Separate emulator/UI test assets; the reviewed FirstC assets remain identical.
export function uiOnlyAssets(){
  const names=['FRAME','ICON','INPUT','TOUCH','END'];
  return {legend:png(180,160,(x,y)=>ownTextPixel(names[Math.floor(y/32)]??'',x,y%32)),
    run:png(96,20,(x,y)=>ownTextPixel('TEST UI',x,y,[36,92,128])),
    preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=180&&y<258&&(y-180)%26<16?[255,255,255]:[0,0,0])};
}
// Native logging uses the same reviewed geometry and original pixel glyphs.
export function logCAssets(){
  const names=['FILE','MARK','C TEXT','UNLOAD','END'];
  return {legend:png(180,160,(x,y)=>ownTextPixel(names[Math.floor(y/32)]??'',x,y%32)),
    run:png(96,20,(x,y)=>ownTextPixel('RUN C',x,y,[36,92,128])),
    preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<290&&(y-160)%26<16?[0,255,255]:[0,0,0])};
}
export function framesAssets(){
 const names=['FILE','MARK','FRAMES','UNLOAD','EXIT'];
 return {legend:png(180,160,(x,y)=>ownTextPixel(names[Math.floor(y/32)]??'',x,y%32)),
  run:png(96,20,(x,y)=>ownTextPixel('RUN C',x,y,[36,92,128])),
  exit:png(96,20,(x,y)=>ownTextPixel('EXIT',x,y,[36,92,128])),
  preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<264&&(y-160)%26<16?[0,255,255]:[0,0,0])};
}
export function heldAssets(){
 const names=['UP','LEFT','RIGHT','FIRE','EXIT'];
 const assets={legend:png(180,160,(x,y)=>ownTextPixel(names[Math.floor(y/32)]??'',x,y%32)),
  title:png(120,20,(x,y)=>ownTextPixel('HOLD TEST',x,y)),
  preview:png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<290&&(y-160)%26<16?[255,128,0]:[0,0,0])};
 for(const name of ['START','EXIT','UP','LEFT','RIGHT','FIRE'])assets[name.toLowerCase()]=png(96,20,(x,y)=>ownTextPixel(name,x,y,[36,92,128]));
 return assets;
}
