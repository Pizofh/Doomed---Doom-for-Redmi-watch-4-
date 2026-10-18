// SPDX-License-Identifier: GPL-2.0-only
// Inspect only the audio-core image from the already pinned local stock ZIP.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {inflateRawSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {root} from './doom-ready-source-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';
assert.equal(process.argv.length,2);
const hash=b=>createHash('sha256').update(b).digest('hex');
const stock=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/rw4-stock-2.2.86-candidate.bin'));
assert.equal(hash(stock),'d9dee6871ca6dc893000214d04ef6f5429a1b0f9ea57c79d8db9caf83cff6321');
const metadata=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/rw4-firmware-containers-r193.json'),'utf8'));
const candidates=metadata.zipCandidates.filter(c=>c.centralAndLocalBoundsVerified).flatMap(c=>c.entries).filter(e=>e.name==='vela_audio.bin');
assert.equal(candidates.length,1);const e=candidates[0];
assert(e.method===8&&!(e.flags&1)&&e.size===1778532&&e.packed===1154588);
assert.equal(stock.readUInt32LE(e.localOffset),0x04034b50);
const nl=stock.readUInt16LE(e.localOffset+26),xl=stock.readUInt16LE(e.localOffset+28);
assert.equal(stock.toString('ascii',e.localOffset+30,e.localOffset+30+nl),'vela_audio.bin');
assert.equal(e.dataOffset,e.localOffset+30+nl+xl);
const data=inflateRawSync(stock.subarray(e.dataOffset,e.dataOffset+e.packed),{maxOutputLength:2097152,info:true});
assert.equal(data.engine.bytesWritten,e.packed);const bytes=data.buffer;
assert.equal(bytes.length,e.size);assert.equal(crc32(bytes),e.crc32);
const strings=[];let start=0;
for(let i=0;i<=bytes.length;i++){
 if(i<bytes.length&&bytes[i]>=32&&bytes[i]<=126)continue;
 if(i-start>=2&&i-start<=256){const value=bytes.toString('ascii',start,i);
  if(/media_player|set_options|format|sample_rate|channels|av_dict_parse|prepare|s16le|unix:|rpmsg:/.test(value))strings.push({offset:start,value});
 }start=i+1;
}
// Infer candidate address deltas from repeated string pointers, not from AP's
// mapping. They are inspection hypotheses and never executable bindings.
assert.equal(bytes.readUInt32LE(32),0x3dc00020);
const bases=new Map();
for(const s of strings){const seen=new Set();for(let i=0;i+4<=bytes.length;i+=4){const v=bytes.readUInt32LE(i);
 const base=v-s.offset;
 if(v>=0x3dc00000&&v<0x3de00000&&base>=0x3db00000&&base<0x3dc00000)seen.add(base);
}for(const base of seen)bases.set(base,(bases.get(base)||0)+1);}
const likely=[...bases].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([base,matches])=>({base,matches}));
assert.equal(likely[0].base,0x3dbe97d0);assert(likely[0].matches>=120);
for(const s of strings){s.references=[];for(const {base}of likely){
 const needle=Buffer.alloc(4);needle.writeUInt32LE(base+s.offset);
 for(let at=bytes.indexOf(needle);at>=0;at=bytes.indexOf(needle,at+1))s.references.push({base,offset:at});
}}
const out=path.join(root,'artifacts/research/audio-server-r368');fs.mkdirSync(out,{recursive:true});
if(fs.existsSync(path.join(out,'image.bin')))assert.equal(hash(fs.readFileSync(path.join(out,'image.bin'))),hash(bytes));
else fs.writeFileSync(path.join(out,'image.bin'),bytes,{flag:'wx'});
function reviewedFile(name,content){const file=path.join(out,name);
 if(fs.existsSync(file))assert.equal(hash(fs.readFileSync(file)),hash(Buffer.from(content)));
 else fs.writeFileSync(file,content,{flag:'wx'});
}
reviewedFile('review-v2.json',JSON.stringify({imageSha256:hash(bytes),size:bytes.length,likely,strings,firmwareExecuted:false,physicalWatchUsed:false},null,2)+'\n');
const objdump=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
assert.equal(hash(fs.readFileSync(objdump)),'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
for(const [name,start,end]of [['player-commands',0xefc00,0xf0900],['client-prepare',0xcd500,0xcd900],['player-worker',0xf2a00,0xf3400],['input-formats',0xf5480,0xf55b0],['demuxer-list',0xee180,0xee250]]){
 const d=spawnSync(objdump,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,path.join(out,'image.bin')],{windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:1048576});
 assert(!d.error&&d.status===0);
 const text=d.stdout.split('\n').map(line=>{const m=/\bldr[^\n]*\[pc[^\n]*@\s*\(?0x([0-9a-f]+)/.exec(line);
  if(!m)return line;const at=parseInt(m[1],16);if(at+4>bytes.length)return line;
  const v=bytes.readUInt32LE(at),p=v-0x3dbe97d0;let label='';
  if(p>=0&&p<bytes.length){const end=bytes.indexOf(0,p);if(end>p&&end-p<=192&&bytes.subarray(p,end).every(c=>c>=32&&c<=126))label=' '+JSON.stringify(bytes.toString('ascii',p,end));}
  return line+' ; literal=0x'+v.toString(16)+label;
 }).join('\n');
 reviewedFile(name+'.txt',text);
}
console.log(JSON.stringify({size:bytes.length,imageSha256:hash(bytes),strings:strings.length,likely,firmwareExecuted:false,physicalWatchUsed:false}));
