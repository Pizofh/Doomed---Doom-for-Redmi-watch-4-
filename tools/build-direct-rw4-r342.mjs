// PC compile/static audit only. No module entry, watch package or transport.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
import {root,sha256} from './doom-palette-source-r333.mjs';
if(process.argv.length!==2)throw Error('FixedBuildOnly');
const out=path.join(root,'build/direct-rw4-r342');if(fs.existsSync(path.join(out,'review.json')))throw Error('ReviewedBuildExists');fs.mkdirSync(out,{recursive:true});
const tc=path.join(root,'tools/local/arm-14.3-review'),logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:4194304});logs.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));if(r.error||r.status)throw Error('StepFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const ap=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
assert.equal(sha256(ap),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/device/firmware-bindings.lock.json')));
const owner=lock.entries.find(e=>e.name==='owner_token');assert(owner);assert.equal(sha256(ap.subarray(owner.offset,owner.offset+64)),owner.sha256);
// Draw order20/21/22 and23/24/25, Image MAIN/POST21/24, delete33.
for(const[at,value]of [[0x2035c,0x2114],[0x2036c,0x2115],[0x20376,0x2116],[0x2041e,0x2117],[0x20428,0x2118],[0x20432,0x2119],[0x4c950,0x2815],[0x4c954,0x2818],[0x1f23c,0x2121],[0x1f838,0xe92d]])assert.equal(ap.readUInt16LE(at),value);
// Event handler array layout: callback0, user_data4, filter8 (12B record).
for(const[at,value]of [[0x1f688,0x685a],[0x1f68c,0x60ea],[0x1f690,0x4798],[0x1f7b2,0x68c0],[0x1f77e,0x6840],[0x1f78e,0x7a00]])assert.equal(ap.readUInt16LE(at),value);
const entries=[['OWNER',owner.offset,lock.codeBase],['DEFAULT',0x41b18],['SCREEN',0x13bfc],['CREATE',0x4c740],['SOURCE',0x4c75c],['REFRESH',0x20cb0],['DELETE',0x1f404],['DROP',0x646c4],['FINISH',0x59678],['GPU_WAIT',0x55ba0],['EVENT_ADD',0x1f838],['EVENT_REMOVE',0x1f8c8],['EVENT_USER',0x1f7b0],['EVENT_CURRENT',0x1f77c],['EVENT_CODE',0x1f78c]].map(([name,offset,base=0x1bff187c])=>{const bytes=ap.subarray(offset,offset+64);let fnv=2166136261;for(const c of bytes)fnv=Math.imul(fnv^c,16777619)>>>0;return{name,offset,address:base+offset+1,fnv,sha256:sha256(bytes)};});
const header=entries.map(e=>`#define DIRECT_ADDR_${e.name} UINT32_C(0x${e.address.toString(16)})`).join('\n')+'\nstatic const struct {uintptr_t address;uint32_t fnv;} direct_pins[]={\n'+entries.map(e=>` {UINT32_C(0x${(e.address-1).toString(16)}),UINT32_C(0x${e.fnv.toString(16)})},`).join('\n')+'\n};\n';
fs.writeFileSync(path.join(out,'direct-addresses-r342.h'),header);
const sources=['direct-view-r342.c','direct-rw4-r342.c'],objects=[];
for(const name of sources){const object=path.join(out,name+'.o');objects.push(object);run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4/device','-I'+out,'-c','doom/platform-rw4/device/'+name,'-o',object],name);}
const output=path.join(out,'direct-rw4-component.o');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r',...objects,'-o',output],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-s','-r',output],'review');
assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(re));assert(/Tag_CPU_arch: v8-M\.mainline/.test(re));assert(!/Tag_ABI_VFP_args: VFP registers/.test(re));
const bytes=fs.readFileSync(output);assert.equal(bytes.readUInt32LE(24),0);let allocated=0;for(let i=0;i<bytes.readUInt16LE(48);i++){const p=bytes.readUInt32LE(32)+i*bytes.readUInt16LE(46);if(bytes.readUInt32LE(p+8)&2)allocated+=bytes.readUInt32LE(p+20);}
const result={checkpoint:'R342',componentSha256:sha256(bytes),componentBytes:bytes.length,allocatedSectionBytes:allocated,additionalPixelBytes:512000,bindings:entries,sourceHashes:Object.fromEntries([...sources,'direct-view-r342.h','direct-rw4-r342.h'].map(n=>[n,sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device',n)))])),imports:[],moduleEntry:false,physicalTransport:false,deviceExecuted:false,loadableModule:false,errorHookPhysicallyValidated:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,bindings:entries.length}));
