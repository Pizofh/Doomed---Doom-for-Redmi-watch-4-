// Fixed read-only WAD probe. Only the reviewed PC guest/loopback transport.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {digest,verifyShareware} from './wad-data.mjs';
if(process.argv.length!==2)throw Error('No arbitrary target/file accepted');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(digest(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest changed');
const source=path.join(projectRoot,'build/native-wad/wad.elf'),binary=fs.readFileSync(source);
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-wad/wad-review.json')));
if(!review.contractReviewed||review.guestSha256!==guestHash||review.sha256!==digest(binary)||
   review.sha256!=='5f75898a47ee32b58cfa0bd0c60b983d3a22cf6222aafdeb32f43dcee9b93e37'||
   review.sourceSha256!==digest(fs.readFileSync(path.join(projectRoot,'experiments/native-wad/wad-probe.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('Source/ELF review mismatch');
const wadFile=path.join(projectRoot,'tools/local/doom-shareware/doom1.wad');
if(fs.lstatSync(wadFile).isSymbolicLink()||fs.statSync(wadFile).size!==4196020)throw Error('Unexpected own data file');
const wad=fs.readFileSync(wadFile),expected=verifyShareware(wad);
const dataReview=JSON.parse(fs.readFileSync(path.join(projectRoot,'tools/local/doom-shareware/review.json')));
if(dataReview.sha256!==expected.sha256||dataReview.executedDownloadedCode!==false)throw Error('Data review mismatch');
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/native-wad-'+Date.now());fs.mkdirSync(folder);
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(digest(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('ADB changed');
const target=['-H','127.0.0.1','-P','5039','-s','emulator-5554'];
function adb(args,label,timeout=15000){
  const r=spawnSync(adbExe,[...target,...args],{shell:false,windowsHide:true,encoding:'utf8',timeout,maxBuffer:65536,
    env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label+'; client timeout cannot stop guest C');return r.stdout+r.stderr;
}
const module='rw4wad',elf='/tmp/rw4-wad-probe.elf',file='/tmp/rw4-wad-probe.wad';
const absence=s=>/^nsh: ls: stat failed: 2\r?$/im.test(s);
if(/\brw4[a-z0-9_]*\b/i.test(adb(['shell','lsmod'],'modules-before')))throw Error('Own native module already loaded');
for(const [i,f]of[elf,file].entries())if(!absence(adb(['shell','ls',f],'absence-'+i)))throw Error('Own temp path already exists');
if(!/\/tmp type tmpfs\b/.test(adb(['shell','mount'],'mounts')))throw Error('/tmp is not the reviewed tmpfs');
adb(['shell','free'],'memory-before');adb(['shell','df'],'storage-before');
const faces=path.join(folder,'watchface-before.json');adb(['pull','/data/app/watchface/watchface_list.json',faces],'face-before');
const active=JSON.parse(fs.readFileSync(faces)).watchface_list.filter(f=>String(f.in_use)==='1'&&String(f.type)==='1');
if(active.length!==1||String(active[0].id)!=='365700764')throw Error('Expected Storage active, UIProbe inactive');
fs.writeFileSync(path.join(folder,'expected.json'),JSON.stringify(expected,null,2)+'\n');
adb(['push',source,elf],'push-elf');adb(['push',wadFile,file],'push-wad');
for(const [label,f,h]of[['elf',elf,digest(binary)],['wad',file,expected.sha256]]){
  const back=path.join(folder,'readback-'+label+'.bin');adb(['pull',f,back],'readback-'+label);
  if(digest(fs.readFileSync(back))!==h)throw Error('Readback differs; not loading');
}
const output=adb(['shell','insmod',elf,module],'insmod',20000);
// A missing completion is an inspection gate; never unload blindly after a timeout.
if(!output.includes('RW4_WAD: done rc=0 close=0'))throw Error('Successful close/return absent; inspect before cleanup');
if(!adb(['shell','lsmod'],'modules-loaded').includes(module))throw Error('Initializer did not register successfully');
const actual=[...output.matchAll(/RW4_WAD: lump index=(\d+) name=([A-Z0-9_]+) offset=(\d+) size=(\d+) fnv=([0-9a-f]{8})/g)]
  .map(m=>({index:Number(m[1]),name:m[2],offset:Number(m[3]),size:Number(m[4]),fnv:m[5]}));
const selected=expected.selected.toSorted((a,b)=>a.index-b.index);
const sameLumps=JSON.stringify(actual)===JSON.stringify(selected);
const markers=[`header bytes=${expected.bytes} count=${expected.count} directory=${expected.directory}`,
  `directory entries=${expected.count} fnv=${expected.directoryFnv} maps=9 selected=16`,
  `sequential bytes=${expected.bytes} chunks=${Math.ceil(expected.bytes/512)} fnv=${expected.fnv} eof=1 error=0`];
const after=path.join(folder,'wad-after.bin');adb(['pull',file,after],'wad-after');
const unchanged=digest(fs.readFileSync(after))===expected.sha256;
// Finite initializer has returned, FILE closed, no worker/callback. Unload own code only.
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('Module still loaded');
for(const [i,f]of[elf,file].entries()){
  adb(['shell','rm',f],'remove-'+i);
  if(!absence(adb(['shell','ls',f],'removed-'+i)))throw Error('Own temp remains');
}
adb(['shell','free'],'memory-after');adb(['shell','ps'],'processes-after');
const facesAfter=path.join(folder,'watchface-after.json');adb(['pull','/data/app/watchface/watchface_list.json',facesAfter],'face-after');
const activeAfter=JSON.parse(fs.readFileSync(facesAfter)).watchface_list.filter(f=>String(f.in_use)==='1'&&String(f.type)==='1');
const storageActive=activeAfter.length===1&&String(activeAfter[0].id)==='365700764';
const passed=sameLumps&&unchanged&&storageActive&&markers.every(m=>output.includes('RW4_WAD: '+m));
const result={passed,folder,guestSha256:guestHash,binarySha256:digest(binary),wadSha256:expected.sha256,
  wadBytes:expected.bytes,directoryEntries:expected.count,directoryOffset:expected.directory,
  selectedLumps:actual.length,allLumpBoundsChecked:true,directoryFnv:expected.directoryFnv,wholeFileFnv:expected.fnv,
  sequentialChunks:Math.ceil(expected.bytes/512),sameLumps,wadUnchanged:unchanged,storageActive,
  opaqueFile:true,readOnlyData:true,moduleUnloaded:true,temporaryFilesRemoved:true,rebootRequired:false,
  uiActivityValidated:false,workerReadValidated:false,persistenceValidated:false,doomCompiled:false,doomExecuted:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!passed)throw Error('WAD checkpoint incomplete; inspect evidence');
