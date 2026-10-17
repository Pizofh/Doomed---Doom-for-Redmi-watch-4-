// Owned emulator only; stages our inactive UIProbe source, measures screenshots,
// and restores its exact prior Lua file after the prototype closes normally.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256} from './doom-palette-source-r333.mjs';import {session} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';import {captureScreenshot} from './emulator-screenshot.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['stage','test','cleanup'].includes(action))throw Error('FixedActionOnly');
const s=session('direct-ui-'+action),review=JSON.parse(fs.readFileSync(path.join(root,'build/direct-ui-s3-r340/review.json'))),elf=path.join(root,'build/direct-ui-s3-r340/direct-ui.elf'),lua=path.join(root,'experiments/doom-runtime-rw4/direct-ui-r340.lua');
if(review.s3Only!==true||review.physicalTransport!==false||review.elfSha256!==sha256(fs.readFileSync(elf))||review.luaSha256!==sha256(fs.readFileSync(lua)))throw Error('ReviewChanged');
const stage=path.join(root,'artifacts/emulator/direct-ui-r340-stage'),own='/data/app/watchface/market/365799903/lua/main.lua',remote='/tmp/rw4-direct-ui-r340.elf',result='/tmp/rw4-direct-ui-r340-result.txt';
const absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t),moduleAbsent=()=>!s.adb(['shell','lsmod'],'modules').includes('rw4direct340');
function pull(remote,name){const p=path.join(s.folder,name);s.adb(['pull',remote,p],name);return p;}
if(action==='stage'){
 if(fs.existsSync(stage)||!moduleAbsent())throw Error('PriorStageOrModule');
 const faces=JSON.parse(fs.readFileSync(pull('/data/app/watchface/watchface_list.json','faces.json'))).watchface_list;
 if(!faces.some(f=>f.id==='365799903'&&String(f.in_use)==='0'))throw Error('OwnFaceMustBeInactive');
 if(!absent(s.adb(['shell','ls',remote],'remote-absence'))||!absent(s.adb(['shell','ls',result],'result-absence')))throw Error('Collision');
 const backup=pull(own,'prior-main.lua');fs.mkdirSync(stage);fs.copyFileSync(backup,path.join(stage,'prior-main.lua'));
 fs.writeFileSync(path.join(stage,'record.json'),JSON.stringify({own,priorSha256:sha256(fs.readFileSync(backup)),sourceSha256:review.luaSha256,elfSha256:review.elfSha256,physicalTransport:false},null,2)+'\n');
 s.adb(['push',elf,remote],'payload');if(sha256(fs.readFileSync(pull(remote,'payload-readback.elf')))!==review.elfSha256)throw Error('PayloadMismatch');
 s.adb(['shell','rm',own],'remove-own-derived-main');s.adb(['push',lua,own],'new-own-main');
 if(sha256(fs.readFileSync(pull(own,'source-readback.lua')))!==review.luaSha256)throw Error('SourceMismatch');
 console.log(JSON.stringify({staged:true,face:'365799903',sourceBackedUp:true,physicalTransport:false}));
}else if(action==='cleanup'){
 if(!moduleAbsent()||!absent(s.adb(['shell','ls','/dev/rw4direct340'],'node-absence')))throw Error('PrototypeNotClosed');
 const record=JSON.parse(fs.readFileSync(path.join(stage,'record.json'))),backup=path.join(stage,'prior-main.lua');
 if(sha256(fs.readFileSync(backup))!==record.priorSha256||sha256(fs.readFileSync(pull(own,'current.lua')))!==record.sourceSha256)throw Error('RestoreSourceMismatch');
 s.adb(['shell','rm',own],'remove-own-prototype');s.adb(['push',backup,own],'restore-own-prior');
 if(sha256(fs.readFileSync(pull(own,'restored.lua')))!==record.priorSha256)throw Error('RestoreReadbackMismatch');
 for(const p of [remote,result])s.adb(['shell','rm',p],'remove-own-temporary');
 console.log(JSON.stringify({restored:true,moduleAndNodeAbsent:true,physicalTransport:false}));
}else{
 if(!moduleAbsent())throw Error('StartFromReady');
 const observations=[],cycles=[];const colors=[[255,0,0],[0,255,0],[0,0,255],[255,130,0]];
 async function shot(label,expectPattern){const r=await captureScreenshot(label),a=readScreenshot(r.output);
 if(!expectPattern)return{...r,phase:null};
 const color=(x,y)=>[...a.pixels.subarray(((y+60)*390+x+35)*a.bpp,((y+60)*390+x+35)*a.bpp+3)];
 let phase=-1;for(let p=0;p<2;p++)if(color(2,2).every((v,i)=>Math.abs(v-colors[p][i])<=7))phase=p;
 if(phase<0)throw Error('NoDirectPattern:'+r.output);
 for(let y=0;y<200;y++)for(let x=0;x<320;x++){
 const q=(x>=160?1:0)+(y>=100?2:0),bar=16+phase*160,c=x>=bar&&x<bar+4?[255,255,255]:colors[(q+phase)%4];
 if(!color(x,y).every((v,i)=>Math.abs(v-c[i])<=7))throw Error('TornOrIncorrectPattern:'+x+','+y+':'+r.output);
 }
 return{...r,phase,verifiedPixels:64000};}
 for(let cycle=0;cycle<2;cycle++){
 await gesture(90,380,90,380);await new Promise(r=>setTimeout(r,150));
 const captures=[];for(let i=0;i<48;i++){captures.push(await shot('direct340-c'+cycle+'-s'+i,true));await new Promise(r=>setTimeout(r,12));}
 await gesture(290,380,290,380);
 if(!moduleAbsent()||!absent(s.adb(['shell','ls','/dev/rw4direct340'],'closed-node')))throw Error('RetirementIncomplete');
 const text=fs.readFileSync(pull(result,'cycle-'+cycle+'-stats.txt'),'utf8'),v=text.split(',').map(Number);
 if(v.length!==33||v[0]!==0x34495244||v[3]!==2||v[9]!==1||v[10]!==1||v[12]!==1)throw Error('InvalidClosedStats');
 let changes=0;for(let i=1;i<captures.length;i++)if(captures[i].phase!==captures[i-1].phase)changes++;
 const seconds=(captures.at(-1).timestamp-captures[0].timestamp)/1000000;
 const summary={cycle,frames:v[4],elapsedMs:v[6],aggregateRefreshUs:v[7],maximumRefreshUs:v[8],created:v[9],deleted:v[10],drains:v[11],queueClean:v[12]===1,captures:captures.length,visibleChanges:changes,sampleSeconds:seconds,visibleChangesPerSecond:changes/seconds};
 cycles.push(summary);observations.push(...captures);fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify({cycles,observations},null,2));
 }
 if(cycles.some(c=>c.visibleChanges<10))throw Error('InsufficientVisibleChanges');
 const report={checkpoint:'R340',passed:true,cycles,pixelsVerified:observations.length*64000,persistentImagePerCycle:true,immutableBuffers:true,drawQueueEmptyBeforeRetirement:true,frameFilesWritten:false,realS3Ui:true,rw4Executed:false,physicalTransport:false};
 fs.writeFileSync(path.join(stage,'test-result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
