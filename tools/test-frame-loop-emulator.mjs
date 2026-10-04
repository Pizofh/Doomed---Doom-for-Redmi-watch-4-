// Start only from the known own launcher. Bounded PC-only frame/lifecycle test.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,gesture} from './emulator-ui.mjs';
import {bridgeState} from './lua-bridge-state.mjs';
import {assertUiProbe,assertNativePattern} from './assert-ui-probe.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
guardEmulator();
const folder=path.join(projectRoot,'artifacts/emulator/frame-loop-'+Date.now());
fs.mkdirSync(folder);
const prefix=path.basename(folder), hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const adbExe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(adbExe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('Unreviewed ADB');
const host=JSON.parse(fs.readFileSync(path.join(projectRoot,'artifacts/emulator/host-process.json'),'utf8'));
if(host.stdoutPath!==path.join(projectRoot,'artifacts/emulator/host-stdout.txt'))throw Error('Unexpected log source');
const startOffset=fs.statSync(host.stdoutPath).size;
function logs(){
  const size=fs.statSync(host.stdoutPath).size-startOffset;
  if(size<0||size>2*1024*1024)throw Error('Emulator log exceeds test bound');
  const b=Buffer.alloc(size),fd=fs.openSync(host.stdoutPath,'r');
  try{fs.readSync(fd,b,0,size,startOffset);}finally{fs.closeSync(fd);}
  return b.toString('utf8');
}
function adb(args,label){
  const r=spawnSync(adbExe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:128*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label);
  return r.stdout+r.stderr;
}
function capture(label,surface){
  const name=prefix+'-'+label;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536});
  if(r.error||r.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png');
  if(surface)assertUiProbe(file,surface);
  if(surface==='page'){
    let phase;
    try{assertNativePattern(file,0);phase=0;}catch{assertNativePattern(file,1);phase=1;}
    return {name,phase};
  }
  return {name};
}
const records=[];
function save(){fs.writeFileSync(path.join(folder,'observations.json'),JSON.stringify(records,null,2)+'\n');
  fs.writeFileSync(path.join(folder,'loop-excerpts.txt'),logs().split(/\r?\n/).filter(l=>/RW4_|PANIC|ERROR.*lua|lua.*crash/i.test(l)).join('\n')+'\n');}
function sample(label,surface){
  const atUtc=new Date().toISOString(),native=bridgeState();
  const free=adb(['shell','free'],label+'-free');
  const files=adb(['shell','ls','-l','/tmp'],label+'-files');
  const owned=[...files.matchAll(/(\d+)\s+(rw4-loop-frame-[^\s]+)/g)];
  if(native.registered){
    if(owned.length!==2||new Set(owned.map(m=>m[2])).size!==2||owned.some(m=>
      !/^rw4-loop-frame-[01]\.bin$/.test(m[2])||Number(m[1])>89612||
      (native.state.paused===1&&Number(m[1])!==89612)))throw Error('Frame files are not bounded to the two slots');
  }else if(owned.length)throw Error('Frame files remained without module');
  const screenshot=capture(label,surface);
  const value={label,atUtc,native,free,files,screenshot};records.push(value);save();return value;
}
capture('launcher','launcher');
if(bridgeState().registered)throw Error('Exit current native activity before this test');
const payload=path.join(folder,'native-before.elf');adb(['pull','/tmp/rw4-lua-bridge.elf',payload],'native-before');
if(hash(fs.readFileSync(payload))!=='f345f4c2e2ec7a6811dad0f66e077dc65b397271aa8291da4b1fdd2f1851a0b6')throw Error('Unreviewed loop payload');
await gesture(195,285,195,285);
sample('active-0','page');
// Short waits keep the owner responsive; native test has a 300-frame ceiling.
await new Promise(r=>setTimeout(r,1300));
sample('active-1','page');
await gesture(195,440,195,40);
const pause1=sample('paused-0');
if(!pause1.native.registered||pause1.native.state.paused!==1)throw Error('Panel did not pause native activity');
await new Promise(r=>setTimeout(r,1500));
await gesture(50,45,50,45);
const pause2=sample('paused-1');
if(JSON.stringify(pause1.native.state)!==JSON.stringify(pause2.native.state))throw Error('Updates/input continued behind panel');
await gesture(195,10,195,330);
const resumed=sample('resumed','page');
if(resumed.native.state.paused!==0)throw Error('Panel close did not resume');
const deadline=Date.now()+90000;
let finished=false,index=0;
while(Date.now()<deadline){
  await new Promise(r=>setTimeout(r,5000));
  const text=logs();
  if(/RW4_UI_LOOP: frame failed|PANIC/.test(text))throw Error('Frame loop failed; preserve state for inspection');
  const point=sample('running-'+index++,'page');
  if(!point.native.registered)throw Error('Native activity vanished');
  if(text.includes('RW4_UI_LOOP: budget reached 300')){finished=true;break;}
}
if(!finished)throw Error('Frame budget did not complete in deadline');
const end=sample('budget','page');
if(end.native.state.paused!==1)throw Error('Budget did not pause C');
await new Promise(r=>setTimeout(r,1200));
const idle=sample('budget-idle','page');
if(JSON.stringify(end.native.state)!==JSON.stringify(idle.native.state))throw Error('Budget did not stop updates');
await gesture(195,390,195,390);
const exited=sample('exit','launcher');
if(exited.native.registered||/rw4-loop-frame-[01]\.bin/.test(exited.files))throw Error('Exit left own nodes or frame files');
await gesture(195,285,195,285);
sample('reopened','page');
await new Promise(r=>setTimeout(r,1300));
sample('reopened-running','page');
await gesture(195,390,195,390);
const final=sample('exit-again','launcher');
if(final.native.registered||/rw4-loop-frame-[01]\.bin/.test(final.files))throw Error('Reentry cleanup failed');
const text=logs(),progress=[...text.matchAll(/RW4_UI_LOOP: frames=(\d+) lua_kib=([\d.]+)/g)].map(m=>({frames:Number(m[1]),luaKiB:Number(m[2])}));
const phases=[...new Set(records.filter(r=>r.screenshot.phase!==undefined).map(r=>r.screenshot.phase))];
if(phases.length!==2)throw Error('Both native phases were not captured; inspect timing');
const result={passed:true,folder,progress,phases,records:records.length,periodMs:200,limit:300,
  nativeSha256:hash(fs.readFileSync(payload)),physicalTransport:false,
  limitations:['Short finite run; no long-duration leak proof','Measured source updates are not display FPS','No Doom, held input or physical compatibility tested']};
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
