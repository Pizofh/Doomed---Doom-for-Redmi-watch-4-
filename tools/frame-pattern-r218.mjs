// Independent PC oracle: same image specification, Node's zlib checks C output.
import {inflateSync} from 'node:zlib';
import {crc32} from './static-watchface-transfer.mjs';
export function pixel(phase,x,y) {
 const palette=[[255,0,0],[0,255,0],[0,0,255],[255,128,0]];
 return (x>=8+phase*20&&x<12+phase*20)||y===31||y===32?[255,255,255]:palette[((x>=48?1:0)+(y>=32?2:0)+phase)%4];
}
export function adlerParts(bytes){let a=1,b=0;for(const c of bytes){a=(a+c)%65521;b=(b+a)%65521;}return [a,b];}
function chunk(type,data){const head=Buffer.alloc(8),tail=Buffer.alloc(4);head.writeUInt32BE(data.length);head.write(type,4);tail.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type),data])));return Buffer.concat([head,data,tail]);}
export function expectedFrame(phase){
 if(!Number.isInteger(phase)||phase<0||phase>3)throw Error('FixedPhaseOnly');
 const rows=Buffer.alloc(18496);
 for(let y=0;y<64;y++)for(let x=0;x<96;x++)rows.set(pixel(phase,x,y),y*289+1+x*3);
 const ihdr=Buffer.from([0,0,0,96,0,0,0,64,8,2,0,0,0]),prefix=Buffer.from([0x78,0x01,0x01,0x40,0x48,0xbf,0xb7]);
 const [a,b]=adlerParts(rows),tail=Buffer.alloc(4);tail.writeUInt32BE(b*65536+a);
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',Buffer.concat([prefix,rows,tail])),chunk('IEND',Buffer.alloc(0))]);
}
export function verifyFrame(bytes,phase){
 if(!bytes.equals(expectedFrame(phase))||bytes.length!==18564)throw Error('FrameMismatch');
 let p=8,idat;
 while(p<bytes.length){const n=bytes.readUInt32BE(p),type=bytes.subarray(p+4,p+8).toString();if(crc32(bytes.subarray(p+4,p+8+n))!==bytes.readUInt32BE(p+8+n))throw Error('CrcMismatch');if(type==='IDAT')idat=bytes.subarray(p+8,p+8+n);p+=12+n;}
 const rows=inflateSync(idat);if(rows.length!==18496)throw Error('ZlibMismatch');
 for(let y=0;y<64;y++){if(rows[y*289]!==0)throw Error('FilterMismatch');for(let x=0;x<96;x++)if(!pixel(phase,x,y).every((c,i)=>rows[y*289+1+x*3+i]===c))throw Error('PixelMismatch');}
 return true;
}
