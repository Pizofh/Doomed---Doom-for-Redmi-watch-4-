// Execute ONLY the S3-specific build in the owned loopback guest, never RW4 ELF.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {sha256} from './first-c-source.mjs';
import {verifyFrame,adlerParts} from './frame-pattern-r218.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorOnly');
const out=path.join(root,'artifacts/emulator/frames-c-r218'),top='/tmp/rw4frames-r218',module='s3framesr218';
if(fs.existsSync(out))throw Error('ExistingReport');
const review=JSON.parse(fs.readFileSync(path.join(root,'build/hello-native-rw4/r218-s3/review.json'),'utf8'));
const elf=fs.readFileSync(path.join(root,'build/hello-native-rw4/r218-s3/frames.elf'));
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(review.scope!=='s3'||review.imageSha256!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa'||review.elfSha256!==sha256(elf)||review.sourceSha256!==sha256(fs.readFileSync(path.join(root,'experiments/hello-native-rw4/frames-r218.c')))||sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('BuildOrAdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});
const records=[];
function adb(args,label){const r=spawnSync(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorOperationFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
const before=adb(['shell','lsmod'],'modules-before');
if(before.includes(module)||!absent(adb(['shell','ls',top],'absence'))||!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mount')))throw Error('GuestPreflight');
adb(['shell','mkdir',top],'mkdir');
fs.writeFileSync(path.join(out,'marker.txt'),'RW4-FRAMES-R218\n',{flag:'wx'});
for(const [file,name] of [[path.join(root,'build/hello-native-rw4/r218-s3/frames.elf'),'frames.elf'],[path.join(out,'marker.txt'),'frames-attempt-r218.txt']])adb(['push',file,top+'/'+name],'push-'+name);
adb(['shell','insmod',top+'/frames.elf',module],'run-s3-native');
const loaded=adb(['shell','lsmod'],'registered');
if(!loaded.split(/\r?\n/).some(line=>line.trim().split(/\s+/)[0]===module))throw Error('NativeInitNotRegistered');
// Synchronous init, no tasks or retained callbacks; retire before PNG validation.
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after')!==before)throw Error('ModuleInventoryChanged');
const frames=[];
for(let phase=0;phase<4;phase++){const name=`frame${phase}-r218.png`,file=path.join(out,name);adb(['pull',top+'/'+name,file],'pull-'+name);const bytes=fs.readFileSync(file);verifyFrame(bytes,phase);frames.push({phase,size:bytes.length,sha256:sha256(bytes),adlerParts:adlerParts(bytes)});}
for(const name of ['frames.elf','frames-attempt-r218.txt',...frames.map(f=>`frame${f.phase}-r218.png`)])adb(['shell','rm',top+'/'+name],'remove-'+name);
adb(['shell','rmdir',top],'rmdir');if(!absent(adb(['shell','ls',top],'absence-after')))throw Error('ScratchRemains');
const report={checkpoint:'R218',scope:'S3 emulator only',s3NativeModuleExecuted:true,rw4NativeModuleExecuted:false,sourceSha256:review.sourceSha256,elfSha256:review.elfSha256,frames,pixelAndPngCrcAndZlibVerified:true,moduleInventoryRestored:true,ownTmpfsFilesRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
