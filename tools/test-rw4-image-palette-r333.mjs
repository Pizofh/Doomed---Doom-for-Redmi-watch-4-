// Native C state-machine test on S3; OS/thread functions are simulated.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
import {imageCountersTransport} from './doom-image-counters-source-r325.mjs';
import {paletteTransport} from './doom-palette-source-r333.mjs';
const baseline=false,pngTransport=paletteTransport;
const realVfs=true;
if(process.argv.length!==2)throw Error('FixedTestOnly');guardEmulator();
const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));if(sha256(image)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa')throw Error('GuestChanged');
const out=path.join(root,'artifacts/emulator/'+(realVfs?'doom-image-palette-r333-'+(baseline?'baseline-':'candidate-'):'doom-transport-r272-')+Date.now()),tc=path.join(root,'tools/local/arm-14.3-review');fs.mkdirSync(out,{recursive:true});const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});logs.push({label,status:r.status,stdout:r.stdout??'',stderr:r.stderr??''});fs.writeFileSync(path.join(out,'log.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0)throw Error('StepFailed:'+label);return r.stdout+r.stderr;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'tools');
const flags=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4','-Idoom/platform-rw4/device',...(baseline?['-DBASELINE_R325']:[])];
const transport=path.join(out,'transport.c'),probe=path.join(out,'probe.c');fs.writeFileSync(transport,pngTransport());
let oldProbe=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/image-vfs-probe.c'),'utf8').replace('#include "image-view.h"','#include "palette-view-r333.h"').replace('static unsigned char bytes[8];','').replace('int rw4_host_owner_token(void){return 17;}','static int test_owner=17;int rw4_host_owner_token(void){return test_owner;}');
if(!baseline)oldProbe=oldProbe.replace('return 22;','return 0;').replace('size;return 22;','size;return 0;').replace('(void)p;return 22;','(void)p;return 0;').replace('(void)id;(void)a;(void)fn;(void)arg;return 22;','(void)a;*id=42;fn(arg);return 0;').replace('(void)id;(void)result;return 22;','(void)id;*result=NULL;return 0;');
const goldenFolders=fs.readdirSync(path.join(root,'artifacts/emulator')).filter(n=>n.startsWith('rw-png-palette-')).sort().reverse();
const goldenPath=goldenFolders.map(n=>path.join(root,'artifacts/emulator',n,'reference.png')).find(f=>fs.existsSync(f)&&sha256(fs.readFileSync(f))==='4b9c67b7b0990cb6364b28b6cb2d9dc2257f1f94f54f308dfe2fec5ebdd85afb');if(!goldenPath)throw Error('GoldenMissing');
let goldenFnv=2166136261;for(const x of fs.readFileSync(goldenPath))goldenFnv=Math.imul(goldenFnv^x,16777619)>>>0;
const body=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/image-palette-probe-r333.c'),'utf8').replaceAll('__EXPECTED_FNV__',String(goldenFnv));
const injected=pngTransport();fs.writeFileSync(transport,injected);
fs.writeFileSync(probe,oldProbe.slice(0,oldProbe.indexOf('int rw4_image_vfs_probe_init'))+body);
for(const [source,name]of [[transport,'transport'],['doom/platform-rw4/device/palette-view-r333.c','image'],[probe,'probe']])run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-Wno-misleading-indentation','-c',source,'-o',path.join(out,name+'.o')],name);
const ui=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ui/ui-review.json')));if(ui.guestSha256!==sha256(image)||!ui.contractReviewed)throw Error('S3ContractChanged');
const printf=ui.bindings.find(b=>b.name==='printf')?.address;if(!printf)throw Error('PrintfAbsent');
let bindings=['--defsym=host_printf='+printf];
if(realVfs){
 const names=['printf','register_driver','unregister_driver','fopen','fclose','fread','fseek','ftell','setvbuf','feof','clearerr','lv_image_decoder_get_info','lv_image_decoder_open','lv_image_decoder_close'],symbols=new Map(),sh=image.readUInt32LE(32),stride=image.readUInt16LE(46),count=image.readUInt16LE(48);
 for(let i=0;i<count;i++){
  const p=sh+i*stride;if(image.readUInt32LE(p+4)!==2)continue;
  const off=image.readUInt32LE(p+16),size=image.readUInt32LE(p+20),q=sh+image.readUInt32LE(p+24)*stride,strings=image.subarray(image.readUInt32LE(q+16),image.readUInt32LE(q+16)+image.readUInt32LE(q+20));
  for(let a=off;a<off+size;a+=16){if((image[a+12]&15)!==2||!image.readUInt16LE(a+14))continue;const n=image.readUInt32LE(a);symbols.set(strings.toString('ascii',n,strings.indexOf(0,n)),image.readUInt32LE(a+4));}
 }
 bindings=names.map(n=>{const v=symbols.get(n);if(!v)throw Error('HostFunctionAbsent:'+n);return '--defsym=host_'+(n==='register_driver'?'register':n==='unregister_driver'?'unregister':n)+'='+v;});
}
const elf=path.join(out,'probe.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e',realVfs?'rw4_image_vfs_probe_init':'rw4_transport_probe_init',...bindings,path.join(out,'probe.o'),path.join(out,'transport.o'),path.join(out,'image.o'),'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-s','-r',elf],'review'),bytes=fs.readFileSync(elf);
if(bytes.length>65536||bytes.readUInt16LE(16)!==1||!(bytes.readUInt32LE(24)&1)||/\bUND[ \t]+\S+[ \t]*$/m.test(re)||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('ElfReview');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const adb=(args,label)=>run(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],label),module=realVfs?'rw4pngr333':'rw4transport272',remote=realVfs?'/tmp/rw4-image-counters-r333.elf':'/tmp/rw4-transport-r272.elf';
if(adb(['shell','lsmod'],'before').includes(module)||!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',remote],'path-before')))throw Error('Preflight');
const nodes=['/dev/rw4doomctl','/dev/rw4doomframe','/dev/rw4doomimage.png'];
if(realVfs)for(const [i,node]of nodes.entries())if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',node],'node-before-'+i)))throw Error('NodeAlreadyPresent');
const references=fs.readdirSync(path.join(root,'artifacts/emulator')).filter(n=>n.startsWith('rw-png-palette-')).sort().reverse();
const reference=references.map(n=>path.join(root,'artifacts/emulator',n,'reference.png')).find(f=>fs.existsSync(f)&&sha256(fs.readFileSync(f))==='4b9c67b7b0990cb6364b28b6cb2d9dc2257f1f94f54f308dfe2fec5ebdd85afb');if(!reference)throw Error('ReferenceMissing');
adb(['push',reference,'/tmp/rw4-png-reference-r333.png'],'reference');
adb(['push',elf,remote],'push');const back=path.join(out,'readback.elf');adb(['pull',remote,back],'readback');if(sha256(bytes)!==sha256(fs.readFileSync(back)))throw Error('Readback');
const output=adb(['shell','insmod',remote,module],'run'),m=output.match(realVfs?/RW4_IMAGE_VFS_R274: passed=1 checks=(\d+) realVfs=1/:/RW4_TRANSPORT_R272: passed=1 checks=(\d+)/);
if(!m)throw Error('CompletionAbsent:NoAutomaticCleanup');
adb(['shell','rmmod',module],'unload');if(adb(['shell','lsmod'],'after').includes(module))throw Error('UnloadUnconfirmed');adb(['shell','rm',remote],'remove');
adb(['shell','rm','/tmp/rw4-png-reference-r333.png'],'remove-reference');


if(realVfs)for(const [i,node]of nodes.entries())if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',node],'node-after-'+i)))throw Error('NodeRemains');
const result={checkpoint:'R333',baselineReproduction:baseline,codecSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/palette-view-r333.c'))),passed:true,checks:+m[1],elfSha256:sha256(bytes),transportSourceSha256:sha256(injected),baseTransportSha256:sha256(pngTransport()),faultInjected:false,fullReadComparedWithGolden:true,explicitReservationTested:!baseline,nonDestructiveReadyCheckTested:true,noImageReadOnPending:!baseline,missingCloseBranchModeled:baseline,actualS3InfoWithHeldReaderTested:false,overlappingReaderPositionsTested:!baseline,readerLimitAndUnloadGuardTested:false,nativeCExecuted:true,kernelAndWorkerSimulated:!realVfs,workerSimulated:true,realVfsTested:realVfs,realThreadsTested:false,realDoomTested:false,lvglDecoderTested:true,actualS3IndexedDecoderOpened:true,decoderScope:"S3 real VFS/stdio, explicit reservation or historical produced/no-READY reproduction; S3 indexed decoder actually opened; no RW4 decoder execution",decodedPixelsInspected:false,moduleRemoved:true,tempRemoved:true,rw4Executed:false,physicalTransport:false};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');fs.mkdirSync(path.join(root,'artifacts/research/image-palette-r333'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/research/image-palette-r333/'+(baseline?'baseline':'candidate')+'-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

