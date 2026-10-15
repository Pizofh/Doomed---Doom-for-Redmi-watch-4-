// Fixed owned loopback VM only; real engine integration, never physical ADB.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root} from './verify-emulator.mjs';import {session} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
import {sha256} from './first-c-source.mjs';import {verifyShareware} from './wad-data.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['stage','test','cleanup'].includes(action))throw Error('Expected stage|test|cleanup');
const s=session('doom-ram-'+action),review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json'))),elf=path.join(root,'build/doom-ram-s3/doom-ram-s3.elf');
if(review.physicalTransport!==false||review.rw4Executable!==false||!review.realPthread||review.elfSha256!==sha256(fs.readFileSync(elf)))throw Error('PayloadChanged');
if(action!=='cleanup')for(const [p,h]of Object.entries(review.sourceHashes))if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('SourceChanged:'+p);
const module='rw4doomram276',remote='/tmp/rw4-doom-ram-s3.elf',wad='/tmp/rw4-doom-ram-s3.wad',nodes=['/dev/rw4doomctl','/dev/rw4doomframe','/dev/rw4doomimage.bin'];
const absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t);
function empty(label){if(s.adb(['shell','lsmod'],label+'-modules').includes(module))throw Error('ModuleRetained');for(const [i,p]of nodes.entries())if(!absent(s.adb(['shell','ls',p],label+'-node-'+i)))throw Error('NodeRetained');}
function checkAssets(){const p=path.join(s.folder,'readback.elf');s.adb(['pull',remote,p],'elf-readback');if(sha256(fs.readFileSync(p))!==review.elfSha256)throw Error('PayloadMismatch');const w=path.join(s.folder,'readback.wad');s.adb(['pull',wad,w],'wad-readback');verifyShareware(fs.readFileSync(w));}
empty('before');
if(action==='stage'){
 for(const p of [remote,wad])if(!absent(s.adb(['shell','ls',p],'path-before')))throw Error('AlreadyStaged');
 const w=path.join(root,'tools/local/doom-shareware/doom1.wad');verifyShareware(fs.readFileSync(w));
 s.adb(['push',elf,remote],'elf-push');s.adb(['push',w,wad],'wad-push');checkAssets();
 console.log(JSON.stringify({staged:true,elfSha256:review.elfSha256,wadVerified:true,physicalTransport:false}));
}else if(action==='cleanup'){
 checkAssets();for(const p of [remote,wad]){s.adb(['shell','rm',p],'remove');if(!absent(s.adb(['shell','ls',p],'after-remove')))throw Error('PathRetained');}
 console.log(JSON.stringify({payloadAndWadRemoved:true,modulesAndNodesAbsent:true,physicalTransport:false}));
}else{
 checkAssets();
 const list=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',list],'faces');
 const active=JSON.parse(fs.readFileSync(list)).watchface_list.filter(f=>String(f.type)==='1'&&String(f.in_use)==='1');if(active.length!==1||active[0].id!=='365799903')throw Error('OwnFaceNotActive');
 const lua=path.join(s.folder,'main.lua');s.adb(['pull','/data/app/watchface/market/365799903/lua/main.lua',lua],'lua');if(sha256(fs.readFileSync(lua))!==review.sourceHashes['experiments/doom-runtime-rw4/doom-ram-ui.lua'])throw Error('LauncherChanged');
 const logFile=path.join(root,'artifacts/emulator/host-stdout.txt'),offset=fs.statSync(logFile).size;
 const observations=[],screens=[];
 function save(){fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify(observations,null,2)+'\n');}
 function state(label){
  const code="local f=assert(io.open('/dev/rw4doomctl','rb'));f:setvbuf('no');local b=assert(f:read(128));assert(f:close());assert(#b==128);local v={string.unpack('<'..string.rep('I4',32),b)};print('DOOM_RAM_STATE',table.concat(v,',',1,32))";
  const text=s.adb(['shell','lua','-e','"'+code+'"'],label),m=text.match(/DOOM_RAM_STATE\s+([\d,]+)/);if(!m)throw Error('SnapshotMissing');
  const v=m[1].split(',').map(Number);if(v.length!==32||v[0]!==0x32574452||v[7])throw Error('SnapshotInvalid');
  const names=['magic','version','seq','started','ready','finished','joined','error','thread','produced','dropped','requested','applied','overflows','reason','code','peak','allocated','freed','cleanup','tic','drawn','gamestate','episode','map','x','y','angle','ammo','health','keys','wall_ms'];
  const r={label,...Object.fromEntries(names.map((n,i)=>[n,v[i]]))};observations.push(r);save();return r;
 }
 async function waitReady(){const until=Date.now()+20000;while(Date.now()<until){const r=state('waiting-ready');if(r.finished)throw Error('EngineExitedEarly');if(r.ready&&r.drawn>2)return r;await new Promise(r=>setTimeout(r,250));}throw Error('ReadyTimeout');}
 function capture(label){
  const name=path.basename(s.folder)+'-'+label,r=spawnSync(process.execPath,['tools/emulator-screenshot.mjs',name],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000});if(r.error||r.status!==0)throw Error('CaptureFailed');
  const file=path.join(root,'artifacts/emulator/screenshots',name+'.png'),a=readScreenshot(file),colors=new Set(),crop=Buffer.alloc(320*200*3);let p=0;
  for(let y=35;y<235;y++)for(let x=35;x<355;x++){const n=(y*390+x)*a.bpp;const c=a.pixels.subarray(n,n+3);crop.set(c,p);p+=3;colors.add(c.toString('hex'));}
  if(colors.size<50)throw Error('RenderAbsent');const result={label,file,uniqueColors:colors.size,cropSha256:sha256(crop)};screens.push(result);return result;
 }
 const cycles=[];
 for(let cycle=0;cycle<2;cycle++){
  await gesture(65,415,65,415);const initial=await waitReady();if(initial.thread===0||initial.gamestate!==0||initial.episode!==1||initial.map!==1)throw Error('NotE1M1');capture('cycle-'+cycle+'-e1m1');
  let before=state('cycle-'+cycle+'-baseline');
  if(cycle===0){
   await gesture(55,330,55,330,1000);let r=state('after-up');if(r.x===before.x&&r.y===before.y)throw Error('MovementMissing');before=r;
   await gesture(150,330,150,330,650);r=state('after-left');if(r.angle===before.angle)throw Error('LeftMissing');before=r;
   await gesture(245,330,245,330,650);r=state('after-right');if(r.angle===before.angle)throw Error('RightMissing');before=r;
   await gesture(340,330,340,330,1000);r=state('after-fire');if(r.ammo>=before.ammo)throw Error('FireMissing');
   await gesture(195,415,195,415);await new Promise(r=>setTimeout(r,250));const paused=state('paused');await new Promise(r=>setTimeout(r,400));const still=state('still-paused');if(still.tic!==paused.tic||still.applied||still.requested||still.keys)throw Error('PauseNotNeutral');
   await gesture(195,415,195,415);await new Promise(r=>setTimeout(r,350));const resumed=state('resumed');if(resumed.tic<=still.tic)throw Error('ResumeMissing');capture('after-controls');
  }
  await gesture(320,415,320,415);const until=Date.now()+10000;let ended=false;
  while(Date.now()<until){if(!s.adb(['shell','lsmod'],'wait-unload').includes(module)){ended=true;break;}await new Promise(r=>setTimeout(r,150));}
  if(!ended)throw Error('UnloadTimeout');empty('cycle-'+cycle+'-closed');cycles.push({cycle,closed:true});
 }
 const n=fs.statSync(logFile).size-offset;if(n<0||n>4*1024*1024)throw Error('LogWindowChanged');const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}
 const log=b.toString('utf8'),markers=log.split(/\r?\n/).filter(l=>l.includes('RW4_DOOM_RAM_R276:'));fs.writeFileSync(path.join(s.folder,'own-markers.txt'),markers.join('\n')+'\n');
 if(/PANIC|RW4_DOOM_RAM_R276: (error|close retained)/.test(log)||(log.match(/RW4_DOOM_RAM_R276: closed frames=/g)??[]).length!==2)throw Error('LifecycleLogMismatch');
 const joined=[...log.matchAll(/RW4_DOOM_RAM_R276: joined ([\d,]+)/g)].map(m=>m[1].split(',').map(Number));
 if(joined.length!==2||joined.some(v=>v[6]!==1||v[14]!==1||v[15]!==0||v[16]===0||v[17]!==v[18]||v[19]!==0||v[11]||v[12]))throw Error('JoinedCleanupMismatch');
 const result={checkpoint:'R276',passed:true,cycles,originalDoom:true,realWorker:true,privateNewlib:true,e1m1:true,movement:true,left:true,right:true,fire:true,pauseResume:true,joined:joined.map(v=>({thread:v[8],peakBytes:v[16],allocated:v[17],freed:v[18],cleanup:v[19],reason:v[14]})),screens,frameFilesWritten:false,s3FormatAdapter:true,rw4Executed:false,physicalTransport:false};
 fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
