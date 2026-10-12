// Fixed owned PC emulator only. No physical watch/USB/Bluetooth path.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const id='365219991',guest='/data/app/watchface/market/'+id;
const build=path.join(root,'artifacts/lua-minimal-r177');
const dest=path.join(root,'artifacts/emulator/lua-minimal-r177');
const hash=b=>createHash('sha256').update(b).digest('hex');
const review=JSON.parse(fs.readFileSync(path.join(build,'review.json'),'utf8'));
const bytes=fs.readFileSync(path.join(build,'LuaProbe-id-only.face'));
const source=fs.readFileSync(path.join(root,'experiments/lua-minimal/main.lua'));
if(review.id!==id||review.size!==19796||review.sha256!=='a40c85607a8c208823f2dd6064ebca3c907a850e9a392c0b3eb0d718d3c9490a'||
  hash(bytes)!==review.sha256||hash(source)!==review.sourceSha256||!bytes.includes(source)||bytes[5]!==0||bytes.subarray(40,49).toString('ascii')!==id)throw Error('PackageChanged');
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
const record={checkpoint:'R177',id,guest,sha256:review.sha256,headerByte5:0,snapshot,physicalTransport:false,
  sourceSha256:review.sourceSha256,resetRequested:false,priorActiveIds:before.filter(f=>String(f.in_use)==='1').map(f=>f.id)};
fs.writeFileSync(path.join(dest,'install.json'),JSON.stringify(record,null,2)+'\n');
adb(['shell','mkdir',guest],'mkdir');
adb(['push',path.join(build,'LuaProbe-id-only.face'),guest+'/resource.bin'],'push');
const rb=path.join(dest,'resource-readback.bin');adb(['pull',guest+'/resource.bin',rb],'readback');
if(hash(fs.readFileSync(rb))!==review.sha256)throw Error('ReadbackMismatch');
adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-emulator-cache');
await resetGuest();record.resetRequested=true;
fs.writeFileSync(path.join(dest,'install.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({checkpoint:'R177',id,readbackMatched:true,headerByte5:0,resetRequested:true,physicalTransport:false}));
