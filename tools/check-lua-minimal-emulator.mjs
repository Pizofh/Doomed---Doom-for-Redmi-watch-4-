// Read-only validation of the owned PC guest and this experiment's local logs.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const dest=path.join(root,'artifacts/emulator/lua-minimal-r177');
const install=JSON.parse(fs.readFileSync(path.join(dest,'install.json'),'utf8'));
if(install.id!=='365219991'||install.physicalTransport!==false||install.headerByte5!==0)throw Error('UnexpectedInstall');
guardEmulator();
function pull(guest,name){const file=path.join(dest,name);const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),
  ['-H','127.0.0.1','-P','5039','-s','emulator-5554','pull',guest,file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  if(r.error||r.status!==0)throw Error('PullFailed');return fs.readFileSync(file);}
const extracted=pull(install.guest+'/lua/main.lua','derived-main-readback.lua');
const source=fs.readFileSync(path.join(root,'experiments/lua-minimal/main.lua'));
if(!source.equals(extracted)||createHash('sha256').update(extracted).digest('hex')!==install.sourceSha256)throw Error('ExtractedSourceChanged');
const list=JSON.parse(pull('/data/app/watchface/watchface_list.json','list-final.json')).watchface_list;
const own=list.find(f=>f.id===install.id);
if(!own||own.in_use!=='0'||!list.some(f=>f.id==='365700764'&&f.in_use==='1'))throw Error('StockNotRestored');
const before=JSON.parse(fs.readFileSync(path.join(dest,'list-before.json'))).watchface_list;
if(before.some(f=>!list.some(n=>n.id===f.id)))throw Error('OtherEntryMissing');
const logPath=path.join(root,'artifacts/emulator/host-stdout.txt');
if(fs.statSync(logPath).size>16777216)throw Error('LogTooLarge');
const log=fs.readFileSync(logPath,'utf8');
const start=log.lastIndexOf('RW4_LUA_MINIMAL: ready Lua 5.4');
if(start<0)throw Error('ReadyAbsent');
const section=log.slice(start),ticks=[...section.matchAll(/RW4_LUA_MINIMAL: tick (\d+)/g)].map(m=>Number(m[1]));
if(JSON.stringify(ticks)!==JSON.stringify([1,2,3,4,5,6,7,8,9,10])||!section.includes('RW4_LUA_MINIMAL: limit'))throw Error('CounterNotBounded');
const ninth=section.indexOf('RW4_LUA_MINIMAL: tick 9'),tenth=section.indexOf('RW4_LUA_MINIMAL: tick 10');
const between=section.slice(ninth,tenth);
if(!/RW4_LUA_MINIMAL: pause[\s\S]*RW4_LUA_MINIMAL: resume/.test(between)||!section.includes('close lua now.'))throw Error('LifecycleNotObserved');
const summary={checkpoint:'R177',sameCandidateHeaderByte5:0,extractedSourceExact:true,luaVersion:'5.4',
  ticks,pauseResumeBeforeTenthTick:true,budgetStopped:true,luaCloseObserved:true,
  ownRegisteredInactive:true,stockStorageActive:true,otherCatalogEntriesPreserved:true,
  physicalTransport:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(dest,'validation.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
