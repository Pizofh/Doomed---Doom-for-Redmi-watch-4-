// Composite the exact packaged PNGs for layout review; not a live LVGL render.
import fs from 'node:fs';import path from 'node:path';import {inflateSync} from 'node:zlib';
import {root} from './proc-view-source-r246.mjs';import {png} from './first-c-assets.mjs';import {procViewAssets} from './proc-view-assets-r246.mjs';
if(process.argv.length!==2)throw Error('FixedPreviewOnly');
const out=path.join(root,'artifacts/proc-view-r246'),records=procViewAssets().records;
function decode(b){const width=b.readUInt32BE(16),height=b.readUInt32BE(20);if(b[24]!==8||b[25]!==2||b[28]!==0)throw Error('ImageFormat');const chunks=[];for(let p=8;p<b.length;){const n=b.readUInt32BE(p);if(b.subarray(p+4,p+8).toString()==='IDAT')chunks.push(b.subarray(p+8,p+8+n));p+=12+n;}const rows=inflateSync(Buffer.concat(chunks));if(rows.length!==(width*3+1)*height)throw Error('Pixels');for(let y=0;y<height;y++)if(rows[y*(width*3+1)]!==0)throw Error('Filter');return {width,height,rows};}
const images=new Map(records.map(([n,b])=>[n,decode(b)]));
const text='rw4step234,0c003001,0c003141,00000000,0,20100000,972,20101000,36\n'.slice(0,63);
for(const mode of ['text','hex']){
 const pixels=Buffer.alloc(390*450*3,32);
 function fill(x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)for(let i=0;i<3;i++)pixels[(yy*390+xx)*3+i]=c[i];}
 function image(n,x,y){const a=images.get(n);if(!a||x+a.width>390||y+a.height>450)throw Error('Layout');for(let yy=0;yy<a.height;yy++)a.rows.copy(pixels,((y+yy)*390+x)*3,yy*(a.width*3+1)+1,(yy+1)*(a.width*3+1));}
 function glyphs(s,count,x,y,columns){s=s.padEnd(count,' ');for(let i=0;i<count;i++)image('g'+s.charCodeAt(i).toString(16)+'.png',x+(i%columns)*12,y+Math.floor(i/columns)*16);}
 image('title.png',135,8);image('legend.png',40,36);for(let i=0;i<4;i++)fill(286,36+i*22,14,14,[0,255,0]);
 image('length.png',40,126);glyphs(text.length.toString(16).toUpperCase().padStart(4,'0'),4,148,126,4);
 image('head-'+mode+'.png',40,146);
 glyphs(mode==='text'?text.toUpperCase():Buffer.from(text).toString('hex').toUpperCase(),128,51,170,24);
 image('tail.png',40,270);glyphs(Buffer.from(text.slice(-16)).toString('hex').toUpperCase(),32,51,294,24);
 fill(30,348,145,64,[36,92,128]);image('check.png',54,370);fill(215,348,145,64,[36,92,128]);image('mode.png',239,370);
 fs.writeFileSync(path.join(out,'layout-'+mode+'.png'),png(390,450,(x,y)=>[...pixels.subarray((y*390+x)*3,(y*390+x)*3+3)]),{flag:'wx'});
}
console.log(JSON.stringify({checkpoint:'R246',layoutPreviews:2,syntheticData:true,liveLvglRendered:false,physicalWatchUsed:false}));
