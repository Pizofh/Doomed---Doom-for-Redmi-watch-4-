// Finite reviewed worker lifecycle probe, owned PC emulator only; no physical transport.
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
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-task/task-review.json')));
const source=path.join(projectRoot,'build/native-task/task.elf'),binary=fs.readFileSync(source);
if(!review.contractReviewed||review.guestSha256!==guestHash||review.sha256!==hash(binary)||
   review.sha256!=='0a6065fbb3588716ce2093285db69cb2b794d84fab34b8c977ad8bca0639a6f3'||
   review.sourceSha256!==hash(fs.readFileSync(path.join(projectRoot,'experiments/native-task/task-probe.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('Source/binary review mismatch');
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/native-task-'+Date.now());fs.mkdirSync(folder);
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('ADB changed');
const target=['-H','127.0.0.1','-P','5039','-s','emulator-5554'];
const env={...process.env,ADB_MDNS_AUTO_CONNECT:'0'};
function adb(args,label){
  const r=spawnSync(adbExe,[...target,...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label);return r.stdout+r.stderr;
}
const module='rw4task',file='/tmp/rw4-task-probe.elf';
const prior=adb(['shell','lsmod'],'modules-before');
if(['rw4task','rw4time','rw4fs','rw4stdio','rw4bridge'].some(n=>prior.includes(n)))throw Error('Own native code already loaded; inspect before testing');
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
    const marker=stdout.match(/RW4_TASK: window cycle=0 owner_tid=(\d+) worker_tid=(\d+) wait_ms=4000/);
    if(marker&&!actions){
      const ownerTid=Number(marker[1]),tid=Number(marker[2]);
      actions=(async()=>{
        const psBefore=adb(['shell','ps'],'ps-during-wait');
        const task=psBefore.split(/\r?\n/).find(l=>new RegExp('^\\s*'+tid+'\\s').test(l));
        if(!task||!task.includes('pthread')||!task.includes('Waiting  Signal'))throw Error('Worker task not observed waiting');
        try{
          await gesture(195,410,195,40);
          const panel=capture('panel-during-wait');assertPanel(panel);
          // spawnSync(capture) blocks host callbacks: the client flag alone can be stale.
          const psAfter=adb(['shell','ps'],'ps-after-panel-capture');
          const taskAfter=psAfter.split(/\r?\n/).find(l=>new RegExp('^\\s*'+tid+'\\s').test(l));
          if(!taskAfter||!taskAfter.includes('pthread')||!taskAfter.includes('Waiting  Signal'))throw Error('Worker not waiting after panel capture');
          if(commandFinished)throw Error('UI evidence arrived after probe returned');
          fs.writeFileSync(path.join(folder,'ui-during-wait.json'),JSON.stringify({ownerTid,tid,task,taskAfter,panel,commandStillRunning:true,atUtc:new Date().toISOString()},null,2)+'\n');
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
const done=/RW4_TASK: done cycles=3 pending_join=0/.test(output);
if(!done)throw Error('No completion marker; inspect guest before unloading');
if(!adb(['shell','lsmod'],'modules-loaded').includes(module))throw Error('Initializer did not succeed');
adb(['shell','rmmod',module],'unload');
if(adb(['shell','lsmod'],'modules-after').includes(module))throw Error('Module remains loaded');
adb(['shell','rm',file],'remove-temp');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',file],'file-after')))throw Error('Temp payload remains');
const after=capture('after'),a=readScreenshot(before),b=readScreenshot(after);
const restoredPixels=a.bpp===b.bpp&&a.pixels.equals(b.pixels);
const joined=[...output.matchAll(/RW4_TASK: joined cycle=(\d+) worker_tid=(\d+) steps=(\d+) reason=(\d+) value=([0-9a-f]{8}) join_ms=(\d+) rc=(-?\d+) error=(\d+)/g)].map(m=>({cycle:Number(m[1]),workerTid:Number(m[2]),steps:Number(m[3]),reason:Number(m[4]),value:m[5],joinMs:Number(m[6]),rc:Number(m[7]),error:Number(m[8])}));
const afterPs=adb(['shell','ps'],'processes-after');
const tasksGone=joined.every(j=>!afterPs.split(/\r?\n/).some(l=>new RegExp('^\\s*'+j.workerTid+'\\s').test(l)));
const facesAfter=path.join(folder,'watchface-after.json');adb(['pull','/data/app/watchface/watchface_list.json',facesAfter],'face-after');
const activeAfter=JSON.parse(fs.readFileSync(facesAfter)).watchface_list.filter(f=>String(f.in_use)==='1'&&String(f.type)==='1');
const storageActive=activeAfter.length===1&&String(activeAfter[0].id)==='365700764';
const passed=!!actions&&!actionError&&restoredPixels&&storageActive&&tasksGone&&joined.length===3&&joined.every((j,i)=>j.cycle===i&&j.rc===0&&j.error===0&&j.steps>0&&j.steps<=[80,3,40][i]&&j.reason===[1,2,1][i]&&j.value===(0x34570000+i*16+j.reason).toString(16)&&j.joinMs<2000)&&
 [0,1,2].every(i=>output.includes('RW4_TASK: busy cycle='+i+' pending_join=1 uninit_rc=-16'));
const result={passed,folder,guestSha256:guestHash,binarySha256:hash(binary),joined,actionsTriggered:!!actions,actionError,
 restoredPixels,storageActive,tasksGone,moduleUnloaded:true,temporaryPayloadRemoved:true,backup:backup.folder,
 uiCallerWorkerStartValidated:false,forcedCancellationTested:false,joinFailureInjected:false,physicalTransport:false};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!passed)throw Error('Worker checkpoint incomplete; inspect evidence');
