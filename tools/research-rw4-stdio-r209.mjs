// Inspect callees reached by the stock Lua print; not an API execution tool.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-stdio-r209');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
 sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
function bl(p){
 const a=b.readUInt16LE(p),c=b.readUInt16LE(p+2);
 if((a&0xf800)!==0xf000||(c&0xd000)!==0xd000)throw Error('NotBl');
 const s=(a>>>10)&1,i1=(~(((c>>>13)&1)^s))&1,i2=(~(((c>>>11)&1)^s))&1;
 let v=(s<<24)|(i1<<23)|(i2<<22)|((a&1023)<<12)|((c&2047)<<1);
 if(s)v-=33554432;return p+4+v;
}
for(const [p,target] of [[0x3035de,0x1bcba4],[0x3035ee,0x1ec4e4],[0x303618,0x1ec608]])if(bl(p)!==target)throw Error('CallerChanged');
const windows=[['stream-base',0x1bcba4,0x1bcc40],['write-stream',0x1ec4a0,0x1ec680]];
fs.mkdirSync(out,{recursive:true});
for(const [label,start,end] of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
const candidates=[0x1bcba4,0x1ec4e4,0x1ec608].map(offset=>({offset,
 first32Hex:b.subarray(offset,offset+32).toString('hex'),first64Sha256:sha256(b.subarray(offset,offset+64))}));
fs.writeFileSync(path.join(out,'stdio.json'),JSON.stringify({checkpoint:'R209',candidates,
 firmwareExecuted:false,watchCommandRequested:false,callableHardwareContractVerified:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R209',candidateCount:candidates.length,
 firmwareExecuted:false,watchCommandRequested:false,callableHardwareContractVerified:false}));
