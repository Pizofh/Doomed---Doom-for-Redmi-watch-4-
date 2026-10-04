// R69: phases around manually reviewed stock watchface selection. Exact PC guest.
// No forced unload/kill, UI API from CLI, automatic Settings navigation or USB.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {session,requireOwnedLauncher,reviewedPayload} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
const action=process.argv[2];
if(process.argv.length!==3||!['start','closed','reentry'].includes(action))throw Error('Expected start|closed|reentry');
reviewedPayload();
const s=session('doom-close-'+action),recordFile=path.join(projectRoot,'artifacts/emulator/doom-close-latest.json');
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function active(id){
  const f=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',f],'faces');
  const a=JSON.parse(fs.readFileSync(f)).watchface_list.filter(x=>String(x.in_use)==='1'&&String(x.type)==='1');
  if(a.length!==1||a[0].id!==id)throw Error('Expected active watchface '+id);
}
function capture(label,launcher=false){
  const name=path.basename(s.folder)+'-'+label;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.error||r.status!==0)throw Error('Screenshot failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png');
  if(launcher){const a=readScreenshot(file);for(const [x,y,c]of [[20,200,[16,24,32]],[60,285,[57,114,128]],[60,390,[57,114,128]]]){
    const p=(y*390+x)*a.bpp;if(!c.every((v,i)=>Math.abs(a.pixels[p+i]-v)<=6))throw Error('Launcher not recognized');
  }}
  return file;
}
function markers(record){
  const n=fs.statSync(logFile).size-record.offset;if(n<0||n>2*1024*1024)throw Error('Host log changed or exceeds bound');
  const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,record.offset);}finally{fs.closeSync(fd);}
  const logs=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),logs.split(/\r?\n/).filter(l=>/RW4_DOOM|RW4_RUNTIME/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error|EXIT requested)/.test(logs))throw Error('Failure or EXIT marker: no-exit flow not proven');
  return logs;
}
function save(r){fs.writeFileSync(recordFile,JSON.stringify(r,null,2)+'\n');fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(r,null,2)+'\n');}
function absent(file){if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',file],'absence')))throw Error('File remains: '+file);}
function gone(tid){if(new RegExp('^\\s*'+tid+'\\s','m').test(s.adb(['shell','ps'],'ps')))throw Error('Worker remains');}
if(action==='start'){
  if(fs.existsSync(recordFile)&&JSON.parse(fs.readFileSync(recordFile)).phase!=='complete')throw Error('Prior close test unfinished; inspect before starting');
  requireOwnedLauncher(s);
  const offset=fs.statSync(logFile).size,freeBefore=s.adb(['shell','free'],'free-before');
  await gesture(195,285,195,285);let v;
  for(let i=0;i<20;i++){v=s.state();if(v?.ready===1&&v.produced>2)break;await delay(100);}
  if(!v||v.ready!==1||v.live!==1||v.error||v.reason||v.paused||v.episode!==1||v.map!==1||v.produced<3)throw Error('Engine not active; retain for inspection');
  const screenshot=capture('running');
  const r={phase:'running',startFolder:s.folder,offset,worker:v.tid,initial:v,screenshot,freeBefore,physicalTransport:false};save(r);
  console.log(JSON.stringify({phase:r.phase,worker:r.worker,folder:s.folder}));
}else{
  const r=JSON.parse(fs.readFileSync(recordFile));
  if(r.physicalTransport!==false||!/^doom-close-start-\d+$/.test(path.basename(r.startFolder))||
    path.dirname(r.startFolder)!==path.join(projectRoot,'artifacts/emulator')||!Number.isInteger(r.worker)||r.worker<1)throw Error('Invalid owned test record');
  if(action==='closed'){
    if(r.phase!=='running')throw Error('Expected running test before closed');active('365700764');
    let v;for(let i=0;i<20;i++){v=s.state();if(v?.reason&&v.live===0)break;await delay(100);}
    if(!v||v.tid!==r.worker||v.reason!==1||v.live||v.error||v.cleanup||v.allocated!==13||v.freed!==13||
      v.requested||v.applied||v.queued||v.readers||v.producer_busy||v.ack!==v.epoch||v.accepting)throw Error('Worker/resources not cleanly retired');
    gone(r.worker);if(!s.adb(['shell','lsmod'],'modules-retained').includes('rw4doom'))throw Error('Expected retained module');
    const copies=[];
    for(let i=0;i<2;i++){
      const f=path.join(s.folder,'retained-'+i+'.bin');s.adb(['pull','/tmp/rw4-doom-frame-'+i+'.bin',f],'retained-copy-'+i);
      const b=fs.readFileSync(f);if(b.length!==128012||!b.subarray(0,12).equals(Buffer.from([25,18,0,0,64,1,200,0,128,2,0,0])))throw Error('Retained frame format differs');copies.push(f);
    }
    const log=markers(r);if(!log.includes('RW4_DOOM_UI: close retained')||log.includes('uninit rc=0 tid='+r.worker))throw Error('Finalizer retention not proven');
    if(!log.includes('finished tid='+r.worker+' result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0'))throw Error('Missing clean engine stop');
    Object.assign(r,{phase:'closed',closedFolder:s.folder,closedState:v,retainedCopies:copies,closedScreenshot:capture('normal'),moduleRetained:true,workerGone:true,engineOwnedResourcesClean:true});save(r);
    console.log(JSON.stringify({phase:r.phase,worker:r.worker,moduleRetained:true,folder:s.folder}));
  }else{
    if(r.phase!=='closed')throw Error('Expected closed test before reentry');active('365799903');
    let goneNode=false;for(let i=0;i<20;i++){if(s.state()===null){goneNode=true;break;}await delay(100);}
    if(!goneNode||s.adb(['shell','lsmod'],'modules-collected').includes('rw4doom'))throw Error('UI did not collect retained module; no host unload');
    gone(r.worker);for(const f of ['/dev/rw4doomstream','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin'])absent(f);
    const log=markers(r);if(!log.includes('uninit rc=0 tid='+r.worker+' reason=1 live=0 refs=0 requested=0 applied=0 queued=0')||
      !log.includes('unloaded tid='+r.worker))throw Error('Missing reentry cleanup marker');
    if((log.match(/RW4_DOOM_UI: START/g)||[]).length!==1)throw Error('Unexpected second engine run');
    Object.assign(r,{phase:'complete',passed:true,reentryFolder:s.folder,reentryScreenshot:capture('collected',true),
      noExitUsed:true,uiCollectedRetainedResources:true,hostUnload:false,rebootForExit:false,freeAfter:s.adb(['shell','free'],'free-after')});save(r);
    console.log(JSON.stringify({passed:true,phase:r.phase,worker:r.worker,folder:s.folder,noExitUsed:true,rebootForExit:false}));
  }
}
