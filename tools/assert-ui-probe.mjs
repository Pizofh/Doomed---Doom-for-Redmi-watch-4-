// Read PNG pixels only; never edits an image. Guard for this own fixed UI.
import fs from 'node:fs';
import zlib from 'node:zlib';

export function assertUiProbe(filename, expected) {
  if (!['page','launcher'].includes(expected)) throw new Error('Unknown probe surface');
  const png=fs.readFileSync(filename);
  if(png.length>1024*1024||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error('Unexpected PNG');
  const chunks=[]; let bpp=0,ended=false;
  for(let p=8;p+12<=png.length;){
    const n=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);
    if(p+12+n>png.length) throw new Error('Invalid PNG bounds');
    const b=png.subarray(p+8,p+8+n);
    if(type==='IHDR'){
      if(n!==13||b.readUInt32BE(0)!==390||b.readUInt32BE(4)!==450||b[8]!==8||![2,6].includes(b[9])||b[10]||b[11]||b[12]) throw new Error('Unexpected PNG layout');
      bpp=b[9]===2?3:4;
    }
    if(type==='IDAT') chunks.push(b);
    p+=12+n;
    if(type==='IEND'){ended=true;break;}
  }
  if(!bpp||!ended) throw new Error('Incomplete PNG');
  const stride=390*bpp;
  const raw=zlib.inflateSync(Buffer.concat(chunks),{maxOutputLength:(stride+1)*450});
  if(raw.length!==(stride+1)*450) throw new Error('Unexpected inflated length');
  const pixels=Buffer.alloc(stride*450);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<450;y++){
    const f=raw[y*(stride+1)]; if(f>4) throw new Error('Unknown PNG filter');
    for(let x=0;x<stride;x++){
      const at=y*stride+x,a=x>=bpp?pixels[at-bpp]:0,b=y?pixels[at-stride]:0,c=y&&x>=bpp?pixels[at-stride-bpp]:0;
      const prediction=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][f];
      pixels[at]=(raw[y*(stride+1)+1+x]+prediction)&255;
    }
  }
  // Captured RGB after the guest's RGB565 conversion, not the Lua RGB888 value.
  const color=expected==='page'?[16,53,74]:[16,24,33];
  for(const [x,y] of [[20,100],[195,230],[370,250]]) {
    const p=(y*390+x)*bpp;
    if(!color.every((v,i)=>pixels[p+i]===v)) throw new Error(`Expected own ${expected} surface at ${x},${y}; RGB=${[...pixels.subarray(p,p+3)]}; stop and inspect UI`);
  }
}
