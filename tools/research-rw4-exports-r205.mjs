// Pinned firmware as data: references and bounded disassembly only, no execution.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedExportsResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-exports-r205');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file),imageSha='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db';
if(b.length!==6636408||sha256(b)!==imageSha||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const globals=[0x3c1aef98,0x3c1aef94];
const references=globals.map(value=>{
 const offsets=[];for(let p=0;p+4<=b.length;p+=4)if(b.readUInt32LE(p)===value)offsets.push(p);
 if(offsets.length>64)throw Error('ReferenceBound');return {address:value,offsets};
});
// Decode only direct Thumb BL encodings; targets require independent inspection.
function blTarget(p){
 const a=b.readUInt16LE(p),c=b.readUInt16LE(p+2);
 if((a&0xf800)!==0xf000||(c&0xd000)!==0xd000)return null;
 const s=(a>>>10)&1,i1=(~(((c>>>13)&1)^s))&1,i2=(~(((c>>>11)&1)^s))&1;
 let imm=(s<<24)|(i1<<23)|(i2<<22)|((a&1023)<<12)|((c&2047)<<1);
 if(s)imm-=33554432;return p+4+imm;
}
if(blTarget(0x1e7f22)!==0x1e7f48||blTarget(0x1bb49c)!==0x1f513c)throw Error('BlDecoderKnownAnchorFailed');
const getterCalls=[];
for(let p=0;p+4<=b.length;p+=2)if(blTarget(p)===0x1e7f48)getterCalls.push(p);
if(getterCalls.length>64)throw Error('CallBound');
const names=['puts','printf','vprintf','fprintf','fputs','write','syslog','vsyslog',
 'malloc','calloc','free','memcpy','memset','fopen','fread','fclose','open','close',
 'read','clock_gettime','gettimeofday','usleep','modlib_setsymtab','g_symtab','g_nsymbols'];
const codeBase=0x0c100000,stringsDelta=0x3bff187c; // R194 local-group hypotheses only.
const strings=names.map(name=>{
 const needle=Buffer.from(name+'\0'),hits=[];
 for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length)){
  if(p&&b[p-1]>=32&&b[p-1]<=126)continue;
  const refs=[];
  for(const delta of [codeBase,stringsDelta]){
   const address=delta+p;
   for(let q=0;q+4<=b.length;q+=4)if(b.readUInt32LE(q)===address)refs.push({offset:q,delta});
  }
  if(refs.length>128)throw Error('StringReferenceBound');hits.push({offset:p,refs});
 }
 return {name,hits};
});
const windows=[['startup-copy',0x850,0xb30],['global-getter-neighborhood',0x1e7b10,0x1e7f80],
 ['symtab-find',0x1ef738,0x1ef850]];
for(const [i,p] of [...new Set(references.flatMap(r=>r.offsets))].entries()){
 if(p>=0x1e7b10&&p<0x1e7f80)continue;
 windows.push(['global-reference-'+i,Math.max(0,(p-160)&~1),Math.min(b.length,p+48)]);
}
fs.mkdirSync(out,{recursive:true});
for(const [name,start,end] of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,name+'-thumb.txt'),r.stdout,{flag:'wx'});
}
const report={checkpoint:'R205',imageSha256:imageSha,globalStorageReferences:references,
 getterCalls,strings,windows:windows.map(([label,start,end])=>({label,start,end})),
 mappingsNotApiHeader:true,firmwareExecuted:false,watchCommandRequested:false};
fs.writeFileSync(path.join(out,'references.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R205',globalStorageReferences:references,getterCalls,
 exactNames:strings.filter(s=>s.hits.length).map(s=>({name:s.name,count:s.hits.length})),
 disassembledWindows:windows.length,firmwareExecuted:false,watchCommandRequested:false}));
