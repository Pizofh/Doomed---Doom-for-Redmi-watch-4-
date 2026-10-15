// Page replacement and reentry in the owned S3 VM; no host STOP/unload/reset.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {projectRoot as root} from './verify-emulator.mjs';
import {gesture} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['start','closed','reentry'].includes(action))throw Error('Expected start|closed|reentry');
const s=session('doom-ram-close-'+action),review=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ram-s3/review.json')));
if(review.physicalTransport!==false||review.rw4Executable!==false||!review.realPthread)throw Error('NotPcReview');
for(const [p,h]of Object.entries(review.sourceHashes))if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('SourceChanged');
const recordFile=path.join(root,'artifacts/emulator/doom-ram-close-latest.json'),logFile=path.join(root,'artifacts/emulator/host-stdout.txt');
const module='rw4doomram276',nodes=['/dev/rw4doomctl','/dev/rw4doomframe','/dev/rw4doomimage.bin'];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function save(r){fs.writeFileSync(recordFile,JSON.stringify(r,null,2)+'\n');fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(r,null,2)+'\n');}
function active(id){const p=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',p],'faces');const a=JSON.parse(fs.readFileSync(p)).watchface_list.filter(f=>String(f.type)==='1'&&String(f.in_use)==='1');if(a.length!==1||a[0].id!==id)throw Error('UnexpectedActiveFace');}
function state(){
 const code="local f=assert(io.open('/dev/rw4doomctl','rb'));f:setvbuf('no');local b=assert(f:read(128));assert(f:close());assert(#b==128);local v={string.unpack('<'..string.rep('I4',32),b)};print('RAM_CLOSE_STATE',table.concat(v,',',1,32))";
 const t=s.adb(['shell','lua','-e','"'+code+'"'],'state'),m=t.match(/RAM_CLOSE_STATE\s+([\d,]+)/);if(!m)throw Error('StateMissing');const v=m[1].split(',').map(Number);if(v.length!==32||v[0]!==0x32574452||v[7])throw Error('StateInvalid');return v;
}
function logs(r){const n=fs.statSync(logFile).size-r.offset;if(n<0||n>4*1024*1024)throw Error('LogChanged');const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,r.offset);}finally{fs.closeSync(fd);}const t=b.toString('utf8');fs.writeFileSync(path.join(s.folder,'own-markers.txt'),t.split(/\r?\n/).filter(l=>l.includes('RW4_DOOM_RAM_')).join('\n')+'\n');if(/PANIC|RW4_DOOM_RAM_R276: error/.test(t))throw Error('FailureMarker');return t;}
if(action==='start'){
 if(fs.existsSync(recordFile)&&JSON.parse(fs.readFileSync(recordFile)).phase!=='complete')throw Error('PriorTestUnfinished');
 active('365799903');if(s.adb(['shell','lsmod'],'modules').includes(module))throw Error('ModuleAlreadyPresent');
 for(const [remote,hash]of [['/tmp/rw4-doom-ram-s3.elf',review.elfSha256],['/data/app/watchface/market/365799903/lua/main.lua',review.sourceHashes['experiments/doom-runtime-rw4/doom-ram-ui.lua']]]){const p=path.join(s.folder,path.basename(remote));s.adb(['pull',remote,p],'readback');if(sha256(fs.readFileSync(p))!==hash)throw Error('StagedInputChanged');}
 const r={phase:'starting',offset:fs.statSync(logFile).size,elfSha256:review.elfSha256,startFolder:s.folder,physicalTransport:false};save(r);
 await gesture(65,415,65,415);let v;
 for(let i=0;i<30;i++){v=state();if(v[4]&&v[21]>2)break;await delay(250);}
 if(!v[4]||v[5]||v[22]!==0||v[23]!==1||v[24]!==1||!v[8])throw Error('NotRunningE1M1');
 r.phase='running';r.thread=v[8];r.initial=v;save(r);console.log(JSON.stringify({phase:r.phase,thread:r.thread,physicalTransport:false}));
}else{
 const r=JSON.parse(fs.readFileSync(recordFile));if(r.physicalTransport!==false||r.elfSha256!==review.elfSha256||!Number.isInteger(r.thread)||r.thread<1)throw Error('RecordChanged');
 if(action==='closed'){
  if(r.phase!=='running')throw Error('ExpectedRunning');active('365700764');let v;
  for(let i=0;i<25;i++){v=state();if(v[5])break;await delay(100);}
  if(v[8]!==r.thread||!v[5]||v[6]||v[11]||v[12]||v[30]||v[31]>=120000||!s.adb(['shell','lsmod'],'retained').includes(module))throw Error('ExpectedStoppedRetained');
  const t=logs(r);if(!t.includes('RW4_DOOM_RAM_R277: close retained stop=true')||t.includes('RW4_DOOM_RAM_R276: joined'))throw Error('GcStopNotProven');
  r.phase='closed';r.retainedState=v;r.closedFolder=s.folder;save(r);console.log(JSON.stringify({phase:r.phase,finished:true,joined:false,moduleRetained:true,physicalTransport:false}));
 }else{
  if(r.phase!=='closed')throw Error('ExpectedClosed');active('365799903');let absent=false;
  for(let i=0;i<30;i++){if(!s.adb(['shell','lsmod'],'wait-collected').includes(module)){absent=true;break;}await delay(100);}
  if(!absent)throw Error('CollectionMissing');for(const p of nodes)if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',p],'node-absence')))throw Error('NodeRetained');
  const t=logs(r),joined=[...t.matchAll(/RW4_DOOM_RAM_R276: joined ([\d,]+)/g)].map(m=>m[1].split(',').map(Number));
  if(!t.includes('RW4_DOOM_RAM_R277: collecting thread='+r.thread)||!t.includes('RW4_DOOM_RAM_R277: collected')||joined.length!==1||(t.match(/RW4_DOOM_RAM_R276: started/g)??[]).length!==1)throw Error('CollectionMarkersMissing');
  const v=joined[0];if(v[8]!==r.thread||v[6]!==1||v[14]!==1||v[15]!==0||v[17]!==14||v[18]!==14||v[19]||v[11]||v[12])throw Error('CleanupNotConfirmed');
  const ps=s.adb(['shell','ps'],'threads-after');if(new RegExp('^\\s*'+r.thread+'\\s','m').test(ps))throw Error('ThreadRetained');
  Object.assign(r,{phase:'complete',passed:true,joined:v,reentryFolder:s.folder,workerGoneAfterJoin:true,hostStop:false,hostUnload:false,rebootForExit:false});save(r);
  console.log(JSON.stringify({checkpoint:'R277',passed:true,gcStop:true,uiReentryCollected:true,allocated:v[17],freed:v[18],workerGoneAfterJoin:true,hostUnload:false,rebootForExit:false,physicalTransport:false}));
 }
}
