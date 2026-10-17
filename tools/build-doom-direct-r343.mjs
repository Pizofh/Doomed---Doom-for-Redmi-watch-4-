// Offline candidate only. S3-model is real Doom/threads with simulated graphics.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
import {root,sha256,demandAdapter} from './doom-demand-source-r337.mjs';import {packageRoot} from './verify-emulator.mjs';
const mode=process.argv[2];if(process.argv.length!==3||!['s3-model','s3-ui','rw4'].includes(mode))throw Error('Expected s3-model|s3-ui|rw4');
const out=path.join(root,'build/doom-direct-r343',mode),tc=path.join(root,'tools/local/arm-14.3-review');if(fs.existsSync(path.join(out,'review.json')))throw Error('ReviewedBuildExists');fs.mkdirSync(out,{recursive:true});
const logs=[];function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8388608});logs.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));if(r.error||r.status)throw Error('StepFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const s3=mode.startsWith('s3-'),ui=mode==='s3-ui',gcc=path.join(tc,'bin/arm-none-eabi-gcc.exe'),ld=path.join(tc,'arm-none-eabi/bin/ld.exe');
const target=s3?['-march=armv7-a','-mthumb','-mfloat-abi=soft']:['-march=armv8-m.main','-mthumb','-mfloat-abi=soft'];
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-I'+out,`-DRW4_GAME_WAD="/data/app/watchface/market/${s3?'365799913':'365219963'}/lua/doom1.wad"`];
const objects=[],defs=[],libraries=[];let baseline;
if(s3){
 const review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json')));
 for(const[p,h]of Object.entries(review.sourceHashes))assert.equal(sha256(fs.readFileSync(path.join(root,p))),h);
 const names=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8').match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).filter(n=>n!=='doomgeneric_xlib.o');assert.equal(names.length,80);
 const old=[...names.map(n=>path.join(root,'build/doom-ram-s3',n)),...Array.from({length:7},(_,i)=>path.join(root,'build/doom-ram-s3/own-'+i+'.o'))];
 defs.push(...review.bindings.map(b=>'--defsym='+b.local+'='+b.address));
 if(ui){
  const guest=path.join(packageRoot,'system-images/vela-release-4.0/nuttx'),b=fs.readFileSync(guest);assert.equal(sha256(b),'849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa');
  const dwarf=run(path.join(tc,'bin/arm-none-eabi-gdb.exe'),['-batch','-ex','file '+guest.replaceAll('\\','/'),'-ex','p /d LV_EVENT_DRAW_MAIN_END','-ex','p /d LV_EVENT_DRAW_POST_END','-ex','p /d LV_EVENT_DELETE','-ex','p /d (unsigned)&((lv_display_t*)0)->layer_head','-ex','p /d (unsigned)&((lv_layer_t*)0)->draw_task_head','-ex','p /d (unsigned)&((lv_layer_t*)0)->next','-ex','p /d sizeof(lv_image_dsc_t)'],'s3-types');
  for(const[i,n]of [24,27,35,672,56,64,20].entries())assert(dwarf.includes('$'+(i+1)+' = '+n));
  const symbols=new Map();for(let i=0;i<b.readUInt16LE(48);i++){const p=b.readUInt32LE(32)+i*b.readUInt16LE(46);if(b.readUInt32LE(p+4)!==2)continue;const q=b.readUInt32LE(32)+b.readUInt32LE(p+24)*b.readUInt16LE(46),str=b.subarray(b.readUInt32LE(q+16),b.readUInt32LE(q+16)+b.readUInt32LE(q+20));for(let a=b.readUInt32LE(p+16),e=a+b.readUInt32LE(p+20);a<e;a+=16){if((b[a+12]&15)!==2||!b.readUInt16LE(a+14))continue;const n=b.readUInt32LE(a);symbols.set(str.toString('ascii',n,str.indexOf(0,n)),b.readUInt32LE(a+4));}}
  const names={s3_default:'lv_display_get_default',s3_screen:'lv_display_get_screen_active',s3_image_create:'lv_image_create',s3_image_src:'lv_image_set_src',s3_position:'lv_obj_set_pos',s3_delete:'lv_obj_delete',s3_refresh:'_lv_display_refr_timer',s3_add:'lv_obj_add_event_cb',s3_remove:'lv_obj_remove_event_cb',s3_event_code:'lv_event_get_code',s3_event_current:'lv_event_get_current_target',s3_event_user:'lv_event_get_user_data',s3_drop:'lv_image_cache_drop',s3_header_drop:'lv_image_header_cache_drop',s3_dispatch:'lv_draw_dispatch'};
  for(const[local,name]of Object.entries(names)){assert(symbols.get(name),'Missing '+name);defs.push('--defsym='+local+'='+symbols.get(name));}
 }
 for(const lib of review.libraries){const file=run(gcc,[...target,'-print-file-name='+lib.name],lib.name).trim();assert(path.resolve(file).toLowerCase().startsWith(tc.toLowerCase()+path.sep));assert.equal(sha256(fs.readFileSync(file)),lib.sha256);libraries.push(file);}
 const reproduced=path.join(out,'baseline.elf');run(ld,['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...review.bindings.map(b=>'--defsym='+b.local+'='+b.address),...old,'--start-group',...libraries,'--end-group','-o',reproduced],'baseline');assert.equal(sha256(fs.readFileSync(reproduced)),review.elfSha256);baseline=review.elfSha256;
 objects.push(...old.filter((_,i)=>![83,84,85].includes(i)));
}else{
 const reviewed=JSON.parse(fs.readFileSync(path.join(root,'build/direct-rw4-r342/review.json')));
 for(const[p,h]of Object.entries(reviewed.sourceHashes))assert.equal(sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device',p))),h);
 const libc=path.join(root,'build/doom-rw4-libc/engine-libc.o'),bindings=path.join(root,'build/doom-rw4-bindings/bindings.o');
 assert.equal(sha256(fs.readFileSync(libc)),JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-libc/review.json'))).elfSha256);
 assert.equal(sha256(fs.readFileSync(bindings)),'523ce18e38ea031ff706145b0cb41c6e63ba4d5b4f7cdf592a2c515bd2d90081');
 objects.push(libc,bindings,path.join(root,'build/direct-rw4-r342/direct-rw4-component.o'));
 assert.equal(sha256(fs.readFileSync(objects[2])),reviewed.componentSha256);
 const ap=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));assert.equal(sha256(ap),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
 // Lua property table x/y setters, independently matched to property7/8.
 assert.equal(ap.readUInt32LE(0x19a694),0x1c00a2f9);assert.equal(ap.readUInt32LE(0x19a6a0),0x1c00a331);
 assert.equal(ap.readUInt16LE(0x18a86),0x2107);assert.equal(ap.readUInt16LE(0x18abe),0x2108);
 const pos=[0x18a7c,0x18ab4].map(offset=>{const data=ap.subarray(offset,offset+64);let fnv=2166136261;for(const c of data)fnv=Math.imul(fnv^c,16777619)>>>0;return{address:offset+0x1bff187c,fnv,sha256:sha256(data)};});
 fs.writeFileSync(path.join(out,'position-bindings.json'),JSON.stringify(pos,null,2));
 fs.writeFileSync(path.join(out,'direct-position-r343.h'),pos.map((e,i)=>`#define DIRECT_POSITION_${i?'Y':'X'} UINT32_C(0x${(e.address+1).toString(16)})`).join('\n')+'\nstatic const struct {uintptr_t address;uint32_t fnv;} direct_position_pins[]={\n'+pos.map(e=>` {UINT32_C(0x${e.address.toString(16)}),UINT32_C(0x${e.fnv.toString(16)})},`).join('\n')+'\n};\n');
 const library=path.join(tc,'lib/gcc/arm-none-eabi/14.3.1/thumb/v8-m.main/nofp/libgcc.a');assert.equal(sha256(fs.readFileSync(library)),'4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd');libraries.push(library);
 baseline=JSON.parse(fs.readFileSync(path.join(root,'build/doom-demand-r337/native/review.json'))).elfSha256;
 assert.equal(sha256(fs.readFileSync(path.join(root,'build/doom-demand-r337/native/doom.elf'))),baseline);
}
const adapter=path.join(out,'adapter.c');fs.writeFileSync(adapter,demandAdapter());
const sources=[adapter,'doom/platform-rw4/device/direct-transport-r343.c',s3?(ui?'experiments/doom-runtime-rw4/direct-s3-r343.c':'experiments/doom-runtime-rw4/direct-model-r343.c'):'doom/platform-rw4/device/direct-backend-r343.c',...(s3?['doom/platform-rw4/device/direct-view-r342.c']:[])];
for(const[i,p]of sources.entries()){
 const object=path.join(out,'direct-'+i+'.o'),extra=i===0?['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h']:[];
 run(gcc,[...flags,...extra,'-c',p,'-o',object],'compile-'+i);objects.push(object);
}
const elf=path.join(out,'doom.elf');run(ld,['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...defs,...objects,'--start-group',...libraries,'--end-group','-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-s','-r',elf],'review');fs.writeFileSync(path.join(out,'readelf.txt'),re);
const bytes=fs.readFileSync(elf);assert.equal(bytes.readUInt16LE(16),1);assert.equal(bytes.readUInt16LE(18),40);assert(bytes.readUInt32LE(24)&1);assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(re));assert(!/Tag_ABI_VFP_args: VFP registers/.test(re));
if(!s3)assert(/Tag_CPU_arch: v8-M\.mainline/.test(re));
function allocated(b){let n=0;for(let i=0;i<b.readUInt16LE(48);i++){const p=b.readUInt32LE(32)+i*b.readUInt16LE(46);if(b.readUInt32LE(p+8)&2)n+=b.readUInt32LE(p+20)+Math.max(0,b.readUInt32LE(p+32)-1);}return n;}
const result={checkpoint:'R343',mode,elfBytes:bytes.length,elfSha256:sha256(bytes),allocatedSectionBytesWithAlignment:allocated(bytes),baselineSha256:baseline,...(!s3?{staticDifferenceVersusDemand:allocated(bytes)-allocated(fs.readFileSync(path.join(root,'build/doom-demand-r337/native/doom.elf')))}:{}),buffers:2,pixelBytes:512000,zoneMiB:4,controlBytes:256,controlVersion:4,frameNodes:0,pngCodec:false,realEngine:true,realThreads:s3,graphics:s3?(ui?'real S3 UI':'modeled'):'candidate RW4 bindings',sourceHashes:Object.fromEntries(sources.map(p=>[path.isAbsolute(p)?path.relative(root,p):p,sha256(fs.readFileSync(path.resolve(root,p)))])),physicalDeploymentAuthorized:false,physicalTransport:false,rw4Executable:!s3,deviceExecuted:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
