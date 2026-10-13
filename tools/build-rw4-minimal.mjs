// PC-only candidate from RW4 static loader findings. No transport/emulator imports.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('FixedBuildOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const toolchain=path.join(root,'tools/local/arm-14.3-review');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const pins={
  'bin/arm-none-eabi-gcc.exe':'6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4',
  'bin/arm-none-eabi-objdump.exe':'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1',
  'bin/arm-none-eabi-readelf.exe':'e0f53e6cf812ca2a240b57fee99b6e77ec28cc515cc65c93d8ab0573b522d1c6',
  'libexec/gcc/arm-none-eabi/14.3.1/cc1.exe':'553e335a64f1bf784311202578e7102f2338930d3af3b39b7e1fa474adb0cf84',
  'arm-none-eabi/bin/as.exe':'3730b6d3752f021f4718e331b8f1295bb737ab5d9ee5b40ed7537958eb40a35f',
  'arm-none-eabi/bin/ld.exe':'041ff41f439498450235ecd561bd1365136e7969bb30705c5ddd5a2e3cba3132'
};
for(const [file,expected] of Object.entries(pins))if(hash(fs.readFileSync(path.join(toolchain,file)))!==expected)throw Error('ToolChanged');
const imageHash='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db';
if(hash(fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin')))!==imageHash)throw Error('FirmwareChanged');
const destination=path.join(root,'build/hello-native-rw4/r194');
if(fs.existsSync(destination))throw Error('ExistingBuild');
fs.mkdirSync(destination,{recursive:true});
const source='experiments/hello-native-rw4/minimal.c',object='build/hello-native-rw4/r194/minimal.o',output='build/hello-native-rw4/r194/minimal.elf';
const logs=[];
function run(tool,args){
  const result=spawnSync(path.join(toolchain,tool),args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:1048576});
  logs.push({tool,args,status:result.status,stdout:result.stdout,stderr:result.stderr});
  if(result.error||result.status!==0)throw Error('ToolFailed');return result.stdout;
}
const flags=['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-std=c17','-Os','-ffreestanding','-fno-builtin',
  '-fno-common','-fno-pic','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector',
  '-falign-functions=8','-Wall','-Wextra','-Werror'];
run('bin/arm-none-eabi-gcc.exe',[...flags,'-c',source,'-o',object]);
run('arm-none-eabi/bin/ld.exe',['-r','-e','rw4_minimal_init',object,'-o',output]);
const readelf=run('bin/arm-none-eabi-readelf.exe',['-W','-h','-A','-S','-r','-s',output]);
const disassembly=run('bin/arm-none-eabi-objdump.exe',['-dr',output]);
const bytes=fs.readFileSync(path.join(root,output));
const relocations=[...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]);
const imports=[...readelf.matchAll(/\bUND\s+(\S+)[ \t]*$/gm)].map(m=>m[1]);
if(bytes[4]!==1||bytes[5]!==1||bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||bytes.readUInt32LE(24)!==1||
  imports.length||relocations.length||!/Tag_CPU_arch: v8-M\.mainline/.test(readelf)||/Tag_ABI_VFP_args: VFP registers/.test(readelf))throw Error('CandidateContractMismatch');
const shoff=bytes.readUInt32LE(32),stride=bytes.readUInt16LE(46),count=bytes.readUInt16LE(48);
if(stride!==40||count>100||shoff+stride*count>bytes.length)throw Error('SectionsRefused');
const executable=[];
for(let i=0;i<count;i++){
  const p=shoff+i*stride,flags=bytes.readUInt32LE(p+8),size=bytes.readUInt32LE(p+20),offset=bytes.readUInt32LE(p+16);
  if(flags&4){if(offset+size>bytes.length)throw Error('SectionBounds');executable.push({offset,size,alignment:bytes.readUInt32LE(p+32)});}
}
if(executable.length!==1||executable[0].size!==4||executable[0].alignment<8||
  !bytes.subarray(executable[0].offset,executable[0].offset+4).equals(Buffer.from([0,0x20,0x70,0x47])))throw Error('UnexpectedMachineCode');
const report={checkpoint:'R194',candidateOnly:true,physicalDeploymentAuthorized:false,hardwareCompatibilityVerified:false,
  firmwareImageSha256:imageHash,sourceSha256:hash(fs.readFileSync(path.join(root,source))),elfSha256:hash(bytes),elfBytes:bytes.length,
  executableBytes:4,entry:1,imports,relocations,flags,firmwareExecuted:false,moduleExecuted:false,watchCommandRequested:false};
for(const [name,text] of [['readelf.txt',readelf],['disassembly.txt',disassembly],['review.json',JSON.stringify(report,null,2)+'\n'],['build-log.json',JSON.stringify({pins,logs},null,2)+'\n']])fs.writeFileSync(path.join(destination,name),text,{flag:'wx'});
console.log(JSON.stringify(report));
