// Emulator only. No hardware target, C, shell execution from Lua or native module.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';
import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedUiInstallOnly');
const id='365219997',guest='/data/app/watchface/market/'+id;
const work=path.join(root,'artifacts/ui-only-r200'),out=path.join(root,'artifacts/emulator/ui-only-r200');
if(fs.existsSync(out)){
 if(fs.existsSync(path.join(out,'install.json')))throw Error('ExistingInstall');
 // Preserve a read-only failed preflight; both fixed paths stay under artifacts.
 const saved=out+'-preflight';if(fs.existsSync(saved))throw Error('ExistingPreflight');
 fs.renameSync(out,saved);
}
const bytes=fs.readFileSync(path.join(work,'UiOnly-id-only.face'));
const review=JSON.parse(fs.readFileSync(path.join(work,'review.json'),'utf8'));
if(review.id!==id||review.size!==12784||review.sha256!=='ecb3f0cb9f5fceac877c20eb77944a3ecf6ebbc6f97fe48a6197eb9e39ea8e84'||
 sha256(bytes)!==review.sha256||review.nativeCodeIncluded!==false||review.nativeExecutionBackendIncluded!==false||review.physicalProfileRegistered!==false||bytes[5]!==0||bytes.subarray(40,49).toString('ascii')!==id)throw Error('ChangedUiOnlyPackage');
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});
const records=[];
function adb(args,label){
 const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
 records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
 fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');
 if(r.error||r.status!==0)throw Error('OwnedEmulatorCommandFailed');return r.stdout+r.stderr;
}
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest],'absence')))throw Error('IdExists');
const modules=adb(['shell','lsmod'],'modules-before');
if(!/^\s*NAME\s+INIT\s+UNINIT\s+ARG\s+NEXPORTS\s+TEXT\s+SIZE\s+DATA\s+SIZE\s*$/.test(modules))throw Error('ExpectedEmptyModuleRegistry');
const catalog=path.join(out,'list-before.json');adb(['pull','/data/app/watchface/watchface_list.json',catalog],'catalog-before');
const before=JSON.parse(fs.readFileSync(catalog,'utf8')).watchface_list;
const priorActiveIds=before.filter(f=>String(f.in_use)==='1').map(f=>f.id);
// This S3 cache has separate active Storage and built-in entries. Do not edit them.
if(before.some(f=>f.id===id)||!priorActiveIds.includes('365700764')||
 priorActiveIds.some(v=>!['365700764','362150001'].includes(v)))throw Error('UnexpectedCatalog');
const snapshot=await snapshotData();
const record={checkpoint:'R200',id,guest,sha256:review.sha256,physicalTransport:false,nativeCodeIncluded:false,
 snapshot,priorActiveIds,resetRequested:false};
fs.writeFileSync(path.join(out,'install.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
adb(['shell','mkdir',guest],'mkdir-owned');
adb(['push',path.join(work,'UiOnly-id-only.face'),guest+'/resource.bin'],'push-owned');
const rb=path.join(out,'resource-readback.bin');adb(['pull',guest+'/resource.bin',rb],'readback');
if(!fs.readFileSync(rb).equals(bytes))throw Error('ReadbackMismatch');
adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-guest-cache');
await resetGuest();record.resetRequested=true;
fs.writeFileSync(path.join(out,'install.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({checkpoint:'R200',id,readbackMatched:true,resetRequested:true,
 emulatorOnly:true,nativeCodeIncluded:false,physicalTransport:false,bluetoothOperationRequested:false}));
