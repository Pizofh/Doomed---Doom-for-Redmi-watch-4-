// Rebuild only the WAD-dependent adapters; verify the reused complete link first.
// Output is a PC review candidate. No ADB, installer, radio or native execution.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,launcherProfile} from './doom-launcher-source.mjs';
const target=process.argv[2];if(process.argv.length!==3)throw Error('Expected rw4|s3');
const profile=launcherProfile(target),out=path.join(root,'build/doom-launcher-r282',target),tc=path.join(root,'tools/local/arm-14.3-review');
if(fs.existsSync(path.join(out,'review.json')))throw Error('ReviewedOutputExists');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
const gcc=path.join(tc,'bin/arm-none-eabi-gcc.exe'),ld=path.join(tc,'arm-none-eabi/bin/ld.exe');
const abis={rw4:['-march=armv8-m.main','-mthumb','-mfloat-abi=soft'],s3:['-march=armv7-a','-mthumb','-mfloat-abi=soft']};
const flags=[...abis[target],'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device'];
try{
 run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'toolchain');
 const original=target==='rw4'?'build/doom-rw4-bindings/doom-rw4-candidate.elf':'build/doom-ram-s3/doom-ram-s3.elf';
 const expected=target==='rw4'?'45d3044d0139db84f4f8c7f74f67f1c196b76a7843a416e5520ca5a593c459d7':'4cc023ce788a69605c1265b874dc4926e27c11b1673b133f79c95939a330af2a';
 if(sha256(fs.readFileSync(path.join(root,original)))!==expected)throw Error('ReviewedElfChanged');
 const common=['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init'];
 let link;
 if(target==='rw4'){
  const old=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-device/review.json')));
  for(const [name,h]of Object.entries(old.sourceHashes))if(sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device',name)))!==h)throw Error('ReviewedSourceChanged:'+name);
  const priorLibc=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-libc/review.json'))),input=path.join(root,'build/doom-rw4-libc/engine-libc.o');
  if(sha256(fs.readFileSync(input))!==priorLibc.elfSha256)throw Error('LibcChanged');
  const library=path.join(tc,'lib/gcc/arm-none-eabi/14.3.1/thumb/v8-m.main/nofp/libgcc.a');
  if(sha256(fs.readFileSync(library))!=='4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd')throw Error('LibgccChanged');
  const object=n=>path.join(root,'build/doom-rw4-device',n+'.o');
  link=(adapter,transport,destination)=>{
   const intermediate=path.join(out,'unbound.o');
   run(ld,[...common,input,adapter,transport,object('image-view'),library,'-o',intermediate],'link-unbound');
   run(ld,[...common,intermediate,path.join(root,'build/doom-rw4-bindings/bindings.o'),'-o',destination],'link-bound');
  };
  const repro=path.join(out,'reproduced-prior.elf');link(object('adapter'),object('transport'),repro);
  if(sha256(fs.readFileSync(repro))!==expected)throw Error('PriorObjectsDoNotReproduce');
 }else{
  const review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json')));
  if(review.elfSha256!==expected||review.rw4Executable!==false)throw Error('WrongS3Review');
  for(const [p,h]of Object.entries(review.sourceHashes))if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('ReviewedS3SourceChanged:'+p);
  const objects=[...Array.from({length:80},()=>null)]; // Recipe order from upstream Makefile below.
  const make=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8');
  const names=make.match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).filter(n=>n!=='doomgeneric_xlib.o');
  if(names.length!==80)throw Error('EngineRecipeChanged');objects.splice(0,80,...names.map(n=>path.join(root,'build/doom-ram-s3',n)),...Array.from({length:7},(_,i)=>path.join(root,'build/doom-ram-s3/own-'+i+'.o')));
  const libraries=['libc.a','libm.a','libgcc.a'].map(name=>{
   const file=run(gcc,[...abis.s3,'-print-file-name='+name],name).trim();
   if(!path.resolve(file).toLowerCase().startsWith(tc.toLowerCase()+path.sep)||sha256(fs.readFileSync(file))!==review.libraries.find(l=>l.name===name)?.sha256)throw Error('S3LibraryChanged');return file;
  });
  const symbols=review.bindings.map(b=>'--defsym='+b.local+'='+b.address);
  link=(adapter,transport,destination)=>run(ld,[...common,...symbols,...objects.map((p,i)=>i===83?adapter:i===84?transport:p),'--start-group',...libraries,'--end-group','-o',destination],'link-s3');
  const repro=path.join(out,'reproduced-prior.elf');link(objects[83],objects[84],repro);
  if(sha256(fs.readFileSync(repro))!==expected)throw Error('PriorS3ObjectsDoNotReproduce');
 }
 const paths={};
 for(const name of ['adapter','transport']){
  const extra=name==='adapter'?['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h']:[];
  const object=path.join(out,name+'.o');paths[name]=object;
  run(gcc,[...flags,...extra,...(target==='s3'?['-DRW4_IMAGE_S3_TEST']:[]),'-DRW4_GAME_WAD="'+profile.base+'doom1.wad"','-c','doom/platform-rw4/device/'+name+'.c','-o',object],name);
 }
 const output=path.join(out,'doom.elf');link(paths.adapter,paths.transport,output);
 const b=fs.readFileSync(output),re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',output],'review');
 fs.writeFileSync(path.join(out,'readelf.txt'),re);
 if(!b.includes(Buffer.from(profile.base+'doom1.wad'))||b.includes(Buffer.from('/not-installed/rw4-doom/doom1.wad'))||b.includes(Buffer.from('/tmp/rw4-doom-ram-s3.wad'))||b.readUInt16LE(16)!==1||!(b.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re))throw Error('NewElfContract');
 const result={checkpoint:'R282',target,id:profile.id,module:profile.module,elfBytes:b.length,elfSha256:sha256(b),priorElfReproduced:expected,wadPath:profile.base+'doom1.wad',wadPathAssigned:true,upstreamEngineRecompiled:false,adaptersRecompiled:['adapter','transport'],imports:[],physicalDeploymentAuthorized:false,nativeLoadEnabled:profile.allow_native,physicalTransport:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}finally{fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
