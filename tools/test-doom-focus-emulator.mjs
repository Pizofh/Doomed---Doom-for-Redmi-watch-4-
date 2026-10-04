// R68: original Doom, stock focus and cooperative STOP with pointer still down.
// Reviewed emulator only. No host kill/unload/LVGL, USB or arbitrary targets.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {session,requireOwnedLauncher} from './doom-ui-emulator.mjs';
import {gesture,rpc} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
const s=session('doom-focus-test');requireOwnedLauncher(s);
const observations=[],captures=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const logFile=path.join(projectRoot,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
const freeBefore=s.adb(['shell','free'],'free-before');
let pointerDown=false,worker=0;
function record(label,v){
  observations.push({label,atUtc:new Date().toISOString(),...v});
  fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify(observations,null,2)+'\n');return v;
}
async function sample(label,mask=0,paused=0){
  let v;
  for(let i=0;i<20;i++){
    v=s.state();
    if(v?.ready===1&&v.requested===mask&&v.applied===mask&&v.delivered_keys===mask&&v.paused===paused&&v.queued===0&&v.ack===v.epoch)break;
    await delay(100);
  }
  record(label,v);
  if(!v||v.ready!==1||v.requested!==mask||v.applied!==mask||v.delivered_keys!==mask||v.paused!==paused||v.queued||v.ack!==v.epoch||
    v.error||v.reason||v.overflows||v.live!==1||v.detached!==1||v.owner===v.init||v.episode!==1||v.map!==1||v.gamestate!==0)throw Error('State differs: '+label);
  return v;
}
function pixel(a,x,y){const at=(y*390+x)*a.bpp;return [...a.pixels.subarray(at,at+3)];}
function capture(label,mode){
  const name=path.basename(s.folder)+'-'+label;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),name],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.error||r.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',name+'.png'),a=readScreenshot(file);
  if(mode==='panel'){
    if(pixel(a,195,80).some(v=>v!==0)||pixel(a,195,300).some(v=>v>50)||pixel(a,365,300).every(v=>v<100))throw Error('Stock panel not recognized; no panel tap allowed');
  }else{
    const rgb=mode==='launcher'?[16,24,32]:mode==='menu'?[32,48,64]:[18,52,73];
    if(!pixel(a,20,200).every((v,i)=>Math.abs(v-rgb[i])<=6))throw Error('Own page differs: '+label);
  }
  captures.push({label,file,mode});fs.writeFileSync(path.join(s.folder,'captures.json'),JSON.stringify(captures,null,2)+'\n');
}
function frozen(a,b){
  if(['tic','x','y','angle','ammo','drawn','produced','changes','key_events'].some(k=>a[k]!==b[k]))throw Error('Game/input progressed while paused');
}
function integer(v){const b=[];do{b.push((v&127)|(v>127?128:0));v=Math.floor(v/128);}while(v);return Buffer.from(b);}
async function firePointer(down){
  // y325 is inside FIRE but outside START when the launcher replaces the game.
  await rpc('sendMouse',Buffer.concat([Buffer.from([8]),integer(310),Buffer.from([16]),integer(325),Buffer.from([24,down])]));
  pointerDown=down===1;
}
async function stop(){
  // Fresh sequence and all descriptors closed; UI may publish a cache command.
  // Retry only known EINVAL sequence races, as in the reviewed R62 STOP test.
  const code="local r <close> = assert(io.open('/dev/rw4doom','rb'));r:setvbuf('no');local b=assert(r:read(192));assert(r:close());local v={string.unpack('<'..string.rep('I4',48),b)};local w <close> = assert(io.open('/dev/rw4doom','wb'));w:setvbuf('no');local ok,e,n=w:write(string.pack('<I4I4I4',0x34574c52,v[2]+1,2));assert(w:close());print(ok and 'OWN_STOP_OK' or 'OWN_STOP_RETRY',n)";
  for(let i=0;i<6;i++){
    const out=s.adb(['shell','lua','-e','"'+code+'"'],'stop-'+i);
    if(out.includes('OWN_STOP_OK'))return;
    if(!/OWN_STOP_RETRY\s+22/.test(out))throw Error('STOP failed');await delay(50);
  }
  throw Error('STOP sequence race exceeded retry bound; retain module');
}
async function retired(){
  for(let i=0;i<20;i++){if(s.state()===null)return;await delay(100);}
  throw Error('UI did not collect; retain module, no host unload');
}
function clean(){
  if(s.adb(['shell','lsmod'],'modules-after').includes('rw4doom'))throw Error('Module remains');
  if(new RegExp('^\\s*'+worker+'\\s','m').test(s.adb(['shell','ps'],'ps-after')))throw Error('Worker remains');
  for(const f of ['/dev/rw4doomstream','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin'])
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',f],'absence')))throw Error('Owned node/copy remains');
}
function logs(){
  const n=fs.statSync(logFile).size-offset;if(n<0||n>2*1024*1024)throw Error('Log bound exceeded');
  const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}
  const out=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),out.split(/\r?\n/).filter(l=>/RW4_DOOM|RW4_RUNTIME/.test(l)).join('\n')+'\n');
  if(/PANIC|RW4_DOOM_UI: (error|input error|poll error|close error)/.test(out))throw Error('Failure marker');return out;
}
try{
  capture('ready','launcher');await gesture(195,285,195,285);const first=await sample('first-level');worker=first.tid;
  capture('running','game');
  // Starts in the free margin. It does not test focus loss with a held action.
  await gesture(195,440,195,40);capture('stock-panel','panel');const panelA=await sample('stock-paused',0,1);
  await delay(700);const panelB=await sample('stock-paused-repeat',0,1);frozen(panelA,panelB);
  await gesture(50,45,50,45);const panelTap=await sample('stock-neutral-tap',0,1);frozen(panelB,panelTap);
  await gesture(195,40,195,410);capture('return-paused','menu');const returned=await sample('returned-paused',0,1);
  await delay(600);const still=await sample('return-no-auto-resume',0,1);frozen(returned,still);
  await gesture(195,195,195,195);const resumed=await sample('explicit-resume');capture('resumed','game');
  await delay(450);const progress=await sample('resume-progress');if(progress.tic<=resumed.tic)throw Error('Resume did not progress');
  await firePointer(0);await delay(150);await firePointer(1);await delay(650);
  const held=await sample('fire-held',8);if(held.ammo>=progress.ammo)throw Error('Held FIRE did not shoot');
  capture('fire-held','game');
  const stopRequestedAtUtc=new Date().toISOString();await stop();await retired();
  if(!pointerDown)throw Error('Pointer released before retirement');
  clean();capture('retired-while-held','launcher');await delay(300);
  if(s.state()!==null)throw Error('Held pointer restarted game');
  const log=logs();
  const m=log.match(new RegExp('RW4_DOOM_UI: finished tid='+worker+' result=(\\d+) peak=(\\d+) alloc=(\\d+) free=(\\d+) streams=(\\d+) cleanup=(\\d+)'));
  if(!m||m[1]!=='1'||m[3]!==m[4]||m[5]!=='0'||m[6]!=='0'||
    !log.includes('uninit rc=0 tid='+worker+' reason=1 live=0 refs=0 requested=0 applied=0 queued=0')||
    !log.includes('pause System panel')||!log.includes('resume neutral'))throw Error('Missing clean focus/STOP markers');
  const result={passed:true,folder:s.folder,worker,observations:observations.length,captures:captures.length,
    stockPanelPaused:true,stockTapIsolated:true,explicitResumeRequired:true,resumedProgress:true,
    heldFireStop:true,pointerHeldThroughRetirement:true,noHeldAutoRestart:true,held,
    stopRequestedAtUtc,retirementChecksCompletedAtUtc:new Date().toISOString(),
    finish:{reason:Number(m[1]),peakBytes:Number(m[2]),allocated:Number(m[3]),freed:Number(m[4]),streams:Number(m[5]),cleanup:Number(m[6])},
    hostUnload:false,rebootForExit:false,physicalTransport:false,focusLossWhileActionHeldTested:false,
    freeBefore,freeAfter:s.adb(['shell','free'],'free-after')};
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}catch(e){
  fs.writeFileSync(path.join(s.folder,'failure.json'),JSON.stringify({error:e.message,pointerDown,worker,physicalTransport:false},null,2)+'\n');
  try{if(s.state()){await stop();await delay(700);console.log('Cooperative cleanup state:',s.state());}}catch(cleanup){console.log('Retained for inspection:',cleanup.message);}
  throw e;
}finally{if(pointerDown){await firePointer(0);await delay(350);}}
