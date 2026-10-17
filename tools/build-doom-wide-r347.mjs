// Reuse the reviewed engine/control/core objects; replace only the UI backend.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-touch-r345.mjs';import {packageRoot} from './verify-emulator.mjs';
const mode=process.argv[2];assert(process.argv.length===3&&['rw4','s3-ui'].includes(mode));
const s3=mode==='s3-ui',out=path.join(root,'build/doom-wide-r347',mode),old=path.join(root,'build/doom-direct-r343',mode),tc=path.join(root,'tools/local/arm-14.3-review');assert(!fs.existsSync(path.join(out,'review.json')));fs.mkdirSync(out,{recursive:true});
const logs=[];function run(name,args,label){const r=spawnSync(path.join(tc,'bin',name+'.exe'),args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:8388608});logs.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));assert(!r.error&&r.status===0,label);return r.stdout;}
const prior=JSON.parse(fs.readFileSync(path.join(old,'review.json'))),oldElf=fs.readFileSync(path.join(old,'doom.elf'));
assert.equal(sha256(oldElf),s3?'5a6772154c02bd069c0bf0225c000429d9fd00afb30e71fe94bd697063bcb22c':'cb7d0c4c0322c9b1c9c827fb67511705262caf988beb04075c66f9c887a16de3');
for(const[p,h]of Object.entries(prior.sourceHashes))assert.equal(sha256(fs.readFileSync(path.join(root,p))),h);
const target=s3?['-march=armv7-a','-mthumb','-mfloat-abi=soft']:['-march=armv8-m.main','-mthumb','-mfloat-abi=soft'];
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-I'+out,'-I'+old];
const objects=[],defs=[],libraries=[],bindings={};
if(s3){
 const r=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json'))),names=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/Makefile'),'utf8').match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).filter(n=>n!=='doomgeneric_xlib.o');assert.equal(names.length,80);
 objects.push(...names.map(n=>path.join(root,'build/doom-ram-s3',n)),...[0,1,2,6].map(i=>path.join(root,'build/doom-ram-s3/own-'+i+'.o')));
 defs.push(...r.bindings.map(b=>'--defsym='+b.local+'='+b.address));
 const guest=path.join(packageRoot,'system-images/vela-release-4.0/nuttx');assert.equal(sha256(fs.readFileSync(guest)),r.guestSha256);
 const symbols=new Map(run('arm-none-eabi-nm',[guest],'symbols').split(/\r?\n/).map(l=>l.match(/^([0-9a-f]+) [Tt] (\S+)$/)).filter(Boolean).map(m=>[m[2],parseInt(m[1],16)|1]));
 const functions={s3_default:'lv_display_get_default',s3_screen:'lv_display_get_screen_active',s3_image_create:'lv_image_create',s3_image_src:'lv_image_set_src',s3_position:'lv_obj_set_pos',s3_delete:'lv_obj_delete',s3_refresh:'_lv_display_refr_timer',s3_add:'lv_obj_add_event_cb',s3_remove:'lv_obj_remove_event_cb',s3_event_code:'lv_event_get_code',s3_event_current:'lv_event_get_current_target',s3_event_user:'lv_event_get_user_data',s3_drop:'lv_image_cache_drop',s3_header_drop:'lv_image_header_cache_drop',s3_dispatch:'lv_draw_dispatch',s3_scale:'lv_image_set_scale',s3_antialias:'lv_image_set_antialias'};
 for(const[n,f]of Object.entries(functions)){assert(symbols.has(f),f);defs.push('--defsym='+n+'='+symbols.get(f));bindings[n]=symbols.get(f);}
 for(const l of r.libraries){const file=path.resolve(run('arm-none-eabi-gcc',[...target,'-print-file-name='+l.name],l.name).trim());assert(file.toLowerCase().startsWith(tc.toLowerCase()+path.sep));assert.equal(sha256(fs.readFileSync(file)),l.sha256);libraries.push(file);}
}else{
 const ap=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));assert.equal(sha256(ap),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
 // Lua Image property "zoom", integer setter at table+8. set_src centers pivot.
 assert.equal(ap.readUInt32LE(0x19a144),0x3c178400);assert.equal(ap.readUInt32LE(0x19a148),0);assert.equal(ap.readUInt32LE(0x19a14c),0x1c03ec9d);
 for(const[at,word]of [[0x4d420,0x8ec3],[0x4d4b8,0x86e5],[0x4c7ce,0x8660],[0x4c7d0,0x86a5]])assert.equal(ap.readUInt16LE(at),word);
 let fnv=2166136261;for(const c of ap.subarray(0x4d420,0x4d460))fnv=Math.imul(fnv^c,16777619)>>>0;
 const address=0x4d420+0x1bff187c;fs.writeFileSync(path.join(out,'direct-scale-r347.h'),`#define DIRECT_SCALE_ADDRESS UINT32_C(0x${address.toString(16)})\n#define DIRECT_SCALE_FUNCTION UINT32_C(0x${(address+1).toString(16)})\n#define DIRECT_SCALE_FNV UINT32_C(0x${fnv.toString(16)})\n`);bindings.zoom={address,fnv,first64Sha256:sha256(ap.subarray(0x4d420,0x4d460)),scale:306,unity:256,pivot:[160,100]};
 assert.equal(ap.readUInt32LE(0x19a150),0x3c18a060);assert.equal(ap.readUInt32LE(0x19a158),0x1c03edb5);assert.equal(ap.readUInt32LE(0x4d544),0x12c7f361);
 let ah=2166136261;for(const c of ap.subarray(0x4d538,0x4d578))ah=Math.imul(ah^c,16777619)>>>0;
 const aa=0x4d538+0x1bff187c;fs.appendFileSync(path.join(out,'direct-scale-r347.h'),`#define DIRECT_ALIAS_ADDRESS UINT32_C(0x${aa.toString(16)})\n#define DIRECT_ALIAS_FUNCTION UINT32_C(0x${(aa+1).toString(16)})\n#define DIRECT_ALIAS_FNV UINT32_C(0x${ah.toString(16)})\n`);bindings.antialias={address:aa,fnv:ah,first64Sha256:sha256(ap.subarray(0x4d538,0x4d578)),enabled:false};
 objects.push(path.join(root,'build/doom-rw4-libc/engine-libc.o'),path.join(root,'build/doom-rw4-bindings/bindings.o'),path.join(root,'build/direct-rw4-r342/direct-rw4-component.o'));
 const lib=path.join(tc,'lib/gcc/arm-none-eabi/14.3.1/thumb/v8-m.main/nofp/libgcc.a');assert.equal(sha256(fs.readFileSync(lib)),'4de693594a790a5f5004e6d5937a7ff9eec6df2c616b5d7a883a631bf3534dcd');libraries.push(lib);
}
objects.push(path.join(old,'direct-0.o'),path.join(old,'direct-1.o'));
const backend=s3?'experiments/doom-runtime-rw4/direct-wide-s3-r347.c':'doom/platform-rw4/device/direct-wide-r347.c',object=path.join(out,'wide.o');
run('arm-none-eabi-gcc',[...flags,'-c',backend,'-o',object],'compile-backend');objects.push(object);if(s3)objects.push(path.join(old,'direct-3.o'));
const baseline=path.join(out,'baseline.elf');run('arm-none-eabi-ld',['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...defs.filter(d=>!d.startsWith('--defsym=s3_scale=')&&!d.startsWith('--defsym=s3_antialias=')),...objects.map(p=>p===object?path.join(old,'direct-2.o'):p),'--start-group',...libraries,'--end-group','-o',baseline],'baseline-reproduction');assert.equal(sha256(fs.readFileSync(baseline)),sha256(oldElf));
const elf=path.join(out,'doom.elf');run('arm-none-eabi-ld',['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_doom_device_init',...defs,...objects,'--start-group',...libraries,'--end-group','-o',elf],'link');
const re=run('arm-none-eabi-readelf',['-W','-h','-A','-S','-s',elf],'review');assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(re));assert(!/Tag_ABI_VFP_args: VFP registers/.test(re));fs.writeFileSync(path.join(out,'readelf.txt'),re);
function allocated(b){let n=0;for(let i=0;i<b.readUInt16LE(48);i++){const p=b.readUInt32LE(32)+i*b.readUInt16LE(46);if(b.readUInt32LE(p+8)&2)n+=b.readUInt32LE(p+20)+Math.max(0,b.readUInt32LE(p+32)-1);}return n;}
const bytes=fs.readFileSync(elf),extra=allocated(bytes)-allocated(oldElf);assert(extra>=0&&extra<4096);
const result={checkpoint:'R347',mode,elfBytes:bytes.length,elfSha256:sha256(bytes),baselineSha256:sha256(oldElf),allocatedSectionBytesWithAlignment:allocated(bytes),extraStaticBytes:extra,bindings,scale:306,sourceSize:[320,200],approxDisplaySize:[382.5,239.0625],pixelBytes:512000,pngCodec:false,physicalDeploymentAuthorized:false,physicalTransport:false,unchangedObjectHashes:Object.fromEntries(objects.filter(p=>p!==object).map(p=>[path.relative(root,p),sha256(fs.readFileSync(p))])),sourceHashes:{...prior.sourceHashes,[backend]:sha256(fs.readFileSync(path.join(root,backend)))}};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({mode,elfBytes:bytes.length,sha256:result.elfSha256,extraStaticBytes:extra,physicalTransport:false}));
