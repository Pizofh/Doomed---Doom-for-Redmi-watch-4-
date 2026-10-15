// Compile the pinned REAL engine for RW4's tested ISA. No firmware bindings or execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
const runtimeOnly=process.argv.length===3&&process.argv[2]==='runtime';
if(process.argv.length!==2&&!runtimeOnly)throw Error('FixedPcBuildOnly');
const relative='build/doom-rw4-engine',out=path.join(root,relative),tc=path.join(root,'tools/local/arm-14.3-review');
const logs=[];
function run(exe,args){
 const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
 logs.push({exe,args,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});
 if(r.error||r.status!==0)throw Error('BuildStepFailed:'+path.basename(exe));return r.stdout;
}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs']);
const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/doomgeneric-source.lock.json')));
if(lock.revision!=='dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284'||lock.files.length!==181)throw Error('UnexpectedUpstream');
for(const e of lock.files){
 if(!/^(?:LICENSE|README\.TXT|README\.md|doomgeneric\/(?:[a-z0-9_]+\.[ch]|Makefile))$/.test(e.path))throw Error('ManifestPath');
 const f=path.join(root,'third_party/doomgeneric',e.path);if(fs.lstatSync(f).isSymbolicLink())throw Error('SourceLink');
 const b=fs.readFileSync(f),blob=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
 if(b.length!==e.size||blob!==e.gitBlobSha1)throw Error('SourceChanged:'+e.path);
}
const make=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8');
const sources=make.match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).map(n=>n.replace(/\.o$/,'.c')).filter(n=>n!=='doomgeneric_xlib.c');
if(sources.length!==80||sources.some(n=>!lock.files.some(e=>e.path==='doomgeneric/'+n)))throw Error('RecipeChanged');
fs.mkdirSync(out,{recursive:true});
let overlay=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/i_system.c'),'utf8').replace(/\r\n/g,'\n');
for(const [match,replacement]of [
 [/void I_Quit \(void\)\n\{[\s\S]*?\n\}/,'void I_Quit (void)\n{\n    rw4_exit(0);\n}'],
 [/void I_Error \(char \*error, \.\.\.\)\n\{[\s\S]*?\n\}/,'void I_Error (char *error, ...)\n{\n    va_list args;\n    va_start(args, error);\n    rw4_error(error, args);\n}']]){
 if((overlay.match(new RegExp(match.source,'g'))??[]).length!==1)throw Error('ExitOverlayAnchor');overlay=overlay.replace(match,replacement);
}
fs.writeFileSync(path.join(out,'i_system.c'),overlay);
const target=['-march=armv8-m.main','-mthumb','-mfloat-abi=soft'];
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fcommon','-fno-pic',
 '-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-ffunction-sections','-falign-functions=8',
 '-Wall','-Wextra','-DNORMALUNIX','-D_DEFAULT_SOURCE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-DRW4_ENGINE',
 '-Idoom/platform-rw4/compat','-Idoom/platform-rw4','-Ithird_party/doomgeneric/doomgeneric',
 '-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h'];
