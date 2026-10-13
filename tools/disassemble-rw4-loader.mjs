// Fixed bounded windows of pinned data, using the reviewed GNU disassembler.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const contract=process.argv.length===3&&process.argv[2]==='--contract';
const relocation=process.argv.length===3&&process.argv[2]==='--relocation';
if(process.argv.length!==2&&!contract&&!relocation)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-loader-r194');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(hash(fs.readFileSync(file))!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
  hash(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const spans=relocation?[['reloc-abs32',0x1e6bf0,0x1e6c48],['symvalue',0x1e7d80,0x1e7f48],['initialize',0x1e77a0,0x1e7840]]:
  contract?[['elf-verify',0x1e800c,0x1e8050],['arm-check',0x1e6a24,0x1e6ba0],['bind',0x1e7220,0x1e7440],['rmmod-detail',0x1bb79c,0x1bb8d0]]:
  [['module',1815600,1816800],['symtab',1998500,1999100],['commands',2230300,2230752]];
for(const [label] of spans)if(fs.existsSync(path.join(out,label+'-thumb.txt')))throw Error('ExistingOutput');
for(const [label,start,end] of spans){
  const result=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:131072});
  if(result.error||result.status!==0)throw Error('DisassemblyRefused');
  fs.writeFileSync(path.join(out,label+'-thumb.txt'),result.stdout,{flag:'wx'});
}
console.log(JSON.stringify({checkpoint:'R194',windows:spans.map(([label,start,end])=>({label,start,end})),firmwareExecuted:false,watchCommandRequested:false}));
