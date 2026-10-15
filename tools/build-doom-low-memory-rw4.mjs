// Compile the same adapter tested in R284 for the RW4 candidate ABI.
// Offline only. No loader, packaging, radio or physical deployment is invoked.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const out=path.join(root,'build/doom-low-memory-rw4-r285'),tc=path.join(root,'tools/local/arm-14.3-review');
if(fs.existsSync(path.join(out,'review.json')))throw Error('ReviewedOutputExists');fs.mkdirSync(out,{recursive:true});
const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
try{
 run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'toolchain');
 const source=path.join(root,'build/doom-low-memory-r284/adapter-low.c'),sourceBytes=fs.readFileSync(source);
 if(sha256(sourceBytes)!=='2e7e2146aa6678818c2cd43740dccf05509d77417c970c4b726d04e8bdf20bfe')throw Error('TestedAdapterChanged');
 const test=JSON.parse(fs.readFileSync(path.join(root,'build/doom-low-memory-r284/test-result.json')));
 const s3=JSON.parse(fs.readFileSync(path.join(root,'build/doom-low-memory-r284/review.json')));
 if(!test.passed||test.zoneMiB!==4||test.cycles.length!==2||test.cycles.some(c=>c.peakBytes!==4486833||c.allocated!==14||c.freed!==14)||s3.adapterSha256!==sha256(sourceBytes)||s3.elfSha256!==sha256(fs.readFileSync(path.join(root,'build/doom-low-memory-r284/doom-low-s3.elf'))))throw Error('MissingS3Evidence');
 const prior=path.join(root,'build/doom-launcher-r282/rw4'),expected='5365bf23602cc9b4fc8a55a0e0e29459518614dc1b240d1a81182d76f70bdf29';
 if(sha256(fs.readFileSync(path.join(prior,'doom.elf')))!==expected)throw Error('PriorCandidateChanged');
 const device=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-device/review.json')));
 for(const [n,h]of Object.entries(device.sourceHashes))if(sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device',n)))!==h)throw Error('DeviceSourceChanged');
 const libc=path.join(root,'build/doom-rw4-libc/engine-libc.o'),libcReview=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-libc/review.json')));
 if(sha256(fs.readFileSync(libc))!==libcReview.elfSha256)throw Error('EngineLibcChanged');
 const library=path.join(tc,'lib/gcc/arm-none-eabi/14.3.1/thumb/v8-m.main/nofp/libgcc.a');
 if(sha256(fs.readFileSync(library))!=='4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd')throw Error('LibgccChanged');
 const ld=path.join(tc,'arm-none-eabi/bin/ld.exe'),common=['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init'];
 function link(adapter,destination){
  const intermediate=path.join(out,'unbound.o');
  run(ld,[...common,libc,adapter,path.join(prior,'transport.o'),path.join(root,'build/doom-rw4-device/image-view.o'),library,'-o',intermediate],'link-unbound');
  run(ld,[...common,intermediate,path.join(root,'build/doom-rw4-bindings/bindings.o'),'-o',destination],'link-bound');
 }
 const repro=path.join(out,'prior-reproduced.elf');link(path.join(prior,'adapter.o'),repro);
 if(sha256(fs.readFileSync(repro))!==expected)throw Error('PriorObjectsNotReproducible');
 const generated=path.join(out,'adapter-low.c');fs.writeFileSync(generated,sourceBytes,{flag:'wx'});
 const object=path.join(out,'adapter.o'),flags=['-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h','-DRW4_GAME_WAD="/data/app/watchface/market/365219963/lua/doom1.wad"'];
 run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',generated,'-o',object],'compile');
 const elf=path.join(out,'doom.elf');link(object,elf);const b=fs.readFileSync(elf);
 const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-s','-r',elf],'readelf');fs.writeFileSync(path.join(out,'readelf.txt'),re);
 const relocationTypes=[...new Set([...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]))];
 if(b.readUInt16LE(16)!==1||b.readUInt16LE(18)!==40||!(b.readUInt32LE(24)&1)||!/Tag_CPU_arch: v8-M\.mainline/.test(re)||/Tag_ABI_VFP_args: VFP registers|\bUND[ \t]+\S+[ \t]*$/m.test(re)||relocationTypes.some(t=>!['R_ARM_ABS32','R_ARM_THM_CALL','R_ARM_THM_JUMP24'].includes(t)))throw Error('ElfContract');
 const sh=b.readUInt32LE(32),stride=b.readUInt16LE(46),count=b.readUInt16LE(48),stridx=b.readUInt16LE(50);
 if(stride!==40||count>128||stridx>=count||sh+stride*count>b.length)throw Error('Sections');
 const st=sh+stridx*stride,strings=b.subarray(b.readUInt32LE(st+16),b.readUInt32LE(st+16)+b.readUInt32LE(st+20));
 const sections=[],groups={text:{bytes:0,alignment:1},data:{bytes:0,alignment:1}};let staticBytes=0;
 const align=(v,a)=>Math.ceil(v/a)*a;
 for(let i=0;i<count;i++){
  const p=sh+i*stride,flags=b.readUInt32LE(p+8),size=b.readUInt32LE(p+20),a=b.readUInt32LE(p+32),n=b.readUInt32LE(p);
  if(!(flags&2))continue;
  if(b.readUInt32LE(p+12)!==0||a<1||a>4096||(a&(a-1)))throw Error('SectionLayout');
  const name=strings.toString('ascii',n,strings.indexOf(0,n)),kind=flags&1?'data':'text',g=groups[kind];
  g.bytes=align(g.bytes,a)+align(size,4);g.alignment=Math.max(g.alignment,a);staticBytes+=size;
  sections.push({name,kind,size,alignment:a});
 }
 // Firmware R193 modlib_load: per-section align, sizes rounded to4, two heaps.
 const residentSectionBytes=groups.text.bytes+groups.data.bytes;
 const snapshot=JSON.parse(fs.readFileSync(path.join(root,'experiments/memory-preflight/observations-r284.json'))).pools.find(p=>p.displayedName==='UMEM');
 const runtimePeak=4486833,threadStack=32768,subtotal=residentSectionBytes+runtimePeak+threadStack;
 const result={checkpoint:'R285',target:'rw4',id:'365219963',module:'rw4doom282',zoneMiB:4,elfBytes:b.length,elfSha256:sha256(b),adapterSha256:sha256(sourceBytes),priorElfReproduced:expected,upstreamEngineRecompiled:false,adaptersRecompiled:['adapter'],imports:[],relocationTypes,sections,staticBytes,loaderGroups:groups,residentSectionBytes,sectionHeaderBytes:count*40,wadPath:'/data/app/watchface/market/365219963/lua/doom1.wad',wadPathAssigned:true,nativeLoadEnabled:false,physicalDeploymentAuthorized:false,physicalTransport:false,deviceExecuted:false,
 budget:{runtimePeakMeasuredOnS3:runtimePeak,threadStack,subtotal,observedUmemFree:snapshot.free,observedUmemLargest:snapshot.largest,remainingBeforeUnmeasuredOverhead:snapshot.free-subtotal,unmeasuredOverheadAllowance:1048576,remainingAfterPlanningAllowance:snapshot.free-subtotal-1048576,allowanceIsMeasuredBound:false,mallocPoolMappingVerified:false}};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}finally{fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
