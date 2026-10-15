// Read-only analysis of the pinned candidate. No resolved address is executed.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const follow=process.argv.length===3&&process.argv[2]==='follow';
const contracts=process.argv.length===3&&process.argv[2]==='contracts';
if(process.argv.length!==2&&!follow&&!contracts)throw Error('FixedAnalysisOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const b=fs.readFileSync(file),out=path.join(root,'artifacts/research/doom-rw4-runtime-r271'+(follow?'-follow':contracts?'-contracts':''));
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1'||fs.existsSync(out))throw Error('InputOrOutputRefused');
const rows=[];
for(const name of contracts?[]:['clock','seek','setvbuf','format','collectgarbage','malloc','free','clock_gettime','fseek','ftell','vsnprintf']){
 const needle=Buffer.from(name+'\0');
 for(let at=b.indexOf(needle);at>=0;at=b.indexOf(needle,at+needle.length)){
  if(!follow&&at&&b[at-1]>=32&&b[at-1]<=126)continue;
  for(const delta of [0x0c100000,0x3bff187c])for(let p=0;p+8<=b.length;p+=4){
   if(b.readUInt32LE(p)!==at+delta)continue;
   const value=b.readUInt32LE(p+4),target=(value&~1)-0x0c100000;
   rows.push({name,stringOffset:at,referenceOffset:p,delta,nextWord:value,thumbTarget:(value&1)&&target>=0&&target<b.length?target:null});
  }
 }
}
if(rows.length>256)throw Error('BoundExceeded');
fs.mkdirSync(out,{recursive:true});
const windows=contracts?[
 {label:'fseek-ftell',start:0x1ec2b8,end:0x1ec3b8},
 {label:'clock-ticks',start:0x1b98e4,end:0x1b993e},
 {label:'allocator-lua-reference',start:0x2ee2d0,end:0x2ee370}
]:follow?[
 {label:'seek-tell-core',start:0x1ec6c4,end:0x1ec824},
 {label:'heap-alloc',start:0x1f48ec,end:0x1f4af8},
 {label:'heap-free',start:0x1f462c,end:0x1f4850},
 {label:'clock-gettime-candidate',start:0x1b95c0,end:0x1b9a10}
]:[{label:'allocator-wrappers',start:0x1f50d0,end:0x1f52d0},{label:'stream-seek-and-tell',start:0x1ec7b0,end:0x1eca20}];
for(const r of rows.filter(r=>r.thumbTarget!==null)){
 if(windows.some(w=>r.thumbTarget>=w.start&&r.thumbTarget<w.end))continue;
 windows.push({label:r.name+'-'+r.thumbTarget.toString(16),start:r.thumbTarget,end:Math.min(b.length,r.thumbTarget+384)});
}
if(windows.length>24)throw Error('WindowBound');
for(const w of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+w.start,'--stop-address='+w.end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,w.label+'.txt'),r.stdout,{flag:'wx'});
}
const report={checkpoint:'R271',imageSha256:sha256(b),rows,windows,addressesAreCandidates:true,firmwareExecuted:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
