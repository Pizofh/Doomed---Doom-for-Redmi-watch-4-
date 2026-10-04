// R72: one bounded 90-second run at the reviewed 50ms Lua interval. PC emulator only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {session,requireOwnedLauncher} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';
import {captureScreenshot} from './emulator-screenshot.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No external targets');
const source=fs.readFileSync(path.join(projectRoot,'experiments/doom-ui/main.lua'));
if(crypto.createHash('sha256').update(source).digest('hex')!=='8e347b1b0a0ea4706e50761ca3a58739fe985660585afbd6b1b8f008f54990aa')throw Error('Expected reviewed R71 Lua');
const s=session('doom-stability');requireOwnedLauncher(s);
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const rows=[],actions=[],captures=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const save=()=>fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify({rows,actions,captures},null,2)+'\n');
function memory(label){
  const raw=s.adb(['shell','free'],label+'-free'),out={};
  for(const n of ['GImageCache','Umem']){
    const m=raw.match(new RegExp('^\\s*'+n+':\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*$','m'));
    if(!m)throw Error('Memory format differs');out[n]=Object.fromEntries(['total','used','free','maxused','maxfree','nused','nfree'].map((k,i)=>[k,Number(m[i+1])]));
  }
  return out;
}
function files(label){
  const raw=s.adb(['shell','ls','-l','/tmp'],label+'-tmp'),own=[...raw.matchAll(/(\d+)\s+(rw4-doom[^\s]*)\s*$/gm)].map(m=>({name:m[2],bytes:Number(m[1])}));
  const expected={'rw4-doom-ui.elf':446144,'rw4-doom1.wad':4196020,'rw4-doom-frame-0.bin':128012,'rw4-doom-frame-1.bin':128012};
  if(own.length!==4||new Set(own.map(r=>r.name)).size!==4||own.some(r=>!(r.name in expected)||r.bytes>expected[r.name]||(!r.name.includes('frame-')&&r.bytes!==expected[r.name])))throw Error('Own tmp set changed');
  // A stat can race the brief truncation/write of an existing frame; never read its mutable content here.
  return own;
}
function state(label){
  const v=s.state();if(!v||!v.ready||!v.live||v.reason||v.error||v.stop||v.paused||v.overflows||v.episode!==1||v.map!==1||v.gamestate!==0)throw Error('Engine not active: '+label);return v;
}
async function capture(label,launcher=false){
  const a=await captureScreenshot(path.basename(s.folder)+'-'+label),p=readScreenshot(a.output),at=(200*390+20)*p.bpp,color=launcher?[16,24,32]:[18,52,73];
  if(!color.every((v,i)=>Math.abs(p.pixels[at+i]-v)<=6))throw Error('Unexpected UI surface');captures.push({label,...a});save();
}
function sample(label){
  const native=state(label),row={label,atUtc:new Date().toISOString(),native,memory:memory(label),files:files(label)};
  rows.push(row);save();console.log(JSON.stringify({sample:label,wallMs:native.wall_ms,tic:native.tic,produced:native.produced,umemUsed:row.memory.Umem.used,cacheUsed:row.memory.GImageCache.used}));return row;
}
function logs(){
  const n=fs.statSync(logFile).size-offset;if(n<0||n>2*1024*1024)throw Error('Log bound exceeded');
  const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}
  const t=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),t.split(/\r?\n/).filter(l=>/RW4_DOOM/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error)/.test(t))throw Error('Runtime error marker');return t;
}
try{
  const memoryBefore=memory('before');await gesture(195,285,195,285);
  let ready=false;for(let i=0;i<30;i++){const v=s.state();if(v?.ready&&v.produced>2){ready=true;break;}await delay(100);}
  if(!ready)throw Error('Engine not ready');const first=sample('t0'),start=performance.now();await capture('initial');
  for(let i=1;i<=9;i++){
    await delay(Math.max(0,start+i*10000-performance.now()));const row=sample('t'+i*10);
    if(row.native.tid!==first.native.tid||row.native.tic<=rows.at(-2).native.tic||row.native.produced<=rows.at(-2).native.produced)throw Error('Worker stopped making progress');
    if(i===3||i===7){
      const fire=i===7;await gesture(fire?310:185,fire?325:380,fire?310:185,fire?325:380,800);await delay(250);
      const after=state(fire?'fire-released':'turn-released');
      if(after.requested||after.applied||after.delivered_keys||after.queued||(fire?after.ammo>=row.native.ammo:after.angle===row.native.angle))throw Error('Control/release did not work');
      actions.push({label:fire?'fire':'right',before:row.native,after});save();
    }
    if(i===4||i===9)await capture('t'+i*10);
  }
  const last=rows.at(-1);if(last.native.wall_ms-first.native.wall_ms<89000||last.native.wall_ms>=115000)throw Error('Duration outside safe test window');
  await gesture(310,405,310,405);await gesture(195,390,195,390);
  let absent=false;for(let i=0;i<30;i++){if(s.state()===null){absent=true;break;}await delay(100);}
  if(!absent||s.adb(['shell','lsmod'],'modules').includes('rw4doom')||new RegExp('^\\s*'+first.native.tid+'\\s','m').test(s.adb(['shell','ps'],'ps')))throw Error('UI did not retire module/worker');
  for(const f of ['/dev/rw4doomstream','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin'])if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',f],'absence')))throw Error('Resource remains');
  await capture('exited',true);const memoryAfter=memory('after'),log=logs();
  if(!log.includes('finished tid='+first.native.tid+' result=1 peak=6582961 alloc=13 free=13 streams=0 cleanup=0')||!log.includes('uninit rc=0 tid='+first.native.tid+' reason=1 live=0 refs=0 requested=0 applied=0 queued=0'))throw Error('Cleanup differs');
  const m=log.match(/RW4_DOOM_PERF: units=100us submitted=(\d+) frame_samples=(\d+) period=50 trace_limit=256/);
  if(!m||Number(m[1])<1000||Number(m[2])!==256||(log.match(/RW4_DOOM_PERF: frame /g)||[]).length!==256||(log.match(/RW4_DOOM_PERF: timer /g)||[]).length!==256)throw Error('Bounded profiling differs');
  const elapsed=last.native.wall_ms-first.native.wall_ms,steady=rows.filter(r=>Number(r.label.slice(1))>=20),summary={};
  for(const n of ['GImageCache','Umem']){const v=steady.map(r=>r.memory[n].used);summary[n]={steadyFromSeconds:20,minUsed:Math.min(...v),maxUsed:Math.max(...v),firstUsed:v[0],lastUsed:v.at(-1),netUsedChange:v.at(-1)-v[0],samples:v.length};}
  const result={passed:true,folder:s.folder,physicalTransport:false,worker:first.native.tid,elapsedGuestMs:elapsed,
    tics:last.native.tic-first.native.tic,framesProduced:last.native.produced-first.native.produced,submittedTotal:Number(m[1]),
    frameTraceSamples:256,timerTraceSamples:256,timerPeriodMs:50,sampleCount:rows.length,actions:actions.map(a=>a.label),captures:captures.length,
    memoryBefore,memoryAfter,memorySummary:summary,filesBounded:rows.every(r=>r.files.filter(f=>f.name.includes('frame-')).every(f=>f.bytes<=128012)),
    ownedResourcesClean:true,rebootForExit:false,hostUnload:false,longTermLeakFreedomProven:false};
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}catch(e){save();fs.writeFileSync(path.join(s.folder,'failure.json'),JSON.stringify({error:e.message,physicalTransport:false},null,2)+'\n');throw e;}
