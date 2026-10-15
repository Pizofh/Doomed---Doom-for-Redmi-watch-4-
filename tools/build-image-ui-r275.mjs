// PC-only fixture, same transport and an explicit S3 image-header adapter.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedBuildOnly');
const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
if(sha256(image)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('GuestChanged');
const out=path.join(root,'build/image-ui-r275'),tc=path.join(root,'tools/local/arm-14.3-review');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout;}
try{
 run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
 const inputs=['doom/platform-rw4/device/transport.c','doom/platform-rw4/device/image-view.c','experiments/doom-runtime-rw4/image-ui-probe.c'];
 const flags=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-DRW4_IMAGE_S3_TEST','-Idoom/platform-rw4','-Idoom/platform-rw4/device'];
 const objects=inputs.map((p,i)=>{const o=path.join(out,'source-'+i+'.o');run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',p,'-o',o],'compile-'+i);return o;});
 const symbols=new Map(),sh=image.readUInt32LE(32),stride=image.readUInt16LE(46),count=image.readUInt16LE(48);
 for(let i=0;i<count;i++){const p=sh+i*stride;if(image.readUInt32LE(p+4)!==2)continue;const off=image.readUInt32LE(p+16),size=image.readUInt32LE(p+20),q=sh+image.readUInt32LE(p+24)*stride,strings=image.subarray(image.readUInt32LE(q+16),image.readUInt32LE(q+16)+image.readUInt32LE(q+20));for(let a=off;a<off+size;a+=16){if((image[a+12]&15)!==2||!image.readUInt16LE(a+14))continue;const n=image.readUInt32LE(a);symbols.set(strings.toString('ascii',n,strings.indexOf(0,n)),image.readUInt32LE(a+4));}}
 const names={host_register:'register_driver',host_unregister:'unregister_driver',host_owner:'nxsched_gettid',host_image_drop:'lv_image_cache_drop',host_header_drop:'lv_image_header_cache_drop'};
 const bindings=Object.entries(names).map(([local,name])=>{const address=symbols.get(name);if(!address)throw Error('MissingSymbol:'+name);return {local,name,address};});
 const elf=path.join(out,'image-ui.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_image_ui_probe_init',...bindings.map(b=>'--defsym='+b.local+'='+b.address),...objects,'-o',elf],'link');
 const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',elf],'review');fs.writeFileSync(path.join(out,'readelf.txt'),re);const bytes=fs.readFileSync(elf);
 if(bytes.length>65536||bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('ElfContract');
 const sourceHashes=Object.fromEntries([...inputs,'doom/platform-rw4/device/platform.h','doom/platform-rw4/device/image-view.h','doom/platform-rw4/runtime.h','experiments/doom-runtime-rw4/image-ui.lua'].map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))]));
 const result={checkpoint:'R275',elfSha256:sha256(bytes),elfBytes:bytes.length,guestSha256:sha256(image),bindings,sourceHashes,s3FormatAdapter:true,synchronousFakeWorker:true,doomIncluded:false,physicalTransport:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');}
