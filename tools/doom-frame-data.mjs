// Exact RGB888 engine output in little-endian B,G,R,0 words. No invented image.
import {deflateSync} from 'node:zlib';
export function frameData(raw){
  if(raw.length!==320*200*4)throw Error('Unexpected engine frame length');
  let fnv=2166136261;const colors=new Set();let nonblack=0;
  const scan=Buffer.alloc(200*(320*3+1));
  for(let y=0;y<200;y++)for(let x=0;x<320;x++){
    const at=(y*320+x)*4,p=raw.readUInt32LE(at);
    if(raw[at+3]!==0)throw Error('Unexpected engine pixel format');
    for(let j=0;j<4;j++)fnv=Math.imul(fnv^raw[at+j],16777619)>>>0;
    colors.add(p);if(p)nonblack++;
    const out=y*961+1+x*3;scan[out]=raw[at+2];scan[out+1]=raw[at+1];scan[out+2]=raw[at];
  }
  function chunk(type,data){
    const name=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);name.copy(out,4);data.copy(out,8);
    let crc=0xffffffff;for(const b of Buffer.concat([name,data])){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;
  }
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(320,0);ihdr.writeUInt32BE(200,4);ihdr[8]=8;ihdr[9]=2;
  return {fnv:fnv.toString(16).padStart(8,'0'),colors:colors.size,nonblack,
    png:Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))])};
}
