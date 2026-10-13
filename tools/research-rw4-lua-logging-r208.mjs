// Fixed, bounded firmware inspection; never execute it or access a device.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-lua-logging-r208');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
 sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
if(b.readUInt32LE(0xb040c)!==0x0c3fdf11)throw Error('LoadlibAnchorChanged');
const hits=[];
// Compiler string merging can reuse a suffix of a longer NUL-terminated string.
// Keep suffix hits rather than assuming that preceding printable text excludes
// a name. Pointer and table context must still be verified manually.
for(const name of ['print','assert','collectgarbage','tostring','_VERSION']){
 const needle=Buffer.from(name+'\0');
 for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length)){
  const refs=[];
  for(let q=8;q+16<=b.length;q+=4)if(b.readUInt32LE(q)===p+0x3bff187c){
   refs.push({offset:q,words:Array.from({length:6},(_,i)=>({offset:q-8+i*4,value:b.readUInt32LE(q-8+i*4)}))});
  }
  if(refs.length>128)throw Error('ReferenceBound');
  hits.push({name,offset:p,suffix:p>0&&b[p-1]>=32&&b[p-1]<=126,refs});
 }
}
if(hits.length>128)throw Error('NameBound');
const candidates=[];
for(const h of hits.filter(h=>h.name==='print'))for(const r of h.refs){
 const v=b.readUInt32LE(r.offset+4),p=(v&~1)-0x0c100000;
 if((v&1)&&p>=0x1000&&p<b.length-512)candidates.push({tableOffset:r.offset,functionOffset:p,stringOffset:h.offset});
}
if(candidates.length>8)throw Error('FunctionBound');
const windows=[{label:'loadlib-complete',start:0x2fdf10,end:0x2fdfc4},
 ...candidates.map((c,i)=>({label:'print-candidate-'+i,start:c.functionOffset,end:c.functionOffset+512}))];
fs.mkdirSync(out,{recursive:true});
for(const {label,start,end} of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
fs.writeFileSync(path.join(out,'logging.json'),JSON.stringify({checkpoint:'R208',hits,candidates,windows,
 mappingsNotApiHeader:true,firmwareExecuted:false,watchCommandRequested:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R208',referencedNames:hits.filter(h=>h.refs.length),
 candidates,firmwareExecuted:false,watchCommandRequested:false}));
