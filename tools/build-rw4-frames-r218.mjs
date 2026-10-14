// Two separate builds: RW4 is data only; S3 binds only its pinned guest image.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
import {packageRoot} from './verify-emulator.mjs';
const mode=process.argv[2]??'rw4';
if(process.argv.length>3||!['rw4','s3'].includes(mode))throw Error('FixedBuildOnly');
const check=spawnSync(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8'});
if(check.status!==0)throw Error('ReviewedToolchainOrRw4InputsChanged');
const tc=path.join(root,'tools/local/arm-14.3-review'),relative='build/hello-native-rw4/r218-'+mode,dir=path.join(root,relative);
if(fs.existsSync(dir))throw Error('ExistingBuild');
function fnv(bytes){let h=2166136261;for(const c of bytes)h=Math.imul((h^c)>>>0,16777619)>>>0;return h;}
let bindings,imageSha;
if(mode==='rw4'){
 const review=JSON.parse(fs.readFileSync(path.join(root,'build/hello-native-rw4/r214/review.json'),'utf8'));
 imageSha=review.firmwareImageSha256;bindings=review.bindings;
 if(imageSha!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db'||bindings.length!==5)throw Error('BindingsChanged');
}else{
 const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
 imageSha=sha256(image);if(imageSha!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('S3ImageChanged');
 const table=image.readUInt32LE(32),stride=image.readUInt16LE(46),count=image.readUInt16LE(48),sections=[];
 if(stride!==40||table+stride*count>image.length)throw Error('SectionBounds');
 for(let i=0;i<count;i++){const p=table+i*stride;sections.push({type:image.readUInt32LE(p+4),address:image.readUInt32LE(p+12),offset:image.readUInt32LE(p+16),size:image.readUInt32LE(p+20),link:image.readUInt32LE(p+24),entry:image.readUInt32LE(p+36)});}
 const wanted={fopen:'OPEN',fclose:'CLOSE',fread:'READ',fwrite:'WRITE',fflush:'FLUSH'};bindings=[];
 for(const s of sections.filter(s=>s.type===2)){
  const strings=sections[s.link];if(!strings||s.entry!==16)throw Error('SymbolBounds');
  for(let p=s.offset;p<s.offset+s.size;p+=16){const at=strings.offset+image.readUInt32LE(p),end=image.indexOf(0,at);if(end<at||end>strings.offset+strings.size)throw Error('StringBounds');const name=image.toString('utf8',at,end);
   if(!Object.hasOwn(wanted,name))continue;
   const address=image.readUInt32LE(p+4),code=address&~1,sec=sections.find(v=>code>=v.address&&code+64<=v.address+v.size);
   if(!sec||(image[p+12]&15)!==2||(address&1)!==1)throw Error('S3FunctionRefused');
   const offset=sec.offset+code-sec.address,first=image.subarray(offset,offset+64);
   bindings.push({name:wanted[name],offset,thumbAddress:address,fnv64:fnv(first),sha256First64:sha256(first)});
  }
 }
 if(bindings.length!==5||new Set(bindings.map(b=>b.name)).size!==5)throw Error('S3BindingsMissing');
}
const physicalRoot='/data/app/watchface/market/365219980/lua/',testRoot='/tmp/rw4frames-r218/';
fs.mkdirSync(dir,{recursive:true});
const header=[...bindings.flatMap(b=>[`#define RW4_${b.name} ((uintptr_t)0x${b.thumbAddress.toString(16)}u)`,`#define RW4_${b.name}_FNV UINT32_C(${b.fnv64})`]),`#define FRAME_ROOT "${mode==='rw4'?physicalRoot:testRoot}"`].join('\n')+'\n';
fs.writeFileSync(path.join(dir,'frames-bindings-r218.h'),header,{flag:'wx'});
const logs=[];
function run(tool,args){const r=spawnSync(path.join(tc,tool),args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:2097152});logs.push({tool,args,status:r.status,stdout:r.stdout,stderr:r.stderr});if(r.error||r.status!==0){fs.writeFileSync(path.join(dir,'failed-build.json'),JSON.stringify(logs,null,2));throw Error('BuildFailed: '+r.stderr);}return r.stdout;}
const source='experiments/hello-native-rw4/frames-r218.c',script='experiments/hello-native-rw4/log-r210.ld';
const flags=[...(mode==='rw4'?['-march=armv8-m.main','-mfloat-abi=soft']:['-mcpu=cortex-a7','-mfpu=neon-vfpv4','-mfloat-abi=hard','-mgeneral-regs-only']),'-mthumb','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-falign-functions=8','-fstack-usage','-Wall','-Wextra','-Werror'];
run('bin/arm-none-eabi-gcc.exe',[...flags,'-I',relative,'-c',source,'-o',relative+'/frames.o']);
run('arm-none-eabi/bin/ld.exe',['-r','-T',script,'-e','rw4_frames_init',relative+'/frames.o','-o',relative+'/frames.elf']);
const re=run('bin/arm-none-eabi-readelf.exe',['-W','-h','-A','-S','-r','-s',relative+'/frames.elf']),dis=run('bin/arm-none-eabi-objdump.exe',['-dr',relative+'/frames.elf']);
const elf=fs.readFileSync(path.join(dir,'frames.elf')),imports=[...re.matchAll(/\bUND\s+(\S+)[ \t]*$/gm)].map(m=>m[1]),relocations=[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]);
if(elf[4]!==1||elf[5]!==1||elf.readUInt16LE(16)!==1||elf.readUInt16LE(18)!==40||elf.readUInt32LE(24)!==1||imports.length||!relocations.length||relocations.some(r=>r!=='R_ARM_ABS32')||elf.length>4096||!/^00000000 <rw4_frames_init>:/m.test(dis))throw Error('ElfContractRefused');
const sh=elf.readUInt32LE(32),stride=elf.readUInt16LE(46),count=elf.readUInt16LE(48),executable=[];
if(stride!==40||sh+stride*count>elf.length)throw Error('ElfBounds');
for(let i=0;i<count;i++){const p=sh+i*stride,f=elf.readUInt32LE(p+8),n=elf.readUInt32LE(p+20),offset=elf.readUInt32LE(p+16);if((f&3)===3&&n)throw Error('WritableStateRefused');if(f&4){if(offset+n>elf.length)throw Error('TextBounds');executable.push({offset,size:n,alignment:elf.readUInt32LE(p+32)});}}
if(executable.length!==1||executable[0].alignment<8)throw Error('ExecutableRefused');
const report={checkpoint:'R218',scope:mode,imageSha256:imageSha,elfSha256:sha256(elf),elfBytes:elf.length,sourceSha256:sha256(fs.readFileSync(path.join(root,source))),headerSha256:sha256(Buffer.from(header)),linkerSha256:sha256(fs.readFileSync(path.join(root,script))),bindings,imports,relocations,entry:1,executable,flags,stackUsage:fs.readFileSync(path.join(dir,'frames.su'),'utf8'),moduleExecuted:false,physicalDeploymentAuthorized:false,physicalWatchUsed:false};
for(const [name,data] of [['review.json',JSON.stringify(report,null,2)+'\n'],['build-log.json',JSON.stringify(logs,null,2)+'\n'],['readelf.txt',re],['disassembly.txt',dis]])fs.writeFileSync(path.join(dir,name),data,{flag:'wx'});
console.log(JSON.stringify(report));
