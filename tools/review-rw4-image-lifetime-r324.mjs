// Bounded static inspection only. No new binding or firmware execution.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const follow=process.argv.length===3&&process.argv[2]==='follow';
const finish=process.argv.length===3&&process.argv[2]==='finish';
const core=process.argv.length===3&&process.argv[2]==='core';
if(process.argv.length!==2&&!follow&&!finish&&!core)throw Error('FixedModeOnly');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file);
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('InputsChanged');
const out=path.join(root,'artifacts/research/image-lifetime-r324'+(follow?'-follow':finish?'-finish':core?'-core':''));if(fs.existsSync(out))throw Error('OutputExists');fs.mkdirSync(out);
const codeBase=0x1bff187c,dataBase=0x3bff187c;
if(b.readUInt32LE(0x5b4658)!==0xf000f85f)throw Error('FsRegisterVeneerChanged');
const fsRegister=(b.readUInt32LE(0x5b465c)&~1)-codeBase;
if(fsRegister<0x44000||fsRegister>0x45000)throw Error('UnexpectedRegisterTarget');
const calls=[];
for(let at=0;at+4<=b.length;at+=2){const a=b.readUInt16LE(at),c=b.readUInt16LE(at+2);if((a&0xf800)!==0xf000||(c&0xd000)!==0xd000)continue;const s=(a>>10)&1;let d=(s<<24)|(((~((c>>13)^s))&1)<<23)|(((~((c>>11)^s))&1)<<22)|((a&1023)<<12)|((c&2047)<<1);if(s)d-=33554432;const dst=at+4+d;if(dst===fsRegister||dst===0x5b4658)calls.push(at);}
if(calls.length>16)throw Error('CallerBound');
const methods=[];
for(const marker of ['luavgl_obj_delete\0','lv_obj_del_async\0','lv_obj_del\0','delete\0']){
 const offsets=[];for(let at=b.indexOf(Buffer.from(marker));at>=0;at=b.indexOf(Buffer.from(marker),at+1)){if(at&&b[at-1]!==0&&marker==='delete\0')continue;offsets.push(at);if(offsets.length>32)throw Error('StringBound');}
 for(const offset of offsets){const refs=[];for(const base of [codeBase,dataBase,0x0c100000]){const p=Buffer.alloc(4);p.writeUInt32LE(base+offset);for(let at=b.indexOf(p);at>=0;at=b.indexOf(p,at+1)){if(refs.length>=32)throw Error('ReferenceBound');refs.push({at,next:b.readUInt32LE(at+4)});}}methods.push({marker,offset,refs});}
}
const candidates=methods.flatMap(m=>m.marker==='delete\0'?m.refs:[]).filter(r=>r.next>=0x0c6d0001&&r.next<0x0c700000).map(r=>({...r,offset:(r.next&~1)-0x0c100000}));
const neighbors=candidates.map(r=>({at:r.at,offset:r.offset,entries:Array.from({length:17},(_,i)=>r.at+(i-8)*8).flatMap(at=>{const p=b.readUInt32LE(at)-dataBase;if(p<0||p>=b.length)return[];const end=b.indexOf(0,p);if(end<0||end-p>40)return[];const name=b.subarray(p,end).toString('ascii');return /^[a-z_]+$/.test(name)?[{at,name,fn:b.readUInt32LE(at+4)}]:[];})}));
if(b.readUInt32LE(0x5b42f8)!==0xf000f85f)throw Error('ObjectVeneerChanged');
const objectDelete=(b.readUInt32LE(0x5b42fc)&~1)-codeBase;
if(objectDelete<0x1f000||objectDelete>0x22000)throw Error('UnexpectedObjectDelete');
const windows=core?[['object-delete-core',objectDelete,objectDelete+400]]:finish?[['object-delete-end',0x5dfff4,0x5e00ac],['posix-veneers',0x64e10,0x64fc0]]:follow?[['normal-fs-read-close',0x33e90,0x33f28],...candidates.map(r=>['delete-'+r.offset.toString(16),r.offset,r.offset+128])]:[['fs-register',fsRegister,fsRegister+96],...calls.map(at=>['register-caller-'+at.toString(16),Math.max(0,at-160),at+80])];
for(const [name,start,end]of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:65536});if(r.error||r.status!==0)throw Error('DisassemblyFailed');fs.writeFileSync(path.join(out,name+'.txt'),r.stdout,{flag:'wx'});}
const result={checkpoint:'R324',fsRegister,objectDelete,calls,...(follow?{neighbors}:{methods}),windows,firmwareExecuted:false,physicalTransport:false};fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
