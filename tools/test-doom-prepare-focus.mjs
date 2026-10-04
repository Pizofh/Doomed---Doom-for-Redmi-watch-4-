// R73 supplement: stock panel cancels preparation before native load; final Lua launches once.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {session,requireOwnedLauncher,persistentDoomDir} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';
import {captureScreenshot} from './emulator-screenshot.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No arguments accepted');
const recordFile=path.join(projectRoot,'artifacts/emulator/doom-persistence-latest.json');
const record=JSON.parse(fs.readFileSync(recordFile));
if(record.phase!=='complete'||record.passed!==true||record.physicalTransport!==false||record.directory!==persistentDoomDir)throw Error('Prior persistence evidence required');
const s=session('doom-prepare-focus');requireOwnedLauncher(s);
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function logs(){
  const n=fs.statSync(logFile).size-offset;if(n<0||n>2*1024*1024)throw Error('Log exceeds bound');
  const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}
  const t=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),t.split(/\r?\n/).filter(l=>/RW4_DOOM/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error)|RW4_DOOM_STORAGE: prepare error/.test(t))throw Error('Runtime failure marker');return t;
}
function absent(f){if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',f],'absence')))throw Error('Remains: '+f);}
function clean(){
  if(s.state()!==null||s.adb(['shell','lsmod'],'modules').includes('rw4doom'))throw Error('Native component remains');
  for(const f of ['/tmp/rw4-doom-ui.elf','/tmp/rw4-doom1.wad','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin','/dev/rw4doomstream'])absent(f);
}
async function capture(label,color){
  const a=await captureScreenshot(path.basename(s.folder)+'-'+label),r=readScreenshot(a.output),at=(200*390+20)*r.bpp;
  if(!color.every((v,i)=>Math.abs(r.pixels[at+i]-v)<=6))throw Error('Unexpected surface');return a;
}
clean();await gesture(195,285,195,285);let partial;
for(let i=0;i<100;i++){
  const m=s.adb(['shell','ls','-l','/tmp/rw4-doom1.wad'],'partial-copy').match(/(\d+)\s+(?:\/tmp\/)?rw4-doom1\.wad\s*$/m);
  if(m){partial=Number(m[1]);if(partial>0&&partial<4196020)break;}await delay(50);
}
if(!partial||partial>=4196020||s.state()!==null)throw Error('Partial preparation not observed');
await gesture(195,440,195,40);const panelCapture=await capture('panel',[0,0,0]);
await delay(2000);clean();
const pausedLog=logs();if(!pausedLog.includes('preparation cancelled on pause')||pausedLog.includes('RW4_DOOM_UI: START'))throw Error('Background launch not cancelled');
await gesture(195,40,195,410);const readyCapture=await capture('ready',[16,24,32]);
await gesture(195,285,195,285);let first;
for(let i=0;i<300;i++){const v=s.state();if(v?.ready&&v.produced>2){first=v;break;}await delay(100);}
if(!first||first.error||first.reason||!first.live||first.episode!==1||first.map!==1||first.ammo!==50)throw Error('Final-source launch failed');
await delay(250);const gameCapture=await capture('game',[18,52,73]);
await gesture(310,405,310,405);await gesture(195,390,195,390);
let gone=false;for(let i=0;i<30;i++){if(s.state()===null){gone=true;break;}await delay(100);}
if(!gone)throw Error('Worker did not retire');clean();
if(new RegExp('^\\s*'+first.tid+'\\s','m').test(s.adb(['shell','ps'],'ps')))throw Error('Worker PID remains');
const exitedCapture=await capture('exited',[16,24,32]),log=logs();
const prep=log.match(/RW4_DOOM_STORAGE: prepared elf=446144 wad=4196020 ms=([\d.]+)/);
if(!prep||!log.includes('finished tid='+first.tid+' result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0'))throw Error('Missing preparation/cleanup evidence');
const result={passed:true,folder:s.folder,partialBytes:partial,pauseCancelledBeforeNativeLoad:true,noDelayedStartDuringMs:2000,
  finalLuaSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(projectRoot,'experiments/doom-ui/main.lua'))).digest('hex'),
  worker:first.tid,first,prepareMs:Number(prep[1]),ownedResourcesClean:true,hostPushes:0,rebootForExit:false,
  panelCapture,readyCapture,gameCapture,exitedCapture,physicalTransport:false};
record.finalSourceSupplement=result;fs.writeFileSync(recordFile,JSON.stringify(record,null,2)+'\n');
fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:true,folder:s.folder,partialBytes:partial,worker:first.tid,prepareMs:result.prepareMs,hostPushes:0,rebootForExit:false}));
