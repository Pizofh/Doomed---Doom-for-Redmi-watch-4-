// Bounded diagnostic input test in the owned PC emulator; no game or hardware.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,gesture,rpc} from './emulator-ui.mjs';
import {bridgeState} from './lua-bridge-state.mjs';
import {assertUiProbe,assertNativePattern,readScreenshot} from './assert-ui-probe.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
guardEmulator();if(bridgeState().registered)throw Error('Start only from inactive own launcher');
const folder=path.join(projectRoot,'artifacts/emulator/ui-keys-'+Date.now());fs.mkdirSync(folder);
const prefix=path.basename(folder),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('Unreviewed ADB');
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const records=[];
function save(){fs.writeFileSync(path.join(folder,'observations.json'),JSON.stringify(records,null,2)+'\n');}
function adb(args,label){
  const r=spawnSync(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label);return r.stdout+r.stderr;
}
const guest=path.join(folder,'native-readback.elf');adb(['pull','/tmp/rw4-lua-bridge.elf',guest],'native-readback');
if(hash(fs.readFileSync(guest))!=='ec7b6d5d1eab951a27423607a82ef8801778c9ccc6dfd515a2c50a4891e0a844')throw Error('Unreviewed C');
const pkg=JSON.parse(fs.readFileSync(path.join(projectRoot,'artifacts/package-review/ui-probe-package.json')));
if(pkg.controlsMode!==true)throw Error('Controls package required');
function snapshot(label,held,paused=0){
  // Read-only 64-byte snapshot. Never pop the Lua UI consumer's key queue.
  const code="local f <close> = assert(io.open('/dev/rw4bridge','rb')); f:setvbuf('no'); local b=assert(f:read(64)); assert(f:close()); local v={string.unpack('<I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4',b)}; for i=1,16 do io.write(tostring(v[i]),' ') end; io.write('KEY_SNAPSHOT_END')";
  const out=adb(['shell','lua','-e','"'+code+'"'],label);
  const m=out.match(/((?:\d+\s+){16})KEY_SNAPSHOT_END/);if(!m)throw Error('No key snapshot');
  const v=m[1].trim().split(/\s+/).map(Number);
  const s={sequence:v[1],active:v[2],paused:v[3],held:v[8],queued:v[9],changes:v[10],overflows:v[11],cancels:v[12],sampled:v[13],steps:v[14]};
  records.push({label,atUtc:new Date().toISOString(),...s});save();
  if(v[0]!==0x34574252||v[15]!==32||s.active!==1||s.held!==held||s.paused!==paused||s.overflows!==0||s.queued>32)throw Error('Unexpected input state: '+label);
  return s;
}
function capture(label,surface){
  const name=prefix+'-'+label,r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.error||r.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png');
  if(surface==='launcher'||surface==='page')assertUiProbe(file,surface);
  if(surface==='page'){
    try{assertNativePattern(file,0,50);}catch{assertNativePattern(file,1,50);}
  }
  if(surface==='menu'){
    const {pixels,bpp}=readScreenshot(file);
    for(const [x,y] of [[20,100],[20,230],[370,250]]){
      const p=(y*390+x)*bpp;
      if(![33,49,66].every((v,i)=>pixels[p+i]===v))throw Error('Expected own paused menu');
    }
  }
  return file;
}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function varint(v){const b=[];do{b.push((v&127)|(v>127?128:0));v=Math.floor(v/128);}while(v);return Buffer.from(b);}
async function mouse(x,y,down){
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=390||y<0||y>=450||![0,1].includes(down))throw Error('Mouse outside own display');
  await rpc('sendMouse',Buffer.concat([Buffer.from([8]),varint(x),Buffer.from([16]),varint(y),Buffer.from([24,down])]));
}
async function contact(points,fn){
  let last=points[0];
  try{
    await mouse(...last,0);await delay(150);await mouse(...last,1);await delay(650);
    for(let i=0;i<points.length;i++){
      last=points[i];if(i){await mouse(...last,1);await delay(650);}await fn(i);
    }
  }finally{await mouse(...last,0);await delay(450);}
}
capture('launcher','launcher');await gesture(195,285,195,285);await delay(300);capture('game','page');snapshot('initial',0);
await contact([[125,285]],async()=>{
  const a=snapshot('forward-held',1);await delay(1000);const b=snapshot('forward-held-repeat',1);
  if(b.changes!==a.changes||b.steps<=a.steps||b.sampled!==1||b.queued!==0)throw Error('Held state repeated edges or was not sampled');
});snapshot('forward-released',0);
await contact([[70,285],[185,285],[185,355],[125,355]],async i=>snapshot('slide-'+i,[3,5,4,0][i]));snapshot('slide-released',0);
await contact([[70,355]],async()=>snapshot('left-held',2));snapshot('left-released',0);
await contact([[310,305]],async()=>{snapshot('fire-held',8);capture('fire','page');});snapshot('fire-released',0);
await contact([[125,285],[310,305],[125,285]],async i=>snapshot('outside-'+i,i===0?1:0));snapshot('outside-released',0);
await gesture(310,395,310,395);capture('menu','menu');snapshot('menu-paused',0,1);
await gesture(195,195,195,195);snapshot('resume-neutral',0);capture('resumed','page');
// Own bounded timer pauses while the pointer is STILL down. Not a stock-focus-loss test.
await gesture(310,395,310,395);await gesture(195,285,195,285);
await contact([[310,305]],async()=>{
  snapshot('cancel-test-held',8);await delay(3400);snapshot('cancel-while-held',0,1);capture('held-cancelled','menu');
});snapshot('cancel-after-release',0,1);
await gesture(195,195,195,195);snapshot('fresh-resume',0);
await contact([[125,285]],async()=>snapshot('fresh-forward',1));snapshot('fresh-released',0);
await gesture(310,395,310,395);await gesture(195,390,195,390);capture('exit','launcher');
if(bridgeState().registered)throw Error('EXIT did not unload');
await gesture(195,285,195,285);snapshot('reentry',0);capture('reentry','page');
await gesture(310,395,310,395);await gesture(195,390,195,390);capture('second-exit','launcher');
const after=bridgeState();if(after.registered)throw Error('Second EXIT did not unload');
const tmp=adb(['shell','ls','-l','/tmp'],'tmp-after');if(/rw4-loop-frame/.test(tmp))throw Error('Owned frame files retained');
const size=fs.statSync(logFile).size-offset;if(size<0||size>2*1024*1024)throw Error('Log exceeds bound');
const buf=Buffer.alloc(size),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,buf,0,size,offset);}finally{fs.closeSync(fd);}
const excerpts=buf.toString('utf8').split(/\r?\n/).filter(l=>/RW4_|PANIC|ERROR.*lua/i.test(l)).join('\n');
fs.writeFileSync(path.join(folder,'excerpts.txt'),excerpts+'\n');
if(/PANIC|RW4_INPUT_UI: (error|frame error|exit cleanup error|start failed)/.test(excerpts))throw Error('Input UI reported failure');
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify({passed:true,observations:records.length,after,physicalTransport:false,stockFocusLossWhileHeldTested:false},null,2)+'\n');
console.log(JSON.stringify({passed:true,folder,observations:records.length,physicalTransport:false}));
