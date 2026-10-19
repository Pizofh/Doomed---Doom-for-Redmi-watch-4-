// SPDX-License-Identifier: GPL-2.0-only
// Offline branch inventory only; no device IO, native loading or firmware edits.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(process.argv.length,2);
const hash=b=>createHash('sha256').update(b).digest('hex');
const b=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
assert.equal(hash(b),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
function branch(a,c,at){
 if((a&0xf800)===0xf000&&[(c&0xd000)].some(x=>x===0x9000||x===0xd000)){
  const s=(a>>>10)&1,j1=(c>>>13)&1,j2=(c>>>11)&1;
  let d=(s<<24)|((1^(j1^s))<<23)|((1^(j2^s))<<22)|((a&1023)<<12)|((c&2047)<<1);
  if(s)d-=0x2000000;return{kind:(c&0xd000)===0xd000?'BL':'B.W',target:at+4+d};
 }
 if((a&0xf800)===0xf000&&(c&0xd000)===0x8000&&((a>>>6)&15)<14){
  const s=(a>>>10)&1;let d=(s<<20)|(((c>>>11)&1)<<19)|(((c>>>13)&1)<<18)|((a&63)<<12)|((c&2047)<<1);
  if(s)d-=0x200000;return{kind:'B.cond.W',target:at+4+d};
 }
 if((a&0xf800)===0xe000){let d=(a&2047)<<1;if(d&2048)d-=4096;return{kind:'B.n',target:at+4+d};}
 if((a&0xf000)===0xd000&&((a>>>8)&15)<14){let d=(a&255)<<1;if(d&256)d-=512;return{kind:'B.cond.n',target:at+4+d};}
 return null;
}
// Check signed displacement and the different J1/J2 encodings before scanning.
let decoderCases=0;
for(const d of [-0x100000,-262142,-4,0,262142,0xffffe]){
 const bits=d&0x1fffff,a=0xf000|(((bits>>>20)&1)<<10)|((bits>>>12)&63),c=0x8000|(((bits>>>18)&1)<<13)|(((bits>>>19)&1)<<11)|((bits>>>1)&2047);
 assert.deepEqual(branch(a,c,0x200000),{kind:'B.cond.W',target:0x200004+d});decoderCases++;
}
for(const [a,kind,d] of [[0xe000,'B.n',0],[0xe7fe,'B.n',-4],[0xd000,'B.cond.n',0],[0xd0fe,'B.cond.n',-4]]){assert.deepEqual(branch(a,0,4096),{kind,target:4100+d});decoderCases++;}
const notify=0x1c2fec,expected=[0x1dadc0,0x1dccee,0x1de8c8];
for(const at of expected){const a=b.readUInt16LE(at),c=b.readUInt16LE(at+2);assert.deepEqual(branch(a,c,at),{kind:'BL',target:notify});assert.deepEqual(branch(a,c^0x4000,at),{kind:'B.W',target:notify});decoderCases+=2;}
const candidates=[];
for(let at=0;at+4<=b.length;at+=2){const r=branch(b.readUInt16LE(at),b.readUInt16LE(at+2),at);if(r?.target===notify)candidates.push({at,kind:r.kind});}
assert.deepEqual(candidates,expected.map(at=>({at,kind:'BL'})));
const absolute=Buffer.alloc(4);absolute.writeUInt32LE(0x0c100000+notify+1);const references=[];
for(let at=b.indexOf(absolute);at>=0;at=b.indexOf(absolute,at+1))references.push(at);
assert.deepEqual(references,[]);
const result={checkpoint:'R399',imageSha256:hash(b),decoderCases,notifyOffset:notify,candidates,absoluteThumbReferences:references,
 noAdditionalDirectTailBranchFound:true,activeHardwareDriverKnown:false,liveContactsMeasured:false,
 physicalTransport:false,firmwareExecuted:false,scope:'Direct branch candidates only; indirect calls, other report paths and panel capability remain unproven'};
const out=path.join(root,'artifacts/research/rw4-touch-r399');assert(!fs.existsSync(out),'Existing review; inspect instead of overwriting');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
