// Compile our bridge for the exact inspected S3; no RW4 output or guest execution.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedS3BuildOnly');
const out=path.join(root,'build/native-step-bridge-r230-reviewed'),tc=path.join(root,'tools/local/arm-14.3-review');if(fs.existsSync(out))throw Error('ExistingBuild');
const pins={'bin/arm-none-eabi-gcc.exe':'6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4','bin/arm-none-eabi-objdump.exe':'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1','bin/arm-none-eabi-readelf.exe':'e0f53e6cf812ca2a240b57fee99b6e77ec28cc515cc65c93d8ab0573b522d1c6','libexec/gcc/arm-none-eabi/14.3.1/cc1.exe':'553e335a64f1bf784311202578e7102f2338930d3af3b39b7e1fa474adb0cf84','arm-none-eabi/bin/as.exe':'3730b6d3752f021f4718e331b8f1295bb737ab5d9ee5b40ed7537958eb40a35f','arm-none-eabi/bin/ld.exe':'041ff41f439498450235ecd561bd1365136e7969bb30705c5ddd5a2e3cba3132'};
for(const [p,h]of Object.entries(pins))if(sha256(fs.readFileSync(path.join(tc,p)))!==h)throw Error('ToolChanged');
const image=path.join(packageRoot,'system-images/vela-release-4.0/nuttx'),guestSha='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';if(sha256(fs.readFileSync(image))!==guestSha)throw Error('GuestChanged');
fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:1048576});logs.push({exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0)throw Error('BuildToolFailed');return r.stdout;}
const guest=JSON.parse(run(process.execPath,['tools/inspect-native.mjs',image,'bridge']));if(guest.sha256!==guestSha)throw Error('GuestInspectionMismatch');
const source='experiments/native-step/bridge-s3-r230.c',obj=path.join(out,'bridge.o'),elf=path.join(out,'bridge.elf');
const flags=['-mcpu=cortex-a7','-mthumb','-mfpu=neon-vfpv4','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-falign-functions=4','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror'];
run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',source,'-o',obj]);
const symbols=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-s',obj]),imports=[...symbols.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(x=>x[1]);
const allowed=['printf','register_driver','unregister_driver'];
if(imports.length!==3||imports.some(x=>!allowed.includes(x)))throw Error('UnreviewedImport');
const bindings=imports.map(name=>{const s=guest.selectedSymbols.find(s=>s.name===name&&(s.info&15)===2);if(!s)throw Error('MissingBinding');return s;});
run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-e','rw4_step_bridge_init',...bindings.map(s=>'--defsym='+s.name+'='+s.value),obj,'-o',elf]);
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-r','-s',elf]),dis=run(path.join(tc,'bin/arm-none-eabi-objdump.exe'),['-dr',elf]),b=fs.readFileSync(elf);
const relocations=[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(x=>x[0]);
if(b.length>16384||b[4]!==1||b[5]!==1||b.readUInt16LE(16)!==1||b.readUInt16LE(18)!==40||(b.readUInt32LE(24)&3)!==1||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||relocations.some(r=>r!=='R_ARM_ABS32'))throw Error('ElfContractMismatch');
const report={checkpoint:'R230',scope:'S3 bridge only; not RW4 ABI',guestSha256:guestSha,sourceSha256:sha256(fs.readFileSync(path.join(root,source))),coreSha256:sha256(fs.readFileSync(path.join(root,'experiments/native-step/core-r229.h'))),elfSha256:sha256(b),elfBytes:b.length,bindings,relocations,entry:b.readUInt32LE(24),flags,nativeThreadsIncluded:false,persistentFileWritesIncluded:false,physicalTransferEnabled:false,firmwareExecuted:false,moduleExecuted:false};
for(const [name,text]of [['review.json',JSON.stringify(report,null,2)+'\n'],['readelf.txt',re],['disassembly.txt',dis]])fs.writeFileSync(path.join(out,name),text,{flag:'wx'});console.log(JSON.stringify(report));
