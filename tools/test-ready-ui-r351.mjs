// Exact production main, S3 native adapter; isolated own face and temporary assets.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {readyLauncher as touchLauncher,readyAssets as touchAssets,root,sha256} from './doom-ready-r351.mjs';import {session} from './doom-ui-emulator.mjs';
import {gesture} from './emulator-ui.mjs';import {captureScreenshot} from './emulator-screenshot.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
import {readyUiFixture} from './ready-ui-fixture-r351.mjs';
import {crc32} from './static-watchface-transfer.mjs';
import {ownTextPixel} from './native-info-legend.mjs';
const action=process.argv[2];assert(['stage','test','cleanup'].includes(action)&&process.argv.length===3);
const s=session('ready-ui-'+action),stage=path.join(root,'artifacts/emulator/ready-ui-r351'),own='/data/app/watchface/market/365799903/lua/main.lua';
const remote='/tmp/rw4-ready351.elf',dir='/tmp/rw4-ready351-assets',kinds=['paused','resumed','closed','error','playing'],assets=touchAssets();delete assets.preview;
const stateDir='/tmp/rw4-ready351-state';
const absent=p=>/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',p],'absence'));
const moduleAbsent=()=>!s.adb(['shell','lsmod'],'modules').includes('rw4ready351ui');
function pull(p,name){const file=path.join(s.folder,name);s.adb(['pull',p,file],name);return file;}
function inactive(){const faces=JSON.parse(fs.readFileSync(pull('/data/app/watchface/watchface_list.json','faces.json'))).watchface_list;assert(faces.some(f=>f.id==='365799903'&&String(f.in_use)==='0'));}
if(action==='stage'){
 assert(!fs.existsSync(stage));assert(moduleAbsent());inactive();for(const p of [remote,dir,stateDir,'/dev/rw4doomslot',...kinds.map(k=>'/tmp/rw4-ready351-'+k+'.bin'),'/dev/rw4doomready'])assert(absent(p));
 const elf=fs.readFileSync(path.join(root,'build/doom-ready-r351/s3-ui/doom.elf'));assert.equal(sha256(elf),'ce6dfa0b4b77bc69eff3a43d7652a7ea96bb295eb08da2d28046efdf842aa525');
 const p=touchLauncher(fs.readFileSync(path.join(root,'build/doom-ready-r351/rw4/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
 const source=readyUiFixture(p,elf);
 fs.mkdirSync(stage);fs.copyFileSync(pull(own,'prior-main.lua'),path.join(stage,'prior-main.lua'));
 fs.writeFileSync(path.join(stage,'main.lua'),source);fs.writeFileSync(path.join(stage,'record.json'),JSON.stringify({priorSha256:sha256(fs.readFileSync(path.join(stage,'prior-main.lua'))),sourceSha256:sha256(source),productionSourceSha256:p.sourceSha256},null,2));
 s.adb(['push',path.join(root,'build/doom-ready-r351/s3-ui/doom.elf'),remote],'elf');assert.equal(sha256(fs.readFileSync(pull(remote,'elf-readback'))),sha256(elf));
 s.adb(['shell','mkdir',stateDir],'state-dir');s.adb(['push',path.join(root,'build/doom-ready-r351/s3-ui/doom.elf'),stateDir+'/doom.elf'],'guard-elf');
 s.adb(['shell','mkdir',dir],'asset-dir');for(const[n,b]of Object.entries(assets)){const file=path.join(stage,n+'.png');fs.writeFileSync(file,b);s.adb(['push',file,dir+'/'+n+'.png'],'asset');}
 s.adb(['shell','rm',own],'remove-own-main');s.adb(['push',path.join(stage,'main.lua'),own],'main');assert.equal(sha256(fs.readFileSync(pull(own,'main-readback'))),sha256(source));console.log('Staged S3 only');
}else if(action==='cleanup'){
 assert(moduleAbsent());assert(absent('/dev/rw4doomready'));assert(absent('/dev/rw4doomslot'));inactive();const r=JSON.parse(fs.readFileSync(path.join(stage,'record.json')));
 assert.equal(sha256(fs.readFileSync(pull(own,'current-main'))),r.sourceSha256);assert.equal(sha256(fs.readFileSync(path.join(stage,'prior-main.lua'))),r.priorSha256);
 s.adb(['shell','rm',own],'remove-fixture');s.adb(['push',path.join(stage,'prior-main.lua'),own],'restore-main');assert.equal(sha256(fs.readFileSync(pull(own,'restored-main'))),r.priorSha256);
 for(const p of [remote,stateDir+'/doom.elf',stateDir+'/save-a.rw4',stateDir+'/save-b.rw4',...kinds.map(k=>'/tmp/rw4-ready351-'+k+'.bin'),...Object.keys(assets).map(n=>dir+'/'+n+'.png')])if(!absent(p))s.adb(['shell','rm',p],'remove-own');
 s.adb(['shell','rmdir',dir],'remove-own-empty-dir');s.adb(['shell','rmdir',stateDir],'remove-own-state-dir');fs.writeFileSync(path.join(stage,'cleanup.json'),JSON.stringify({restored:true,moduleAndNodeAbsent:true,physicalTransport:false}));console.log('Restored');
}else{
 const delay=ms=>new Promise(r=>setTimeout(r,ms)),cycles=[];
 function saved(kind,name){const b=fs.readFileSync(pull('/tmp/rw4-ready351-'+kind+'.bin',name));assert.equal(b.length,256);return Array.from({length:64},(_,i)=>b.readUInt32LE(i*4));}
 const timings=[];let checkpoint=null;
 async function waitPlaying(cycle){const begin=Date.now();if(!absent('/tmp/rw4-ready351-playing.bin'))s.adb(['shell','rm','/tmp/rw4-ready351-playing.bin'],'clear-own-playing');await gesture(195,240,195,240);for(let i=0;i<30;i++){await delay(300);if(!absent('/tmp/rw4-ready351-playing.bin')){timings.push(Date.now()-begin);return;}}throw Error('No playable frame');}
 function bank(name){const b=fs.readFileSync(pull(stateDir+'/'+name,'bank-'+name));assert(b.length>=75);const n=b.readUInt32LE(12);assert(b.readUInt32LE(0)===0x31535752&&b.readUInt32LE(4)===1&&b.readUInt32LE(8)===371943786&&b.length===24+n&&crc32(b.subarray(24))===b.readUInt32LE(16));return b;}
 for(let cycle=0;cycle<2;cycle++){
  await waitPlaying(cycle);
  if(cycle===0){
   for(const[x,y]of [[122,281],[52,325],[192,325],[122,369],[321,300],[321,370]])await gesture(x,y,x,y,260);
   const playing=await captureScreenshot('ready351-playing');
   await gesture(136,419,136,419);await delay(500);checkpoint=saved('paused','checkpoint');
   assert(checkpoint[40]<50&&checkpoint[42]===0&&checkpoint[53]>0);
   await gesture(106,330,106,330);await delay(1800);const stored=saved('paused','stored');assert(stored[54]===8&&stored[55]===0&&stored[56]===0&&stored[57]===1);
   bank('save-a.rw4');await captureScreenshot('ready351-saved');
   await gesture(136,419,136,419);await gesture(122,281,122,281,500);await gesture(136,419,136,419);await delay(500);
  }else{await gesture(136,419,136,419);await delay(500);}
  await gesture(284,330,284,330);await delay(1800);const loaded=saved('paused','loaded-'+cycle);
  assert(loaded[54]===9&&loaded[55]===0&&loaded[56]===0,'CARGAR must finish successfully');
  for(const i of [37,38,39,40,41])assert.equal(loaded[i],checkpoint[i],'Restored field '+i);
  await delay(600);const still=saved('paused','still-'+cycle);assert(still[32]===loaded[32]&&still[22]===loaded[22]);
  await gesture(136,419,136,419);await delay(400);const resumed=saved('resumed','resumed-'+cycle);assert(resumed[32]>loaded[32]);
  if(cycle===0){for(let i=0;i<26;i++){await delay(4500);await gesture(245,260,245,260);if(i%6===0)console.log('Long session',i);}}
  await gesture(232,419,232,419);await delay(800);const closed=saved('closed','closed-'+cycle);
  assert(moduleAbsent()&&absent('/dev/rw4doomready')&&absent('/dev/rw4doomslot'));assert(closed[6]===1&&closed[29]===1&&closed[26]===2&&closed[17]===closed[18]&&closed[19]===0);
  if(cycle===0){assert(closed[43]>120000,'Must outlast former native limit');const good=bank('save-a.rw4'),bad=Buffer.from(good);bad.writeUInt32LE(999,20);bad[bad.length-1]^=1;const file=path.join(stage,'corrupt-newer-bank.rw4');fs.writeFileSync(file,bad);s.adb(['push',file,stateDir+'/save-b.rw4'],'corrupt-own-second-bank');}
  cycles.push({cycle,gametic:closed[32],presentations:closed[22],allocated:closed[17],freed:closed[18],wallMs:closed[43],phase:closed[26],saveLoad:true,restoredFields:[37,38,39,40,41],corruptNewerBankFallback:cycle===1});
 }
 assert(timings[1]<timings[0],'Second START must skip ELF CRC pass');
 const r=JSON.parse(fs.readFileSync(path.join(stage,'record.json')));fs.writeFileSync(path.join(stage,'result.json'),JSON.stringify({passed:true,cycles,startupMs:timings,longSession:true,saveLoadAcrossUnload:true,corruptBankFallback:true,productionSourceSha256:r.productionSourceSha256,exactProductionMain:true,s3Adapter:true,physicalTransport:false},null,2));console.log(JSON.stringify({passed:true,cycles}));
}
