// Owned PC guest only: UI produces masks; worker consumes and generates frames.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {session,reviewedPayload} from './worker-input-emulator.mjs';
import {gesture,rpc} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
const s=session('worker-input-test'),payload=reviewedPayload();
if(s.state()!==null)throw Error('Begin at inactive owned launcher');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const elf=path.join(s.folder,'payload.elf');s.adb(['pull','/tmp/rw4-worker-input.elf',elf],'payload');
if(hash(fs.readFileSync(elf))!==payload.sha256)throw Error('Staged payload differs');
const faceFile=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',faceFile],'faces');
const active=JSON.parse(fs.readFileSync(faceFile)).watchface_list.filter(f=>String(f.type)==='1'&&String(f.in_use)==='1');
if(active.length!==1||active[0].id!=='365799903')throw Error('UIProbe not active');
const sourceFile=path.join(s.folder,'main.lua');s.adb(['pull','/data/app/watchface/market/365799903/lua/main.lua',sourceFile],'source');
if(!fs.readFileSync(sourceFile).equals(fs.readFileSync(path.join(projectRoot,'experiments/native-worker-input/main.lua'))))throw Error('Extracted Lua differs');
const pkg=JSON.parse(fs.readFileSync(path.join(projectRoot,'artifacts/package-review/ui-probe-package.json')));
if(pkg.workerInputMode!==true)throw Error('Expected winput package');
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const records=[],captures=[],workers=[];
const freeBefore=s.adb(['shell','free'],'free-before');
let expectedOverflows=0;
function save(){fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify(records,null,2)+'\n');}
async function sample(label,mask,paused=0){
  let state;
  for(let i=0;i<8;i++){
    state=s.state();
    if(state?.requested===mask&&state.applied===mask&&state.paused===paused&&state.queued===0&&state.ack===state.epoch)break;
    await delay(100);
  }
  records.push({label,atUtc:new Date().toISOString(),...state});save();
  if(!state||state.requested!==mask||state.applied!==mask||state.paused!==paused||state.queued!==0||state.ack!==state.epoch||
    state.error!==0||state.reason!==0||state.detached!==1||state.live!==1||state.owner===state.init||state.overflows!==expectedOverflows)throw Error('Input state differs: '+label);
  return state;
}
function pixel(a,x,y){return [...a.pixels.subarray((y*390+x)*a.bpp,(y*390+x)*a.bpp+3)];}
const colors=[[255,0,0],[0,255,0],[0,0,255],[255,255,255],[255,255,0],[0,255,255],[255,0,255],[0,0,0]];
function capture(label,mode,expectedMask){
  const name=path.basename(s.folder)+'-'+label;
  const result=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],{encoding:'utf8',windowsHide:true,shell:false,timeout:15000});
  if(result.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png'),a=readScreenshot(file);
  if(mode==='panel'){
    if(pixel(a,195,80).some(v=>v!==0)||pixel(a,195,300).some(v=>v>50)||pixel(a,365,300).every(v=>v<100))throw Error('Stock panel differs');
  }else{
    const color=mode==='launcher'?[16,24,32]:mode==='menu'?[32,48,64]:[18,52,73];
    if(!pixel(a,20,200).every((v,i)=>Math.abs(v-color[i])<=6))throw Error('Owned page differs: '+label);
  }
  let generation=null,mask=null;
  if(mode==='game'){
    generation=0;mask=0;
    for(let bit=0;bit<32;bit++){
      const p=pixel(a,35+bit*10+5,53);
      if(p.every(v=>v>=253))generation=(generation+2**bit)>>>0;else if(p.some(v=>v>2))throw Error('Mixed generation');
    }
    for(let bit=0;bit<4;bit++){
      const p=pixel(a,35+bit*80+40,61);
      if(p[0]<=2&&p[1]>=253&&p[2]<=2)mask|=1<<bit;else if(p.some(v=>v>2))throw Error('Mixed frame input');
    }
    if(!generation||expectedMask!==undefined&&mask!==expectedMask)throw Error('Unexpected frame input '+label);
    for(let y=0;y<140;y++)for(let x=0;x<320;x++){
      const rgb=y<8?colors[(generation>>>Math.floor(x/10))&1?3:7]:y<16?colors[(mask>>>Math.floor(x/80))&1?1:7]:
        y<70?colors[(Math.floor(x/40)+generation)&7]:colors[(Math.floor(x/16)^Math.floor(y/16)^generation)&1?3:7];
      if(!pixel(a,x+35,y+50).every((v,i)=>Math.abs(v-rgb[i])<=2))throw Error('Incoherent frame '+label+' '+x+','+y);
    }
  }
  captures.push({label,file,mode,generation,mask});fs.writeFileSync(path.join(s.folder,'captures.json'),JSON.stringify(captures,null,2)+'\n');
  return {generation,mask};
}
function integer(v){const b=[];do{b.push((v&127)|(v>127?128:0));v=Math.floor(v/128);}while(v);return Buffer.from(b);}
async function mouse(x,y,down){
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=390||y<0||y>=450||![0,1].includes(down))throw Error('Pointer out of bounds');
  await rpc('sendMouse',Buffer.concat([Buffer.from([8]),integer(x),Buffer.from([16]),integer(y),Buffer.from([24,down])]));
}
async function contact(points,callback){
  let last=points[0];
  try{
    await mouse(...last,0);await delay(150);await mouse(...last,1);await delay(650);
    for(let i=0;i<points.length;i++){
      last=points[i];if(i){await mouse(...last,1);await delay(650);}await callback(i);
    }
  }finally{await mouse(...last,0);await delay(450);}
}
async function exit(label,tid){
  await gesture(310,395,310,395);await sample(label+'-paused',0,1);
  await gesture(195,390,195,390);
  let absent=false;for(let i=0;i<12;i++){if(s.state()===null){absent=true;break;}await delay(150);}
  if(!absent||s.adb(['shell','lsmod'],label+'-modules').includes('rw4winput'))throw Error('Module remains');
  if(new RegExp('^\\s*'+tid+'\\s','m').test(s.adb(['shell','ps'],label+'-ps')))throw Error('Worker remains');
  for(const file of ['/dev/rw4wistream','/tmp/rw4-worker-input-0.bin','/tmp/rw4-worker-input-1.bin'])
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',file],label+'-absence')))throw Error('Owned node/copy remains');
  capture(label,'launcher');
}
capture('ready','launcher');await gesture(195,285,195,285);await delay(500);
const first=await sample('initial',0);workers.push(first.tid);
const ps=s.adb(['shell','ps'],'ps-running');if(!new RegExp('^\\s*'+first.tid+'\\s+'+first.owner+'\\s','m').test(ps))throw Error('Worker not in UI group');
capture('first-frame','game',0);
await contact([[125,285]],async()=>{
  const a=await sample('forward-held',1);capture('forward-frame','game',1);await delay(1000);const b=await sample('forward-held-repeat',1);
  if(a.changes!==b.changes||a.key_events!==b.key_events||b.steps<=a.steps||b.produced<=a.produced)throw Error('Repeated edges or worker did not progress');
});await sample('forward-released',0);
await contact([[70,285],[185,285],[185,355],[125,355]],async i=>sample('slide-'+i,[3,5,4,0][i]));await sample('slide-released',0);
await contact([[70,355]],async()=>sample('left-held',2));await sample('left-released',0);
await contact([[310,305]],async()=>{await sample('fire-held',8);capture('fire-frame','game',8);});await sample('fire-released',0);
await contact([[125,285],[310,305],[125,285]],async i=>sample('outside-'+i,i===0?1:0));await sample('outside-released',0);
await gesture(310,395,310,395);await sample('menu-paused',0,1);capture('menu','menu');
await gesture(195,195,195,195);await sample('resume-neutral',0);
await gesture(310,395,310,395);await gesture(195,285,195,285);
await contact([[310,305]],async()=>{
  await sample('cancel-held',8);await delay(3400);await sample('cancel-while-held',0,1);capture('held-cancelled','menu');
});await sample('cancel-after-release',0,1);
await gesture(195,195,195,195);await sample('fresh-resume',0);
await contact([[125,285]],async()=>sample('fresh-forward',1));await sample('fresh-release',0);
// Global panel is still available; explicit resume is required after returning.
await gesture(195,440,195,40);capture('stock-panel','panel');const panelA=await sample('stock-panel',0,1);await delay(350);const panelB=await sample('stock-panel-repeat',0,1);
if(panelA.steps!==panelB.steps||panelA.produced!==panelB.produced)throw Error('Worker advanced under panel');
await gesture(195,40,195,410);await sample('stock-return-paused',0,1);capture('stock-return','menu');
await gesture(195,195,195,195);await sample('stock-resume-neutral',0);
// Saturation is injected on UI by the dedicated finite QA button.
await gesture(310,395,310,395);await gesture(195,132,195,132);expectedOverflows=1;
await sample('overflow-neutral',0,1);capture('overflow-menu','menu');
await gesture(195,195,195,195);await sample('overflow-resume',0);
await contact([[310,305]],async()=>sample('post-overflow-fire',8));await sample('post-overflow-release',0);
await exit('first-exit',first.tid);
expectedOverflows=0;await gesture(195,285,195,285);const second=await sample('reentry-neutral',0);workers.push(second.tid);
capture('reentry-frame','game',0);await contact([[125,285]],async()=>sample('reentry-forward',1));await sample('reentry-release',0);
await exit('second-exit',second.tid);
const size=fs.statSync(logFile).size-offset;if(size<0||size>2*1024*1024)throw Error('Log exceeds bounded read');
const fd=fs.openSync(logFile,'r'),bytes=Buffer.alloc(size);try{fs.readSync(fd,bytes,0,size,offset);}finally{fs.closeSync(fd);}
const logs=bytes.toString('utf8'),markers=logs.split(/\r?\n/).filter(l=>/RW4_WINPUT/.test(l)).join('\n');
fs.writeFileSync(path.join(s.folder,'own-markers.txt'),markers+'\n');
if(/PANIC|RW4_WINPUT_UI: (error|input error|poll error|close error)/.test(logs))throw Error('Runtime failure marker');
for(const id of workers)if(!markers.includes('uninit rc=0 tid='+id+' reason=1 live=0 refs=0 requested=0 applied=0 queued=0'))throw Error('Missing neutral retirement '+id);
const events=[...markers.matchAll(/RW4_WINPUT_KEY: key=(\d+) down=([01]) tid=(\d+)/g)].map(m=>({key:Number(m[1]),down:Number(m[2]),tid:Number(m[3])}));
const bit={173:1,172:2,174:4,163:8},masks=new Map(workers.map(id=>[id,0]));
for(const event of events){if(!masks.has(event.tid)||!bit[event.key])throw Error('Wrong key producer');const mask=masks.get(event.tid),flag=bit[event.key];
  if(Boolean(mask&flag)===Boolean(event.down))throw Error('Duplicate key edge');masks.set(event.tid,event.down?mask|flag:mask&~flag);
}
if([...masks.values()].some(mask=>mask!==0)||!events.some(e=>e.key===163&&e.down===1))throw Error('Unreleased or missing keys');
const result={passed:true,folder:s.folder,workers,observations:records.length,fullFrameCaptures:captures.filter(c=>c.mode==='game').length,
  keyEvents:events.length,overflowCancelled:true,heldPauseCancelled:true,stockPanelPause:true,reentryClean:true,exitCycles:2,
  workerConsumedInput:true,noDoom:true,noWad:true,physicalTransport:false,rebootForExit:false,stockFocusLossWhileHeldTested:false,
  freeBefore,freeAfter:s.adb(['shell','free'],'free-after')};
fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
