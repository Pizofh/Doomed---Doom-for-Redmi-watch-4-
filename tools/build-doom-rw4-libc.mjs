// Link our private libc, not the firmware's private newlib data structures.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedPcLinkOnly');
const baseDir=path.join(root,'build/doom-rw4-engine'),out=path.join(root,'build/doom-rw4-libc'),tc=path.join(root,'tools/local/arm-14.3-review');
fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){
 const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});
 logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});
 if(r.error||r.status!==0)throw Error('BuildStepFailed:'+label);return r.stdout;
}
const flags=['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4'];
const hosts=['malloc','free','fopen','fclose','fread','fseek','ftell','feof','ferror','clearerr'];
try{
 run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
 const prior=JSON.parse(fs.readFileSync(path.join(baseDir,'runtime-review.json'))),engine=JSON.parse(fs.readFileSync(path.join(baseDir,'review.json')));
 if(prior.elfSha256!==sha256(fs.readFileSync(path.join(baseDir,'engine-runtime-port.o')))||engine.elfSha256!==sha256(fs.readFileSync(path.join(baseDir,'engine-port.o')))||prior.runtimeSourceSha256!==sha256(fs.readFileSync(path.join(baseDir,'runtime-device.c')))||prior.jumpSourceSha256!==sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/jump.S'))))throw Error('PriorInputsChanged');
 const libs=['libc.a','libm.a','libgcc.a'].map(name=>{
  const file=run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),flags.slice(0,3).concat('-print-file-name='+name),name).trim();
  if(!path.resolve(file).toLowerCase().startsWith(path.resolve(tc).toLowerCase()+path.sep)||!/[\\/]thumb[\\/]v8-m\.main[\\/]nofp[\\/]/i.test(file))throw Error('WrongMultilib');
  return {name,file,sha256:sha256(fs.readFileSync(file))};
 });
 const pinFile=path.join(root,'doom/platform-rw4/device/newlib.lock.json');
 const pins=JSON.parse(fs.readFileSync(pinFile));
 if(libs.some(l=>pins[l.name]!==l.sha256))throw Error('UnreviewedLibrary');
 run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,...hosts.map(n=>'-D'+n+'=rw4_host_'+n),'-Dnxsched_gettid=rw4_host_owner_token','-c',path.join(baseDir,'runtime-device.c'),'-o',path.join(out,'runtime-host.o')],'runtime');
 run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c','doom/platform-rw4/device/libc-glue.c','-o',path.join(out,'glue.o')],'glue');
 const output=path.join(out,'engine-libc.o');
 run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/device/module.ld',path.join(baseDir,'engine-port.o'),path.join(out,'runtime-host.o'),path.join(baseDir,'jump.o'),path.join(out,'glue.o'),'--start-group',...libs.map(l=>l.file),'--end-group','-o',output],'link');
 const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-s','-r',output],'review');fs.writeFileSync(path.join(out,'readelf.txt'),re);
 const imports=[...re.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m=>m[1]).sort();
 const expected=[...hosts.map(n=>'rw4_host_'+n),'rw4_host_owner_token','DG_DrawFrame','DG_GetKey','DG_GetTicksMs','DG_Init','DG_SetWindowTitle','DG_SleepMs'].sort();
 if(JSON.stringify(imports)!==JSON.stringify(expected))throw Error('UnexpectedImports:'+imports.join(','));
 const bytes=fs.readFileSync(output),sh=bytes.readUInt32LE(32),stride=bytes.readUInt16LE(46),count=bytes.readUInt16LE(48);
 if(bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||bytes.readUInt32LE(24)!==0||stride!==40||sh+count*stride>bytes.length||!/Tag_CPU_arch: v8-M\.mainline/.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re))throw Error('ElfMismatch');
 let staticBytes=0;for(let i=0;i<count;i++){const p=sh+i*stride;if(bytes.readUInt32LE(p+8)&2)staticBytes+=bytes.readUInt32LE(p+20);}
 const result={checkpoint:'R272',elfSha256:sha256(bytes),elfBytes:bytes.length,staticBytes,imports,libraries:libs.map(({name,sha256})=>({name,sha256})),runtimeSourceSha256:prior.runtimeSourceSha256,glueSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/libc-glue.c'))),
  privateNewlib:true,firmwareFileLayoutUsed:false,firmwareReentLayoutUsed:false,loadableModule:false,deviceExecuted:false,physicalTransport:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
