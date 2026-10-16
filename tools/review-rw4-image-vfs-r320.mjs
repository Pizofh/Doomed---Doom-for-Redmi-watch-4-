// Fixed bounded static windows only. Never executes or exports firmware.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const registry=process.argv.length===3&&process.argv[2]==='registry';
if(process.argv.length!==2&&!registry)throw Error('FixedModeOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(sha256(fs.readFileSync(file))!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputsChanged');
const out=path.join(root,'artifacts/research/image-vfs-r320'+(registry?'-registry':''));if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out);
const windows=registry?[['fs-registry',0x442a0,0x44374]]:[['fs-open',0x44374,0x4449c],['fs-close-read',0x4449c,0x446ec],['fs-seek-tell',0x446ec,0x44830]];
for(const [name,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:65536});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout,{flag:'wx'});}
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({checkpoint:'R320',windows,firmwareExecuted:false,physicalTransport:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R320',windows:windows.length,physicalTransport:false}));
