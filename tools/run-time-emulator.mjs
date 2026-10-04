// Finite reviewed timing probe, owned PC emulator only; no physical transport.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData,gesture} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(hash(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest changed');
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-time/time-review.json')));
const source=path.join(projectRoot,'build/native-time/time.elf'),binary=fs.readFileSync(source);
if(!review.contractReviewed||review.guestSha256!==guestHash||review.sha256!==hash(binary)||
   review.sha256!=='4cceedf220a4df9133b89fc8f29db45a6cf9d22fe54efe31b30d1810b934012d'||
   review.sourceSha256!==hash(fs.readFileSync(path.join(projectRoot,'experiments/native-time/time-probe.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('Source/binary review mismatch');
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/native-time-'+Date.now());fs.mkdirSync(folder);
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('ADB changed');
const target=['-H','127.0.0.1','-P','5039','-s','emulator-5554'];
const env={...process.env,ADB_MDNS_AUTO_CONNECT:'0'};
function adb(args,label){
  const r=spawnSync(adbExe,[...target,...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label);return r.stdout+r.stderr;
}
const module='rw4time',file='/tmp/rw4-time-probe.elf';
const prior=adb(['shell','lsmod'],'modules-before');
if(prior.includes(module)||prior.includes('rw4bridge'))throw Error('Own native code already loaded; inspect before testing');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',file],'file-absence')))throw Error('Own temp path exists');
const faces=path.join(folder,'watchface-list.json');adb(['pull','/data/app/watchface/watchface_list.json',faces],'current-face');
const active=JSON.parse(fs.readFileSync(faces)).watchface_list.filter(f=>String(f.in_use)==='1'&&String(f.type)==='1');
if(active.length!==1||String(active[0].id)!=='365700764')throw Error('Start only from reviewed Storage watchface');
const backup=await snapshotData();
function capture(label){
  const name=path.basename(folder)+'-'+label;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.error||r.status!==0)throw Error('Capture failed');
  return path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png');
}
const before=capture('before');
function assertPanel(file){
  const {pixels,bpp}=readScreenshot(file);
  const at=(x,y)=>[...pixels.subarray((y*390+x)*bpp,(y*390+x)*bpp+3)];
  if(at(195,80).some(v=>v!==0)||at(195,300).some(v=>v>50)||at(365,300).every(v=>v<100))throw Error('Stock panel capture not recognized');
}
// A frozen screenshot can survive screen OFF. Validate actual UI activity before C.
try{await gesture(195,410,195,40);assertPanel(capture('panel-preflight'));}
finally{await gesture(195,40,195,410);}
const resumed=readScreenshot(capture('preflight-return')),original=readScreenshot(before);
if(resumed.bpp!==original.bpp||!resumed.pixels.equals(original.pixels))throw Error('Preflight did not return to Storage');
adb(['push',source,file],'push');const reread=path.join(folder,'readback.elf');adb(['pull',file,reread],'readback');
if(hash(fs.readFileSync(reread))!==hash(binary))throw Error('Readback differs; not loading');
let actions=null,actionError=null,commandFinished=false;
const output=await new Promise((resolve,reject)=>{
  const args=[...target,'shell','insmod',file,module];
  const child=spawn(adbExe,args,{shell:false,windowsHide:true,env,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';const startedAtUtc=new Date().toISOString();
  const timer=setTimeout(()=>child.kill(),20000); // Ends client only, never stops guest C.
  child.stdout.on('data',b=>{
    stdout+=b.toString('utf8');
    if(stdout.length>65536){child.kill();return;}
    const marker=stdout.match(/RW4_TIME: long wait begin request_ms=4000 tid=(\d+)/);
    if(marker&&!actions){
      const tid=Number(marker[1]);
      actions=(async()=>{
        const psBefore=adb(['shell','ps'],'ps-during-wait');
        const task=psBefore.split(/\r?\n/).find(l=>new RegExp('^\\s*'+tid+'\\s').test(l));
        if(!task||!task.includes('sh -c insmod')||!task.includes('Waiting  Signal'))throw Error('Probe task not observed waiting');
        try{
          await gesture(195,410,195,40);
          const panel=capture('panel-during-wait');assertPanel(panel);
          // spawnSync(capture) blocks host callbacks: the client flag alone can be stale.
          const psAfter=adb(['shell','ps'],'ps-after-panel-capture');
          const taskAfter=psAfter.split(/\r?\n/).find(l=>new RegExp('^\\s*'+tid+'\\s').test(l));
          if(!taskAfter||!taskAfter.includes('sh -c insmod')||!taskAfter.includes('Waiting  Signal'))throw Error('Probe not waiting after panel capture');
          if(commandFinished)throw Error('UI evidence arrived after probe returned');
          fs.writeFileSync(path.join(folder,'ui-during-wait.json'),JSON.stringify({tid,task,taskAfter,panel,commandStillRunning:true,atUtc:new Date().toISOString()},null,2)+'\n');
        }finally{await gesture(195,40,195,410);}
      })().catch(e=>{actionError=e.message;});
    }
  });
  child.stderr.on('data',b=>{stderr+=b.toString('utf8');});
  child.once('error',e=>{clearTimeout(timer);reject(e);});
  child.once('close',status=>{
    commandFinished=true;clearTimeout(timer);
    fs.writeFileSync(path.join(folder,'insmod.json'),JSON.stringify({args,status,stdout,stderr,startedAtUtc,endedAtUtc:new Date().toISOString()},null,2)+'\n');
    if(status!==0)reject(Error('Client failed; do not unload possibly live code'));else resolve(stdout+stderr);
  });
});
if(actions)await actions;
const done=/RW4_TIME: done waits=19 tid=(\d+)/.exec(output);
if(!done)throw Error('No completion marker; inspect guest before unloading');
if(!adb(['shell','lsmod'],'modules-loaded').includes(module))throw Error('Initializer did not succeed');
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('Module remains loaded');
adb(['shell','rm',file],'remove-temp');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',file],'file-after')))throw Error('Temp payload remains');
const after=capture('after'),a=readScreenshot(before),b=readScreenshot(after);
const restoredPixels=a.bpp===b.bpp&&a.pixels.equals(b.pixels);
const samples=output.match(/RW4_TIME: monotonic samples=(\d+) changes=(\d+)/);
const waits=[...output.matchAll(/RW4_TIME: wait trial=(\d+) request_ms=(\d+) elapsed_us=(\d+) delta_ms=(\d+) rc=(-?\d+)/g)].map(m=>
  ({trial:Number(m[1]),requestMs:Number(m[2]),elapsedUs:Number(m[3]),deltaMs:Number(m[4]),rc:Number(m[5])}));
const expected=[0,1,10,50,100,250,0,1,10,50,100,250,0,1,10,50,100,250,4000];
const passed=!!actions&&!actionError&&restoredPixels&&Number(samples?.[1])===257&&waits.length===19&&
  waits.every((w,i)=>w.requestMs===expected[i]&&w.trial===Math.floor(i/6)&&w.rc===0&&w.elapsedUs+100>=w.requestMs*1000&&
    w.elapsedUs<=w.requestMs*1000+2000000&&Math.abs(w.deltaMs-w.elapsedUs/1000)<1.1)&&
  output.includes('RW4_TIME: rollover delta_ms=5');
const result={passed,folder,guestSha256:guestHash,binarySha256:hash(binary),samples:Number(samples?.[1]),changes:Number(samples?.[2]),waits,
  actionsTriggered:!!actions,actionError,restoredPixels,moduleUnloaded:true,temporaryPayloadRemoved:true,backup:backup.folder,
  uiSleepValidated:false,interruptedSleepTested:false,wallClockMutationTested:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!passed)throw Error('Timing checkpoint incomplete; inspect evidence');
