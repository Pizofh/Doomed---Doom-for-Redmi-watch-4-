// Recompile original Doom and the RW4 candidate sources for the pinned S3 VM.
// No RW4 firmware addresses, hardware, downloads or game-data redistribution.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedPcBuildOnly');
const out=path.join(root,'build/doom-ram-s3'),tc=path.join(root,'tools/local/arm-14.3-review');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
try{
 run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
 const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
 if(sha256(image)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('GuestChanged');
 const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/doomgeneric-source.lock.json')));
 if(lock.revision!=='dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284'||lock.files.length!==181)throw Error('UpstreamChanged');
 for(const e of lock.files){const p=path.join(root,'third_party/doomgeneric',e.path);if(fs.lstatSync(p).isSymbolicLink())throw Error('SourceLink');const b=fs.readFileSync(p);if(b.length!==e.size||crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==e.gitBlobSha1)throw Error('SourceChanged:'+e.path);}
 const make=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8');
 const sources=make.match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).map(n=>n.replace(/\.o$/,'.c')).filter(n=>n!=='doomgeneric_xlib.c');
 if(sources.length!==80||sources.some(n=>!lock.files.some(e=>e.path==='doomgeneric/'+n)))throw Error('RecipeChanged');
 const prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-engine/runtime-review.json')));
 for(const [p,h]of [['build/doom-rw4-engine/runtime-device.c',prior.runtimeSourceSha256],['build/doom-rw4-engine/i_system.c',prior.overlaySha256],['doom/platform-rw4/device/jump.S',prior.jumpSourceSha256]])if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('GeneratedInputChanged:'+p);
 const target=['-march=armv7-a','-mthumb','-mfloat-abi=soft'];
 const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Idoom/platform-rw4','-Idoom/platform-rw4/device'];
 const engineFlags=[...flags,'-fcommon','-DNORMALUNIX','-D_DEFAULT_SOURCE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-DRW4_ENGINE','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h'];
 const gcc=path.join(tc,'bin/arm-none-eabi-gcc.exe'),objects=[];
 for(const n of sources){const o=path.join(out,n.replace(/\.c$/,'.o'));run(gcc,[...engineFlags,'-c',n==='i_system.c'?'build/doom-rw4-engine/i_system.c':'third_party/doomgeneric/doomgeneric/'+n,'-o',o],n);objects.push(o);}
 const hostNames=['malloc','free','fopen','fclose','fread','fseek','ftell','feof','ferror','clearerr'];
 const own=['build/doom-rw4-engine/runtime-device.c','doom/platform-rw4/device/libc-glue.c','doom/platform-rw4/device/jump.S','doom/platform-rw4/device/adapter.c','doom/platform-rw4/device/transport.c','doom/platform-rw4/device/image-view.c','experiments/doom-runtime-rw4/doom-s3-host.c'];
 for(const [i,p]of own.entries()){
  const o=path.join(out,'own-'+i+'.o'),extra=i===0?[...hostNames.map(n=>'-D'+n+'=rw4_host_'+n),'-Dnxsched_gettid=rw4_host_owner_token']:[];
  run(gcc,[...flags,'-fno-common','-Werror','-DRW4_IMAGE_S3_TEST','-DRW4_GAME_WAD="/tmp/rw4-doom-ram-s3.wad"','-Ithird_party/doomgeneric/doomgeneric',...extra,'-c',p,'-o',o],p);objects.push(o);
 }
 const pins=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/device/newlib.lock.json'))).emulator;
 const libraries=['libc.a','libm.a','libgcc.a'].map(name=>{const file=run(gcc,[...target,'-print-file-name='+name],name).trim();if(!path.resolve(file).toLowerCase().startsWith(path.resolve(tc).toLowerCase()+path.sep)||!/[\\/]thumb[\\/]v7-a[\\/]nofp[\\/]/i.test(file)||sha256(fs.readFileSync(file))!==pins[name])throw Error('LibraryChanged');return {name,file,sha256:pins[name]};});
 const symbols=new Map(),sh=image.readUInt32LE(32),stride=image.readUInt16LE(46),count=image.readUInt16LE(48);
 for(let i=0;i<count;i++){const p=sh+i*stride;if(image.readUInt32LE(p+4)!==2)continue;const off=image.readUInt32LE(p+16),size=image.readUInt32LE(p+20),q=sh+image.readUInt32LE(p+24)*stride,strings=image.subarray(image.readUInt32LE(q+16),image.readUInt32LE(q+16)+image.readUInt32LE(q+20));for(let a=off;a<off+size;a+=16){if((image[a+12]&15)!==2||!image.readUInt16LE(a+14))continue;const n=image.readUInt32LE(a);symbols.set(strings.toString('ascii',n,strings.indexOf(0,n)),image.readUInt32LE(a+4));}}
 const names=hostNames.map(n=>['rw4_host_'+n,n]).concat([['rw4_host_owner_token','nxsched_gettid'],['host_register','register_driver'],['host_unregister','unregister_driver'],['host_image_drop','lv_image_cache_drop'],['host_header_drop','lv_image_header_cache_drop'],['host_clock_gettime','clock_gettime'],['rw4_host_usleep','usleep'],['rw4_host_attr_init','pthread_attr_init'],['rw4_host_attr_stack','pthread_attr_setstacksize'],['rw4_host_attr_destroy','pthread_attr_destroy'],['rw4_host_thread_create','pthread_create'],['rw4_host_thread_join','pthread_join']]);
 const bindings=names.map(([local,name])=>{const address=symbols.get(name);if(!address)throw Error('SymbolAbsent:'+name);return {local,name,address};});
 const elf=path.join(out,'doom-ram-s3.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...bindings.map(b=>'--defsym='+b.local+'='+b.address),...objects,'--start-group',...libraries.map(l=>l.file),'--end-group','-o',elf],'link');
 const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-s','-r',elf],'review');fs.writeFileSync(path.join(out,'readelf.txt'),re);const bytes=fs.readFileSync(elf);
 const relocationTypes=[...new Set([...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]))];
 if(bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||/Tag_ABI_VFP_args: VFP registers/.test(re)||relocationTypes.some(t=>!['R_ARM_ABS32','R_ARM_THM_CALL','R_ARM_THM_JUMP24','R_ARM_THM_MOVW_ABS_NC','R_ARM_THM_MOVT_ABS'].includes(t)))throw Error('ElfContract');
 const sourceHashes=Object.fromEntries([...own,'doom/platform-rw4/device/platform.h','doom/platform-rw4/device/image-view.h','doom/platform-rw4/runtime.h','doom/platform-rw4/device/module.ld','experiments/doom-runtime-rw4/doom-ram-ui.lua'].map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))]));
 const report={checkpoint:'R276',elfSha256:sha256(bytes),elfBytes:bytes.length,guestSha256:sha256(image),revision:lock.revision,engineFiles:80,privateNewlib:true,realPthread:true,s3FormatAdapter:true,relocationTypes,bindings,libraries:libraries.map(({name,sha256})=>({name,sha256})),sourceHashes,physicalTransport:false,rw4Executable:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');}
