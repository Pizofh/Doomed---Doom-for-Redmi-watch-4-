// START/EXIT integration in our own foreground UIProbe, exact PC guest only.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {session,reviewedPayload} from './launcher-emulator.mjs';
import {gesture} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No targets accepted');
reviewedPayload();const s=session('native-launcher');
if(s.state())throw Error('Begin only with native module absent');
const faceFile=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',faceFile],'faces');
const active=JSON.parse(fs.readFileSync(faceFile)).watchface_list.filter(x=>String(x.in_use)==='1'&&String(x.type)==='1');
if(active.length!==1||active[0].id!=='365799903')throw Error('Own UIProbe required');
const lua=path.join(s.folder,'main.lua');s.adb(['pull','/data/app/watchface/market/365799903/lua/main.lua',lua],'derived-source');
if(!fs.readFileSync(lua).equals(fs.readFileSync(path.join(projectRoot,'experiments/native-launcher/main.lua'))))throw Error('Extracted Lua differs');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function capture(name) {
  const label=path.basename(s.folder)+'-'+name;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),label],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.error||r.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',label+'.png');return {file,...readScreenshot(file)};
}
function page(a) {
  const at=(x,y)=>[...a.pixels.subarray((y*390+x)*a.bpp,(y*390+x)*a.bpp+3)];
  const near=(x,y,rgb)=>at(x,y).every((v,i)=>Math.abs(v-rgb[i])<=6);
  if(!near(20,200,[16,24,32])||!near(60,285,[57,114,128])||!near(60,390,[57,114,128]))throw Error('Owned launcher not recognized');
}
function thread(ps,st) {
  const row=ps.split(/\r?\n/).find(l=>new RegExp('^\\s*'+st.tid+'\\s').test(l));
  if(!row||!row.includes('pthread')||!new RegExp('^\\s*'+st.tid+'\\s+'+st.owner+'\\s').test(row))throw Error('Worker not in UI group');
  if(ps.split(/\r?\n/).some(l=>new RegExp('^\\s*'+st.init+'\\s').test(l)))throw Error('Initializer NSH still present');
  return row;
}
const before=capture('before');page(before);
const cycles=[];
for(let i=0;i<2;i++) {
  await gesture(195,285,195,285);await delay(300);
  const first=s.state();
  if(!first||first.pending!==1||first.detached!==1||first.live!==1||first.ready!==1||first.error!==0||first.stop!==0||first.steps<1||first.owner===first.tid||first.owner===first.init)throw Error('START contract failed');
  if(!s.adb(['shell','lsmod'],'loaded-'+i).includes('rw4worker'))throw Error('Module not registered after init');
  const ps=s.adb(['shell','ps'],'ps-start-'+i),row=thread(ps,first);
  const moving=capture('running-'+i);page(moving);
  await delay(250);const advancing=s.state();if(!advancing||advancing.tid!==first.tid||advancing.steps<=first.steps)throw Error('Worker did not advance');
  let panel=null;
  if(i===0) {
    // Actual loader busy gate, not a direct function call or forced unload.
    const code="local ok,why,status=os.execute('rmmod rw4worker'); assert(ok==nil and why=='exit' and status~=0); print('WORKER_BUSY_REJECTED')";
    if(!s.adb(['shell','lua','-e','"'+code+'"'],'busy-unload').includes('WORKER_BUSY_REJECTED'))throw Error('Live module unload not rejected');
    try {
      await gesture(195,410,195,40);const image=capture('panel');
      const p=(x,y)=>[...image.pixels.subarray((y*390+x)*image.bpp,(y*390+x)*image.bpp+3)];
      if(p(195,80).some(v=>v!==0)||p(195,300).some(v=>v>50)||p(365,300).every(v=>v<100))throw Error('Panel did not respond');
      const paused=s.state();if(!paused||paused.paused!==1||paused.live!==1)throw Error('Worker not paused behind panel');
      await delay(350);const stable=s.state();if(!stable||stable.steps!==paused.steps||stable.tid!==paused.tid)throw Error('Paused counter changed');
      panel={paused,stable,file:image.file,task:thread(s.adb(['shell','ps'],'ps-panel'),stable)};
    }finally{await gesture(195,40,195,410);}
    const resumed=s.state();if(!resumed||resumed.paused!==0||resumed.live!==1)throw Error('Resume failed');
  }
  const stopping=s.state();if(!stopping||stopping.live!==1)throw Error('Worker ended before EXIT');
  const exitAt=Date.now();await gesture(195,390,195,390);
  let absent=false;
  for(let n=0;n<12;n++) {if(s.state()===null){absent=true;break;}await delay(150);}
  const gonePs=s.adb(['shell','ps'],'ps-after-'+i);
  if(!absent||gonePs.split(/\r?\n/).some(l=>new RegExp('^\\s*'+first.tid+'\\s').test(l))||s.adb(['shell','lsmod'],'modules-after-'+i).includes('rw4worker'))throw Error('EXIT failed to retire/unload');
  const after=capture('exited-'+i);page(after);
  const textChanged=!before.pixels.subarray(80*390*before.bpp,170*390*before.bpp).equals(after.pixels.subarray(80*390*after.bpp,170*390*after.bpp));
  if(!textChanged)throw Error('UI status did not update');
  cycles.push({first,advancing,task:row,panel,exitObservedMs:Date.now()-exitAt,workerGone:true,moduleGone:true,nodeGone:true,uiStatusChanged:textChanged});
}
// Keep only a bounded tail of relevant own markers, not the proprietary log.
const log=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),fd=fs.openSync(log,'r'),size=fs.fstatSync(fd).size;
const bytes=Buffer.alloc(Math.min(65536,size));fs.readSync(fd,bytes,0,bytes.length,size-bytes.length);fs.closeSync(fd);
const markers=bytes.toString().split(/\r?\n/).filter(l=>/RW4_(?:WORKER|LAUNCHER):/.test(l));
fs.writeFileSync(path.join(s.folder,'own-markers.txt'),markers.join('\n')+'\n');
for(const c of cycles)if(!markers.some(l=>l.includes('uninit rc=0 tid='+c.first.tid+' reason=1 live=0 refs=0')))throw Error('Retirement marker missing');
const result={passed:true,folder:s.folder,cycles,uiCreatedWorker:true,initializerReturnedBeforeWorker:true,busyRmmodRejected:true,
  joinInUi:false,sleepInUi:false,workerCallsLvgl:false,cleanExitRequiresReboot:false,physicalTransport:false,doomCompiled:false,wadLoaded:false};
fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
