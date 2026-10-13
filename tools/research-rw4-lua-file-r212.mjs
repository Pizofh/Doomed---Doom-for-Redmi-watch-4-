// Pinned image as data, bounded IO registration/callee discovery, no device.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-lua-file-r212');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
 sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const hits=[];
for(const name of ['open','close','input','output','lines','tmpfile','popen']){
 const needle=Buffer.from(name+'\0');
 for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length)){
  const refs=[];
  for(let q=8;q+16<=b.length;q+=4)if(b.readUInt32LE(q)===p+0x3bff187c){
   const ptr=b.readUInt32LE(q+4),fn=(ptr&~1)-0x0c100000;
   if((ptr&1)&&fn>=0x1000&&fn<b.length-512)refs.push({offset:q,functionOffset:fn});
  }
  if(refs.length>32)throw Error('ReferenceBound');if(refs.length)hits.push({name,offset:p,refs});
 }
}
const windows=[];
for(const h of hits.filter(x=>['open','close'].includes(x.name)))for(const r of h.refs){
 windows.push({label:h.name+'-'+windows.length,start:r.functionOffset,end:r.functionOffset+512});
}
if(windows.length>16)throw Error('WindowBound');
fs.mkdirSync(out,{recursive:true});
for(const {label,start,end} of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
fs.writeFileSync(path.join(out,'files.json'),JSON.stringify({checkpoint:'R212',hits,windows,
 firmwareExecuted:false,watchCommandRequested:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R212',hits,windows:windows.length,firmwareExecuted:false,watchCommandRequested:false}));
