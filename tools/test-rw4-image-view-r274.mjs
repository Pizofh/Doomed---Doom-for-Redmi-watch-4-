// Pure RW4 image view executed on owned S3 CPU; never its LVGL decoder or radio.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');guardEmulator();
const guest=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
if(sha256(guest)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('GuestChanged');
const tc=path.join(root,'tools/local/arm-14.3-review'),out=path.join(root,'artifacts/emulator/image-view-r274-'+Date.now());fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout+r.stderr;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const expected=Buffer.alloc(256004);expected.writeUInt32LE(4+320*1024+200*2097152);
const levels5=Array.from({length:32},(_,i)=>i*8+Math.floor(i/4)),levels6=Array.from({length:64},(_,i)=>i*4+Math.floor(i/16));
for(let i=0;i<64000;i++){
 const v=((i*97)^0xa55a)&65535,p=4+i*4;
 expected[p]=levels5[v%32];expected[p+1]=levels6[Math.floor(v/32)%64];expected[p+2]=levels5[Math.floor(v/2048)];expected[p+3]=255;
}
let fnv=2166136261;for(const c of expected)fnv=Math.imul(fnv^c,16777619)>>>0;
const flags=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4/device','-DEXPECTED_FNV='+fnv+'u'];
for(const [source,name]of [['doom/platform-rw4/device/image-view.c','image'],['experiments/doom-runtime-rw4/image-probe.c','probe']])run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',source,'-o',path.join(out,name+'.o')],name);
const ui=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ui/ui-review.json'))),printf=ui.bindings.find(b=>b.name==='printf')?.address;
if(ui.guestSha256!==sha256(guest)||!ui.contractReviewed||!printf)throw Error('S3BindingChanged');
const elf=path.join(out,'image-probe.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_image_probe_init','--defsym=host_printf='+printf,path.join(out,'probe.o'),path.join(out,'image.o'),'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',elf],'review'),bytes=fs.readFileSync(elf);
if(bytes.length>32768||bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('ElfReview');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const adb=(args,label)=>run(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],label),module='rw4image274',remote='/tmp/rw4-image-r274.elf';
if(adb(['shell','lsmod'],'before').includes(module)||!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',remote],'path-before')))throw Error('Preflight');
adb(['push',elf,remote],'push');const back=path.join(out,'readback.elf');adb(['pull',remote,back],'readback');if(sha256(bytes)!==sha256(fs.readFileSync(back)))throw Error('Readback');
const resultText=adb(['shell','insmod',remote,module],'run'),m=resultText.match(/RW4_IMAGE_R274: passed=1 checks=(\d+) bytes=256004 fnv=([a-f0-9]{8})/);
if(!m||m[2]!==fnv.toString(16).padStart(8,'0'))throw Error('CompletionAbsent:NoAutomaticCleanup');
adb(['shell','rmmod',module],'unload');if(adb(['shell','lsmod'],'after').includes(module))throw Error('UnloadUnconfirmed');adb(['shell','rm',remote],'remove');
const result={checkpoint:'R274',passed:true,checks:+m[1],encodedBytes:expected.length,fnv:m[2],expectedSha256:sha256(expected),elfSha256:sha256(bytes),codecSourceSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/image-view.c'))),nativeCExecuted:true,lvglDecoderTested:false,vfsCallbacksTested:false,rw4Executed:false,moduleRemoved:true,tempRemoved:true,physicalTransport:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
