// Fixed owned PC emulator only. No physical watch/USB/Bluetooth path.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';
const mode=process.argv[2]??'minimal',diagnostic=mode==='diagnostic',imageMode=mode==='image',nativeMode=mode==='native-info';
if(!['minimal','diagnostic','image','native-info'].includes(mode)||process.argv.length!==(process.argv[2]?3:2))throw Error('OnlyFixedLuaModesAccepted');
const id=nativeMode?'365219994':imageMode?'365219993':diagnostic?'365219992':'365219991',guest='/data/app/watchface/market/'+id;
const name=nativeMode?'NativeInfo':imageMode?'LuaImage':diagnostic?'LuaDiag':'LuaProbe',checkpoint=nativeMode?'R188':imageMode?'R184':diagnostic?'R180':'R177';
const label=nativeMode?'lua-native-info-r188':imageMode?'lua-image-r184':diagnostic?'lua-diagnostic-r180':'lua-minimal-r177';
const size=nativeMode?12708:imageMode?9328:diagnostic?10524:19796;
const pinnedHash=nativeMode?'e0fe5fb93311460eb784d44b449613ec0defc20841e061096811b4b42eea9c4d':imageMode?'150f285b7e63cc99519b32cde0b93fe35784cc5ba2d60a5d01746f1064483e49':diagnostic?'140b2a05618f617e70a7f5f28029beefed64251c43af0086cfaacfe0a681c8f1':
  'a40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a';
const build=path.join(root,'artifacts',label);
const dest=path.join(root,'artifacts/emulator',label);
const hash=b=>createHash('sha256').update(b).digest('hex');
const review=JSON.parse(fs.readFileSync(path.join(build,'review.json'),'utf8'));
const bytes=fs.readFileSync(path.join(build,name+'-id-only.face'));
const source=fs.readFileSync(path.join(root,'experiments',nativeMode?'lua-native-info':imageMode?'lua-image':diagnostic?'lua-diagnostic':'lua-minimal','main.lua'));
if(review.id!==id||review.size!==size||review.sha256!==pinnedHash||
  hash(bytes)!==review.sha256||hash(source)!==review.sourceSha256||!bytes.includes(source)||bytes[5]!==0||bytes.subarray(40,49).toString('ascii')!==id)throw Error('PackageChanged');
if(imageMode){
  const asset=fs.readFileSync(path.join(build,'app/lua/pattern.png'));
  if(review.imageSha256!=='2988d113d2d69931201b4c4274a3828aaa49ef689352c9d18548e7c30730bfe1'||hash(asset)!==review.imageSha256||!bytes.includes(asset))throw Error('ImageChanged');
}
if(nativeMode){
  const asset=fs.readFileSync(path.join(build,'app/lua/legend.png'));
  if(review.imageSha256!=='b8991bea47c296a6f602bff28aa3552e343d045aca675dec48d49db9575d70b0'||hash(asset)!==review.imageSha256||!bytes.includes(asset))throw Error('LegendChanged');
}
if(fs.existsSync(dest)){
  // Preserve a failed local preflight only; never resume a recorded installation.
  if(fs.existsSync(path.join(dest,'install.json')))throw Error('ExistingInstall');
  fs.renameSync(dest,dest+'-preflight-'+Date.now());
}
guardEmulator();fs.mkdirSync(dest);
function adb(args,label){const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:1048576,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(dest,'adb-'+label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('EmulatorOperationFailed');return r.stdout+r.stderr;}
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',guest],'absence')))throw Error('IDAlreadyPresent');
if(/\brw4(?:doom|first|winput|wframe|worker|bridge|task|time|fs|stdio)\b/.test(adb(['shell','lsmod'],'modules')))throw Error('OwnNativeModuleLoaded');
adb(['pull','/data/app/watchface/watchface_list.json',path.join(dest,'list-before.json')],'list-before');
const before=JSON.parse(fs.readFileSync(path.join(dest,'list-before.json'),'utf8')).watchface_list;
if(before.some(f=>f.id===id)||before.filter(f=>String(f.in_use)==='1').length<1)throw Error('UnexpectedCatalog');
const snapshot=await snapshotData();
const record={checkpoint,id,guest,sha256:review.sha256,headerByte5:0,snapshot,physicalTransport:false,
  sourceSha256:review.sourceSha256,resetRequested:false,priorActiveIds:before.filter(f=>String(f.in_use)==='1').map(f=>f.id)};
fs.writeFileSync(path.join(dest,'install.json'),JSON.stringify(record,null,2)+'\n');
adb(['shell','mkdir',guest],'mkdir');
adb(['push',path.join(build,name+'-id-only.face'),guest+'/resource.bin'],'push');
const rb=path.join(dest,'resource-readback.bin');adb(['pull',guest+'/resource.bin',rb],'readback');
if(hash(fs.readFileSync(rb))!==review.sha256)throw Error('ReadbackMismatch');
adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-emulator-cache');
await resetGuest();record.resetRequested=true;
fs.writeFileSync(path.join(dest,'install.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({checkpoint,id,readbackMatched:true,headerByte5:0,resetRequested:true,physicalTransport:false}));
