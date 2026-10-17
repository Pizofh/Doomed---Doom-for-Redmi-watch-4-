// Exact production main, S3 native adapter; isolated own face and temporary assets.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {padsLauncher as touchLauncher,padsAssets as touchAssets,root,sha256} from './doom-pads-r349.mjs';import {session} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';import {captureScreenshot} from './emulator-screenshot.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
import {ownTextPixel} from './native-info-legend.mjs';
const action=process.argv[2];assert(['stage','test','cleanup'].includes(action)&&process.argv.length===3);
const s=session('pads-ui-'+action),stage=path.join(root,'artifacts/emulator/pads-ui-r349'),own='/data/app/watchface/market/365799903/lua/main.lua';
const remote='/tmp/rw4-pads349.elf',dir='/tmp/rw4-pads349-assets',kinds=['paused','resumed','closed','error'],assets=touchAssets();delete assets.preview;
const absent=p=>/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',p],'absence'));
const moduleAbsent=()=>!s.adb(['shell','lsmod'],'modules').includes('rw4pads349ui');
function pull(p,name){const file=path.join(s.folder,name);s.adb(['pull',p,file],name);return file;}
function inactive(){const faces=JSON.parse(fs.readFileSync(pull('/data/app/watchface/watchface_list.json','faces.json'))).watchface_list;assert(faces.some(f=>f.id==='365799903'&&String(f.in_use)==='0'));}
if(action==='stage'){
 assert(!fs.existsSync(stage));assert(moduleAbsent());inactive();for(const p of [remote,dir,...kinds.map(k=>'/tmp/rw4-pads349-'+k+'.bin'),'/dev/rw4doompads'])assert(absent(p));
 const elf=fs.readFileSync(path.join(root,'build/doom-pads-r349/s3-ui/doom.elf'));assert.equal(sha256(elf),'bbd49829f150b33c659059bc8f226599b70309de49560f2aecd7679557d94aa4');
 const p=touchLauncher(fs.readFileSync(path.join(root,'build/doom-pads-r349/rw4/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
 const source=p.render({...p.config,ui_base:'/data/app/watchface/market/365799903/lua/',assets_base:dir+'/'},fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/pads-s3-r349.lua'),'utf8'));
 fs.mkdirSync(stage);fs.copyFileSync(pull(own,'prior-main.lua'),path.join(stage,'prior-main.lua'));
 fs.writeFileSync(path.join(stage,'main.lua'),source);fs.writeFileSync(path.join(stage,'record.json'),JSON.stringify({priorSha256:sha256(fs.readFileSync(path.join(stage,'prior-main.lua'))),sourceSha256:sha256(source),productionSourceSha256:p.sourceSha256},null,2));
 s.adb(['push',path.join(root,'build/doom-pads-r349/s3-ui/doom.elf'),remote],'elf');assert.equal(sha256(fs.readFileSync(pull(remote,'elf-readback'))),sha256(elf));
 s.adb(['shell','mkdir',dir],'asset-dir');for(const[n,b]of Object.entries(assets)){const file=path.join(stage,n+'.png');fs.writeFileSync(file,b);s.adb(['push',file,dir+'/'+n+'.png'],'asset');}
 s.adb(['shell','rm',own],'remove-own-main');s.adb(['push',path.join(stage,'main.lua'),own],'main');assert.equal(sha256(fs.readFileSync(pull(own,'main-readback'))),sha256(source));console.log('Staged S3 only');
}else if(action==='cleanup'){
 assert(moduleAbsent());assert(absent('/dev/rw4doompads'));inactive();const r=JSON.parse(fs.readFileSync(path.join(stage,'record.json')));
 assert.equal(sha256(fs.readFileSync(pull(own,'current-main'))),r.sourceSha256);assert.equal(sha256(fs.readFileSync(path.join(stage,'prior-main.lua'))),r.priorSha256);
 s.adb(['shell','rm',own],'remove-fixture');s.adb(['push',path.join(stage,'prior-main.lua'),own],'restore-main');assert.equal(sha256(fs.readFileSync(pull(own,'restored-main'))),r.priorSha256);
 for(const p of [remote,...kinds.map(k=>'/tmp/rw4-pads349-'+k+'.bin'),...Object.keys(assets).map(n=>dir+'/'+n+'.png')])if(!absent(p))s.adb(['shell','rm',p],'remove-own');
 s.adb(['shell','rmdir',dir],'remove-own-empty-dir');fs.writeFileSync(path.join(stage,'cleanup.json'),JSON.stringify({restored:true,moduleAndNodeAbsent:true,physicalTransport:false}));console.log('Restored');
}else{
 const delay=ms=>new Promise(r=>setTimeout(r,ms)),cycles=[];
 function saved(kind,name){const b=fs.readFileSync(pull('/tmp/rw4-pads349-'+kind+'.bin',name));assert.equal(b.length,256);return Array.from({length:64},(_,i)=>b.readUInt32LE(i*4));}
 for(let cycle=0;cycle<2;cycle++){
  await gesture(195,240,195,240);await delay(2000);
  for(const[x,y]of [[122,285],[122,369],[58,327],[186,327],[321,300],[321,370]]){await gesture(x,y,x,y,260);await delay(80);}
  await gesture(136,419,136,419);await delay(400);const paused=saved('paused','paused-'+cycle);assert(paused[20]===0&&paused[7]===0&&paused[22]>10);assert(paused[53]>0,'USAR must reach the real Doom use action');assert(paused[40]<50&&paused[42]===0,'Overlay must fire and release keys before pause');
  await delay(600);const pausedAgain=saved('paused','paused-again-'+cycle);assert(pausedAgain[32]===paused[32]&&pausedAgain[22]===paused[22],'Pause must freeze game tics and presentations');
  const shot=await captureScreenshot('pads349-paused-'+cycle),a=readScreenshot(shot.output);let pixels=0;const colors=new Set();
  // Uncovered upper viewport must contain a real, varied Doom scene.
  for(let y=12;y<200;y++)for(let x=6;x<384;x++){const at=(y*390+x)*a.bpp;colors.add(a.pixels.subarray(at,at+3).toString('hex'));pixels++;}
  assert(colors.size>40);
  let left=0,right=0;for(let y=25;y<195;y++)for(const[x0,name]of [[6,'left'],[356,'right']])for(let x=x0;x<x0+26;x++){const at=(y*390+x)*a.bpp;if([16,32,48].some((v,j)=>Math.abs(a.pixels[at+j]-v)>12)){if(name==='left')left++;else right++;}}
  assert(left>500&&right>500,'Scaled game must reach both outer strips');
  function textVisible(label,x0,y0){let ink=0,visible=0;for(let y=0;y<14;y++)for(let x=0;x<label.length*12;x++)if(ownTextPixel(label,x,y,[0,0,0])[0]===255){ink++;const at=((y0+y)*390+x0+x)*a.bpp;if(a.pixels[at]>180&&a.pixels[at+1]>180&&a.pixels[at+2]>180)visible++;}assert(visible>ink*0.9,'Missing visible '+label);return visible;}
  const resumeInk=textVisible('SEGUIR',100,409),pausedInk=textVisible('PAUSADO',180,260);
  await gesture(136,419,136,419);await delay(350);const resumed=saved('resumed','resumed-'+cycle);assert(resumed[32]>paused[32],'Resume must advance game tics');
  await gesture(232,419,232,419);await delay(700);
  const closed=saved('closed','closed-'+cycle);assert(moduleAbsent()&&absent('/dev/rw4doompads'));assert(closed[6]===1&&closed[29]===1&&closed[26]===2&&closed[17]===closed[18]&&closed[19]===0);
  cycles.push({cycle,presentations:closed[22],gametic:closed[32],allocated:closed[17],freed:closed[18],bridgeError:closed[20],phase:closed[26],ammo:paused[40],heldKeysAtPause:paused[42],pausedTic:paused[32],resumedTic:resumed[32],resumeInk,pausedInk,scaledOuterStripPixels:[left,right],uncoveredPixels:pixels,uncoveredColors:colors.size,screenshot:shot.output});
 }
 const r=JSON.parse(fs.readFileSync(path.join(stage,'record.json')));fs.writeFileSync(path.join(stage,'result.json'),JSON.stringify({passed:true,cycles,productionSourceSha256:r.productionSourceSha256,exactProductionMain:true,s3Adapter:true,physicalTransport:false},null,2));console.log(JSON.stringify({passed:true,cycles}));
}
