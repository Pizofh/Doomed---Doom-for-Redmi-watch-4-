// R73: cancellation then a normal cycle; a second cycle after a separately reviewed clean reset.
import fs from 'node:fs';
import path from 'node:path';
import {session,requireOwnedLauncher,persistentDoomDir} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';
import {captureScreenshot} from './emulator-screenshot.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==3||!['cancel','run','post-reset'].includes(process.argv[2]))throw Error('Expected cancel|run|post-reset');
const action=process.argv[2],s=session('doom-persistent-'+action),recordFile=path.join(projectRoot,'artifacts/emulator/doom-persistence-latest.json');
requireOwnedLauncher(s);
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function absent(file){if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',file],'absence')))throw Error('Remains: '+file);}
function transientAbsent(){for(const f of ['/tmp/rw4-doom-ui.elf','/tmp/rw4-doom1.wad','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin','/dev/rw4doomstream'])absent(f);}
function logs(){
  const n=fs.statSync(logFile).size-offset;if(n<0||n>2*1024*1024)throw Error('Log exceeds bound');const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');
  try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}const t=b.toString('utf8');
  fs.writeFileSync(path.join(s.folder,'own-markers.txt'),t.split(/\r?\n/).filter(l=>/RW4_DOOM/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error)|RW4_DOOM_STORAGE: prepare error/.test(t))throw Error('Runtime failure marker');return t;
}
async function capture(label,launcher=false){
  const a=await captureScreenshot(path.basename(s.folder)+'-'+label),r=readScreenshot(a.output),at=(200*390+20)*r.bpp,c=launcher?[16,24,32]:[18,52,73];
  if(!c.every((v,i)=>Math.abs(r.pixels[at+i]-v)<=6))throw Error('Unexpected surface');return a;
}
function save(r){fs.writeFileSync(recordFile,JSON.stringify(r,null,2)+'\n');fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(r,null,2)+'\n');}
transientAbsent();
let record=fs.existsSync(recordFile)?JSON.parse(fs.readFileSync(recordFile)):null;
if(record&&(record.physicalTransport!==false||record.directory!==persistentDoomDir))throw Error('Invalid own record');
if(action==='cancel'){
  if(record)throw Error('Existing persistence test: inspect before repeating');
  await gesture(195,285,195,285);let size;
  for(let i=0;i<100;i++){
    const out=s.adb(['shell','ls','-l','/tmp/rw4-doom1.wad'],'partial-copy'),m=out.match(/(\d+)\s+(?:\/tmp\/)?rw4-doom1\.wad\s*$/m);
    if(m){size=Number(m[1]);if(size>0&&size<4196020)break;}await delay(50);
  }
  if(!size||size>=4196020||s.state()!==null)throw Error('Did not observe partial copy before native load');
  const partialCapture=await capture('preparing',true);await gesture(195,390,195,390);transientAbsent();
  const log=logs();if(!log.includes('preparation cancelled')||log.includes('RW4_DOOM_UI: START'))throw Error('Cancellation not proven');
  save({phase:'cancelled',cancelFolder:s.folder,partialBytes:size,partialCapture,cancellationClean:true,directory:persistentDoomDir,physicalTransport:false});
  console.log(JSON.stringify({action,folder:s.folder,cancellationClean:true,partialBytes:size}));
}else{
  if(!record||(action==='run'?record.phase!=='cancelled':record.phase!=='pre-reset')||
    (action==='post-reset'&&(record.resetBetweenRuns?.requested!==true||record.resetBetweenRuns?.afterCleanExit!==true)))throw Error('Expected prior phase and reviewed reset');
  const initialCapture=await capture('ready',true);await gesture(195,285,195,285);let first;
  for(let i=0;i<300;i++){const v=s.state();if(v?.ready&&v.produced>2){first=v;break;}await delay(100);}
  if(!first||first.error||first.reason||!first.live||first.episode!==1||first.map!==1||first.ammo!==50)throw Error('Persistent launch failed');
  await delay(250);const gameCapture=await capture('game');
  await gesture(310,325,310,325,800);await delay(250);const fired=s.state();
  if(!fired||fired.error||fired.ammo>=first.ammo||fired.requested||fired.applied||fired.delivered_keys)throw Error('Fire/release not processed');
  await gesture(310,405,310,405);await gesture(195,390,195,390);
  let gone=false;for(let i=0;i<30;i++){if(s.state()===null){gone=true;break;}await delay(100);}
  if(!gone||s.adb(['shell','lsmod'],'modules').includes('rw4doom')||new RegExp('^\\s*'+first.tid+'\\s','m').test(s.adb(['shell','ps'],'ps')))throw Error('Not retired');
  transientAbsent();const exitedCapture=await capture('exited',true),log=logs();
  const prep=log.match(/RW4_DOOM_STORAGE: prepared elf=446144 wad=4196020 ms=([\d.]+)/);
  if(!prep||!log.includes('finished tid='+first.tid+' result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0'))throw Error('Missing preparation/cleanup evidence');
  const cycle={folder:s.folder,worker:first.tid,first,fired,prepareMs:Number(prep[1]),initialCapture,gameCapture,exitedCapture,ownedResourcesClean:true,hostPushes:0,rebootForExit:false};
  if(action==='run')Object.assign(record,{phase:'pre-reset',beforeReset:cycle});
  else Object.assign(record,{phase:'complete',afterReset:cycle,passed:true});
  save(record);console.log(JSON.stringify({action,folder:s.folder,phase:record.phase,worker:first.tid,prepareMs:cycle.prepareMs,ammo:fired.ammo,hostPushes:0,rebootForExit:false}));
}
