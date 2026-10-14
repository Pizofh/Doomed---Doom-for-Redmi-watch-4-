// Guarded PC guest only. No native code and no physical target option.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorOnly');
const id='365219979',guest='/data/app/watchface/market/'+id,out=path.join(root,'artifacts/emulator/held-ui-r224'),pkg=path.join(root,'artifacts/held-r224');
if(fs.existsSync(out))throw Error('ExistingInstall');
const bytes=fs.readFileSync(path.join(pkg,'HoldPad-id-only.face')),review=JSON.parse(fs.readFileSync(path.join(pkg,'review.json'),'utf8'));
if(review.sha256!=='296868366da0f29a010777d031559ddf08a1c52d73f45021b9f3f034fbabff16'||review.id!==id||review.size!==15552||sha256(bytes)!==review.sha256||review.nativeCodeIncluded||review.shellIncluded||review.luaFilesystemWritesIncluded)throw Error('PackageChanged');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label,bootPoll=false){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2));if(r.error||r.status!==0){if(bootPoll)return '';throw Error('EmulatorCommandFailed');}return r.stdout+r.stderr;}
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest],'absence')))throw Error('IdExists');
const beforeModules=adb(['shell','lsmod'],'modules-before');if(!/^\s*NAME\s+INIT\s+UNINIT\s+ARG\s+NEXPORTS\s+TEXT\s+SIZE\s+DATA\s+SIZE\s*$/.test(beforeModules))throw Error('RegistryNotEmpty');
adb(['pull','/data/app/watchface/watchface_list.json',path.join(out,'list-before.json')],'list-before');
const before=JSON.parse(fs.readFileSync(path.join(out,'list-before.json'),'utf8')).watchface_list;
const active=before.filter(x=>String(x.in_use)==='1'&&String(x.type)!=='2');
if(active.length!==1||active[0].id!=='362130009'||before.some(x=>x.id===id))throw Error('UnexpectedBaseline');
const snapshot=await snapshotData(),record={checkpoint:'R224',id,guest,sha256:review.sha256,snapshot,activeBefore:active[0].id,moduleInventoryBefore:beforeModules,physicalTransport:false,nativeCodeIncluded:false};
fs.writeFileSync(path.join(out,'install.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
adb(['shell','mkdir',guest],'mkdir-owned');adb(['push',path.join(pkg,'HoldPad-id-only.face'),guest+'/resource.bin'],'push-owned');
adb(['pull',guest+'/resource.bin',path.join(out,'resource-readback.bin')],'readback');if(!fs.readFileSync(path.join(out,'resource-readback.bin')).equals(bytes))throw Error('ReadbackMismatch');
adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-only-guest-catalog');await resetGuest();
const deadline=Date.now()+15000;while(!/watchface_list.json/.test(adb(['shell','ls','/data/app/watchface/watchface_list.json'],'wait-boot-catalog',true))){if(Date.now()>deadline)throw Error('GuestBootWait');await new Promise(r=>setTimeout(r,500));}
adb(['pull','/data/app/watchface/watchface_list.json',path.join(out,'list-discovered.json')],'list-discovered');
const json=JSON.parse(fs.readFileSync(path.join(out,'list-discovered.json'),'utf8')),rows=json.watchface_list;
const own=rows.find(x=>x.id===id),normal=rows.filter(x=>String(x.in_use)==='1'&&String(x.type)!=='2');
if(!own||String(own.in_use)!=='0'||normal.length!==1||!before.some(x=>x.id===normal[0].id)||before.some(x=>!rows.some(y=>y.id===x.id)))throw Error('DiscoveryChangedBaseline');
record.activeAfterGuestRebuild=normal[0].id;record.guestRebuildChangedSelection=normal[0].id!==record.activeBefore;
fs.writeFileSync(path.join(out,'install.json'),JSON.stringify(record,null,2)+'\n');
// Own entry can follow AOD in rebuilt S3 cache; place it before the active
// normal face, preserving every other row's relative order and all fields.
const sorted=rows.filter(x=>x!==own);sorted.splice(sorted.indexOf(normal[0]),0,own);json.watchface_list=sorted;
const cache=path.join(out,'list-test-order.json');fs.writeFileSync(cache,JSON.stringify(json),{flag:'wx'});adb(['push',cache,'/data/app/watchface/watchface_list.json'],'order-own-before-active');await resetGuest();
console.log(JSON.stringify({checkpoint:'R224',id,readbackMatched:true,ownInactive:true,priorIdsPreserved:true,ownCatalogEntryReordered:true,emulatorOnly:true,nativeCodeIncluded:false,physicalTransport:false,bluetoothOperationRequested:false}));
