// Fixed code windows as data, including a second ROM alias candidate.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const follow=process.argv.length===3&&process.argv[2]==='follow';
const contracts=process.argv.length===3&&process.argv[2]==='contracts';
if(process.argv.length!==2&&!follow&&!contracts)throw Error('FixedAnalysisOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(sha256(fs.readFileSync(file))!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputChanged');
const out=path.join(root,'artifacts/research/image-code-r274'+(follow?'-follow':contracts?'-contracts':''));if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out,{recursive:true});
const windows=contracts?[['seek-dispatch',0x495580,0x495740],['fs-lvgl',0x44374,0x44780],['port-fs',0x5f8cc0,0x5f9200],['header-cache-invalidate',0x2517c,0x25264]]:follow?[['image-entry',0x4c75c,0x4c7a8],['source-format',0x21bc8,0x21c88],['line-format',0x24714,0x247b0],['decoder-header',0x24fc0,0x250b0],['cache-lru',0x64500,0x64a50],['image-draw',0x4cb20,0x4ce20]]:[['image-source',0x4c780,0x4caf0],['decoder-info',0x24aa4,0x24c20],['decoder-open',0x24c20,0x24f60],['cache',0x24540,0x24700],['header',0,0x200],['veneers',0x5b3ae0,0x5b3b30]];
for(const [name,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout,{flag:'wx'});}
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({windows,firmwareExecuted:false,physicalTransport:false},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({windows:windows.length,firmwareExecuted:false}));
