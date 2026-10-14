// Pinned firmware as data only: names/xrefs and bounded Thumb disassembly.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-scheduling-r227');if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file),imageSha='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db';
if(b.length!==6636408||sha256(b)!==imageSha||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const names=['pthread_create','pthread_join','pthread_exit','pthread_detach','pthread_attr_init','pthread_attr_setstacksize','task_create','nxtask_create','nxsched_gettid','gettid','nanosleep','usleep','register_driver','unregister_driver'];
const strings=[],wanted=new Map();
for(const name of names){const needle=Buffer.from(name);for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length)){
 let end=b.indexOf(0,p);if(end<0||end-p>256)continue;
 let start=p;while(start>0&&p-start<128&&b[start-1]>=32&&b[start-1]<=126)start--;
 const hit={name,offset:p,contextStart:start,context:b.toString('ascii',start,end),refs:[]};strings.push(hit);
 for(const delta of [0x0c100000,0x3bff187c]){const key=start+delta;const rows=wanted.get(key)??[];rows.push({hit,delta});wanted.set(key,rows);if(p!==start){const suffixKey=p+delta,more=wanted.get(suffixKey)??[];more.push({hit,delta});wanted.set(suffixKey,more);}}
}}
if(strings.length>256)throw Error('StringBound');
for(let p=0;p+4<=b.length;p+=4)for(const {hit,delta}of wanted.get(b.readUInt32LE(p))??[])if(!hit.refs.some(r=>r.offset===p&&r.delta===delta))hit.refs.push({offset:p,delta});
function bl(p){const a=b.readUInt16LE(p),c=b.readUInt16LE(p+2);if((a&0xf800)!==0xf000||(c&0xd000)!==0xd000)return null;const s=(a>>>10)&1,i1=(~(((c>>>13)&1)^s))&1,i2=(~(((c>>>11)&1)^s))&1;let n=(s<<24)|(i1<<23)|(i2<<22)|((a&1023)<<12)|((c&2047)<<1);if(s)n-=33554432;return p+4+n;}
if(bl(0x1e7f22)!==0x1e7f48||bl(0x2fc4c0)!==0x1ebf0c)throw Error('DecoderAnchorFailed');
const windows=[];
for(const hit of strings)for(const ref of hit.refs){if(windows.some(w=>ref.offset>=w.start&&ref.offset<w.end))continue;const start=Math.max(0,(ref.offset-160)&~1),end=Math.min(b.length,ref.offset+48);windows.push({label:'ref-'+windows.length,start,end,seed:hit.name,calls:[]});}
if(windows.length>96||strings.some(h=>h.refs.length>128))throw Error('ReferenceBound');
fs.mkdirSync(out,{recursive:true});
for(const w of windows){for(let p=w.start;p+4<=w.end;p+=2){const target=bl(p);if(target!==null&&target>=0&&target<b.length)w.calls.push({offset:p,target});}
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+w.start,'--stop-address='+w.end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,w.label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
const report={checkpoint:'R227',imageSha256:imageSha,strings,windows,containsPotentialDataFalsePositives:true,functionSignaturesVerified:false,firmwareExecuted:false,watchCommandRequested:false};
fs.writeFileSync(path.join(out,'candidates.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R227',names:names.map(name=>({name,hits:strings.filter(h=>h.name===name).length,refs:strings.filter(h=>h.name===name).reduce((n,h)=>n+h.refs.length,0)})),windows:windows.length,functionSignaturesVerified:false,firmwareExecuted:false,watchCommandRequested:false}));
