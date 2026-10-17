// One bounded decoder comparison on owned S3 only. No new watch package.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-palette-source-r333.mjs';import {packageRoot} from './verify-emulator.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');const s=session('direct-decoder'),tc=path.join(root,'tools/local/arm-14.3-review');
const b=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')),symbols=new Map();
for(let i=0;i<b.readUInt16LE(48);i++){const p=b.readUInt32LE(32)+i*b.readUInt16LE(46);if(b.readUInt32LE(p+4)!==2)continue;const q=b.readUInt32LE(32)+b.readUInt32LE(p+24)*b.readUInt16LE(46),strings=b.subarray(b.readUInt32LE(q+16),b.readUInt32LE(q+16)+b.readUInt32LE(q+20));for(let at=b.readUInt32LE(p+16),end=at+b.readUInt32LE(p+20);at<end;at+=16){const n=b.readUInt32LE(at);if((b[at+12]&15)===2&&b.readUInt16LE(at+14))symbols.set(strings.toString('ascii',n,strings.indexOf(0,n)),b.readUInt32LE(at+4));}}
const names={host_printf:'printf',host_info:'lv_image_decoder_get_info',host_open:'lv_image_decoder_open',host_close:'lv_image_decoder_close',host_drop:'lv_image_cache_drop',host_header_drop:'lv_image_header_cache_drop',host_clock:'clock_gettime'};
const bindings=Object.entries(names).map(([local,name])=>{const addr=symbols.get(name);if(!addr)throw Error('MissingSymbol');return '--defsym='+local+'='+addr;});
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576});fs.writeFileSync(path.join(s.folder,label+'.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr}));if(r.status||r.error)throw Error('StepFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const object=path.join(s.folder,'probe.o'),elf=path.join(s.folder,'probe.elf');run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-c','experiments/doom-runtime-rw4/direct-decoder-probe-r339.c','-o',object],'compile');
run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','direct_probe_init',...bindings,object,'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-s','-r',elf],'review');if(/\bUND[ \t]+\S+[ \t]*$/m.test(re))throw Error('ImportsRemain');
const remote='/tmp/rw4-direct-probe-r339.elf',reference='/tmp/rw4-direct-reference-r339.png',module='rw4direct339';
const before=s.adb(['shell','lsmod'],'before');if(before.includes(module))throw Error('ModulePresent');
for(const p of [remote,reference])if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',p],'absence')))throw Error('Collision');
const golden=fs.readdirSync(path.join(root,'artifacts/emulator')).filter(n=>n.startsWith('rw-png-palette-')).sort().reverse().map(n=>path.join(root,'artifacts/emulator',n,'reference.png')).find(f=>fs.existsSync(f)&&sha256(fs.readFileSync(f))==='4b9c67b7b0990cb6364b28b6cb2d9dc2257f1f94f54f308dfe2fec5ebdd85afb');if(!golden)throw Error('ReferenceAbsent');
s.adb(['push',elf,remote],'push-probe');s.adb(['push',golden,reference],'push-reference');
const text=s.adb(['shell','insmod',remote,module],'run'),m=text.match(/DIRECT_R339 passed=1 checks=(\d+) direct_us=(\d+) png_us=(\d+) cycles=12/);
if(!m)throw Error('NoCompletionInspectOwnEmulator');
s.adb(['shell','rmmod',module],'unload');if(s.adb(['shell','lsmod'],'after')!==before)throw Error('InventoryChanged');
for(const p of [remote,reference])s.adb(['shell','rm',p],'remove-own-file');
const result={checkpoint:'R339',passed:true,checks:+m[1],cycles:12,directDecodeUs:+m[2],filePngDecodeUs:+m[3],descriptorReused:true,realS3Decoder:true,decodedPixelsInspected:false,widgetsOrGpuTested:false,rw4Executed:false,physicalTransport:false};fs.mkdirSync(path.join(root,'artifacts/research/direct-decoder-r339'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/research/direct-decoder-r339/result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
