// R70: bounded Lua pipeline traces + read-only screenshot sampling. Exact PC guest only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {session,requireOwnedLauncher} from './doom-ui-emulator.mjs';
import {gesture,rpc} from './emulator-ui.mjs';
import {captureScreenshot} from './emulator-screenshot.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No external targets');
const s=session('doom-perf');requireOwnedLauncher(s);
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const observations=[],screens=[],windows=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const save=()=>fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify({observations,screens,windows},null,2)+'\n');
function integer(v){const b=[];do{b.push((v&127)|(v>127?128:0));v=Math.floor(v/128);}while(v);return Buffer.from(b);}
async function mouse(x,y,down){
  if(![70,185].includes(x)||y!==380||![0,1].includes(down))throw Error('Unexpected own turn control');
  await rpc('sendMouse',Buffer.concat([Buffer.from([8]),integer(x),Buffer.from([16]),integer(y),Buffer.from([24,down])]));
}
function sample(label){
  const started=performance.now(),v=s.state(),ended=performance.now();observations.push({label,started,ended,state:v});save();
  if(!v||v.error||v.reason||!v.live||!v.ready||v.episode!==1||v.map!==1)throw Error('Engine not active: '+label);return v;
}
function imageHash(file){
  const a=readScreenshot(file),b=Buffer.alloc(320*200*3);let p=0;
  for(let y=40;y<240;y++)for(let x=35;x<355;x++){const at=(y*390+x)*a.bpp;b[p++]=a.pixels[at];b[p++]=a.pixels[at+1];b[p++]=a.pixels[at+2];}
  const at=(200*390+20)*a.bpp;if(![18,52,73].every((v,i)=>Math.abs(a.pixels[at+i]-v)<=6))throw Error('Game page not visible');
  return crypto.createHash('sha256').update(b).digest('hex');
}
async function screenshots(label,ms){
  const deadline=performance.now()+ms,first=screens.length;
  while(performance.now()<deadline&&screens.length<160){
    const started=performance.now(),name=path.basename(s.folder)+'-'+label+'-'+screens.length;
    const a=await captureScreenshot(name),received=performance.now(),hash=imageHash(a.output);
    screens.push({label,started,received,captureTimestamp:a.timestamp,file:a.output,hash});
    await delay(40);
  }
  const a=screens.slice(first);if(a.length<10)throw Error('Insufficient screenshot sampling');
  const changes=a.slice(1).filter((r,i)=>r.hash!==a[i].hash).length,span=a.at(-1).received-a[0].received;
  windows.push({label,samples:a.length,changes,spanMs:span,observedChangesPerSecond:changes*1000/span,
    maxSampleGapMs:Math.max(...a.slice(1).map((r,i)=>r.received-a[i].received)),actualRefreshFps:false});save();
}
async function turn(label,x,mask){
  const before=sample(label+'-before'),downAt=performance.now();let releaseTimer,releasePromise;
  try{
    await mouse(x,380,1);
    releaseTimer=setTimeout(()=>{releasePromise=mouse(x,380,0);},2800);
    let v;
    for(let i=0;i<12;i++){v=sample(label+'-poll');if(v.delivered_keys===mask&&v.angle!==before.angle)break;await delay(20);}
    if(v.delivered_keys!==mask||v.angle===before.angle)throw Error('Turn not processed');
    windows.push({label:label+'-input',hostObservedUpperBoundMs:performance.now()-downAt,includesRpcAndAdb:true});
    await screenshots(label,2000);
  }finally{clearTimeout(releaseTimer);if(releasePromise)await releasePromise;await mouse(x,380,0);}
  await delay(300);const v=sample(label+'-released');if(v.requested||v.applied||v.delivered_keys||v.queued)throw Error('Input not neutral');
}
function stats(v){
  if(!v.length)throw Error('Empty measurements');v=[...v].sort((a,b)=>a-b);
  return {samples:v.length,min:v[0],mean:v.reduce((a,b)=>a+b,0)/v.length,p50:v[Math.floor((v.length-1)*.5)],p95:v[Math.floor((v.length-1)*.95)],max:v.at(-1)};
}
function logs(){
  const n=fs.statSync(logFile).size-offset;if(n<0||n>2*1024*1024)throw Error('Log bound exceeded');
  const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}
  const t=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),t.split(/\r?\n/).filter(l=>/RW4_DOOM/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error)/.test(t))throw Error('Runtime error');return t;
}
try{
  await gesture(195,285,195,285);let first;
  for(let i=0;i<20;i++){await delay(100);const v=s.state();if(v?.ready&&v.produced>2){first=v;break;}}
  if(!first)throw Error('Engine not ready');sample('ready');
  await screenshots('idle',1200);await turn('right',185,4);await turn('left',70,2);
  const last=sample('before-exit');await gesture(310,405,310,405);await gesture(195,390,195,390);
  let absent=false;for(let i=0;i<20;i++){if(s.state()===null){absent=true;break;}await delay(100);}
  if(!absent||s.adb(['shell','lsmod'],'final-modules').includes('rw4doom')||new RegExp('^\\s*'+first.tid+'\\s','m').test(s.adb(['shell','ps'],'final-ps')))throw Error('UI did not retire module/worker');
  const log=logs(),rows=kind=>[...log.matchAll(new RegExp('RW4_DOOM_PERF: '+kind+' ([\\d,]+)','g'))].map(m=>m[1].split(',').map(Number));
  const frames=rows('frame'),inputs=rows('input'),timers=rows('timer');
  if(frames.length<20||frames.some(r=>r.length!==10||r.some(v=>!Number.isSafeInteger(v)||v<0))||inputs.length<4||inputs.some(r=>r.length!==6)||timers.length<20)throw Error('Incomplete bounded profile');
  if(!log.includes('finished tid='+first.tid+' result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0'))throw Error('Cleanup differs');
  const metric=col=>stats(frames.map(r=>r[col]/10));
  const gaps=frames.slice(1).map((r,i)=>(r[3]-frames[i][3])/10);
  const result={passed:true,folder:s.folder,worker:first.tid,physicalTransport:false,rebootForExit:false,hostUnload:false,
    frames,inputs,timers,windows,traceLimit:128,units:'100us exact guest wall clock',
    pipelineMs:{read:metric(4),decode:metric(5),cacheCommand:metric(6),writeTmpfs:metric(7),setSourceAndSize:metric(8),total:metric(9)},
    submissionGapMs:stats(gaps),submissionRate:(frames.length-1)*10000/(frames.at(-1)[3]-frames[0][3]),
    timerCallbackMs:stats(timers.map(r=>r[2]/10)),inputHandlerMs:stats(inputs.map(r=>r[2]/10)),
    inputDeliveryObservedAtUiMs:stats(inputs.map(r=>r[3]/10)),inputDeliveryIsExactLatency:false,
    engineWindow:{wallMs:last.wall_ms-first.wall_ms,tics:last.tic-first.tic,produced:last.produced-first.produced,callbacks:last.drawn-first.drawn},
    sourceSubmissionIsDisplayCompletion:false,observedImagesAreLowerBound:true,ownedResourcesClean:true};
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({folder:s.folder,passed:true,pipelineMs:result.pipelineMs,submissionGapMs:result.submissionGapMs,submissionRate:result.submissionRate,windows,inputHandlerMs:result.inputHandlerMs,inputDeliveryObservedAtUiMs:result.inputDeliveryObservedAtUiMs},null,2));
}catch(e){fs.writeFileSync(path.join(s.folder,'failure.json'),JSON.stringify({error:e.message,physicalTransport:false},null,2)+'\n');save();throw e;}
