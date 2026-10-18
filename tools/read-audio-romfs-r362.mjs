// SPDX-License-Identifier: GPL-2.0-only
// Parse embedded ROMFS as data, only export bounded media config to ignored folder.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const policy=process.argv.length===3&&process.argv[2]==='--policy';
assert(process.argv.length===2||policy);
const root=fileURLToPath(new URL('../',import.meta.url));
const ap=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
assert.equal(createHash('sha256').update(ap).digest('hex'),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
const base=1298360;assert.equal(ap.toString('ascii',base,base+8),'-rom1fs-');
const size=ap.readUInt32BE(base+8);assert(size>=32&&base+size<=ap.length);
const b=ap.subarray(base,base+size);let sum=0;
for(let i=0;i+4<=Math.min(512,size);i+=4)sum=(sum+b.readUInt32BE(i))>>>0;
assert.equal(sum,0,'ROMFS checksum');
function text(at){const end=b.indexOf(0,at);assert(end>=at&&end<size&&end-at<=255);return {name:b.toString('utf8',at,end),end};}
const volume=text(16),start=Math.ceil((volume.end+1)/16)*16,seen=new Set(),entries=[],selected=[];
function header(at){assert(at>=start&&at%16===0&&at+16<size);const flags=b.readUInt32BE(at),s=text(at+16),data=Math.ceil((s.end+1)/16)*16,bytes=b.readUInt32BE(at+8);
 assert(data+bytes<=size);return {name:s.name,next:flags&0xfffffff0,type:flags&7,spec:b.readUInt32BE(at+4),data,bytes};}
function walk(at,parent,depth){assert(depth<24);while(at){assert(!seen.has(at)&&seen.size<4096);seen.add(at);const h=header(at);
 if(h.name!=='.'&&h.name!=='..'){assert(h.name&&!/[\\/]/.test(h.name));const name=parent+'/'+h.name;entries.push({name,type:h.type,bytes:h.bytes});
  if(h.type===1&&h.spec)walk(h.spec,name,depth+1);
  if(h.type===2&&new RegExp(policy?'^/media/.*\\.(pfw|txt)$':'media.*\\.(conf|ini|json)$').test(name)){assert(h.bytes<65536);const bytes=b.subarray(h.data,h.data+h.bytes);assert(!bytes.includes(0));
   selected.push({name,text:new TextDecoder('utf8',{fatal:true}).decode(bytes),sha256:createHash('sha256').update(bytes).digest('hex')});}
 }at=h.next;}}
const h=header(start);assert.equal(h.type,1);walk(h.spec,'',0);
const out=path.join(root,'artifacts/research/'+(policy?'audio-policy-r362.json':'audio-romfs-r362.json'));
fs.writeFileSync(out,JSON.stringify({base,size,entries,selected,physicalWatchUsed:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({base,size,files:entries.length,selected:selected.map(({name,sha256})=>({name,sha256}))}));
