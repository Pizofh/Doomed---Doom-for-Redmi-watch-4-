// Read the owned S3 guest after UiOnly is closed and Storage is selected.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {ownTextPixel} from './native-info-legend.mjs';
import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedUiCheckOnly');
const out=path.join(root,'artifacts/emulator/ui-only-r200'),build=path.join(root,'artifacts/ui-only-r200');
if(fs.existsSync(path.join(out,'validation.json')))throw Error('ExistingValidation');
const review=JSON.parse(fs.readFileSync(path.join(build,'review.json'),'utf8'));
const install=JSON.parse(fs.readFileSync(path.join(out,'install.json'),'utf8'));
if(install.id!=='365219997'||install.physicalTransport!==false||review.nativeCodeIncluded!==false||
 review.sha256!=='ecb3f0cb9f5fceac877c20eb77944a3ecf6ebbc6f97fe48a6197eb9e39ea8e84')throw Error('WrongUiInstall');
guardEmulator();
const records=[],exe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
function adb(args,label){
 const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
 records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
 fs.writeFileSync(path.join(out,'check-commands.json'),JSON.stringify(records,null,2)+'\n');
 if(r.error||r.status!==0)throw Error('OwnedGuestReadFailed');return r.stdout+r.stderr;
}
for(const entry of review.entries){
 const file=path.join(out,'derived-'+entry.name);adb(['pull',install.guest+'/lua/'+entry.name,file],'readback-'+entry.name);
 if(sha256(fs.readFileSync(file))!==entry.sha256)throw Error('ExtractedUiChanged');
}
const modules=adb(['shell','lsmod'],'modules-after');
if(!/^\s*NAME\s+INIT\s+UNINIT\s+ARG\s+NEXPORTS\s+TEXT\s+SIZE\s+DATA\s+SIZE\s*$/.test(modules))throw Error('ModuleRegistryChanged');
const catalog=path.join(out,'list-final.json');adb(['pull','/data/app/watchface/watchface_list.json',catalog],'catalog-after');
const before=JSON.parse(fs.readFileSync(path.join(out,'list-before.json'),'utf8')).watchface_list;
const after=JSON.parse(fs.readFileSync(catalog,'utf8')).watchface_list;
if(after.length!==before.length+1||before.some(b=>!after.some(a=>a.id===b.id))||
 !after.some(a=>a.id===install.id&&a.in_use==='0')||!after.some(a=>a.id==='365700764'&&a.in_use==='1'))throw Error('CatalogOrStockChanged');
const screenshots=path.join(root,'artifacts/emulator/screenshots');
const render=readScreenshot(path.join(screenshots,'ui-only-r200-render.png'));
const clicked=readScreenshot(path.join(screenshots,'ui-only-r200-click.png'));
function pixel(image,x,y,color){
 const at=(y*390+x)*image.bpp;
 if(!color.every((v,c)=>Math.abs(image.pixels[at+c]-v)<=8))throw Error('UiPixelMismatch-'+x+'-'+y);
}
for(let i=0;i<5;i++){
 pixel(render,295,121+i*32,[96,96,96]);pixel(clicked,295,121+i*32,[0,255,0]);
}
const names=['FRAME','ICON','INPUT','TOUCH','END'];
for(let y=0;y<160;y++)for(let x=0;x<180;x++)pixel(render,79+x,113+y,ownTextPixel(names[Math.floor(y/32)],x,y%32));
for(let y=0;y<20;y++)for(let x=0;x<96;x++)pixel(render,147+x,299+y,ownTextPixel('TEST UI',x,y,[36,92,128]));
for(const suffix of ['click-repeat','resume2']){
 if(!fs.readFileSync(path.join(screenshots,'ui-only-r200-click.png')).equals(fs.readFileSync(path.join(screenshots,'ui-only-r200-'+suffix+'.png'))))throw Error('UnexpectedUiChange');
}
const host=path.join(root,'artifacts/emulator/host-stdout.txt');
if(fs.statSync(host).size>16777216)throw Error('HostLogBound');
const full=fs.readFileSync(host,'utf8'),start=full.lastIndexOf('RW4_UI_ONLY: built=');
if(start<0)throw Error('UiLogAbsent');
const log=full.slice(start),lines=log.split(/\r?\n/).filter(line=>line.startsWith('RW4_UI_ONLY:'));
if(!lines.includes('RW4_UI_ONLY: built=true')||!lines.includes('RW4_UI_ONLY: event_ready=true')||
 lines.filter(line=>line==='RW4_UI_ONLY: click').length!==1||!log.includes('close lua now.'))throw Error('UiLifecycleMismatch');
fs.writeFileSync(path.join(out,'own-lifecycle.txt'),lines.join('\n')+'\n');
const report={checkpoint:'R200',scope:'S3-emulator-real-LVGL',packageSha256:review.sha256,
 sourceSha256:review.sourceSha256,labelsAndButtonPixelsVerified:true,realTouchCallbackObserved:true,
 duplicateTouchBlocked:true,unchangedAfterStockPanel:true,luaCloseObserved:true,stockStorageActive:true,
 extractedSourceAndImagesExact:true,priorIdsPreserved:true,beforeCount:before.length,afterCount:after.length,
 moduleRegistryEmpty:true,nativeCodeIncluded:false,dynamicLoadUsed:false,
 emulatorGlobalLoadIsFunction:lines.includes('RW4_UI_ONLY: load_type=function'),
 runtimePathMatchesOldSuffix:lines.includes('RW4_UI_ONLY: expected_path_suffix=true'),
 physicalTransport:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
