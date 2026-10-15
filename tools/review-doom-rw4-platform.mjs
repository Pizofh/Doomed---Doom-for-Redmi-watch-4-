// Pinned image as data only. Names identify candidates, never sufficient bindings.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const follow=process.argv.length===3&&process.argv[2]==='follow';
const detail=process.argv.length===3&&process.argv[2]==='detail';
if(process.argv.length!==2&&!follow&&!detail)throw Error('FixedAnalysisOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const b=fs.readFileSync(file),out=path.join(root,'artifacts/research/doom-platform-r273'+(follow?'-follow':detail?'-detail':''));
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1'||fs.existsSync(out))throw Error('InputsOrOutputChanged');
const names=follow||detail?[]:['getpid','gettid','pthread_self','usleep','nanosleep','Canvas','Image','get_img_size','set_src','src','image_dsc','buffer'];
const rows=[],wanted=new Map();
for(const name of names){const needle=Buffer.from(name+'\0');for(let at=b.indexOf(needle);at>=0;at=b.indexOf(needle,at+needle.length)){
 const row={name,stringOffset:at,refs:[]};rows.push(row);
 for(const delta of [0x0c100000,0x3bff187c]){const key=at+delta,entries=wanted.get(key)??[];entries.push({row,delta});wanted.set(key,entries);}
}}
if(rows.length>512)throw Error('StringBound');
for(let p=8;p+24<=b.length;p+=4)for(const {row,delta}of wanted.get(b.readUInt32LE(p))??[]){
 if(row.refs.length>128)throw Error('ReferenceBound');
 const words=Array.from({length:8},(_,i)=>b.readUInt32LE(p-8+4*i)),next=words[3],target=(next&~1)-0x0c100000;
 row.refs.push({offset:p,delta,words,nextThumb:(next&1)&&target>=0&&target<b.length?target:null});
}
fs.mkdirSync(out,{recursive:true});
const windows=detail?[
 {label:'errno-tcb',start:0x1e5eac,end:0x1e5ef0},
 {label:'short-scheduler-accessors',start:0x1bceb0,end:0x1bd020},
 {label:'img-veneer-candidate',start:0x3dfd8,end:0x3e298},
 {label:'lua-touserdata',start:0x2f9428,end:0x2f94b0},
 {label:'clock-gettime-entry',start:0x1b9700,end:0x1b97c0}
]:follow?[
 {label:'task-accessors',start:0x1bca50,end:0x1bcbe0},
 {label:'usleep-core',start:0x1f3da4,end:0x1f3e80},
 {label:'clock-source-full',start:0x1d2420,end:0x1d24c0},
 {label:'lv-img-set-src',start:0x5b4220,end:0x5b45a0},
 {label:'lua-type-helpers',start:0x2f8de4,end:0x2f8ea0},
 {label:'lua-tostring',start:0x2f9290,end:0x2f9300},
 {label:'src-property-callback',start:(208530513&~1)-0x0c100000,end:(208530513&~1)-0x0c100000+256}
]:[{label:'getpid-candidate',start:0x1b9820,end:0x1b98e4},
 {label:'pthread-self-candidate',start:0x1e8ae8,end:0x1e8b20},
 {label:'join-confirmed-candidate',start:0x1bbca0,end:0x1bbdb8},
 {label:'clock-source',start:0x1d2420,end:0x1d2470}];
for(const row of rows.filter(r=>!['src','buffer'].includes(r.name)))for(const ref of row.refs){
 const at=ref.nextThumb;if(at===null||windows.some(w=>at>=w.start&&at<w.end))continue;
 windows.push({label:row.name+'-'+at.toString(16),start:at,end:Math.min(b.length,at+512)});
}
if(windows.length>40)throw Error('WindowBound');
for(const w of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+w.start,'--stop-address='+w.end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,w.label+'.txt'),r.stdout,{flag:'wx'});}
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({checkpoint:'R273',imageSha256:sha256(b),rows,windows,firmwareExecuted:false,physicalTransport:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(rows.filter(r=>r.refs.length).map(r=>({name:r.name,stringOffset:r.stringOffset,refs:r.refs.map(x=>({offset:x.offset,nextThumb:x.nextThumb,words:x.words}))})),null,2));
