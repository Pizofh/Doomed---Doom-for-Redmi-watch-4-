// Offline screenshots/logs + final readbacks captured from the owned S3 guest.
import fs from 'node:fs';
import path from 'node:path';
import {root,sha256,framesSource} from './frames-source-r219.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {pixel} from './frame-pattern-r218.mjs';
if(process.argv.length!==2)throw Error('FixedCheckOnly');
const out=path.join(root,'artifacts/emulator/frames-ui-r220'),shots=path.join(root,'artifacts/emulator/screenshots');
if(fs.existsSync(path.join(out,'validation.json')))throw Error('ExistingValidation');
function color(image,x,y,rgb){const p=(y*390+x)*image.bpp;return rgb.every((v,i)=>Math.abs(image.pixels[p+i]-v)<=8);}
const ready=readScreenshot(path.join(shots,'frames-r220-ready.png'));
for(let i=0;i<5;i++)if(!color(ready,295,69+i*32,[96,96,96]))throw Error('NotReadyGray');
const phases=[];
for(let i=0;i<6;i++){
 const img=readScreenshot(path.join(shots,`frames-r220-render-${i}.png`));
 const phase=[0,1,2,3].find(p=>color(img,152,299,pixel(p,5,10)));if(phase===undefined)throw Error('NoFrame');
 for(let y=0;y<64;y++)for(let x=0;x<96;x++)if(!color(img,147+x,289+y,pixel(phase,x,y)))throw Error('RenderedPixelMismatch');
 for(let j=0;j<4;j++)if(!color(img,295,69+j*32,[0,255,0]))throw Error('NativeStageIndicators');
 phases.push(phase);
}
if(new Set(phases).size<2)throw Error('AnimationNotObserved');
const ended=readScreenshot(path.join(shots,'frames-r220-exited.png'));
for(let i=0;i<5;i++)if(!color(ended,295,69+i*32,[0,255,0]))throw Error('ExitNotGreen');
for(let y=0;y<64;y++)for(let x=0;x<96;x++)if(!color(ended,147+x,289+y,[32,32,32]))throw Error('ImageNotDetached');
const log=fs.readFileSync(path.join(root,'artifacts/emulator/host-stdout.txt'),'utf8'),start=log.lastIndexOf('RW4_FRAMES_UI: Ready'),section=log.slice(start);
if(start<0||!section.includes('RW4_FRAMES_UI: SimulatedStart')||!section.includes('RW4_FRAMES_UI: Detached')||!/RW4_FRAMES_UI: Exit \d+ true/.test(section)||!section.includes('close lua now.'))throw Error('LifecycleIncomplete');
for(let p=0;p<4;p++)if(!section.includes('RW4_FRAMES_UI: Frame '+p+' '))throw Error('FourPhaseCallbacksNotObserved');
const before=JSON.parse(fs.readFileSync(path.join(out,'list-before.json'),'utf8')).watchface_list;
const after=JSON.parse(fs.readFileSync(path.join(out,'list-final.json'),'utf8')).watchface_list;
if(before.some(b=>!after.some(a=>a.id===b.id))||!after.some(a=>a.id==='362130009'&&String(a.in_use)==='1')||!after.some(a=>a.id==='365219981'&&String(a.in_use)==='0'))throw Error('CatalogNotRestored');
const modules=fs.readFileSync(path.join(out,'modules-final.txt'),'utf8'),install=JSON.parse(fs.readFileSync(path.join(out,'install.json'),'utf8'));
if(modules.replace(/\r/g,'').trim()!==install.moduleInventoryBefore.replace(/\r/g,'').trim())throw Error('ModuleInventoryChanged');
const source=framesSource();const report={checkpoint:'R220',scope:'S3 emulator UI only',uiSha256:sha256(Buffer.from(source.ui)),phases,allPixelsOfCapturedCFramesVerified:true,fourPhaseCallbacksObserved:true,realTimerAndManualExitObserved:true,manualStartObserved:true,imagesDetachedAfterExit:true,luaCloseObserved:true,ownRegisteredInactive:true,stockFaceActive:'362130009',priorIdsPreserved:true,moduleInventoryUnchanged:true,nativeBackendSimulated:true,fileCleanupBackendSimulated:true,realCFrameGenerationSeparatelyVerified:true,rw4ElfExecuted:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
