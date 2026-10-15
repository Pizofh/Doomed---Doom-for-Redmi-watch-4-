// Native C state-machine test on S3; OS/thread functions are simulated.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');guardEmulator();
const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));if(sha256(image)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('GuestChanged');
const out=path.join(root,'artifacts/emulator/doom-transport-r272-'+Date.now()),tc=path.join(root,'tools/local/arm-14.3-review');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout+r.stderr;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const flags=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device'];
for(const [source,name]of [['doom/platform-rw4/device/transport.c','transport'],['experiments/doom-runtime-rw4/transport-probe.c','probe']])run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',source,'-o',path.join(out,name+'.o')],name);
const ui=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ui/ui-review.json')));if(ui.guestSha256!==sha256(image)||!ui.contractReviewed)throw Error('S3ContractChanged');
const printf=ui.bindings.find(b=>b.name==='printf')?.address;if(!printf)throw Error('PrintfAbsent');
const elf=path.join(out,'probe.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_transport_probe_init','--defsym=host_printf='+printf,path.join(out,'probe.o'),path.join(out,'transport.o'),'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-s','-r',elf],'review'),bytes=fs.readFileSync(elf);
if(bytes.length>65536||bytes.readUInt16LE(16)!==1||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('ElfReview');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const adb=(args,label)=>run(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],label),module='rw4transport272',remote='/tmp/rw4-transport-r272.elf';
if(adb(['shell','lsmod'],'before').includes(module)||!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',remote],'path-before')))throw Error('Preflight');
adb(['push',elf,remote],'push');const back=path.join(out,'readback.elf');adb(['pull',remote,back],'readback');if(sha256(bytes)!==sha256(fs.readFileSync(back)))throw Error('Readback');
const output=adb(['shell','insmod',remote,module],'run'),m=output.match(/RW4_TRANSPORT_R272: passed=1 checks=(\d+)/);
if(!m)throw Error('CompletionAbsent:NoAutomaticCleanup');
adb(['shell','rmmod',module],'unload');if(adb(['shell','lsmod'],'after').includes(module))throw Error('UnloadUnconfirmed');adb(['shell','rm',remote],'remove');
const result={checkpoint:'R272',passed:true,checks:+m[1],elfSha256:sha256(bytes),transportSourceSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/transport.c'))),nativeCExecuted:true,kernelAndWorkerSimulated:true,realThreadsTested:false,realDoomTested:false,moduleRemoved:true,tempRemoved:true,rw4Executed:false,physicalTransport:false};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
