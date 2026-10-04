// New integration test only: original Doom, own Lua controls, exact PC guest.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {session,requireOwnedLauncher} from './doom-ui-emulator.mjs';
import {gesture,rpc} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
const s=session('doom-ui-test');requireOwnedLauncher(s);
const records=[],captures=[],workers=[],finishes=[];
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const save=()=>fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify(records,null,2)+'\n');
async function sample(label,mask=0,paused=0){
  let v;
  for(let i=0;i<20;i++){
    v=s.state();
    if(v?.ready===1&&v.requested===mask&&v.applied===mask&&v.delivered_keys===mask&&v.paused===paused&&v.queued===0&&v.ack===v.epoch)break;
    await delay(100);
  }
  records.push({label,atUtc:new Date().toISOString(),...v});save();
  if(!v||v.ready!==1||v.requested!==mask||v.applied!==mask||v.delivered_keys!==mask||v.paused!==paused||v.queued||v.ack!==v.epoch||
    v.error||v.reason||v.overflows||!v.live||v.detached!==1||v.owner===v.init||v.episode!==1||v.map!==1||v.gamestate!==0)throw Error('Doom state differs: '+label);
  return v;
}
function pixel(a,x,y){const at=(y*390+x)*a.bpp;return [...a.pixels.subarray(at,at+3)];}
function capture(label,mode){
  const name=path.basename(s.folder)+'-'+label;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png'),a=readScreenshot(file);
  const color=mode==='launcher'?[16,24,32]:mode==='menu'?[32,48,64]:[18,52,73];
  if(!pixel(a,20,200).every((v,i)=>Math.abs(v-color[i])<=6))throw Error('UI page differs: '+label);
  captures.push({label,file,mode});fs.writeFileSync(path.join(s.folder,'captures.json'),JSON.stringify(captures,null,2)+'\n');return a;
}
function integer(v){const b=[];do{b.push((v&127)|(v>127?128:0));v=Math.floor(v/128);}while(v);return Buffer.from(b);}
async function mouse(x,y,down){
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=390||y<0||y>=450||![0,1].includes(down))throw Error('Pointer out of bounds');
  await rpc('sendMouse',Buffer.concat([Buffer.from([8]),integer(x),Buffer.from([16]),integer(y),Buffer.from([24,down])]));
}
async function held(x,y,mask,label){
  let a,b;
  try{
    await mouse(x,y,0);await delay(150);await mouse(x,y,1);await delay(350);
    a=await sample(label+'-held',mask);await delay(450);b=await sample(label+'-held-repeat',mask);
    if(a.changes!==b.changes||b.tic<=a.tic)throw Error('Repeated edge or no game progress');
  }finally{await mouse(x,y,0);await delay(300);}
  const released=await sample(label+'-released');return {a,b,released};
}
// NSH requests only cooperative pause/stop; cache/unload remain on the UI task.
function lifecycle(op){
  if(![2,3].includes(op))throw Error('Unexpected lifecycle op');
  const code="local r <close> = assert(io.open('/dev/rw4doom','rb'));r:setvbuf('no');local b=assert(r:read(192));assert(r:close());local v={string.unpack('<'..string.rep('I4',48),b)};local w <close> = assert(io.open('/dev/rw4doom','wb'));w:setvbuf('no');local ok,e,n=w:write(string.pack('<I4I4I4',0x34574c52,v[2]+1,"+op+"));assert(w:close());print(ok and 'LIFECYCLE_OK' or 'LIFECYCLE_RETRY',n)";
  const out=s.adb(['shell','lua','-e','"'+code+'"'],'lifecycle-'+op);
  if(!out.includes('LIFECYCLE_OK'))throw Error('Lifecycle sequence race; inspect before retry');
}
async function exit(tid,label){
  await gesture(310,405,310,405);await sample(label+'-menu',0,1);await gesture(195,390,195,390);
  let absent=false;for(let i=0;i<20;i++){if(s.state()===null){absent=true;break;}await delay(100);}
  if(!absent||s.adb(['shell','lsmod'],label+'-modules').includes('rw4doom'))throw Error('Module remains');
  if(new RegExp('^\\s*'+tid+'\\s','m').test(s.adb(['shell','ps'],label+'-ps')))throw Error('Worker remains');
  for(const f of ['/dev/rw4doomstream','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin'])
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',f],label+'-absence')))throw Error('Node/copy remains');
  capture(label,'launcher');
}
function markers(){
  const size=fs.statSync(logFile).size-offset;if(size<0||size>2*1024*1024)throw Error('Log exceeds bound');
  const f=fs.openSync(logFile,'r'),b=Buffer.alloc(size);try{fs.readSync(f,b,0,size,offset);}finally{fs.closeSync(f);}
  const logs=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),logs.split(/\r?\n/).filter(l=>/RW4_DOOM|RW4_RUNTIME/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error)/.test(logs))throw Error('Runtime failure marker');
  return logs;
}
const freeBefore=s.adb(['shell','free'],'free-before');
try{
  capture('ready','launcher');await gesture(195,285,195,285);const first=await sample('first-level');workers.push(first.tid);
  capture('first-frame','game');
  const ps=s.adb(['shell','ps'],'running-ps');if(!new RegExp('^\\s*'+first.tid+'\\s+'+first.owner+'\\s','m').test(ps))throw Error('Worker not in UI group');
  await delay(1200);const paced=await sample('frame-progress');
  if(paced.tic<=first.tic||paced.produced<=first.produced)throw Error('Frames/tics did not advance');
  const forward=await held(125,315,1,'forward');if(forward.released.x===first.x&&forward.released.y===first.y)throw Error('Doom player did not move');
  const left=await held(70,380,2,'left');if(left.released.angle===forward.released.angle)throw Error('No left turn');
  const right=await held(185,380,4,'right');if(right.released.angle===left.released.angle)throw Error('No right turn');
  const fire=await held(310,325,8,'fire');if(fire.released.ammo>=right.released.ammo)throw Error('Doom weapon did not consume ammo');
  capture('after-controls','game');
  await gesture(310,405,310,405);const pauseA=await sample('menu-pause',0,1);capture('menu','menu');await delay(800);const pauseB=await sample('menu-pause-repeat',0,1);
  if(['tic','x','y','angle','ammo','drawn'].some(k=>pauseA[k]!==pauseB[k]))throw Error('Engine advanced while paused');
  await gesture(195,195,195,195);await sample('menu-resume');await delay(300);
  // Freeze natively, drain two queued frames, compare every rendered pixel.
  lifecycle(3);await sample('capture-pause',0,1);await delay(650);
  const screenshot=capture('stable-doom','game');let matched=false,colors=0;
  for(let slot=0;slot<2;slot++){
    const f=path.join(s.folder,'stable-frame-'+slot+'.bin');s.adb(['pull','/tmp/rw4-doom-frame-'+slot+'.bin',f],'stable-frame-'+slot);
    const b=fs.readFileSync(f);if(b.length!==128012||!b.subarray(0,12).equals(Buffer.from([25,18,0,0,64,1,200,0,128,2,0,0])))throw Error('Image format differs');
    let good=true;const palette=new Set();
    for(let y=0;y<200;y++)for(let x=0;x<320;x++){
      const v=b.readUInt16LE(12+2*(y*320+x));palette.add(v);
      const rgb=[((v>>>11)&31)*255/31,((v>>>5)&63)*255/63,(v&31)*255/31];
      if(!pixel(screenshot,x+35,y+40).every((c,i)=>Math.abs(c-rgb[i])<=7))good=false;
    }
    if(good){matched=true;colors=palette.size;}
  }
  if(!matched||colors<32)throw Error('Complete Doom frame did not match LVGL display');
  await gesture(310,405,310,405);await sample('capture-menu',0,1);await gesture(195,195,195,195);const resumed=await sample('capture-resume');
  await delay(600);const later=await sample('resumed-progress');if(later.tic<=resumed.tic)throw Error('Resume did not progress');
  await exit(first.tid,'first-exit');
  await gesture(195,285,195,285);const second=await sample('fresh-reentry');workers.push(second.tid);
  if(second.ammo!==50||second.x!==first.x||second.y!==first.y||second.angle!==first.angle)throw Error('Doom globals did not reset on reload');
  capture('reentry-frame','game');await exit(second.tid,'second-exit');
  const logs=markers();
  for(const tid of workers){
    const m=logs.match(new RegExp('RW4_DOOM_UI: finished tid='+tid+' result=(\\d+) peak=(\\d+) alloc=(\\d+) free=(\\d+) streams=(\\d+) cleanup=(\\d+)'));
    if(!m||m[1]!=='1'||m[3]!==m[4]||m[5]!=='0'||m[6]!=='0'||!logs.includes('uninit rc=0 tid='+tid+' reason=1 live=0 refs=0 requested=0 applied=0 queued=0'))throw Error('Missing clean stop '+tid);
    finishes.push({tid,reason:Number(m[1]),peakBytes:Number(m[2]),allocated:Number(m[3]),freed:Number(m[4]),streams:Number(m[5]),cleanup:Number(m[6])});
  }
  const result={passed:true,folder:s.folder,workers,finishes,observations:records.length,fullImageCompared:true,frameColors:colors,
    originalDoom:true,episode:1,map:1,forward:true,left:true,right:true,fire:true,ammoBefore:right.released.ammo,ammoAfter:fire.released.ammo,
    pauseFrozen:true,resumeProgress:true,reentryClean:true,exitCycles:2,rebootForExit:false,physicalTransport:false,
    pacingWindow:{wallMs:paced.wall_ms-first.wall_ms,tics:paced.tic-first.tic,framesProduced:paced.produced-first.produced,callbacks:paced.drawn-first.drawn},
    freeBefore,freeAfter:s.adb(['shell','free'],'free-after')};
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}catch(e){
  fs.writeFileSync(path.join(s.folder,'failure.json'),JSON.stringify({error:e.message,physicalTransport:false},null,2)+'\n');
  // Stop without forced unload; active UI remains responsible for collection.
  try{if(s.state()){lifecycle(2);await delay(700);console.log('Failure cleanup state',s.state());}}catch(cleanup){console.log('Retained for inspection:',cleanup.message);}
  throw e;
}
