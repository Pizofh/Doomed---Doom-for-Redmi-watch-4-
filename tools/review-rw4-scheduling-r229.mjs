// Classify R227/R228 candidates from pinned bytes, never call those addresses.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedReviewOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file),out=path.join(root,'artifacts/research/rw4-scheduling-r229');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(fs.existsSync(out)||b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputRefused');
const delta=0x3bff187c,at=b.readUInt32LE(0x1bc380)-delta;
if(at<0||b.toString('ascii',at,b.indexOf(0,at))!=='pthread/pthread_cancel.c')throw Error('CancelAnchorChanged');
const entries=[{name:'pthread_create wrapper',offset:0x1e8aac,end:0x1e8ad0,classification:'strong static inference'},
 {name:'pthread_join',offset:0x1bbca0,end:0x1bbdb8,classification:'strong static inference'},
 {name:'pthread_cancel; NOT join',offset:0x1bc310,end:0x1bc384,classification:'R228 initial join candidate rejected'},
 {name:'register_driver',offset:0x497624,end:0x497670,classification:'strong static inference'},
 {name:'unregister_driver',offset:0x497670,end:0x497690,classification:'static inference; inode_remove callee'},
 {name:'stock RAM fops table',offset:0x66444,end:0x66464,classification:'table data, not executable API header'}];
const defaults=b.readUInt32LE(0x1bbc14)-delta;if(defaults!==0x65788||b.readUInt32LE(defaults+8)!==2048||b.readUInt32LE(0x1e88e8)-delta!==defaults)throw Error('DefaultAttributesChanged');
fs.mkdirSync(out,{recursive:true});
for(const e of entries){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+e.offset,'--stop-address='+e.end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,e.offset.toString(16)+'.txt'),r.stdout,{flag:'wx'});}
const report={checkpoint:'R229',imageSha256:sha256(b),entries,defaultAttributesCopiedBytes:12,defaultStackSizeCandidate:2048,ramFopsWords:Array.from({length:8},(_,i)=>b.readUInt32LE(0x66444+i*4)),earlierJoinCandidateRefuted:true,fullDriverAbiVerified:false,cooperativeStepPreferredForFirstBridge:true,firmwareExecuted:false,hardwareWatchUsed:false,watchCommandRequested:false};
fs.writeFileSync(path.join(out,'classification.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
