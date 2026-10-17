// Pinned AP as data only; follows events for an owned Image completion hook.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-palette-source-r333.mjs';
const mode=process.argv[2]??'entry';
const windows={entry:[['events',0x1f500,0x1fcc0],['draw-order',0x20320,0x20448]],follow:[['delete-internal',0x1f234,0x1f404],['event-dispatch',0x1f5e0,0x1f650],['draw-img-entry',0x4c8f0,0x4c9d0]]};
if(process.argv.length>3||!windows[mode])throw Error('FixedMode');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe'),b=fs.readFileSync(file);
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('Pins');
const out=path.join(root,'artifacts/research/direct-events-r342-'+mode);if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out,{recursive:true});
for(const[name,start,end]of windows[mode]){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status)throw Error('Disassemble');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout);}
console.log(JSON.stringify({checkpoint:'R342',mode,windows:windows[mode],physicalTransport:false,firmwareExecuted:false}));
