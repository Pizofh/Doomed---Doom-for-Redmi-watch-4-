// Run only the previously reviewed S3 hello, not the ARMv8-M RW4 candidate.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorTestOnly');
const out=path.join(root,'artifacts/emulator/stdout-redirect-r211');
if(fs.existsSync(out))throw Error('ExistingReport');
const guestSha='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
const review=JSON.parse(fs.readFileSync(path.join(root,'build/hello-native/bound-review.json'),'utf8'));
const source=path.join(root,'build/hello-native/hello-bound.elf'),elf=fs.readFileSync(source);
if(!review.contractReviewed||review.guestSha256!==guestSha||review.sha256!==sha256(elf)||elf.length!==1020||
 sha256(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestSha)throw Error('GuestOrReviewedHelloChanged');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});
const top='/tmp/rw4-stdout-r211',module='rw4redir_r211';
const absence=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
const records=[];
function adb(args,label){
 const r=spawnSync(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
 records.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});
 fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');
 if(r.error||r.status!==0)throw Error('EmulatorOperationFailedInspectBeforeRetry');return r.stdout+r.stderr;
}
const before=adb(['shell','lsmod'],'before');
if(before.includes(module)||!absence(adb(['shell','ls',top],'absence')))throw Error('PreexistingState');
if(!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mount')))throw Error('NotTmpfs');
adb(['shell','mkdir',top],'mkdir');
const lua=`local rc = os.execute("insmod ${top}/hello.elf ${module} > ${top}/native.txt")\n`;
fs.writeFileSync(path.join(out,'test.lua'),lua,{flag:'wx'});
for(const [local,remote] of [[source,'hello.elf'],[path.join(out,'test.lua'),'test.lua']]){
 adb(['push',local,top+'/'+remote],'push-'+remote);
 const back=path.join(out,'readback-'+remote);adb(['pull',top+'/'+remote,back],'readback-'+remote);
 if(!fs.readFileSync(back).equals(fs.readFileSync(local)))throw Error('ReadbackChanged');
}
const output=adb(['shell','lua',top+'/test.lua'],'lua-real-s3-hello-redirect');
const registered=adb(['shell','lsmod'],'loaded').includes(module);
if(!registered)throw Error('ReviewedHelloNotRegistered');
// The synchronous command returned and this exact inert S3 hello owns no tasks.
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'after')!==before)throw Error('ModuleInventoryNotRestored');
const capture=path.join(out,'native.txt');adb(['pull',top+'/native.txt',capture],'capture');
const text=fs.readFileSync(capture,'utf8'),message='RW4 emulator: hello C';
for(const name of ['native.txt','test.lua','hello.elf'])adb(['shell','rm',top+'/'+name],'remove-'+name);
adb(['shell','rmdir',top],'rmdir');
if(!absence(adb(['shell','ls',top],'absence-after')))throw Error('ScratchRemains');
const report={checkpoint:'R211',guestScope:'S3 emulator',guestSha256:guestSha,helloSha256:review.sha256,
 capturedNativeMessage:text.includes(message),nativeMessageOnCallerOutput:output.includes(message),
 captureBytes:Buffer.byteLength(text),moduleUnloaded:true,moduleInventoryRestored:true,ownTmpfsFilesRemoved:true,
 rw4CandidateExecuted:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