try{
 const objects=[];
 if(!runtimeOnly)for(const name of sources){
  const object=relative+'/'+name.replace(/\.c$/,'.o');
  run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',name==='i_system.c'?relative+'/'+name:'third_party/doomgeneric/doomgeneric/'+name,'-o',object]);objects.push(object);
 }
 const libgcc=run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...target,'-print-libgcc-file-name']).trim();
 if(!path.isAbsolute(libgcc)||!path.resolve(libgcc).toLowerCase().startsWith(path.resolve(tc).toLowerCase()+path.sep)||!/thumb[\\/]v8-m\.main[\\/]nofp[\\/]libgcc\.a$/i.test(libgcc))throw Error('UnexpectedSoftFloatLibrary');
 if(sha256(fs.readFileSync(libgcc))!=='4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd')throw Error('ReviewedSoftFloatLibraryChanged');
 const artifact=relative+(runtimeOnly?'/engine-runtime-port.o':'/engine-port.o');
 let runtimeSourceSha256=null;
 if(runtimeOnly){
  const prior=JSON.parse(fs.readFileSync(path.join(out,'review.json')));
  if(prior.elfSha256!==sha256(fs.readFileSync(path.join(out,'engine-port.o')))||JSON.stringify(prior.flags)!==JSON.stringify(flags)||prior.overlaySha256!==sha256(overlay)||prior.loadableModule!==false)throw Error('PriorEngineChanged');
  let raw=fs.readFileSync(path.join(root,'doom/platform-rw4/runtime.c'),'utf8').replace(/\r\n/g,'\n');
  if(sha256(raw)!=='5e2d360276d2d50d8aef2adc08604154496ea729adc914c99425f418e38c6531')throw Error('SharedRuntimeChanged');
  raw=raw.replace(/\/\* Inspected guest saves10[\s\S]*?\*\//,'/* Owned base-PCS soft-float jump state: ten words, no firmware layout. */')
   .replace('uint32_t words[27]','uint32_t words[10]').replace('==112,"exact inspected jump buffer"','==40,"owned soft-float jump buffer"')
   .replace(/\bsetjmp\b/g,'rw4_port_setjmp').replace(/\blongjmp\b/g,'rw4_port_longjmp');
  runtimeSourceSha256=sha256(raw);fs.writeFileSync(path.join(out,'runtime-device.c'),raw);
  const base=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4'];
  run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...base,'-c',relative+'/runtime-device.c','-o',relative+'/runtime-device.o']);
  run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...target,'-c','doom/platform-rw4/device/jump.S','-o',relative+'/jump.o']);
  objects.push(relative+'/engine-port.o',relative+'/runtime-device.o',relative+'/jump.o');
 }
 run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/device/module.ld',...objects,libgcc,'-o',artifact]);
 const readelf=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-s','-r',artifact]);
 fs.writeFileSync(path.join(out,runtimeOnly?'runtime-readelf.txt':'readelf.txt'),readelf);
 const b=fs.readFileSync(path.join(root,artifact));
 const imports=[...readelf.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m=>m[1]).sort();
 if(b.readUInt16LE(16)!==1||b.readUInt16LE(18)!==40||b.readUInt32LE(24)!==0||!/Tag_CPU_arch: v8-M\.mainline/.test(readelf)||/Tag_ABI_VFP_args: VFP registers/.test(readelf)||imports.some(n=>n.startsWith('__aeabi_'))||/\bCOM[ \t]+\S+[ \t]*$/m.test(readelf))throw Error('EngineAbiMismatch');
 const sh=b.readUInt32LE(32),stride=b.readUInt16LE(46),count=b.readUInt16LE(48),namesAt=sh+b.readUInt16LE(50)*stride;
 if(stride!==40||sh+stride*count>b.length)throw Error('ElfBounds');
 const names=b.subarray(b.readUInt32LE(namesAt+16),b.readUInt32LE(namesAt+16)+b.readUInt32LE(namesAt+20)),sections=[];
 for(let i=0;i<count;i++){
  const p=sh+i*stride,flags=b.readUInt32LE(p+8);if(!(flags&2))continue;
  const n=b.readUInt32LE(p);sections.push({name:names.toString('ascii',n,names.indexOf(0,n)),bytes:b.readUInt32LE(p+20),alignment:b.readUInt32LE(p+32)});
 }
 const stack=[];for(const n of [...sources,...(runtimeOnly?['runtime-device.c']:[])])for(const row of fs.readFileSync(path.join(out,n.replace(/\.c$/,'.su')),'utf8').trim().split(/\r?\n/)){
  const [where,bytes,type]=row.split('\t');if(where)stack.push({where,bytes:Number(bytes),type});
 }
 const report={checkpoint:'R271',revision:lock.revision,engineFiles:sources.length,engineFilesCompiledThisInvocation:runtimeOnly?0:sources.length,isa:'ARMv8-M.mainline Thumb soft-float',flags,
  elfSha256:sha256(b),elfBytes:b.length,overlaySha256:sha256(overlay),libgcc:{relativePath:path.relative(tc,libgcc),sha256:sha256(fs.readFileSync(libgcc))},
  sections,staticBytes:sections.reduce((sum,s)=>sum+s.bytes,0),imports:imports.map(name=>({name,contract:name.startsWith('rw4_')?'owned runtime':name.startsWith('DG_')?'platform adapter':'libc: RW4 binding pending'})),
  relocationTypes:[...new Set([...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]))],
  largestFunctionStack:stack.sort((a,b)=>b.bytes-a.bytes).slice(0,10),dynamicStackFunctions:stack.filter(s=>s.type!=='static'),
  warnings:(runtimeOnly?JSON.parse(fs.readFileSync(path.join(out,'review.json'))).warnings:0)+logs.reduce((n,l)=>n+[...l.stderr.matchAll(/warning:/g)].length,0),
  defaultZoneBytes:6*1024*1024,screenBufferBytes:320*200*4,soundEnabled:false,
  runtimeSourceSha256,jumpSourceSha256:runtimeOnly?sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/jump.S'))):null,
  linkerSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/module.ld'))),loadableModule:false,runtimeIncluded:runtimeOnly,firmwareBindings:false,deviceExecuted:false,physicalTransport:false};
 if(runtimeOnly)fs.writeFileSync(path.join(out,'jump-disassembly.txt'),run(path.join(tc,'bin/arm-none-eabi-objdump.exe'),['-dr',relative+'/jump.o']));
 fs.writeFileSync(path.join(out,runtimeOnly?'runtime-review.json':'review.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
}finally{fs.writeFileSync(path.join(out,runtimeOnly?'runtime-build-log.json':'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
