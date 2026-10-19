// SPDX-License-Identifier: GPL-2.0-only
// Static data/disassembly only. Never opens a watch, loads C, or calls ioctl.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-final-r388.mjs';
assert.equal(process.argv.length,2);
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file);
assert.equal(sha256(b),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');assert.equal(sha256(fs.readFileSync(exe)),'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
const out=path.join(root,'artifacts/research/rw4-touch-ops-r389');assert(!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
const codeBase=0x0c100000,roBase=0x3bff187c;
const pointers=[];for(let at=0;at+4<=b.length;at+=4){const v=b.readUInt32LE(at);if((v&1)&&v>=codeBase+0x1d6000&&v<codeBase+0x1df000)pointers.push({at,offset:v-codeBase-1});}
const clusters=[];for(const p of pointers){const neighbors=pointers.filter(q=>q.at>=p.at&&q.at<p.at+24);if(neighbors.length>=3&&!clusters.some(c=>p.at<c.at+24))clusters.push({at:p.at,words:Array.from({length:8},(_,i)=>b.readUInt32LE(p.at+i*4)),functions:neighbors});}
fs.writeFileSync(path.join(out,'pointer-clusters.json'),JSON.stringify(clusters,null,2));
const windows=[['upper-ioctl',0x1c2dc0,0x1c2e30],['registration',0x1c3094,0x1c3140],['zinitix-init',0x1dbad0,0x1dbcec],['chipone-init',0x1de2a8,0x1de49e],['hynitron-init',0x1de9c4,0x1dedb0],['raw-read-zinitix',0x1daab0,0x1dac20],['raw-read-chipone',0x1dc940,0x1dca80],...clusters.flatMap(c=>c.functions.map(f=>['callback-'+f.offset.toString(16),f.offset,f.offset+256]))];
for(const [name,start,end]of new Map(windows.map(w=>[w[0],w])).values()){
const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{encoding:'utf8',windowsHide:true,shell:false,timeout:10000,maxBuffer:524288});assert(!r.error&&r.status===0);fs.writeFileSync(path.join(out,name+'.txt'),r.stdout);}
// Initializers install these functions in state+92 (lower object at state+84).
// Upper ioctl delegates to lower+8. All three command dispatch bodies match.
const handlers=[{family:'zinitix',offset:0x1da7e8,literal:0x1dbcb8},{family:'chipone',offset:0x1dbe18,literal:0x1de464},{family:'hynitron',offset:0x1de4ac,literal:0x1ded00}];
for(const h of handlers){
 assert.equal(b.readUInt32LE(h.literal),codeBase+h.offset+1);
 assert(b.subarray(h.offset,h.offset+84).equals(b.subarray(handlers[0].offset,handlers[0].offset+84)));
 assert.equal(b.subarray(h.offset+28,h.offset+34).toString('hex'),'05090e131803');
}
const result={checkpoint:'R389',imageSha256:sha256(b),codeBase,roBase,pointerClusters:clusters.map(c=>({at:c.at,functions:c.functions})),windows:windows.map(([name,start,end])=>({name,start,end})),ioctlHandlers:handlers,identicalDispatchBytes:84,acceptedCommands:[0x901,0x902,0x903,0x904,0x905,0x906],commandEffects:['write board+28 target halfword+2','read board+28 target halfword+2','write board+28 target word+4','read board+28 target word+4','return zero in caller output','no operation'],contactCountSwitchFound:false,activeHardwareDriverKnown:false,physicalTransport:false,firmwareExecuted:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({checkpoint:'R389',clusters:result.pointerClusters,physicalTransport:false}));
