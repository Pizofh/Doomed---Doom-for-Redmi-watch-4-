// Structural adversarial host tests using authored bytes, no id Software assets.
import assert from 'node:assert/strict';
import {inspectWad,verifyShareware,mapNames,resourceNames} from './wad-data.mjs';
import {readTar} from './import-shareware.mjs';
const items=[{name:'E1M1',size:0},...mapNames.map((name,i)=>({name,size:[10,14,30,4,12,4,28,26,3,8][i]})),
  ...Array.from({length:8},(_,i)=>({name:'E1M'+(i+2),size:0})),...resourceNames.map(name=>({name,size:17}))];
const directory=12+items.reduce((sum,e)=>sum+e.size,0),bytes=Buffer.alloc(directory+items.length*16);
bytes.write('IWAD');bytes.writeInt32LE(items.length,4);bytes.writeInt32LE(directory,8);
let offset=12;
for(const [i,e]of items.entries()){
  const p=directory+i*16;bytes.writeInt32LE(offset,p);bytes.writeInt32LE(e.size,p+4);bytes.write(e.name,p+8,'ascii');
  for(let k=0;k<e.size;k++)bytes[offset+k]=(k*13+i)&255;offset+=e.size;
}
const valid=inspectWad(bytes);assert.equal(valid.selected.length,16);assert.equal(valid.maps.length,9);
let rejected=0;
function bad(edit){const copy=Buffer.from(bytes);edit(copy);assert.throws(()=>inspectWad(copy));rejected++;}
bad(b=>b.write('PWAD'));
bad(b=>b.writeInt32LE(-1,4));bad(b=>b.writeInt32LE(4097,4));bad(b=>b.writeInt32LE(0,4));
bad(b=>b.writeInt32LE(-1,8));bad(b=>b.writeInt32LE(11,8));bad(b=>b.writeInt32LE(b.length,8));
bad(b=>b.writeInt32LE(-1,directory));bad(b=>b.writeInt32LE(-1,directory+4));
bad(b=>b.writeInt32LE(b.length+1,directory));bad(b=>b.writeInt32LE(b.length,directory+16+4));
bad(b=>b.fill(0,directory+8,directory+16));bad(b=>b[directory+8]=255);bad(b=>b[directory+15]=65);
bad(b=>b.write('THONGS',directory+16+8));bad(b=>b.writeInt32LE(11,directory+16+4));
bad(b=>b.write('E2M2',directory+11*16+8));bad(b=>b.write('XITLEPIC',directory+23*16+8));
bad(b=>b.writeInt32LE(7,directory+10*16+4));
assert.throws(()=>inspectWad(bytes.subarray(0,bytes.length-1)));rejected++;
assert.throws(()=>verifyShareware(bytes));rejected++;
// Minimal own tar, including header checksum/padding/end records.
function archive(name='own/doom1.wad',type=48){
  const h=Buffer.alloc(512);h.write(name,0,'ascii');h.write('0000644\0',100);h.write('0000000\0',108);h.write('0000000\0',116);
  h.write(bytes.length.toString(8).padStart(11,'0')+'\0',124);h.write('00000000000\0',136);h.fill(32,148,156);h[156]=type;
  let sum=0;for(const b of h)sum+=b;h.write(sum.toString(8).padStart(6,'0')+'\0 ',148);
  return Buffer.concat([h,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]);
}
assert.equal(readTar(archive())[0].size,bytes.length);
for(const badTar of [archive('../doom1.wad'),archive('/doom1.wad'),archive('own/doom1.wad',50),archive().subarray(0,512),Buffer.alloc(512)]){
  assert.throws(()=>readTar(badTar));rejected++;
}
const corrupt=archive();corrupt[0]^=1;assert.throws(()=>readTar(corrupt));rejected++;
console.log(JSON.stringify({passed:true,validOwnWad:true,validOwnTar:true,negativeCases:rejected,gameAssetsUsed:false}));
