// SPDX-License-Identifier: GPL-2.0-only
// Offline data inspection only; no bindings, radio, device IO or firmware edits.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-ready-r351.mjs';
assert.equal(process.argv.length,2);
const image=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const bytes=fs.readFileSync(image),imageHash=sha256(bytes);
assert.equal(imageHash,'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/device/firmware-bindings.lock.json'),'utf8'));
assert.equal(lock.imageSha256,imageHash);assert.equal(lock.codeBase,0x0c100000);
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
assert.equal(sha256(fs.readFileSync(exe)),'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
const out=path.join(root,'artifacts/research/rw4-touch-r371-v3');
assert(!fs.existsSync(out),'OutputExists');fs.mkdirSync(out,{recursive:true});
const windows=[['upper',0x1c2b00,0x1c3280],['lowers',0x1d6000,0x1df000]];
const disassemblies={};
for(const [name,start,end] of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb',
  '--start-address='+start,'--stop-address='+end,image],
  {encoding:'utf8',windowsHide:true,shell:false,timeout:10000,maxBuffer:2*1024*1024});
 assert(!r.error&&r.status===0,'DisassemblyFailed');
 fs.writeFileSync(path.join(out,name+'.txt'),r.stdout);disassemblies[name]=r.stdout.split(/\r?\n/);
}
const notify=0x1c2fec,callers=[];
for(const [name,lines] of Object.entries(disassemblies)){
 for(let i=0;i<lines.length;i++)if(/\bbl\s+0x1c2fec\b/.test(lines[i])){
  const match=lines[i].match(/^\s*([0-9a-f]+):/);assert(match);
  const offset=parseInt(match[1],16);callers.push({window:name,offset,runtimeAddress:lock.codeBase+offset});
  fs.writeFileSync(path.join(out,'notify-caller-'+offset.toString(16)+'.txt'),lines.slice(Math.max(0,i-75),i+12).join('\n')+'\n');
 }
}
// Inventory direct Thumb BLs across the whole image, not just named drivers.
// Candidate instructions in data are not treated as executed code.
const directBranchCandidates=[];
for(let at=0;at+4<=bytes.length;at+=2){
 const first=bytes.readUInt16LE(at),second=bytes.readUInt16LE(at+2);
 if((first&0xf800)!==0xf000||(second&0xd000)!==0xd000)continue;
 const sign=(first>>>10)&1,j1=(second>>>13)&1,j2=(second>>>11)&1;
 let displacement=(sign<<24)|((1^(j1^sign))<<23)|((1^(j2^sign))<<22)|((first&1023)<<12)|((second&2047)<<1);
 if(sign)displacement-=0x2000000;
 if(at+4+displacement===notify)directBranchCandidates.push(at);
}
assert.deepEqual(directBranchCandidates,callers.map(c=>c.offset),'UnreviewedNotifyCaller');
// Absolute pointer references locate callbacks without guessing the RO alias.
function references(value){const p=Buffer.alloc(4);p.writeUInt32LE(value);const refs=[];
 for(let at=bytes.indexOf(p);at>=0;at=bytes.indexOf(p,at+1))refs.push(at);return refs;}
const report={checkpoint:'R371',imageSha256:imageHash,codeBase:lock.codeBase,
 notifyOffset:notify,callers,directBranchCandidates,notifyFunctionPointers:references(lock.codeBase+notify+1),
 windows:windows.map(([name,start,end])=>({name,start,end})),
 scope:'Static caller inventory; active driver, live contacts and physical ABI not established',
 physicalTransport:false,firmwareExecuted:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
