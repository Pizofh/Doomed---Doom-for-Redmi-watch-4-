// Real held contacts + Lua Timer + C ACK, S3 UI only. Pointer release in finally.
import fs from 'node:fs';import path from 'node:path';import {projectRoot as root} from './verify-emulator.mjs';
import {guardEmulator,rpc,gesture} from './emulator-ui.mjs';import {captureScreenshot} from './emulator-screenshot.mjs';import {readScreenshot} from './assert-ui-probe.mjs';
const action=process.argv[2]??'start';if(process.argv.length>3||!['start','resume'].includes(action))throw Error('FixedGuiTestOnly');const out=path.join(root,'artifacts/emulator/step-ui-r231');if(fs.existsSync(path.join(out,'contact-test.json')))throw Error('ExistingTest');
guardEmulator();const delay=ms=>new Promise(r=>setTimeout(r,ms));
function v(n){const a=[];do{a.push((n&127)|(n>127?128:0));n=Math.floor(n/128);}while(n);return Buffer.from(a);}
const mouse=(x,y,b)=>rpc('sendMouse',Buffer.concat([Buffer.from([8]),v(x),Buffer.from([16]),v(y),Buffer.from([24,b])]));
function color(im,x,y,rgb){const p=(y*390+x)*im.bpp;return rgb.every((v,i)=>Math.abs(im.pixels[p+i]-v)<=8);}
function bar(im){const xs=[];for(let x=20;x<370;x++)if(color(im,x,209,[0,255,0]))xs.push(x);if(xs.length<18||xs.length>20)throw Error('CDrivenBarMissing');return xs[0];}
const shots=path.join(root,'artifacts/emulator/screenshots'),ready=readScreenshot(path.join(shots,'step-r231-cycle2-ready.png')),on=readScreenshot(path.join(shots,'step-r231-longpress-on.png'));
for(let i=0;i<5;i++)if(!color(ready,278,108+i*32,[96,96,96]))throw Error('NotReady');if(!color(on,350,166,[35,120,247]))throw Error('LongpressNotOn');
if(action==='start')await gesture(195,332,195,332);await delay(700);const started=await captureScreenshot(action==='resume'?'step-r231-cycle2-started-resume':'step-r231-cycle2-started');const positions=[bar(readScreenshot(started.output))],holds=[];
for(const [name,index,x,y]of [['up',0,104,252],['left',1,104,326],['right',2,286,252],['fire',3,286,326]]){
 try{await mouse(x,y,0);await delay(150);await mouse(x,y,1);await delay(3300);const shot=await captureScreenshot('step-r231-'+name+'-down'),im=readScreenshot(shot.output);if(!color(im,278,73+32*index,[0,255,0])||!color(im,30,390,[36,92,128]))throw Error('ActionAckOrGameUiMissing');positions.push(bar(im));holds.push({name,holdRequestedMs:3300,nativeAckIndicatorGreen:true,selectorNotObserved:true});}finally{await mouse(x,y,0);}
 await delay(250);const released=await captureScreenshot('step-r231-'+name+'-released'),im=readScreenshot(released.output);for(let i=0;i<4;i++)if(!color(im,278,73+32*i,[96,96,96]))throw Error('NotReleased');
}
if(new Set(positions).size<2)throw Error('NoCStepMovement');
await gesture(195,405,195,405);const exit=await captureScreenshot('step-r231-exit'),im=readScreenshot(exit.output);for(let i=0;i<5;i++)if(!color(im,278,108+32*i,[0,255,0]))throw Error('ExitOrHeldThresholdMissing');
const report={checkpoint:'R231',scope:'real S3 UI/Lua/C',holds,barPositions:positions,allReleasesVerified:true,manualExitGreen:true,stockLongpressOnDuringContacts:true,physicalWatchUsed:false,bluetoothOperationRequested:false};fs.writeFileSync(path.join(out,'contact-test.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
