// Real engine and threads on the pinned S3 emulator; no RW4 firmware bindings.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,demandAdapter,demandTransport} from './doom-demand-source-r337.mjs';
const out=path.join(root,'build/doom-demand-r337/s3'),tc=path.join(root,'tools/local/arm-14.3-review');
if(process.argv.length!==2||fs.existsSync(path.join(out,'review.json')))throw Error('FixedFreshBuildOnly');fs.mkdirSync(out,{recursive:true});
const log=[];function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});log.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(log,null,2));if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json')));
for(const [p,h]of Object.entries(review.sourceHashes))if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('ReviewedSourceChanged');
const gcc=path.join(tc,'bin/arm-none-eabi-gcc.exe'),target=['-march=armv7-a','-mthumb','-mfloat-abi=soft'];
const libraries=['libc.a','libm.a','libgcc.a'].map(name=>{const p=run(gcc,[...target,'-print-file-name='+name],name).trim();if(!path.resolve(p).toLowerCase().startsWith(tc.toLowerCase()+path.sep)||sha256(fs.readFileSync(p))!==review.libraries.find(l=>l.name===name)?.sha256)throw Error('LibraryChanged');return p;});
const names=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8').match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).filter(n=>n!=='doomgeneric_xlib.o');if(names.length!==80)throw Error('RecipeChanged');
const objects=[...names.map(n=>path.join(root,'build/doom-ram-s3',n)),...Array.from({length:7},(_,i)=>path.join(root,'build/doom-ram-s3/own-'+i+'.o'))];
objects[83]=path.join(root,'build/doom-launcher-r282/s3/adapter.o');objects[84]=path.join(root,'build/doom-launcher-r282/s3/transport.o');
const link=dest=>run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...review.bindings.map(b=>'--defsym='+b.local+'='+b.address),...objects,'--start-group',...libraries,'--end-group','-o',dest],'link');
const repro=path.join(out,'prior.elf');link(repro);if(sha256(fs.readFileSync(repro))!=='97a684758b8e19588a45bb2825f27a21f7454e4e5efba803f73a4a7ea8b28239')throw Error('PriorNotReproduced');
// Tail replaced ONLY in this emulator fixture to inspect x/y/angle/ammo/keys.
// Actual frame capacity, demand function, adapter and engine are unchanged.
let transport=demandTransport();if(transport.split('image_diagnostics(control_snapshot+20);').length!==2)throw Error('TailChanged');
transport=transport.replace('image_diagnostics(control_snapshot+20);','for(unsigned i=0;i<12;i++)control_snapshot[20+i]=atomic_load(&metrics[i]);');
const source={adapter:demandAdapter(),transport,codec:fs.readFileSync(path.join(root,'doom/platform-rw4/device/palette-view-r333.c'),'utf8')};
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-DRW4_IMAGE_S3_TEST','-DRW4_GAME_WAD="/data/app/watchface/market/365799913/lua/doom1.wad"'];
for(const [i,n]of ['adapter','transport','codec'].entries()){
const file=path.join(out,n+'.c'),object=path.join(out,n+'.o');fs.writeFileSync(file,source[n]);
const extra=n==='adapter'?['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h']:['-Wno-unused-function'];
run(gcc,[...flags,...extra,'-c',file,'-o',object],n);objects[83+i]=object;
}
const elf=path.join(out,'doom.elf');link(elf);const b=fs.readFileSync(elf),re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',elf],'review');
if(b.readUInt16LE(16)!==1||b.readUInt16LE(18)!==40||!(b.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re))throw Error('ElfContract');
const result={checkpoint:'R337',elfSha256:sha256(b),elfBytes:b.length,adapterSha256:sha256(source.adapter),transportSha256:sha256(source.transport),tailForEngineAssertionsOnly:true,realEngine:true,realThreads:true,physicalTransport:false,rw4Executable:false};fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
