// SPDX-License-Identifier: GPL-2.0-only
// Read-only ZIP/IWAD inventory. Never extracts files, executes content or deploys.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';import {inflateRawSync} from 'node:zlib';
import {crc32} from './static-watchface-transfer.mjs';
const MAX_WAD=32*1024*1024,MAX_ZIP=64*1024*1024;
const hash=(b,algorithm='sha256')=>createHash(algorithm).update(b).digest('hex');
function check(value,reason){if(!value)throw Error(reason);}
const mapParts=['THINGS','LINEDEFS','SIDEDEFS','VERTEXES','SEGS','SSECTORS','NODES','SECTORS','REJECT','BLOCKMAP'];
export function inspectIwad(b){
 check(b.length>=12&&b.length<=MAX_WAD&&b.toString('ascii',0,4)==='IWAD','InvalidIwad');
 const count=b.readInt32LE(4),directory=b.readInt32LE(8);
 check(count>0&&count<=8192&&directory>=12&&directory<=b.length&&count<=Math.floor((b.length-directory)/16),'DirectoryBounds');
 const entries=[];
 for(let i=0;i<count;i++){
  const at=directory+i*16,offset=b.readInt32LE(at),size=b.readInt32LE(at+4),raw=b.subarray(at+8,at+16);
  check(offset>=0&&size>=0&&offset<=b.length&&size<=b.length-offset,'LumpBounds');
  const zero=raw.indexOf(0),n=zero<0?8:zero;
  check(n>0&&raw.subarray(0,n).every(c=>c>=32&&c<=126)&&raw.subarray(n).every(c=>c===0),'LumpName');
  entries.push({index:i,name:raw.toString('ascii',0,n),offset,size});
 }
 const markers=entries.filter(e=>/^E[1-4]M[1-9]$|^MAP\d{2}$/.test(e.name)),seen=new Set(),maps=[];
 for(const marker of markers){
  check(!seen.has(marker.name)&&marker.size===0,'MapMarker');seen.add(marker.name);
  const parts=entries.slice(marker.index+1,marker.index+11);
  check(parts.length===10&&parts.every((e,i)=>e.name===mapParts[i]),'MapSequence');
  const units=[10,14,30,4,12,4,28,26,0,2];
  check(parts.every((e,i)=>!units[i]||e.size%units[i]===0),'MapRecords');
  maps.push({name:marker.name,rawBytes:parts.reduce((n,e)=>n+e.size,0),
   things:parts[0].size/10,linedefs:parts[1].size/14,sidedefs:parts[2].size/30,
   vertices:parts[3].size/4,segs:parts[4].size/12,nodes:parts[6].size/28,sectors:parts[7].size/26});
 }
 const exact=(expected)=>expected.length===seen.size&&expected.every(n=>seen.has(n));
 const episodes=n=>Array.from({length:n*9},(_,i)=>'E'+(Math.floor(i/9)+1)+'M'+(i%9+1));
 const edition=exact(episodes(1))?'Doom shareware map set':exact(episodes(3))?'Doom registered map set':
  exact(episodes(4))?'Ultimate Doom map set':exact(Array.from({length:32},(_,i)=>'MAP'+String(i+1).padStart(2,'0')))?'Doom II map set':'Unrecognized map set';
 // Doom resolves repeated lump names to the last entry. Counting superseded
 // samples would overstate the cache needed by an appended retail IWAD.
 const soundEntries=new Map(),soundLumps=entries.filter(e=>/^DS/i.test(e.name));
 for(const e of soundLumps)soundEntries.set(e.name.toUpperCase(),e);
 let soundCount=0,soundBytes=0;const invalidSounds=[];
 for(const e of soundEntries.values()){
  const s=b.subarray(e.offset,e.offset+e.size);
  if(s.length<8||s.readUInt16LE(0)!==3){invalidSounds.push(e.name);continue;}
  const rate=s.readUInt16LE(2),length=s.readUInt32LE(4);
  if(rate<4000||rate>48000||length<=48||length>262144||length>s.length-8){invalidSounds.push(e.name);continue;}
  soundCount++;soundBytes+=length-32;
 }
 return {bytes:b.length,sha256:hash(b),md5:hash(b,'md5'),crc32:crc32(b),lumps:count,directory,edition,
  classification:'By structure, not authenticated publisher provenance',mapCount:maps.length,maps,
  dmxEffects:{count:soundCount,usefulSampleBytes:soundBytes,supersededEntries:soundLumps.length-soundEntries.size,invalid:invalidSounds,currentCacheBytes:544*1024,
   allDmxSamplesFitCurrentCache:soundBytes<=544*1024},
  rawMapBytesAreNotRuntimeRam:true,deviceCompatibilityTested:false};
}
export function inspectArchive(b){
 check(b.length>=22&&b.length<=MAX_ZIP,'ZipSize');
 let end=-1;
 for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50&&i+22+b.readUInt16LE(i+20)===b.length){end=i;break;}
 check(end>=0&&b.readUInt32LE(end+4)===0,'ZipEnd');
 const count=b.readUInt16LE(end+10),size=b.readUInt32LE(end+12),directory=b.readUInt32LE(end+16);
 check(count>0&&count<=4096&&count===b.readUInt16LE(end+8)&&directory+size===end,'ZipDirectory');
 let cursor=directory,total=0;const entries=[],names=new Set(),wads=[];
 for(let i=0;i<count;i++){
  check(cursor+46<=end&&b.readUInt32LE(cursor)===0x02014b50,'ZipEntry');
  const flags=b.readUInt16LE(cursor+8),method=b.readUInt16LE(cursor+10),crc=b.readUInt32LE(cursor+16),
   packed=b.readUInt32LE(cursor+20),length=b.readUInt32LE(cursor+24),nl=b.readUInt16LE(cursor+28),
   extra=b.readUInt16LE(cursor+30),comment=b.readUInt16LE(cursor+32),local=b.readUInt32LE(cursor+42);
  check(nl>0&&nl<=1024&&cursor+46+nl+extra+comment<=end&&!(flags&0x2041),'ZipFlagsOrBounds');
  const raw=b.subarray(cursor+46,cursor+46+nl),name=new TextDecoder('utf-8',{fatal:true}).decode(raw);
  check(!/[\x00-\x1f]/.test(name)&&!names.has(name.toLowerCase()),'ZipName');names.add(name.toLowerCase());
  check(local+30<=directory&&b.readUInt32LE(local)===0x04034b50,'ZipLocal');
  const ln=b.readUInt16LE(local+26),lx=b.readUInt16LE(local+28),data=local+30+ln+lx;
  check(b.readUInt16LE(local+6)===flags&&b.readUInt16LE(local+8)===method&&ln===nl&&
   b.subarray(local+30,local+30+ln).equals(raw)&&data<=directory&&packed<=directory-data,'ZipLocalBounds');
  entries.push({name,bytes:length,packedBytes:packed});
  if(/\.wad$/i.test(name)){
   check((method===0||method===8)&&length>0&&length<=MAX_WAD&&wads.length<4&&total+length<=2*MAX_WAD,'WadZipLimits');
   let wad;
   if(method===0){check(packed===length,'StoredSize');wad=b.subarray(data,data+packed);}
   else{const decoded=inflateRawSync(b.subarray(data,data+packed),{maxOutputLength:MAX_WAD,info:true});check(decoded.engine.bytesWritten===packed,'DeflateConsumption');wad=decoded.buffer;}
   check(wad.length===length&&crc32(wad)===crc,'ZipPayloadChecksum');total+=length;
   wads.push({entry:name,zipCrcVerified:true,...inspectIwad(wad)});
  }
  cursor+=46+nl+extra+comment;
 }
 check(cursor===end,'ZipDirectoryEnd');
 return {archiveBytes:b.length,archiveSha256:hash(b),entries,wads,filesExtracted:false,contentExecuted:false,watchUsed:false};
}
if(path.resolve(process.argv[1]??'')===fileURLToPath(import.meta.url)){
 check(process.argv.length>=3&&process.argv.length<=6,'Usage: node tools/inspect-doom-archives-r373.mjs zip [zip ...]');
 for(const file of process.argv.slice(2)){
  const stat=fs.lstatSync(file);check(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<=MAX_ZIP,'InputFile');
  console.log(JSON.stringify({archive:path.basename(file),...inspectArchive(fs.readFileSync(file))}));
 }
}
