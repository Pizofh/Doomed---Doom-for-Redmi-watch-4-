// Private libc tests using S3 bindings, never RW4 ELF, USB or physical radio.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
if(sha256(image)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('GuestChanged');guardEmulator();
const out=path.join(root,'artifacts/emulator/doom-libc-r272-'+Date.now()),tc=path.join(root,'tools/local/arm-14.3-review');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout+r.stderr;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const target=['-march=armv7-a','-mthumb','-mfloat-abi=soft'];
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4'];
const hosts=['malloc','free','fopen','fclose','fread','fseek','ftell','feof','ferror','clearerr'];
const prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-engine/runtime-review.json'))),raw=path.join(root,'build/doom-rw4-engine/runtime-device.c');if(prior.runtimeSourceSha256!==sha256(fs.readFileSync(raw)))throw Error('RuntimeChanged');
run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,...hosts.map(n=>'-D'+n+'=rw4_host_'+n),'-Dnxsched_gettid=rw4_host_gettid','-c',raw,'-o',path.join(out,'runtime.o')],'runtime');
for(const [src,name]of [['doom/platform-rw4/device/libc-glue.c','glue'],['doom/platform-rw4/device/jump.S','jump']])run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',src,'-o',path.join(out,name+'.o')],name);
const libraries=['libc.a','libm.a','libgcc.a'].map(name=>{
 const file=run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...target,'-print-file-name='+name],name).trim();
 if(!path.resolve(file).toLowerCase().startsWith(path.resolve(tc).toLowerCase()+path.sep)||!/[\\/]thumb[\\/]v7-a[\\/]nofp[\\/]/i.test(file))throw Error('WrongLibrary');return {name,file,sha256:sha256(fs.readFileSync(file))};
});
const libraryPins=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/device/newlib.lock.json'))).emulator;
if(libraries.some(l=>libraryPins[l.name]!==l.sha256))throw Error('ReviewedEmulatorLibraryChanged');
const symbols=new Map(),sh=image.readUInt32LE(32),stride=image.readUInt16LE(46),count=image.readUInt16LE(48);
for(let i=0;i<count;i++){const p=sh+i*stride;if(image.readUInt32LE(p+4)!==2)continue;const off=image.readUInt32LE(p+16),size=image.readUInt32LE(p+20),q=sh+image.readUInt32LE(p+24)*stride,strings=image.subarray(image.readUInt32LE(q+16),image.readUInt32LE(q+16)+image.readUInt32LE(q+20));for(let a=off;a<off+size;a+=16){if((image[a+12]&15)!==2||!image.readUInt16LE(a+14))continue;const n=image.readUInt32LE(a);symbols.set(strings.toString('ascii',n,strings.indexOf(0,n)),image.readUInt32LE(a+4));}}
const bindingNames=hosts.map(n=>['rw4_host_'+n,n]).concat([['rw4_host_gettid','nxsched_gettid'],['host_printf','printf']]);
const bindings=bindingNames.map(([local,guest])=>{const address=symbols.get(guest);if(!address)throw Error('BindingAbsent');return {local,guest,address};});
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const adb=(args,label)=>run(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],label);
const fixture='/tmp/rw4-libc-r272.bin',module='rw4libc272',remote='/tmp/rw4-libc-r272.elf',absent=s=>/^nsh: ls: stat failed: 2\r?$/im.test(s);
if(adb(['shell','lsmod'],'modules-before').includes(module)||!absent(adb(['shell','ls',fixture],'fixture-before'))||!absent(adb(['shell','ls',remote],'elf-before'))||!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mounts')))throw Error('Preflight');
const fixtureLocal=path.join(out,'fixture.bin');fs.writeFileSync(fixtureLocal,Buffer.from([3,4,5,6,7,8,9]));adb(['push',fixtureLocal,fixture],'fixture');
const results=[];
for(const mode of [0,1]){
 run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-DPROBE_OOM='+mode,'-c','experiments/doom-runtime-rw4/libc-probe.c','-o',path.join(out,'probe.o')],'compile-'+mode);
 const elf=path.join(out,'probe-'+mode+'.elf');
 run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/device/module.ld','-e','rw4_libc_probe_init',...bindings.map(b=>'--defsym='+b.local+'='+b.address),...['probe','runtime','glue','jump'].map(n=>path.join(out,n+'.o')),'--start-group',...libraries.map(l=>l.file),'--end-group','-o',elf],'link-'+mode);
 const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-s','-r',elf],'review-'+mode),bytes=fs.readFileSync(elf);
 // Pinned S3 up_relocate types47/48 share MOVW/MOVT handler0x65c83a;
 // reviewed independently before admitting library-generated relocations.
 if(bytes.readUInt16LE(16)!==1||bytes.readUInt16LE(18)!==40||!(bytes.readUInt32LE(24)&1)||bytes.length>262144||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL','R_ARM_THM_JUMP24','R_ARM_THM_MOVW_ABS_NC','R_ARM_THM_MOVT_ABS'].includes(m[0])))throw Error('ElfReview');
 adb(['push',elf,remote],'push-'+mode);const back=path.join(out,'readback-'+mode+'.elf');adb(['pull',remote,back],'readback-'+mode);if(sha256(bytes)!==sha256(fs.readFileSync(back)))throw Error('Readback');
 const text=adb(['shell','insmod',remote,module],'run-'+mode),m=text.match(/RW4_LIBC_R272: case=(\d+) checks=(\d+) rc=(\d+) blocks=0 streams=0 alloc=(\d+) free=(\d+) peak=(\d+) ok=([01])/);
 if(!m)throw Error('CompletionAbsent:NoAutomaticCleanup');
 adb(['shell','rmmod',module],'unload-'+mode);if(adb(['shell','lsmod'],'modules-'+mode).includes(module))throw Error('UnloadUnconfirmed');
 adb(['shell','rm',remote],'remove-'+mode);
 results.push({mode,checks:+m[2],reason:+m[3],allocated:+m[4],freed:+m[5],peak:+m[6],passed:m[7]==='1',elfSha256:sha256(bytes)});
 if(m[7]!=='1')break;
}
const after=path.join(out,'fixture-after.bin');adb(['pull',fixture,after],'fixture-after');const unchanged=sha256(fs.readFileSync(after))===sha256(fs.readFileSync(fixtureLocal));adb(['shell','rm',fixture],'remove-fixture');
const result={checkpoint:'R272',passed:results.length===2&&results.every(r=>r.passed)&&unchanged,cases:results,fixtureUnchanged:unchanged,libraries:libraries.map(({name,sha256})=>({name,sha256})),privateNewlib:true,guest:'S3 PC emulator',rw4Executed:false,physicalTransport:false};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(!result.passed)throw Error('ProbeFailed');
