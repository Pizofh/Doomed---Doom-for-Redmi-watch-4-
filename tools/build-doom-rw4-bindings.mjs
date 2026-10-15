// PC-only full link; no push, packaging, emulator load or physical transport.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedPcBuildOnly');
const out=path.join(root,'build/doom-rw4-bindings'),tc=path.join(root,'tools/local/arm-14.3-review');
fs.mkdirSync(out,{recursive:true});const logs=[];
function run(tool,args,label){const r=spawnSync(path.join(tc,tool),args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout;}
const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/device/firmware-bindings.lock.json')));
const image=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
if(lock.imageSha256!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||sha256(image)!==lock.imageSha256||lock.codeBase!==0x0c100000||lock.fingerprintBytes!==64||lock.entries.length!==21||lock.physicalDeploymentAuthorized!==false)throw Error('UnreviewedBindingImage');
const functions=lock.entries.map(e=>{
 if(!/^[a-z_]+$/.test(e.name)||!Number.isSafeInteger(e.offset)||e.offset<0||e.offset%2||e.offset+64>image.length)throw Error('InvalidBinding');
 const bytes=image.subarray(e.offset,e.offset+64);if(sha256(bytes)!==e.sha256)throw Error('FingerprintChanged:'+e.name);
 let fnv=2166136261;for(const c of bytes)fnv=Math.imul(fnv^c,16777619)>>>0;
 const codeBase=e.name==='image_drop'?0x1bff187c:lock.codeBase;
 if(e.codeBase!==undefined&&e.codeBase!==codeBase)throw Error('BindingAliasChanged');
 return {...e,address:codeBase+e.offset+1,fnv};
});
if(new Set(functions.map(e=>e.name)).size!==21||new Set(functions.map(e=>e.offset)).size!==21)throw Error('DuplicateBinding');
if(!Array.isArray(lock.contracts)||lock.contracts.length!==3)throw Error('FileContractsAbsent');
const contracts=lock.contracts.map(e=>{
 if(!/^[a-z_]+$/.test(e.name)||!Number.isSafeInteger(e.offset)||e.offset<0||e.offset%2||e.offset+64>image.length)throw Error('InvalidContract');
 const bytes=image.subarray(e.offset,e.offset+64);if(sha256(bytes)!==e.sha256)throw Error('ContractChanged:'+e.name);
 let fnv=2166136261;for(const c of bytes)fnv=Math.imul(fnv^c,16777619)>>>0;
 return {...e,address:lock.codeBase+e.offset+1,fnv};
});
const header=functions.map(e=>'#define RW4_ADDR_'+e.name.toUpperCase()+' UINT32_C(0x'+e.address.toString(16)+')').join('\n')+'\n'+
 'static const struct {uintptr_t address;uint32_t fnv;} rw4_fingerprints[]={\n'+[...functions,...contracts].map(e=>' {UINT32_C(0x'+(e.address-1).toString(16)+'),UINT32_C(0x'+e.fnv.toString(16)+')},').join('\n')+'\n};\n';
fs.writeFileSync(path.join(out,'firmware-addresses.h'),header);
const input=path.join(root,'build/doom-rw4-device/doom-device-unbound.o'),prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-device/review.json')));
if(prior.elfSha256!==sha256(fs.readFileSync(input))||prior.firmwareBindings!==false)throw Error('PriorCandidateChanged');
for(const [n,h]of Object.entries(prior.sourceHashes))if(sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device',n)))!==h)throw Error('PriorSourceChanged:'+n);
try{
 const checked=spawnSync(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000});if(checked.error||checked.status!==0)throw Error('ReviewedToolsChanged');
 run('bin/arm-none-eabi-gcc.exe',['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4/device','-I'+out,'-c','doom/platform-rw4/device/firmware-bindings.c','-o',path.join(out,'bindings.o')],'compile');
 const output=path.join(out,'doom-rw4-candidate.elf');
 run('arm-none-eabi/bin/ld.exe',['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',input,path.join(out,'bindings.o'),'-o',output],'link');
 const re=run('bin/arm-none-eabi-readelf.exe',['-W','-h','-A','-S','-s','-r',output],'review');fs.writeFileSync(path.join(out,'readelf.txt'),re);
 const b=fs.readFileSync(output),types=[...new Set([...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]))];
 if(b.readUInt16LE(16)!==1||b.readUInt16LE(18)!==40||!(b.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||!/Tag_CPU_arch: v8-M\.mainline/.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re)||types.some(t=>!['R_ARM_ABS32','R_ARM_THM_CALL','R_ARM_THM_JUMP24'].includes(t)))throw Error('ElfContractMismatch');
 const sh=b.readUInt32LE(32),stride=b.readUInt16LE(46),count=b.readUInt16LE(48);if(stride!==40||sh+count*stride>b.length)throw Error('ElfSections');
 let staticBytes=0;for(let i=0;i<count;i++){const p=sh+i*stride;if(!(b.readUInt32LE(p+8)&2))continue;if(b.readUInt32LE(p+12))throw Error('NonzeroSectionVma');staticBytes+=b.readUInt32LE(p+20);}
 const result={checkpoint:'R275',elfSha256:sha256(b),elfBytes:b.length,staticBytes,entry:b.readUInt32LE(24),imports:[],relocationTypes:types,bindingCount:functions.length,contractFingerprints:contracts.length,firmwareBindings:true,allContractsPhysicallyVerified:false,
  bindingLockSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/firmware-bindings.lock.json'))),bindingSourceSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/firmware-bindings.c'))),unboundSha256:prior.elfSha256,
  runtimeFingerprints:true,ownerIdentity:'current-task pointer token, not PID',loadableModule:false,uiImageDeliveryValidated:false,wadPathAssigned:false,physicalDeploymentAuthorized:false,deviceExecuted:false,physicalTransport:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
