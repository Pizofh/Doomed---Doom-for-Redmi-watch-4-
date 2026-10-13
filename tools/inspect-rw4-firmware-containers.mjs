// Offline structural candidates in one pinned stock file. No extraction/execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/rw4-stock-2.2.86-candidate.bin');
const output=path.join(root,'artifacts/research/rw4-firmware-containers-r193.json');
const expected='d9dee6871ca6dc893000214d04ef6f5429a1b0f9ea57c79d8db9caf83cff6321';
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?(n>>>1)^0xedb88320:n>>>1;return n>>>0;});
function crc32(bytes){let n=0xffffffff;for(const b of bytes)n=(n>>>8)^crcTable[(n^b)&255];return (n^0xffffffff)>>>0;}
const check=ok=>{if(!ok)throw Error('StructureRefused');};
try{
  check(!fs.existsSync(output));
  const stat=fs.lstatSync(input);check(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<=67108864);
  const b=fs.readFileSync(input);check(crypto.createHash('sha256').update(b).digest('hex')===expected);
  const zipCandidates=[],gzipCandidates=[];
  for(let p=b.indexOf(Buffer.from([0x50,0x4b,5,6]));p>=0;p=b.indexOf(Buffer.from([0x50,0x4b,5,6]),p+1)){
    check(zipCandidates.length<1000);
    try{
      check(p+22<=b.length&&b.readUInt32LE(p+4)===0&&b.readUInt16LE(p+8)===b.readUInt16LE(p+10));
      const count=b.readUInt16LE(p+10),cdSize=b.readUInt32LE(p+12),cdOffset=b.readUInt32LE(p+16),end=p+22+b.readUInt16LE(p+20);
      const base=p-cdSize-cdOffset;check(base>=0&&end<=b.length&&count>0&&count<=10000);
      let cursor=base+cdOffset;const entries=[];const names=new Set();
      for(let i=0;i<count;i++){
        check(cursor+46<=p&&b.readUInt32LE(cursor)===0x02014b50);
        const nl=b.readUInt16LE(cursor+28),xl=b.readUInt16LE(cursor+30),cl=b.readUInt16LE(cursor+32);
        check(nl>0&&nl<=1024&&cursor+46+nl+xl+cl<=p);
        const name=new TextDecoder('utf-8',{fatal:true}).decode(b.subarray(cursor+46,cursor+46+nl));
        check(!names.has(name)&&!/[\x00-\x1f]/.test(name));names.add(name);
        const local=base+b.readUInt32LE(cursor+42);check(local>=base&&local+30<=base+cdOffset&&b.readUInt32LE(local)===0x04034b50);
        const ln=b.readUInt16LE(local+26),lx=b.readUInt16LE(local+28),packed=b.readUInt32LE(cursor+20);
        check(ln===nl&&b.subarray(local+30,local+30+ln).equals(b.subarray(cursor+46,cursor+46+nl))&&local+30+ln+lx+packed<=base+cdOffset);
        entries.push({name,localOffset:local,dataOffset:local+30+ln+lx,method:b.readUInt16LE(cursor+10),flags:b.readUInt16LE(cursor+8),packed,size:b.readUInt32LE(cursor+24),crc32:b.readUInt32LE(cursor+16)});
        cursor+=46+nl+xl+cl;
      }
      check(cursor===p);zipCandidates.push({base,end,entries,centralAndLocalBoundsVerified:true,payloadChecksumsVerified:false});
    }catch{zipCandidates.push({eocdOffset:p,structureVerified:false});}
  }
  let decompressedTotal=0;
  const gzipMagic=Buffer.from([0x1f,0x8b,8]);
  for(let p=b.indexOf(gzipMagic);p>=0;p=b.indexOf(gzipMagic,p+1)){
    check(gzipCandidates.length<1000);
    try{
      check(p+10<b.length);const flags=b[p+3];check(!(flags&0xe0));let start=p+10;
      if(flags&4){check(start+2<=b.length);start+=2+b.readUInt16LE(start);check(start<=b.length);}
      for(const mask of [8,16])if(flags&mask){const end=b.indexOf(0,start);check(end>=start&&end-start<=4096);start=end+1;}
      if(flags&2){check(start+2<=b.length&&((crc32(b.subarray(p,start))&65535)===b.readUInt16LE(start)));start+=2;}
      const data=inflateRawSync(b.subarray(start),{maxOutputLength:33554432,info:true});
      const trailer=start+data.engine.bytesWritten;check(trailer+8<=b.length&&b.readUInt32LE(trailer+4)===data.buffer.length&&b.readUInt32LE(trailer)===crc32(data.buffer));
      decompressedTotal+=data.buffer.length;check(decompressedTotal<=67108864);
      const markers=['M2315W1','Redmi Watch 4','NuttX','insmod','rmmod','lsmod','iwasm','/dev/fb0','-rom1fs-','\x7fELF'];
      gzipCandidates.push({offset:p,end:trailer+8,size:data.buffer.length,crcVerified:true,sha256:crypto.createHash('sha256').update(data.buffer).digest('hex'),markerCounts:markers.map(marker=>({marker:marker==='\x7fELF'?'ELF':marker,present:data.buffer.includes(Buffer.from(marker,'ascii'))}))});
    }catch{gzipCandidates.push({offset:p,structureVerified:false});}
  }
  const result={checkpoint:'R193',inputSha256:expected,zipCandidates,gzipCandidates,
    headerWords:[68,72,76,80,84,88,92,96,100,104].map(offset=>({offset,value:b.readUInt32LE(offset)})),
    fieldsAreUninterpreted:true,firmwareExecuted:false,filesExtracted:false,watchCommandRequested:false};
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({checkpoint:'R193',zipDirectoryCandidates:zipCandidates.length,zipDirectoriesValidated:zipCandidates.filter(c=>c.centralAndLocalBoundsVerified).length,
    zipEntries:zipCandidates.reduce((n,c)=>n+(c.entries?.length??0),0),gzipCandidates:gzipCandidates.length,gzipValidated:gzipCandidates.filter(c=>c.crcVerified).length,
    decompressedTotal,firmwareExecuted:false,filesExtracted:false,watchCommandRequested:false}));
}catch{console.error('Fixed firmware container inspection refused; no raw data exported.');process.exitCode=1;}
