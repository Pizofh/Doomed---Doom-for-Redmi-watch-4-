// PC S3-only experiment: original engine's supported -mb 4 option.
// No change to the RW4 candidate, upstream engine, launcher or physical gates.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const out=path.join(root,'build/doom-low-memory-r284'),tc=path.join(root,'tools/local/arm-14.3-review');
if(fs.existsSync(path.join(out,'review.json')))throw Error('ReviewedOutputExists');fs.mkdirSync(out,{recursive:true});
const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
try{
 run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'toolchain');
 const review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json')));
 for(const [p,h]of Object.entries(review.sourceHashes))if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('ReviewedSourceChanged');
 const previous=path.join(root,'build/doom-launcher-r282/s3/doom.elf');
 const expected='97a684758b8e19588a45bb2825f27a21f7454e4e5efba803f73a4a7ea8b28239';
 if(sha256(fs.readFileSync(previous))!==expected)throw Error('PriorLauncherChanged');
 const gcc=path.join(tc,'bin/arm-none-eabi-gcc.exe'),target=['-march=armv7-a','-mthumb','-mfloat-abi=soft'];
 const libraries=['libc.a','libm.a','libgcc.a'].map(name=>{const p=run(gcc,[...target,'-print-file-name='+name],name).trim();if(!path.resolve(p).toLowerCase().startsWith(tc.toLowerCase()+path.sep)||sha256(fs.readFileSync(p))!==review.libraries.find(l=>l.name===name)?.sha256)throw Error('LibraryChanged');return p;});
 const make=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8');
 const names=make.match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).filter(n=>n!=='doomgeneric_xlib.o');if(names.length!==80)throw Error('RecipeChanged');
 const objects=[...names.map(n=>path.join(root,'build/doom-ram-s3',n)),...Array.from({length:7},(_,i)=>path.join(root,'build/doom-ram-s3/own-'+i+'.o'))];
 objects[83]=path.join(root,'build/doom-launcher-r282/s3/adapter.o');objects[84]=path.join(root,'build/doom-launcher-r282/s3/transport.o');
 const link=(adapter,destination)=>run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...review.bindings.map(b=>'--defsym='+b.local+'='+b.address),...objects.map((p,i)=>i===83?adapter:p),'--start-group',...libraries,'--end-group','-o',destination],'link');
 const repro=path.join(out,'prior-reproduced.elf');link(objects[83],repro);if(sha256(fs.readFileSync(repro))!==expected)throw Error('ObjectReuseNotReproducible');
 let source=fs.readFileSync(path.join(root,'doom/platform-rw4/device/adapter.c'),'utf8');
 const old='"-skill","2",NULL',replacement='"-skill","2","-mb","4",NULL';
 if(source.split(old).length!==2||source.split('doomgeneric_Create(8,argv)').length!==2)throw Error('AdapterChanged');
 source=source.replace(old,replacement).replace('doomgeneric_Create(8,argv)','doomgeneric_Create(10,argv)');
 const file=path.join(out,'adapter-low.c'),object=path.join(out,'adapter.o');fs.writeFileSync(file,source);
 const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h','-DRW4_IMAGE_S3_TEST','-DRW4_GAME_WAD="/data/app/watchface/market/365799913/lua/doom1.wad"'];
 run(gcc,[...flags,'-c',file,'-o',object],'adapter');const elf=path.join(out,'doom-low-s3.elf');link(object,elf);
 const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',elf],'readelf'),bytes=fs.readFileSync(elf);
 if(bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re))throw Error('ElfContract');
 fs.writeFileSync(path.join(out,'readelf.txt'),re);
 const result={checkpoint:'R284',zoneMiB:4,elfBytes:bytes.length,elfSha256:sha256(bytes),adapterSha256:sha256(Buffer.from(source)),priorElfReproduced:expected,engineRecompiled:false,upstreamEngineModified:false,physicalTransport:false,rw4Executable:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}finally{fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
