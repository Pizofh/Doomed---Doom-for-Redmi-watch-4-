// First original engine frame, then joined cleanup. Reviewed PC guest only.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {digest,verifyShareware} from './wad-data.mjs';
import {frameData} from './doom-frame-data.mjs';
if(process.argv.length!==2)throw Error('No arbitrary target/file accepted');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(digest(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest changed');
const source=path.join(projectRoot,'build/doom-first-frame/doom-first.elf'),binary=fs.readFileSync(source);
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/doom-first-frame/first-review.json')));
const expectedInputs=['experiments/doom-first-frame/adapter.c','experiments/doom-first-frame/lifecycle.c','experiments/doom-first-frame/first-frame.h',
  'doom/platform-rw4/runtime.c','doom/platform-rw4/runtime.h','doom/platform-rw4/module.ld','doom/platform-rw4/long-calls.h',
  'doom/platform-rw4/compat/stdio.h','doom/platform-rw4/compat/ctype.h','doom/platform-rw4/compat/sys/stat.h'];
if(JSON.stringify(review.inputs)!==JSON.stringify(expectedInputs))throw Error('Unexpected source paths');
const sourceHash=digest(expectedInputs.map(p=>fs.readFileSync(path.join(projectRoot,p),'utf8').replace(/\r\n/g,'\n')).join('\n'));
if(!review.contractReviewed||review.guestSha256!==guestHash||review.revision!=='dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284'||
   review.sha256!==digest(binary)||review.sha256!=='f0f55f55cd72fab7052a3caaca40cbb43567ac9cf5bdcf4326280a8fa11a7539'||
   review.sourceSha256!==sourceHash)throw Error('Source/ELF review mismatch');
const wadFile=path.join(projectRoot,'tools/local/doom-shareware/doom1.wad');
if(fs.lstatSync(wadFile).isSymbolicLink()||fs.statSync(wadFile).size!==4196020)throw Error('Unexpected own WAD');
const expected=verifyShareware(fs.readFileSync(wadFile));
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/doom-first-'+Date.now());fs.mkdirSync(folder);
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(digest(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('ADB changed');
const target=['-H','127.0.0.1','-P','5039','-s','emulator-5554'];
function adb(args,label,timeout=15000){
  const r=spawnSync(adbExe,[...target,...args],{shell:false,windowsHide:true,encoding:'utf8',timeout,maxBuffer:65536,
    env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label+'; client timeout does not stop C');return r.stdout+r.stderr;
}
const module='rw4doomfirst',elf='/tmp/rw4-doom-first.elf',file='/tmp/rw4-doom1.wad',capture='/tmp/rw4-doom-first.bgrx';
const absence=s=>/^nsh: ls: stat failed: 2\r?$/im.test(s);
if(/\brw4[a-z0-9_]*\b/i.test(adb(['shell','lsmod'],'modules-before')))throw Error('Own native module already loaded');
for(const [i,f]of[elf,file,capture].entries())if(!absence(adb(['shell','ls',f],'absence-'+i)))throw Error('Own temp already exists');
if(!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mounts')))throw Error('/tmp is not the reviewed tmpfs');
const memoryBefore=adb(['shell','free'],'memory-before');
const heap=memoryBefore.match(/Umem:\s+\d+\s+\d+\s+(\d+)/);if(!heap||+heap[1]<16*1024*1024)throw Error('Insufficient observed guest free heap');
adb(['push',source,elf],'push-elf');adb(['push',wadFile,file],'push-wad');
for(const [label,f,h]of[['elf',elf,digest(binary)],['wad',file,expected.sha256]]){
  const back=path.join(folder,'readback-'+label+'.bin');adb(['pull',f,back],'readback-'+label);
  if(digest(fs.readFileSync(back))!==h)throw Error('Readback differs; not loading');
}
const output=adb(['shell','insmod',elf,module],'insmod',30000);
// A client timeout never authorizes an unload. Join+cleanup+closed export required.
const joined=output.match(/RW4_DOOM: joined tid=(\d+) rc=0 value=34660001 done=1 result=(-?\d+)/);
if(!joined||!output.includes('RW4_DOOM: done joined=1 cleanup=0 io_error=0')||output.includes('_retained'))throw Error('Safe completion absent; inspect before cleanup');
if(!adb(['shell','lsmod'],'modules-loaded').includes(module))throw Error('Initializer not registered');
const resources=output.match(/RW4_DOOM: resources blocks=(\d+) bytes=(\d+) streams=(\d+) alloc=(\d+) free=(\d+) open=(\d+) close=(\d+) denied=(\d+) peak=(\d+) peak_blocks=(\d+) cleanup=(\d+) reason=(\d+) code=(\d+)/);
const frame=output.match(/RW4_DOOM: frame captured=(\d+) frames=(\d+) ticks=(\d+) episode=(\d+) map=(\d+) elapsed_ms=(\d+) fnv=([a-f0-9]{8}) write=(\d+) close=(-?\d+)/);
let rendered=null;
if(frame&&+frame[1]===1&&+frame[8]===256000&&+frame[9]===0){
  const rawPath=path.join(folder,'e1m1.bgrx');adb(['pull',capture,rawPath],'pull-frame');
  rendered=frameData(fs.readFileSync(rawPath));fs.writeFileSync(path.join(folder,'e1m1.png'),rendered.png);
}
const after=path.join(folder,'wad-after.bin');adb(['pull',file,after],'wad-after');
const unchanged=digest(fs.readFileSync(after))===expected.sha256;
// Worker is joined and export closed even if engine returned an ordinary error.
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('Module still loaded');
for(const [i,f]of[elf,file,capture].entries()){
  if(f===capture&&absence(adb(['shell','ls',f],'capture-check')))continue;
  adb(['shell','rm',f],'remove-'+i);
  if(!absence(adb(['shell','ls',f],'removed-'+i)))throw Error('Own temp remains');
}
adb(['shell','free'],'memory-after');const ps=adb(['shell','ps'],'processes-after');
const workerAbsent=!ps.split(/\r?\n/).some(l=>new RegExp('^\\s*'+joined[1]+'\\s').test(l));
const ownedClean=resources&&[1,2,3,11].every(i=>+resources[i]===0)&&resources[4]===resources[5]&&resources[6]===resources[7];
const framePassed=rendered&&rendered.fnv===frame[7]&&rendered.colors>16&&rendered.nonblack>32000&&+frame[4]===1&&+frame[5]===1&&+frame[3]>0;
const result={passed:!!(framePassed&&ownedClean&&unchanged&&workerAbsent&&+joined[2]===2),folder,guestSha256:guestHash,binarySha256:digest(binary),
  engineRevision:review.revision,engineExecuted:true,wadSha256:expected.sha256,wadUnchanged:unchanged,workerTid:+joined[1],workerJoined:true,workerAbsent,
  frameCaptured:!!rendered,width:320,height:200,episode:frame?+frame[4]:null,map:frame?+frame[5]:null,
  frames:frame?+frame[2]:null,gameTics:frame?+frame[3]:null,elapsedMs:frame?+frame[6]:null,
  frameFnv:rendered?.fnv??null,colors:rendered?.colors??null,nonblackPixels:rendered?.nonblack??null,
  peakTrackedBytes:resources?+resources[9]:null,peakTrackedBlocks:resources?+resources[10]:null,
  allocations:resources?+resources[4]:null,streamsOpened:resources?+resources[6]:null,deniedOperations:resources?+resources[8]:null,
  ownedResourcesClean:!!ownedClean,moduleUnloaded:true,temporaryFilesRemoved:true,rebootRequired:false,
  inputConnected:false,displayedInGuestUi:false,externalStopValidated:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!result.passed)throw Error('First-frame checkpoint incomplete; review cleaned failure');
