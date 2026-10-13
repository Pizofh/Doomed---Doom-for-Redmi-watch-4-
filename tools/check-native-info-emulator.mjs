// Validate only our owned S3 guest, after the normal Storage face is restored.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
guardEmulator();
const dest=path.join(root,'artifacts/emulator/lua-native-info-r188');
const install=JSON.parse(fs.readFileSync(path.join(dest,'install.json')));
if(install.id!=='365219994'||install.physicalTransport!==false||install.headerByte5!==0)throw Error('WrongInstall');
function adb(args){const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),
  ['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  if(r.error||r.status!==0)throw Error('EmulatorReadFailed');return r.stdout+r.stderr;}
for(const [name,sha] of [['main.lua','764d532c6810a51999434c1f7847ec075e5d85c273792ab9b5777a91c7a2f4a7'],
  ['legend.png','b8991bea47c296a6f602bff28aa3552e343d045aca675dec48d49db9575d70b0']]){
  const file=path.join(dest,'derived-'+name);adb(['pull',install.guest+'/lua/'+name,file]);
  if(createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==sha)throw Error('ExtractedChanged');
}
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',install.guest+'/lua/native-info-capture.txt'])))throw Error('ScratchRemains');
const catalog=path.join(dest,'list-final.json');adb(['pull','/data/app/watchface/watchface_list.json',catalog]);
const list=JSON.parse(fs.readFileSync(catalog)).watchface_list;
const before=JSON.parse(fs.readFileSync(path.join(dest,'list-before.json'))).watchface_list;
if(!list.some(f=>f.id===install.id&&f.in_use==='0')||!list.some(f=>f.id==='365700764'&&f.in_use==='1')||before.some(f=>!list.some(n=>n.id===f.id)))throw Error('StockOrCatalogChanged');
const logFile=path.join(root,'artifacts/emulator/host-stdout.txt');
if(fs.statSync(logFile).size>16777216)throw Error('LogLimit');
const full=fs.readFileSync(logFile,'utf8'),start=full.lastIndexOf('RW4_NATIVE_INFO: root');
if(start<0)throw Error('RootAbsent');
const log=full.slice(start),names=['OS FUNC','IO FUNC','LOAD FUNC','SHELL','INSMOD','RMMOD','LSMOD','IWASM','NUTTX','ARM NAME','CLEANUP'];
if(!log.includes('RW4_NATIVE_INFO: ready')||!log.includes('close lua now.')||log.includes('RW4_NATIVE_INFO: stopped'))throw Error('ProbeOrCloseFailed');
const folder=path.join(root,'artifacts/emulator/screenshots');
const png=path.join(folder,'native-info-r188-render.png'),image=readScreenshot(png);
const states=names.map((name,i)=>{
  const state=i<3?'present':'yes';
  if(!log.includes('RW4_NATIVE_INFO: '+name+'='+state))throw Error('StateMismatch');
  const expected=i<3?[255,255,0]:[0,255,0],at=((111+22*i)*390+295)*image.bpp;
  if(!expected.every((v,c)=>Math.abs(image.pixels[at+c]-v)<=8))throw Error('MarkerMismatch');
  return {name,state};
});
if(!fs.readFileSync(png).equals(fs.readFileSync(path.join(folder,'native-info-r188-resume.png'))))throw Error('PanelChangedImage');
const summary={checkpoint:'R188',scope:'S3-emulator-watchface',states,extractedSourceAndLegendExact:true,
  ownCaptureAbsent:true,stockStorageActive:true,priorIdsPreserved:true,unchangedAfterStockPanel:true,luaCloseObserved:true,
  nativeModuleLoaded:false,physicalTransport:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(dest,'validation.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
