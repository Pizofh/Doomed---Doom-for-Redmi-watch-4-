// Host-only bounds/identity checks. Does not execute or redistribute game data.
import crypto from 'node:crypto';
export const shareware = Object.freeze({bytes:4196020,
  md5:'f0cefca49926d00903cf57551d901abe',sha1:'5b2e249b9c5133ec987b3ea77596381dc0d6bc1d',
  sha256:'1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771'});
export const mapNames=['THINGS','LINEDEFS','SIDEDEFS','VERTEXES','SEGS','SSECTORS','NODES','SECTORS','REJECT','BLOCKMAP'];
export const resourceNames=['PLAYPAL','COLORMAP','PNAMES','TEXTURE1','TITLEPIC'];
export const digest=(bytes,algorithm='sha256')=>crypto.createHash(algorithm).update(bytes).digest('hex');
export function fnv(bytes){let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619)>>>0;return h.toString(16).padStart(8,'0');}
export function inspectWad(bytes){
  if(bytes.length<12||bytes.length>8*1024*1024||bytes.toString('ascii',0,4)!=='IWAD')throw Error('Invalid IWAD header/length');
  const count=bytes.readInt32LE(4),directory=bytes.readInt32LE(8);
  if(count<1||count>4096||directory<12||directory>bytes.length||count>Math.floor((bytes.length-directory)/16))throw Error('Invalid directory bounds');
  const entries=[];
  for(let i=0;i<count;i++){
    const p=directory+i*16,offset=bytes.readInt32LE(p),size=bytes.readInt32LE(p+4),raw=bytes.subarray(p+8,p+16);
    if(offset<0||size<0||offset>bytes.length||size>bytes.length-offset)throw Error('Invalid lump bounds: '+i);
    const end=raw.indexOf(0),n=end<0?8:end;
    if(!n||raw.subarray(0,n).some(b=>b<32||b>126)||raw.subarray(n).some(b=>b!==0))throw Error('Invalid lump name: '+i);
    entries.push({index:i,name:raw.toString('ascii',0,n),offset,size});
  }
  const maps=entries.filter(e=>/^E\dM\d$/.test(e.name));
  if(maps.length!==9||maps.some((e,i)=>e.name!=='E1M'+(i+1)))throw Error('Expected unmodified episode-one map set');
  const map=maps[0];
  if(map.size!==0||mapNames.some((name,i)=>entries[map.index+i+1]?.name!==name))throw Error('Invalid E1M1 directory sequence');
  const units=[10,14,30,4,12,4,28,26,0,2];
  for(let i=0;i<mapNames.length;i++){
    const e=entries[map.index+i+1],unit=units[i];
    if(unit&&(e.size===0||e.size%unit!==0)||(i===9&&e.size<8))throw Error('Invalid E1M1 record sizes');
  }
  const selected=[map,...entries.slice(map.index+1,map.index+11)];
  for(const name of resourceNames){
    const matches=entries.filter(e=>e.name===name);
    if(matches.length!==1||matches[0].size===0)throw Error('Missing/ambiguous resource: '+name);
    selected.push(matches[0]);
  }
  const summarize=e=>({...e,fnv:fnv(bytes.subarray(e.offset,e.offset+e.size))});
  return {bytes:bytes.length,count,directory,sha256:digest(bytes),fnv:fnv(bytes),
    directoryFnv:fnv(bytes.subarray(directory,directory+count*16)),maps:maps.map(e=>e.name),selected:selected.map(summarize)};
}
export function verifyShareware(bytes){
  if(bytes.length!==shareware.bytes||digest(bytes,'md5')!==shareware.md5||digest(bytes,'sha1')!==shareware.sha1||digest(bytes)!==shareware.sha256)throw Error('Not the pinned Doom shareware 1.9 data');
  return inspectWad(bytes);
}
