// Fixed PC emulator test. Never selects USB or the physical-watch transport.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const guestSha='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(sha256(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestSha)throw Error('GuestChanged');
guardEmulator();
const tc=path.join(root,'tools/local/arm-14.3-review'),out=path.join(root,'artifacts/emulator/doom-jump-r271-'+Date.now());fs.mkdirSync(out,{recursive:true});
const logs=[];
function run(exe,args,label,timeout=20000){
 const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout,maxBuffer:1024*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
 logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');
 if(r.error||r.status!==0)throw Error('TestStepFailed:'+label);return r.stdout+r.stderr;
}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'reviewed-tools');
const args=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-Os','-std=c17','-ffreestanding','-fno-builtin','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror'];
const source='experiments/doom-runtime-rw4/jump-probe.c',jump='doom/platform-rw4/device/jump.S';
run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...args,'-c',source,'-o',path.join(out,'probe.o')],'compile');
run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...args,'-c',jump,'-o',path.join(out,'jump.o')],'assemble');
const ui=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ui/ui-review.json')));
if(ui.guestSha256!==guestSha||!ui.contractReviewed)throw Error('PriorS3ContractChanged');
const printf=ui.bindings.find(b=>b.name==='printf')?.address;if(!printf)throw Error('ReviewedPrintfAbsent');
const elf=path.join(out,'jump.elf');
run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_jump_probe_init','--defsym=printf='+printf,path.join(out,'probe.o'),path.join(out,'jump.o'),'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',elf],'elf-review'),bytes=fs.readFileSync(elf);
if(bytes.length>8192||bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('UnexpectedElf');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const adb=(args,label)=>run(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],label);
const remote='/tmp/rw4-jump-r271.elf',module='rw4jump271';
if(adb(['shell','lsmod'],'modules-before').includes(module)||!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',remote],'path-before'))||!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mounts')))throw Error('GuestPreflight');
adb(['push',elf,remote],'push');
const back=path.join(out,'readback.elf');adb(['pull',remote,back],'readback');if(sha256(fs.readFileSync(back))!==sha256(bytes))throw Error('ReadbackMismatch');
const output=adb(['shell','insmod',remote,module],'run');
// No timeout cleanup: a timed-out client is not evidence that native execution stopped.
if(!/RW4_JUMP_R271: nonzero=([01]) zero=([01]) touched=24/.test(output))throw Error('CompletionAbsent');
const passed=/RW4_JUMP_R271: nonzero=1 zero=1 touched=24/.test(output);
adb(['shell','rmmod',module],'unload');if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('UnloadUnconfirmed');
adb(['shell','rm',remote],'remove');if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',remote],'path-after')))throw Error('RemovalUnconfirmed');
const result={checkpoint:'R271',passed,guest:'S3 PC emulator',guestSha256:guestSha,elfSha256:sha256(bytes),jumpSourceSha256:sha256(fs.readFileSync(path.join(root,jump))),probeSourceSha256:sha256(fs.readFileSync(path.join(root,source))),nonzeroReturn:passed,zeroBecomesOne:passed,nestedStackReturn:passed,moduleRemoved:true,tempRemoved:true,rw4Executed:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(!passed)throw Error('JumpTestFailed');
