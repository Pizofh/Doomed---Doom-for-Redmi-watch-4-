// Assemble the complete C candidate, still unbound and NOT installable.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedPcBuildOnly');
const out=path.join(root,'build/doom-rw4-device'),tc=path.join(root,'tools/local/arm-14.3-review');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(tool,args,label){const r=spawnSync(path.join(tc,tool),args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout;}
const input=path.join(root,'build/doom-rw4-libc/engine-libc.o'),prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-libc/review.json')));
if(prior.elfSha256!==sha256(fs.readFileSync(input)))throw Error('LibcInputChanged');
const target=['-march=armv8-m.main','-mthumb','-mfloat-abi=soft'];
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device'];
try{
 const checked=spawnSync(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000});
 if(checked.error||checked.status!==0)throw Error('ReviewedToolsChanged');
 for(const name of ['adapter','transport']){
  const engine=name==='adapter'?['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h']:[];
  run('bin/arm-none-eabi-gcc.exe',[...flags,...engine,'-c','doom/platform-rw4/device/'+name+'.c','-o',path.join(out,name+'.o')],name);
 }
 const gcc=path.join(tc,'lib/gcc/arm-none-eabi/14.3.1/thumb/v8-m.main/nofp/libgcc.a');
 if(sha256(fs.readFileSync(gcc))!=='4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd')throw Error('LibgccChanged');
 const output=path.join(out,'doom-device-unbound.o');
 run('arm-none-eabi/bin/ld.exe',['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',input,path.join(out,'adapter.o'),path.join(out,'transport.o'),gcc,'-o',output],'link');
 const re=run('bin/arm-none-eabi-readelf.exe',['-W','-h','-A','-S','-s','-r',output],'review');fs.writeFileSync(path.join(out,'readelf.txt'),re);
 const imports=[...re.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m=>m[1]).sort();
 const expected=[...prior.imports.filter(n=>!n.startsWith('DG_')),'rw4_host_clock_ticks','rw4_host_usleep','rw4_host_attr_init','rw4_host_attr_stack','rw4_host_attr_destroy','rw4_host_thread_create','rw4_host_thread_join','rw4_host_register','rw4_host_unregister'].sort();
 if(JSON.stringify(expected)!==JSON.stringify(imports))throw Error('UnexpectedImports:'+imports.join(','));
 const b=fs.readFileSync(output),sh=b.readUInt32LE(32),size=b.readUInt16LE(46),count=b.readUInt16LE(48);
 if(b.readUInt16LE(16)!==1||b.readUInt16LE(18)!==40||!(b.readUInt32LE(24)&1)||size!==40||sh+count*size>b.length)throw Error('ElfMismatch');
 let allocated=0;for(let i=0;i<count;i++){const p=sh+i*size;if(!(b.readUInt32LE(p+8)&2))continue;if(b.readUInt32LE(p+12)!==0)throw Error('NonzeroRelocatableSectionVma');allocated+=b.readUInt32LE(p+20);}
 const result={checkpoint:'R272',elfSha256:sha256(b),elfBytes:b.length,staticBytes:allocated,entry:b.readUInt32LE(24),imports,adapterAndTransportCompiled:true,rawFrame:{width:320,height:200,format:'RGB565LE',headerBytes:32,slots:2},
  sourceHashes:Object.fromEntries(['platform.h','adapter.c','transport.c','libc-glue.c','jump.S','module.ld'].map(n=>[n,sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device',n)))])),
  stackUsage:Object.fromEntries(['adapter','transport'].map(n=>[n,fs.readFileSync(path.join(out,n+'.su'),'utf8')])),
  relocationTypes:[...new Set([...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]))],
  firmwareBindings:false,loadableModule:false,uiImageDeliveryValidated:false,wadPathAssigned:false,deviceExecuted:false,physicalTransport:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
