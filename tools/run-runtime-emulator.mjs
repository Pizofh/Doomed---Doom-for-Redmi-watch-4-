// One finite runtime contract test, fixed reviewed PC guest and loopback only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('No arbitrary target/file accepted');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(digest(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest changed');
const source=path.join(projectRoot,'build/native-runtime/runtime.elf'),binary=fs.readFileSync(source);
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-runtime/runtime-review.json')));
const sourceHash=digest(['experiments/native-runtime/runtime-probe.c','doom/platform-rw4/runtime.c','doom/platform-rw4/runtime.h','doom/platform-rw4/module.ld']
  .map(p=>fs.readFileSync(path.join(projectRoot,p),'utf8').replace(/\r\n/g,'\n')).join('\n'));
if(!review.contractReviewed||review.guestSha256!==guestHash||review.sha256!==digest(binary)||
   review.sha256!=='6fe5f39f45e9dcc7ffe28d97d51acd083a1a1806ba751be41218dadde529887a'||
   review.sourceSha256!==sourceHash)throw Error('Source/ELF review mismatch');
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/native-runtime-'+Date.now());fs.mkdirSync(folder);
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(digest(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('ADB changed');
const target=['-H','127.0.0.1','-P','5039','-s','emulator-5554'];
function adb(args,label,timeout=15000){
  const r=spawnSync(adbExe,[...target,...args],{shell:false,windowsHide:true,encoding:'utf8',timeout,maxBuffer:65536,
    env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label+'; client timeout cannot stop guest C');return r.stdout+r.stderr;
}
const module='rw4runtime',elf='/tmp/rw4-runtime-probe.elf',file='/tmp/rw4-runtime-fixture.bin';
const absence=s=>/^nsh: ls: stat failed: 2\r?$/im.test(s);
if(/\brw4[a-z0-9_]*\b/i.test(adb(['shell','lsmod'],'modules-before')))throw Error('Own native module already loaded');
for(const [i,f]of[elf,file].entries())if(!absence(adb(['shell','ls',f],'absence-'+i)))throw Error('Own temp path already exists');
if(!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mounts')))throw Error('/tmp is not the reviewed tmpfs');
adb(['shell','free'],'memory-before');
const fixture=Buffer.from([3,4,5,6,7,8,9]),fixturePath=path.join(folder,'fixture.bin');fs.writeFileSync(fixturePath,fixture);
adb(['push',source,elf],'push-elf');adb(['push',fixturePath,file],'push-fixture');
for(const [label,f,h]of[['elf',elf,digest(binary)],['fixture',file,digest(fixture)]]){
  const back=path.join(folder,'readback-'+label+'.bin');adb(['pull',f,back],'readback-'+label);
  if(digest(fs.readFileSync(back))!==h)throw Error('Readback differs; not loading');
}
const output=adb(['shell','insmod',elf,module],'insmod',20000);
// Do not unload after a timeout or absent join marker. Busy uninit remains installed.
const joined=output.match(/RW4_RUNTIME: joined tid=(\d+) rc=0 value=34650008 done=1 failed=0/);
if(!joined||output.includes('join_failed_retained'))throw Error('Successful join/completion absent; inspect before cleanup');
if(!adb(['shell','lsmod'],'modules-loaded').includes(module))throw Error('Initializer did not register successfully');
const rows=[...output.matchAll(/RW4_RUNTIME: cycle=(\d+) rc=(\d+) owner=(\d+) reason=(\d+) code=(\d+) blocks=0 bytes=0 streams=0 alloc=(\d+) free=(\d+) open=1 close=1 denied=7 peak=137 error=0 ok=1/g)];
const reasons=[0,2,3,1,4,5,4,0],codes=[0,0,7,0,12,22,12,0];
const cyclesPassed=rows.length===8&&rows.every((m,i)=>+m[1]===i&&+m[2]===reasons[i]&&m[3]===joined[1]&&+m[4]===reasons[i]&&+m[5]===codes[i]&&+m[6]===3&&m[6]===m[7]);
const after=path.join(folder,'fixture-after.bin');adb(['pull',file,after],'fixture-after');
const unchanged=digest(fs.readFileSync(after))===digest(fixture);
// Joined worker has returned and no retained callbacks/resources remain.
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('Module still loaded');
for(const [i,f]of[elf,file].entries()){
  adb(['shell','rm',f],'remove-'+i);
  if(!absence(adb(['shell','ls',f],'removed-'+i)))throw Error('Own temp remains');
}
adb(['shell','free'],'memory-after');const ps=adb(['shell','ps'],'processes-after');
const workerAbsent=!ps.split(/\r?\n/).some(l=>new RegExp('^\\s*'+joined[1]+'\\s').test(l));
const result={passed:cyclesPassed&&unchanged&&workerAbsent,folder,guestSha256:guestHash,binarySha256:digest(binary),
  workerTid:+joined[1],cycles:rows.length,cyclesPassed,fixtureUnchanged:unchanged,workerJoined:true,workerAbsent,
  remainingOwnedBlocks:0,remainingOwnedStreams:0,peakTrackedBytes:137,allocationBudget:4096,
  normalReturn:true,explicitQuit:true,fatalExit:true,cooperativeStop:true,allocationOverflow:true,allocationLimit:true,invalidFree:true,doubleCloseRejected:true,
  moduleUnloaded:true,temporaryFilesRemoved:true,rebootRequired:false,
  uiActivityValidated:false,externalStopValidated:false,doomExecuted:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!result.passed)throw Error('Runtime checkpoint incomplete; inspect evidence');
