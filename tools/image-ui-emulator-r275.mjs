// Fixed loopback VM only. Visual test of RAM-node rendering and cache retirement.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root} from './verify-emulator.mjs';import {session} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';import {readScreenshot} from './assert-ui-probe.mjs';import {sha256} from './first-c-source.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['stage','test','cleanup'].includes(action))throw Error('Expected stage|test|cleanup');
const s=session('ram-image-'+action),review=JSON.parse(fs.readFileSync(path.join(root,'build/image-ui-r275/review.json'))),elf=path.join(root,'build/image-ui-r275/image-ui.elf');
if(review.physicalTransport!==false||!review.s3FormatAdapter||review.elfSha256!==sha256(fs.readFileSync(elf)))throw Error('FixtureChanged');
if(action!=='cleanup')for(const [p,h]of Object.entries(review.sourceHashes))if(sha256(fs.readFileSync(path.join(root,p)))!==h)throw Error('SourceChanged:'+p);
const remote='/tmp/rw4-image-ui-r275.elf',nodes=['/dev/rw4doomctl','/dev/rw4doomframe','/dev/rw4doomimage.bin'];
const absent=text=>/^nsh: ls: stat failed: 2\r?$/im.test(text);
function empty(label){if(s.adb(['shell','lsmod'],label+'-modules').includes('rw4imageui275'))throw Error('FixtureLoaded');for(const [i,p]of nodes.entries())if(!absent(s.adb(['shell','ls',p],label+'-node-'+i)))throw Error('NodePresent:'+p);}
function readback(){const p=path.join(s.folder,'payload-readback.elf');s.adb(['pull',remote,p],'payload-readback');if(sha256(fs.readFileSync(p))!==review.elfSha256)throw Error('GuestPayloadChanged');}
if(action==='stage'){
 empty('before');if(!absent(s.adb(['shell','ls',remote],'path-before')))throw Error('AlreadyStaged');
 s.adb(['push',elf,remote],'push');readback();console.log(JSON.stringify({staged:true,elfSha256:review.elfSha256,physicalTransport:false}));
}else if(action==='cleanup'){
 empty('cleanup');readback();s.adb(['shell','rm',remote],'remove');if(!absent(s.adb(['shell','ls',remote],'path-after')))throw Error('PayloadRemains');
 console.log(JSON.stringify({moduleAbsent:true,nodesAbsent:true,payloadRemoved:true,physicalTransport:false}));
}else{
 empty('before');readback();
 const p=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',p],'faces');
 const active=JSON.parse(fs.readFileSync(p)).watchface_list.filter(f=>String(f.type)==='1'&&String(f.in_use)==='1');if(active.length!==1||active[0].id!=='365799903')throw Error('OwnFaceNotActive');
 const lua=path.join(s.folder,'main.lua');s.adb(['pull','/data/app/watchface/market/365799903/lua/main.lua',lua],'lua');if(sha256(fs.readFileSync(lua))!==review.sourceHashes['experiments/doom-runtime-rw4/image-ui.lua'])throw Error('UiSourceChanged');
 const offset=fs.statSync(path.join(root,'artifacts/emulator/host-stdout.txt')).size,observations=[];
 function capture(label,phase=null){
  const name=path.basename(s.folder)+'-'+label,r=spawnSync(process.execPath,['tools/emulator-screenshot.mjs',name],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:20000});if(r.error||r.status!==0)throw Error('CaptureFailed');
  const file=path.join(root,'artifacts/emulator/screenshots',name+'.png'),a=readScreenshot(file);
  const color=(x,y)=>[...a.pixels.subarray((y*390+x)*a.bpp,(y*390+x)*a.bpp+3)];
  if(!color(10,100).every((v,i)=>Math.abs(v-[16,32,48][i])<=6))throw Error('WrongUi');
  if(phase!==null){
   const palette=[[255,0,0],[0,255,0],[0,0,255],[255,130,0]];let mismatch=0;
   for(let y=0;y<200;y++)for(let x=0;x<320;x++){
    const white=x>=16+phase*32&&x<20+phase*32,q=(x>=160?1:0)+(y>=100?2:0),expected=white?[255,255,255]:palette[(q+phase)%4];
    if(!color(x+35,y+110).every((v,i)=>Math.abs(v-expected[i])<=7))mismatch++;
   }
   if(mismatch)throw Error('RenderedPixelMismatch:'+mismatch);
  }
  observations.push({label,phase,file,verifiedPixels:phase===null?0:64000});fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify(observations,null,2)+'\n');
 }
 capture('ready');
 for(let cycle=0;cycle<2;cycle++){
  await gesture(65,385,65,385);await new Promise(r=>setTimeout(r,300));capture('cycle-'+cycle+'-first',0);
  await gesture(195,385,195,385);await new Promise(r=>setTimeout(r,300));capture('cycle-'+cycle+'-next',1);
  await gesture(320,385,320,385);empty('cycle-'+cycle+'-closed');capture('cycle-'+cycle+'-closed');
 }
 const logFile=path.join(root,'artifacts/emulator/host-stdout.txt'),n=fs.statSync(logFile).size-offset;if(n<0||n>2*1024*1024)throw Error('LogWindowChanged');
 const b=Buffer.alloc(n),fd=fs.openSync(logFile,'r');try{fs.readSync(fd,b,0,n,offset);}finally{fs.closeSync(fd);}const log=b.toString('utf8');
 fs.writeFileSync(path.join(s.folder,'own-markers.txt'),log.split(/\r?\n/).filter(l=>l.includes('RW4_IMAGE_UI_R275:')).join('\n')+'\n');
 if(/PANIC|RW4_IMAGE_UI_R275: (error|close retained)/.test(log)||(log.match(/RW4_IMAGE_UI_R275: closed/g)??[]).length!==2)throw Error('LifecycleLogMismatch');
 const result={checkpoint:'R275',passed:true,cycles:2,frames:4,pixelsVerified:256000,realLvgl:true,realVfs:true,s3FormatAdapter:true,workerSimulated:true,realDoomTested:false,modulesAndNodesRetired:true,frameFilesWritten:false,rw4Executed:false,physicalTransport:false};
 fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
