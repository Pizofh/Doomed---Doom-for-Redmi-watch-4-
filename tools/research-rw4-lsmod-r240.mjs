// Offline examination of the exact candidate image, never firmware execution.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe'),out=path.join(root,'artifacts/research/rw4-lsmod-r240-final');
const b=fs.readFileSync(file);if(fs.existsSync(out)||b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputChanged');
const refs=[['proc-modules-path',0x78828,0x220b44],['header-format',0x78838,0x220b68],['data-heading',0x78860,0x220b4c],['nexports-heading',0x78868,0x220b54],['uninit-heading',0x78878,0x220b5c],['proc-row-format',0x65678,0x1bb90c]];
for(const [,off,at]of refs)if(b.readUInt32LE(at)!==0x3c057cc0+off-0x66444)throw Error('StringReferenceChanged');
fs.mkdirSync(out,{recursive:true});
const windows=[['lsmod-command',0x2209b8,0x220b7c],['proc-row-formatter',0x1bb88c,0x1bb914]];
for(const [label,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,label+'.txt'),r.stdout,{flag:'wx'});}
const format='%s,%p,%p,%p,%u,%p,%lu,%p,%lu\n';
if(b.subarray(0x65678,0x65678+format.length+1).toString('latin1')!==format+'\0'||b.subarray(0x1bb8c2,0x1bb8c4).toString('hex')!=='4021')throw Error('ProcFormatterChanged');
const report={checkpoint:'R240',imageSha256:sha256(b),stringReferences:refs.map(([label,offset,reference])=>({label,offset,reference})),procRowFormat:format,formatterSizeArgument:64,formatterSizeInstruction:0x1bb8c2,firmwareExecuted:false,watchCommandRequested:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({checkpoint:'R240',stringReferences:refs.length,formatterSizeArgument:64,firmwareExecuted:false,watchCommandRequested:false}));
