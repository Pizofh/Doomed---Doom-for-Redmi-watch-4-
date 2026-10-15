// Bounded static inspection of the already reviewed local firmware image.
// Disassembly stays ignored; no proprietary source/binary is redistributed.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const image=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(sha256(fs.readFileSync(image))!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const out=path.join(root,'artifacts/research/doom-loader-r285');fs.mkdirSync(out,{recursive:true});
const spans=[['load-and-headers',0x1e7890,0x1e7b18],['bind',0x1e7220,0x1e7750],['io-buffer',0x1e7840,0x1e7890],['finish',0x1e7bc4,0x1e7d80]],records=[];
for(const [label,start,end]of spans){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,image],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:131072});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 const file=path.join(out,label+'.txt');if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')!==r.stdout)throw Error('ExistingEvidenceChanged');
 fs.writeFileSync(file,r.stdout);records.push({label,start,end,sha256:sha256(Buffer.from(r.stdout))});
}
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({checkpoint:'R285',records,firmwareExecuted:false,physicalTransport:false},null,2)+'\n');
console.log(JSON.stringify({checkpoint:'R285',fixedWindows:records.length,totalInspectedBytes:records.reduce((n,r)=>n+r.end-r.start,0),firmwareExecuted:false,physicalTransport:false}));
