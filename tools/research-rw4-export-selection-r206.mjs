// Read the pinned image as data; no firmware execution or device access.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-export-selection-r206');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
 sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const anchors=[[0xa3c,0x2c10e784],[0xa40,0x3c000000],[0xa44,0x2c2b9524],
 [0xa48,0x3c1aada0],[0xa4c,0x3c2daa00],[0x1e7f74,0x3c1aef98],[0x1e7f78,0x3c1aef94]];
for(const [p,value] of anchors)if(b.readUInt32LE(p)!==value)throw Error('AnchorChanged');
// Startup 0x9fc copies initialized data, then zeroes this range.
const bss={start:b.readUInt32LE(0xa48),endExclusive:b.readUInt32LE(0xa4c)};
const globals=[0x3c1aef94,0x3c1aef98];
if(!globals.every(v=>v>=bss.start&&v+4<=bss.endExclusive))throw Error('GlobalOutsideBss');
// Scan MOVW/MOVT candidates as well as literals. Encodings in data may be false positives.
function wide(p){
 const a=b.readUInt16LE(p),c=b.readUInt16LE(p+2),kind=a&0xfbf0;
 if((kind!==0xf240&&kind!==0xf2c0)||(c&0x8000))return null;
 return {kind:kind===0xf240?'MOVW':'MOVT',register:(c>>>8)&15,
  immediate:((a&15)<<12)|(((a>>>10)&1)<<11)|(((c>>>12)&7)<<8)|(c&255)};
}
// Independent instruction anchors in existing objdump output.
const known=wide(0x1e7e12);
if(!known||known.kind!=='MOVW'||known.register!==3||known.immediate!==65521)throw Error('WideDecoderAnchor');
const candidates=[];
for(let p=0;p+4<=b.length;p+=2){
 const w=wide(p);if(!w||w.kind!=='MOVW'||![0xef94,0xef98].includes(w.immediate))continue;
 const sameRegisterNearby=[];
 for(let q=p+4;q<=Math.min(p+32,b.length-4);q+=2){
  const t=wide(q);if(t?.kind==='MOVT'&&t.register===w.register&&t.immediate===0x3c1a)sameRegisterNearby.push(q);
 }
 candidates.push({offset:p,...w,sameRegisterNearby});
}
if(candidates.length>128)throw Error('CandidateBound');
// A base pointer plus displacement can evade exact-address searches. Record a
// bounded neighborhood scan without claiming complete reference recovery.
const nearbyLiterals=[];
let nearbyLiteralCount=0;
for(let p=0;p+4<=b.length;p+=4){
 const v=b.readUInt32LE(p);if(v>=0x3c1aed94&&v<=0x3c1af198){
  nearbyLiteralCount++;if(nearbyLiterals.length<128)nearbyLiterals.push({offset:p,value:v});
 }
}
const words=p=>Array.from({length:6},(_,i)=>({offset:p-8+i*4,value:b.readUInt32LE(p-8+i*4)}));
const names=['printf','usleep','fopen','fread','malloc','clock_gettime','gettimeofday'];
const stringContexts=[];
for(const name of names){
 const needle=Buffer.from(name+'\0');
 for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length)){
  if(p&&b[p-1]>=32&&b[p-1]<=126)continue;
  const ptr=p+0x3bff187c,refs=[];
  for(let q=8;q+16<=b.length;q+=4)if(b.readUInt32LE(q)===ptr)refs.push({offset:q,words:words(q)});
  stringContexts.push({name,offset:p,refs});
 }
}
const windows=[['fopen-nsh-use',0x220a50,0x220c00],['fread-use',0x241b80,0x241d30]];
fs.mkdirSync(out,{recursive:true});
for(const [label,start,end] of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
const report={checkpoint:'R206',bss,globalsInZeroedRange:true,wideCandidates:candidates,
 nearbyLiterals,nearbyLiteralCount,nearbySampleTruncated:nearbyLiteralCount>nearbyLiterals.length,
 stringContexts,completeReferenceRecovery:false,
 firmwareExecuted:false,watchCommandRequested:false};
fs.writeFileSync(path.join(out,'selection.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R206',bss,globalsInZeroedRange:true,
 wideCandidates:candidates,nearbyLiteralCount,
 completeReferenceRecovery:false,firmwareExecuted:false,watchCommandRequested:false}));
