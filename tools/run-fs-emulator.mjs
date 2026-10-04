// Fixed read-only C probe and owned fixture, reviewed PC emulator only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(hash(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest changed');
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-fs/fs-review.json')));
const source=path.join(projectRoot,'build/native-fs/fs.elf'),binary=fs.readFileSync(source);
if(!review.contractReviewed||review.guestSha256!==guestHash||review.sha256!==hash(binary)||
   review.sha256!=='872950b90470b8b6a3f6d56087dcf4bfcfc11cfbdccbc15750030bdd8175a3fa'||
   review.sourceSha256!==hash(fs.readFileSync(path.join(projectRoot,'experiments/native-fs/fs-probe.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('Source/binary review mismatch');
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/native-fs-'+Date.now());fs.mkdirSync(folder);
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('ADB changed');
const target=['-H','127.0.0.1','-P','5039','-s','emulator-5554'];
function adb(args,label,timeout=15000){
  const r=spawnSync(adbExe,[...target,...args],{shell:false,windowsHide:true,encoding:'utf8',timeout,maxBuffer:65536,
    env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  // A client timeout never stops guest C. Leave files/module for inspection then.
  if(r.error||r.status!==0)throw Error('ADB failed: '+label+'; inspect before unloading');return r.stdout+r.stderr;
}
const module='rw4fs',elf='/tmp/rw4-fs-probe.elf',fixture='/tmp/rw4-fs-fixture.bin',missing='/tmp/rw4-fs-missing.bin';
const absence=text=>/^nsh: ls: stat failed: 2\r?$/im.test(text);
const prior=adb(['shell','lsmod'],'modules-before');
if(['rw4fs','rw4time','rw4bridge'].some(name=>prior.includes(name)))throw Error('Own native code already loaded');
for(const [i,file]of[elf,fixture,missing].entries())if(!absence(adb(['shell','ls',file],'absence-'+i)))throw Error('Own temp path exists');
const mounts=adb(['shell','mount'],'mounts');
if(!/\/tmp type tmpfs\b/.test(mounts))throw Error('Expected /tmp tmpfs not observed; no payload copied');
adb(['shell','free'],'memory-before');
const size=1048576+37,bytes=Buffer.alloc(size);
for(let i=0;i<size;i++)bytes[i]=((i*37)^(i>>>8)^(i>>>16)^0xa5)&255;
const fnv=buffer=>{let h=2166136261;for(const b of buffer)h=Math.imul(h^b,16777619)>>>0;return h.toString(16).padStart(8,'0');};
const ownFixture=path.join(folder,'fixture.bin');fs.writeFileSync(ownFixture,bytes);
const positions=[0,1,511,512,65535,65536,1048575,size-1,size];
let seed=0x4d2315;for(let i=0;i<32;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;positions.push(seed%size);}
const expectedWindows=positions.map(offset=>{const part=bytes.subarray(offset,Math.min(size,offset+73));return{offset,bytes:part.length,fnv:fnv(part)};});
const fixtureHash=hash(bytes);
fs.writeFileSync(path.join(folder,'fixture-review.json'),JSON.stringify({size,sha256:fixtureHash,fnv:fnv(bytes),expectedWindows,proprietaryAssets:false},null,2)+'\n');
adb(['push',source,elf],'push-elf');adb(['push',ownFixture,fixture],'push-fixture');
for(const [label,file,expected]of[['elf',elf,hash(binary)],['fixture',fixture,fixtureHash]]){
  const local=path.join(folder,'readback-'+label+'.bin');adb(['pull',file,local],'readback-'+label);
  if(hash(fs.readFileSync(local))!==expected)throw Error('Readback differs; not loading');
}
const output=adb(['shell','insmod',elf,module],'insmod',20000);
if(!/RW4_FS: done windows=41 errors=4 close=0/.test(output))throw Error('Completion absent; inspect guest before unloading');
if(!adb(['shell','lsmod'],'modules-loaded').includes(module))throw Error('Initializer did not succeed');
const windows=[...output.matchAll(/RW4_FS: window offset=(\d+) bytes=(\d+) fnv=([0-9a-f]{8})/g)].map(m=>({offset:Number(m[1]),bytes:Number(m[2]),fnv:m[3]}));
const errors=[...output.matchAll(/RW4_FS: error op=(\w+) rc=(-?\d+) errno=(\d+)/g)].map(m=>({op:m[1],rc:Number(m[2]),errno:Number(m[3])}));
const expectedErrors=[{op:'missing',rc:-1,errno:2},{op:'bad_read',rc:-1,errno:9},{op:'bad_seek',rc:-1,errno:9},{op:'bad_whence',rc:-1,errno:22}];
const unchanged=path.join(folder,'fixture-after.bin');adb(['pull',fixture,unchanged],'fixture-after');
const fixtureUnchanged=hash(fs.readFileSync(unchanged))===fixtureHash;
const passed=fixtureUnchanged&&JSON.stringify(windows)===JSON.stringify(expectedWindows)&&JSON.stringify(errors)===JSON.stringify(expectedErrors)&&
  output.includes(`RW4_FS: sequential bytes=${size} chunks=2049 last_bytes=37 fnv=${fnv(bytes)} eof=0`)&&
  output.includes('RW4_FS: origins set=100 cur_forward=123 cur_back=100 end_back=1048576')&&
  output.includes('RW4_FS: high_offset hi=1 lo=7 restored=0 no_read=1')&&
  output.includes('RW4_FS: independent first=777 second=333 second_close=0')&&
  output.includes('RW4_FS: reopen position=0 first=165 close=0');
// Reviewed initializer has returned and retained nothing; unloading is now allowed.
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('Module remains loaded');
for(const [i,file]of[elf,fixture].entries()){
  adb(['shell','rm',file],'remove-'+i);
  if(!absence(adb(['shell','ls',file],'after-'+i)))throw Error('Own temp file remains');
}
if(!absence(adb(['shell','ls',missing],'missing-after')))throw Error('Missing path unexpectedly exists');
adb(['shell','free'],'memory-after');adb(['shell','ps'],'processes-after');
const result={passed,folder,guestSha256:guestHash,binarySha256:hash(binary),fixtureSha256:fixtureHash,
  fixtureBytes:size,sequentialChunks:2049,windows:windows.length,errors,fixtureUnchanged,
  seekOffsetBits:64,highWordPositionTested:true,readBeyondEofHighOffsetTested:false,
  descriptorPositionsIndependent:true,reopenedAtStart:true,moduleUnloaded:true,temporaryFilesRemoved:true,
  cWriteImports:false,filesystem:'tmpfs',stdioTested:false,wadTested:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!passed)throw Error('Filesystem checkpoint incomplete; inspect evidence');
