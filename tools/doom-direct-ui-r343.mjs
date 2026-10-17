// Own UIProbe source replacement on loopback S3 only, backed up/restored exactly.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-demand-source-r337.mjs';import {session} from './doom-ui-emulator.mjs';import {verifyShareware} from './wad-data.mjs';
import {gesture} from './emulator-ui.mjs';import {captureScreenshot} from './emulator-screenshot.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['stage','test','cleanup'].includes(action))throw Error('Expected stage|test|cleanup');
const s=session('doom-direct-ui-'+action),r=JSON.parse(fs.readFileSync(path.join(root,'build/doom-direct-r343/s3-ui/review.json'))),elf=path.join(root,'build/doom-direct-r343/s3-ui/doom.elf'),lua=path.join(root,'experiments/doom-runtime-rw4/direct-ui-r343.lua');
assert.equal(r.graphics,'real S3 UI');assert.equal(r.rw4Executable,false);assert.equal(r.elfSha256,sha256(fs.readFileSync(elf)));
const stage=path.join(root,'artifacts/emulator/doom-direct-ui-r343-stage'),own='/data/app/watchface/market/365799903/lua/main.lua',remote='/tmp/rw4-doom-direct-ui-r343.elf',results=['paused','closed','error'].map(k=>'/tmp/rw4-direct-ui-r343-'+k+'.bin');
const absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t),moduleAbsent=()=>!s.adb(['shell','lsmod'],'modules').includes('rw4direct343ui');
function pull(remote,name){const p=path.join(s.folder,name);s.adb(['pull',remote,p],name);return p;}
function inactive(){const faces=JSON.parse(fs.readFileSync(pull('/data/app/watchface/watchface_list.json','faces.json'))).watchface_list;assert(faces.some(f=>f.id==='365799903'&&String(f.in_use)==='0'),'Own face must be inactive');}
if(action==='stage'){
 assert(!fs.existsSync(stage));assert(moduleAbsent());inactive();
 for(const p of [remote,...results,'/dev/rw4doomdirect'])assert(absent(s.adb(['shell','ls',p],'absence')),'Collision');
 verifyShareware(fs.readFileSync(pull('/data/app/watchface/market/365799913/lua/doom1.wad','doom1.wad')));
 const prior=pull(own,'prior-main.lua');fs.mkdirSync(stage);fs.copyFileSync(prior,path.join(stage,'prior-main.lua'));
 const record={priorSha256:sha256(fs.readFileSync(prior)),luaSha256:sha256(fs.readFileSync(lua)),elfSha256:r.elfSha256,physicalTransport:false};fs.writeFileSync(path.join(stage,'record.json'),JSON.stringify(record,null,2));
 s.adb(['push',elf,remote],'elf');assert.equal(sha256(fs.readFileSync(pull(remote,'elf-readback.elf'))),record.elfSha256);
 s.adb(['shell','rm',own],'remove-own-main');s.adb(['push',lua,own],'source');assert.equal(sha256(fs.readFileSync(pull(own,'source-readback.lua'))),record.luaSha256);
 console.log(JSON.stringify({staged:true,face:'365799903',physicalTransport:false}));
}else if(action==='cleanup'){
 assert(moduleAbsent());assert(absent(s.adb(['shell','ls','/dev/rw4doomdirect'],'node-absence')));inactive();
 const record=JSON.parse(fs.readFileSync(path.join(stage,'record.json'))),prior=path.join(stage,'prior-main.lua');
 assert.equal(sha256(fs.readFileSync(prior)),record.priorSha256);assert.equal(sha256(fs.readFileSync(pull(own,'current.lua'))),record.luaSha256);
 s.adb(['shell','rm',own],'remove-own-fixture');s.adb(['push',prior,own],'restore-own-main');assert.equal(sha256(fs.readFileSync(pull(own,'restored.lua'))),record.priorSha256);
 for(const p of [remote,...results])if(!absent(s.adb(['shell','ls',p],'own-temporary')))s.adb(['shell','rm',p],'remove-own');
 fs.writeFileSync(path.join(stage,'cleanup.json'),JSON.stringify({restored:true,moduleAndNodeAbsent:true,physicalTransport:false}));console.log('Restored');
}else{
 assert(moduleAbsent());const cycles=[];
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function saved(kind,name){const f=path.join(s.folder,name),text=s.adb(['pull','/tmp/rw4-direct-ui-r343-'+kind+'.bin',f],name);if(/failed|error/i.test(text)&&!fs.existsSync(f))return null;const b=fs.readFileSync(f);assert.equal(b.length,256);return Array.from({length:64},(_,i)=>b.readUInt32LE(i*4));}
 for(let cycle=0;cycle<2;cycle++){
  await gesture(90,416,90,416);await delay(2500);
  for(const [x,y]of [[55,310],[145,310],[240,310],[335,310]]){await gesture(x,y,x,y,250);await delay(100);}
  await gesture(90,365,90,365);await delay(500);
  const v=await saved('paused','paused-'+cycle+'.bin');assert(v&&v[0]===0x34445752&&v[7]===0&&v[20]===0&&v[22]>10,'Not paused/playing');
  const shot=await captureScreenshot('doom-direct343-paused-'+cycle),a=readScreenshot(shot.output);let fnv=2166136261;const colors=new Set();
  for(let y=35;y<235;y++)for(let x=35;x<355;x++){const p=(y*390+x)*a.bpp,c=a.pixels,rgb565=((c[p]>>3)<<11)|((c[p+1]>>2)<<5)|(c[p+2]>>3);colors.add(rgb565);fnv=Math.imul(fnv^(rgb565&255),16777619)>>>0;fnv=Math.imul(fnv^(rgb565>>8),16777619)>>>0;}
  const exactPixels=(fnv>>>0)===v[48];assert(colors.size>50,'No Doom image');
  await gesture(90,365,90,365);await delay(350);await gesture(290,416,290,416);await delay(800);
  assert(moduleAbsent(),'Did not close');assert(absent(s.adb(['shell','ls','/dev/rw4doomdirect'],'node-closed')));
  const closed=await saved('closed','closed-'+cycle+'.bin');assert(closed[6]===1&&closed[29]===1&&closed[17]===closed[18]&&closed[19]===0&&closed[26]===2,'Cleanup');
  cycles.push({cycle,presentations:closed[22],gametic:closed[32],peakBytes:closed[16],allocated:closed[17],freed:closed[18],drawEvents:closed[23],fences:closed[24],visibleColors:colors.size,expectedRgb565Fnv:v[48],screenshotRgb565Fnv:fnv>>>0,exactPixels,screenshot:shot.output});
  fs.writeFileSync(path.join(s.folder,'cycles.json'),JSON.stringify(cycles,null,2));
 }
 const result={checkpoint:'R343',passed:true,realDoom:true,realThreads:true,realS3Ui:true,cycles,physicalTransport:false,rw4Executed:false};fs.writeFileSync(path.join(stage,'test-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}
