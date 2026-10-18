// SPDX-License-Identifier: GPL-2.0-only
// Fixed offline audio lifecycle windows. No firmware execution or device IO.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const proxy=process.argv.length===3&&process.argv[2]==='--proxy-r360';
const focus=process.argv.length===3&&process.argv[2]==='--focus-r361';
const table=process.argv.length===3&&process.argv[2]==='--focus-table-r362';
if(process.argv.length!==2&&!proxy&&!focus&&!table)throw Error('Fixed review only');
const ap=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(ap);
if(hash(bytes)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
hash(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('Inputs changed');
const output=path.join(root,'artifacts/research/'+(table?'audio-table-r362':focus?'audio-r361':proxy?'audio-r360':'audio-r359'));
if(fs.existsSync(output))throw Error('Review exists');
const windows=table?[['focus-table',0x4df180,0x4df76c],['media-wrapper',0x5b17a0,0x5b1c40]]:focus?[['focus-generic',0x4e1948,0x4e2200],['socket-wrappers',0x48e320,0x48e800],
['socket-create',0x498780,0x498900]]:proxy?[['proxy-command',0x4df6c0,0x4dfb80],['proxy-open',0x4dfb80,0x4dfe00],
['proxy-transport',0x4e0c00,0x4e1a00]]:[['bes-device',0x1f8600,0x1f9c00],['bes-io',0x1fa100,0x1fb500],
['nxplayer-life',0x217db4,0x218b50],['media-io',0x4dfd00,0x4e09c0],
['focus-client',0x3d6f00,0x3d77c0]];
function describe(at){
 if(at+4>bytes.length)return '';
 const value=bytes.readUInt32LE(at),offset=value-0x3bff187c;
 let label='';
 if(offset>=0&&offset<bytes.length){const end=bytes.indexOf(0,offset);
  if(end>offset&&end-offset<=192&&bytes.subarray(offset,end).every(c=>c>=32&&c<=126))label=' '+JSON.stringify(bytes.toString('ascii',offset,end));}
 return ' ; literal=0x'+value.toString(16)+label;
}
fs.mkdirSync(output,{recursive:true});
for(const[name,start,end]of windows){
 const result=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,ap],
 {windowsHide:true,shell:false,encoding:'utf8',timeout:10000,maxBuffer:1048576});
 if(result.error||result.status)throw Error('Disassembly failed');
 const annotated=result.stdout.split('\n').map(line=>{
  const m=/\bldr[^\n]*\[pc[^\n]*@\s*\(?0x([0-9a-f]+)/.exec(line);
  return m?line+describe(parseInt(m[1],16)):line;
 }).join('\n');
 fs.writeFileSync(path.join(output,name+'.txt'),annotated,{flag:'wx'});
}
fs.writeFileSync(path.join(output,'review.json'),JSON.stringify({windows,imageSha256:hash(bytes),physicalWatchUsed:false,firmwareExecuted:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({windows:windows.length,physicalWatchUsed:false,firmwareExecuted:false}));
