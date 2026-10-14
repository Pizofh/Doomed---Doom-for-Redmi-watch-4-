// Real pointer holds in the owned S3 UI; no hardware target or native module.
import fs from 'node:fs';import path from 'node:path';
import {projectRoot as root} from './verify-emulator.mjs';
import {guardEmulator,rpc,gesture} from './emulator-ui.mjs';
import {captureScreenshot} from './emulator-screenshot.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
if(process.argv.length!==2)throw Error('FixedGuiTestOnly');
const out=path.join(root,'artifacts/emulator/held-ui-r224');if(fs.existsSync(path.join(out,'contact-test.json')))throw Error('ExistingTest');
guardEmulator();
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function varint(n){const a=[];do{a.push((n&127)|(n>127?128:0));n=Math.floor(n/128);}while(n);return Buffer.from(a);}
async function mouse(x,y,b){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=390||y<0||y>=450||![0,1].includes(b))throw Error('PointerBounds');await rpc('sendMouse',Buffer.concat([Buffer.from([8]),varint(x),Buffer.from([16]),varint(y),Buffer.from([24,b])]));}
function pixel(img,x,y,c){const p=(y*390+x)*img.bpp;return c.every((v,i)=>Math.abs(img.pixels[p+i]-v)<=8);}
const ready=readScreenshot(path.join(root,'artifacts/emulator/screenshots/held-r224-ready.png'));
for(let i=0;i<5;i++)if(!pixel(ready,278,108+i*32,[96,96,96]))throw Error('NotReady');
const on=readScreenshot(path.join(root,'artifacts/emulator/screenshots/held-r224-on-after-install.png'));
if(!pixel(on,350,166,[35,120,247]))throw Error('StockLongpressNotOn');
await gesture(195,332,195,332);const result={checkpoint:'R224',stockLongpressOnScreenshotVerified:true,holds:[],exit:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
for(const [name,index,x,y] of [['up',0,104,252],['left',1,104,326],['right',2,286,252],['fire',3,286,326]]){
 try{
  await mouse(x,y,0);await delay(150);await mouse(x,y,1);await delay(3300);
  const shot=await captureScreenshot('held-r224-'+name+'-down'),img=readScreenshot(shot.output);
  if(!pixel(img,278,73+index*32,[0,255,0]))throw Error('HeldActionMissingOrSelectorOpened-'+name);
  if(!pixel(img,30,390,[36,92,128]))throw Error('GameUiLost-'+name);
  result.holds.push({name,durationRequestedMs:3300,ownActionGreenWhileHeld:true,gameUiVisible:true});
 }finally{await mouse(x,y,0);}
 await delay(250);const released=await captureScreenshot('held-r224-'+name+'-released'),img=readScreenshot(released.output);
 for(let i=0;i<4;i++)if(!pixel(img,278,73+i*32,[96,96,96]))throw Error('ActionNotReleased');
}
await gesture(195,405,195,405);const exited=await captureScreenshot('held-r224-exit'),img=readScreenshot(exited.output);
for(let i=0;i<5;i++)if(!pixel(img,278,108+i*32,[0,255,0]))throw Error('HeldThresholdOrExitMissing');
result.exit=true;result.allFourHeldThresholdsReached=true;result.allReleasesVerified=true;
fs.writeFileSync(path.join(out,'contact-test.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
