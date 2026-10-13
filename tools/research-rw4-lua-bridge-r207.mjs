// Pinned stock image is data only. No target, ADB, radio or firmware execution.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedResearchOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-lua-bridge-r207');
if(fs.existsSync(out))throw Error('ExistingResearch');
const b=fs.readFileSync(file);
if(b.length!==6636408||sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||
 sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const names=['loadlib','print','dlopen','dlsym','absent',
 'dynamic libraries not enabled; check your Lua installation',
 'lua_pushlstring','lua_pushstring','luaL_checklstring','luaL_loadfilex'];
const strings=names.map(name=>{
 const needle=Buffer.from(name+'\0'),hits=[];
 for(let p=b.indexOf(needle);p>=0;p=b.indexOf(needle,p+needle.length)){
  if(p&&b[p-1]>=32&&b[p-1]<=126)continue;
  const refs=[];
  for(const delta of [0x0c100000,0x3bff187c])for(let q=8;q+16<=b.length;q+=4){
   if(b.readUInt32LE(q)!==p+delta)continue;
   refs.push({offset:q,delta,words:Array.from({length:6},(_,i)=>({offset:q-8+i*4,value:b.readUInt32LE(q-8+i*4)}))});
  }
  if(refs.length>128)throw Error('ReferenceBound');hits.push({offset:p,refs});
 }
 return {name,hits};
});
// Bounded windows around stub error references and candidate luaL_Reg tables.
const windows=[];
for(const s of strings.filter(s=>['loadlib','print','absent','dynamic libraries not enabled; check your Lua installation'].includes(s.name))){
 for(const h of s.hits)for(const r of h.refs){
  if(windows.some(w=>r.offset>=w.start&&r.offset<w.end))continue;
  windows.push({label:'reference-'+windows.length,start:(r.offset-192)&~1,end:r.offset+64});
 }
}
if(windows.length>32)throw Error('WindowBound');
fs.mkdirSync(out,{recursive:true});
for(const {label,start,end} of windows){
 const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:262144});
 if(r.error||r.status!==0)throw Error('DisassemblyFailed');
 fs.writeFileSync(path.join(out,label+'-thumb.txt'),r.stdout,{flag:'wx'});
}
const report={checkpoint:'R207',strings,windows,mappingsNotApiHeader:true,
 firmwareExecuted:false,watchCommandRequested:false};
fs.writeFileSync(path.join(out,'bridge.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R207',hits:strings.filter(s=>s.hits.length),
 windows:windows.length,firmwareExecuted:false,watchCommandRequested:false}));
