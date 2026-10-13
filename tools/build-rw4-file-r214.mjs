// PC-only: compile our candidate; never execute it, firmware or a device tool.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const action=process.argv[2]??'build';
if(process.argv.length>3||!['build','verify-inputs'].includes(action))throw Error('FixedBuildOnly');
const tc=path.join(root,'tools/local/arm-14.3-review');
const pins={
 'bin/arm-none-eabi-gcc.exe':'6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4',
 'bin/arm-none-eabi-objdump.exe':'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1',
 'bin/arm-none-eabi-readelf.exe':'e0f53e6cf812ca2a240b57fee99b6e77ec28cc515cc65c93d8ab0573b522d1c6',
 'libexec/gcc/arm-none-eabi/14.3.1/cc1.exe':'553e335a64f1bf784311202578e7102f2338930d3af3b39b7e1fa474adb0cf84',
 'arm-none-eabi/bin/as.exe':'3730b6d3752f021f4718e331b8f1295bb737ab5d9ee5b40ed7537958eb40a35f',
 'arm-none-eabi/bin/ld.exe':'041ff41f439498450235ecd561bd1365136e7969bb30705c5ddd5a2e3cba3132'};
for(const [p,h] of Object.entries(pins))if(sha256(fs.readFileSync(path.join(tc,p)))!==h)throw Error('ToolChanged');
const fw=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
const fwSha='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db';
if(fw.length!==6636408||sha256(fw)!==fwSha)throw Error('FirmwareChanged');
const relative='build/hello-native-rw4/r214';
const dir=path.join(root,relative);
if(action==='build'&&fs.existsSync(dir))throw Error('ExistingBuild');
function fnv(bytes){let h=2166136261;for(const v of bytes)h=Math.imul((h^v)>>>0,16777619)>>>0;return h;}
const bindings=[['OPEN',0x1ebf0c],['CLOSE',0x1ebff4],['READ',0x1ec130],['WRITE',0x1ec4e4],['FLUSH',0x1ec608]].map(([name,offset])=>({
 name,offset,thumbAddress:0x0c100000+offset+1,fnv64:fnv(fw.subarray(offset,offset+64)),
 sha256First64:sha256(fw.subarray(offset,offset+64))}));
// Caller anchors: these five direct BL instructions must remain unchanged.
for(const [p,hex] of [[0x2fc4c0,'eff624fd'],[0x2fc130,'eff660ff'],[0x2fc172,'eff6ddff'],[0x3035ee,'e8f679ff'],[0x303618,'e8f6f6ff']]){
 if(fw.subarray(p,p+4).toString('hex')!==hex)throw Error('CallerChanged');
}
// Generic mode parser x case branches to OR flags,#8 (O_EXCL reference).
if(fw[0x1eba85]!==0x1d||fw.subarray(0x1ebaae,0x1ebab2).toString('hex')!=='41f00801')throw Error('ExclusiveModeAnchorChanged');
if(action==='verify-inputs'){console.log(JSON.stringify({checkpoint:'R214',inputsVerified:true,callerAnchors:5,exclusiveModeAnchorVerified:true,firmwareExecuted:false,watchCommandRequested:false}));process.exit(0);}
fs.mkdirSync(dir,{recursive:true});
const header=['/* Private generated binding metadata; not a firmware SDK. */',
 ...bindings.flatMap(x=>[
  `#define RW4_${x.name} ((uintptr_t)0x${x.thumbAddress.toString(16)}u)`,
  `#define RW4_${x.name}_FNV UINT32_C(${x.fnv64})`])].join('\n')+'\n';
fs.writeFileSync(path.join(dir,'log-bindings-r214.h'),header,{flag:'wx'});
const logs=[];
function run(tool,args){
 const r=spawnSync(path.join(tc,tool),args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:1048576});
 logs.push({tool,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
 if(r.error||r.status!==0)throw Error('BuildToolFailed');return r.stdout;
}
const source='experiments/hello-native-rw4/file-r214.c',script='experiments/hello-native-rw4/log-r210.ld';
const object=relative+'/log.o',output=relative+'/log.elf';
const flags=['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-std=c17','-Os','-ffreestanding','-fno-builtin',
 '-fno-common','-fno-pic','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector',
 '-falign-functions=8','-Wall','-Wextra','-Werror'];
run('bin/arm-none-eabi-gcc.exe',[...flags,'-I',relative,'-c',source,'-o',object]);
run('arm-none-eabi/bin/ld.exe',['-r','-T',script,'-e','rw4_file_init',object,'-o',output]);
const re=run('bin/arm-none-eabi-readelf.exe',['-W','-h','-A','-S','-r','-s',output]);
const dis=run('bin/arm-none-eabi-objdump.exe',['-dr',output]);
const elf=fs.readFileSync(path.join(root,output));
const imports=[...re.matchAll(/\bUND\s+(\S+)[ \t]*$/gm)].map(x=>x[1]);
const relocations=[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(x=>x[0]);
if(elf[4]!==1||elf[5]!==1||elf.readUInt16LE(16)!==1||elf.readUInt16LE(18)!==40||elf.readUInt32LE(24)!==1||
 imports.length||!relocations.length||relocations.some(x=>x!=='R_ARM_ABS32')||
 !/Tag_CPU_arch: v8-M\.mainline/.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re)||elf.length>4096)throw Error('ContractMismatch');
// Require one executable allocation, entry at its start, and no writable state.
const sh=elf.readUInt32LE(32),stride=elf.readUInt16LE(46),count=elf.readUInt16LE(48);
if(stride!==40||count>100||sh+stride*count>elf.length)throw Error('SectionBounds');
const executable=[];
for(let i=0;i<count;i++){
 const p=sh+i*stride,f=elf.readUInt32LE(p+8),n=elf.readUInt32LE(p+20),o=elf.readUInt32LE(p+16);
 if((f&3)===3&&n)throw Error('WritableAllocationRefused');
 if(f&4){if(o+n>elf.length)throw Error('TextBounds');executable.push({offset:o,size:n,alignment:elf.readUInt32LE(p+32)});}
}
if(executable.length!==1||executable[0].alignment<8||!/^00000000 <rw4_file_init>:/m.test(dis))throw Error('EntryRefused');
const report={checkpoint:'R214',candidateOnly:true,physicalDeploymentAuthorized:false,hardwareCompatibilityVerified:false,
 firmwareImageSha256:fwSha,sourceSha256:sha256(fs.readFileSync(path.join(root,source))),
 linkerSha256:sha256(fs.readFileSync(path.join(root,script))),elfSha256:sha256(elf),elfBytes:elf.length,
 entry:1,executable,imports,relocations,bindings,absoluteBindings:true,flags,
 firmwareExecuted:false,moduleExecuted:false,watchCommandRequested:false};
for(const [name,text] of [['review.json',JSON.stringify(report,null,2)+'\n'],['build-log.json',JSON.stringify({pins,logs},null,2)+'\n'],
 ['readelf.txt',re],['disassembly.txt',dis]])fs.writeFileSync(path.join(dir,name),text,{flag:'wx'});
console.log(JSON.stringify(report));
