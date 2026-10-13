// Callees reached by Lua IO/native fread caller. Data inspection only.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-file-contract-r213');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
 sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const windows=[['lua-fclose',0x2fc120,0x2fc180],['fopen-fclose',0x1ebf0c,0x1ec02c],['fread',0x1ec130,0x1ec1a0]];
fs.mkdirSync(out,{recursive:true});
for(const [label,start,end] of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
const fingerprints=[0x1ebf0c,0x1ebff4,0x1ec130,0x1ec4e4,0x1ec608].map(offset=>({offset,first64Sha256:sha256(b.subarray(offset,offset+64))}));
fs.writeFileSync(path.join(out,'contract.json'),JSON.stringify({checkpoint:'R213',fingerprints,
 firmwareExecuted:false,watchCommandRequested:false,hardwareCallsVerified:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R213',functions:fingerprints.length,firmwareExecuted:false,watchCommandRequested:false}));
