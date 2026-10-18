// Execute the shared C core on owned S3; host graphics/scheduler are simulated.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-palette-source-r333.mjs';import {packageRoot} from './verify-emulator.mjs';import {session} from './doom-ui-emulator.mjs';
const detach=process.argv[2]==='--detach-r368';
if(process.argv.length!==2&&!(process.argv.length===3&&detach))throw Error('FixedTest');const s=session('direct-view-tests'),tc=path.join(root,'tools/local/arm-14.3-review');
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:4194304});fs.writeFileSync(path.join(s.folder,label+'.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr}));if(r.error||r.status)throw Error('StepFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const guest=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));if(sha256(guest)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('Guest');
const symbols=new Map();for(let i=0;i<guest.readUInt16LE(48);i++){const p=guest.readUInt32LE(32)+i*guest.readUInt16LE(46);if(guest.readUInt32LE(p+4)!==2)continue;const q=guest.readUInt32LE(32)+guest.readUInt32LE(p+24)*guest.readUInt16LE(46),str=guest.subarray(guest.readUInt32LE(q+16),guest.readUInt32LE(q+16)+guest.readUInt32LE(q+20));for(let a=guest.readUInt32LE(p+16),e=a+guest.readUInt32LE(p+20);a<e;a+=16){const n=guest.readUInt32LE(a);if((guest[a+12]&15)===2&&guest.readUInt16LE(a+14))symbols.set(str.toString('ascii',n,str.indexOf(0,n)),guest.readUInt32LE(a+4));}}
const printf=symbols.get('printf');if(!printf)throw Error('Printf');
const inputs=['doom/platform-rw4/device/direct-view-r342.c',...(detach?['doom/platform-rw4/device/direct-detach-r368.c']:[]),'experiments/doom-runtime-rw4/'+(detach?'direct-detach-tests-r368.c':'direct-view-tests-r342.c')],objects=[];
for(const [i,source]of inputs.entries()){const object=path.join(s.folder,i+'.o');objects.push(object);run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4/device','-c',source,'-o',object],'compile-'+i);}
const elf=path.join(s.folder,'direct-tests.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','direct_tests_init','--defsym=test_printf='+printf,...objects,'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-s','-r',elf],'elf');if(/\bUND[ \t]+\S+[ \t]*$/m.test(re))throw Error('ImportsRemain');
const module='rw4direct342tests',remote='/tmp/rw4-direct-tests-r342.elf',absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t);
const prior=s.adb(['shell','lsmod'],'before');if(prior.includes(module)||!absent(s.adb(['shell','ls',remote],'absence')))throw Error('Collision');
s.adb(['push',elf,remote],'push');const text=s.adb(['shell','insmod',remote,module],'execute');
const m=text.match(new RegExp('DIRECT_R'+(detach?'368':'342')+' PASS checks=(\\d+) scenarios=(\\d+) compared_pixels=(\\d+) physical=0 graphics=modeled'));
if(!m)throw Error('TestsFailedInspectOwnGuest');s.adb(['shell','rmmod',module],'unload');if(s.adb(['shell','lsmod'],'after')!==prior)throw Error('ModuleInventoryChanged');s.adb(['shell','rm',remote],'remove-own');
const result={checkpoint:detach?'R368':'R342',passed:true,checks:+m[1],scenarios:+m[2],comparedPixels:+m[3],nativeCExecuted:true,hostGraphics:'modeled',realThreads:false,rw4Executed:false,physicalTransport:false,moduleRemoved:true,sourceHashes:Object.fromEntries(inputs.map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))]))};
const output=path.join(root,'artifacts/research',detach?'direct-detach-r368':'direct-view-r342');
fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
