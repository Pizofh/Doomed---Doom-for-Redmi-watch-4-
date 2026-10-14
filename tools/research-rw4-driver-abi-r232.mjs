// Exact private RW4 image as data; bounded call windows, no hardware execution.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe'),out=path.join(root,'artifacts/research/rw4-driver-abi-r232');
if(fs.existsSync(out))throw Error('ExistingResearch');const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const windows=[['fopen',0x1ebf0c,0x1ebff4],['fclose',0x1ebff4,0x1ec130],['fread',0x1ec130,0x1ec300],['fwrite',0x1ec4e4,0x1ec608],['fflush',0x1ec608,0x1ec730],['register-unregister',0x497624,0x497690],['module-load-remove',0x1bb6cc,0x1bb848]];
function bl(p){const a=b.readUInt16LE(p),c=b.readUInt16LE(p+2);if((a&0xf800)!==0xf000||(c&0xd000)!==0xd000)return null;const s=(a>>>10)&1,i1=(~(((c>>>13)&1)^s))&1,i2=(~(((c>>>11)&1)^s))&1;let n=(s<<24)|(i1<<23)|(i2<<22)|((a&1023)<<12)|((c&2047)<<1);if(s)n-=33554432;return p+4+n;}
if(bl(0x2fc4c0)!==0x1ebf0c||bl(0x3062a0)!==0x1e8aac)throw Error('DecoderAnchorFailed');
const rows=[];fs.mkdirSync(out,{recursive:true});
for(const [label,start,end]of windows){const calls=[];for(let p=start;p+4<=end;p+=2){const target=bl(p);if(target!==null&&target>=0&&target<b.length)calls.push({offset:p,target});}
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,label+'.txt'),r.stdout,{flag:'wx'});rows.push({label,start,end,calls});}
const ptr=b.readUInt32LE(0x1c1e7c),offset=ptr-0x3bff187c;if(offset!==0x66444||b.toString('ascii',offset+32,offset+44)!=='/dev/urandom')throw Error('FopsTableAnchorChanged');
const report={checkpoint:'R232',imageSha256:sha256(b),windows:rows,stockFops:{ramAddress:ptr,fileOffset:offset,words:Array.from({length:8},(_,i)=>b.readUInt32LE(offset+4*i)),observedBytesBeforePath:32},fullDispatchVerified:false,firmwareExecuted:false,watchCommandRequested:false};fs.writeFileSync(path.join(out,'windows.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({checkpoint:'R232',windows:rows.map(w=>({label:w.label,calls:w.calls.map(c=>({at:c.offset.toString(16),to:c.target.toString(16)}))})),firmwareExecuted:false,watchCommandRequested:false}));
