// Own S3 guest only. Install inactive Lua UI, rebuild cache, stage reviewed S3 ELF.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
const action=process.argv[2]??'install';if(process.argv.length>3||!['install','resume'].includes(action))throw Error('FixedEmulatorOnly');
const id='365219978',guest='/data/app/watchface/market/'+id,out=path.join(root,'artifacts/emulator/step-ui-r231');if((action==='install'&&fs.existsSync(out))||(action==='resume'&&!fs.existsSync(path.join(out,'install.json'))))throw Error('ExistingOrMissingInstall');
const pkg=path.join(root,'artifacts/step-ui-r231'),bytes=fs.readFileSync(path.join(pkg,'StepPad-id-only.face')),review=JSON.parse(fs.readFileSync(path.join(pkg,'review.json'),'utf8'));
if(sha256(bytes)!=='f42cfcc39f25650ae86313e28c43d2f99eb24345e3a26a59e49400738f121fa5'||review.size!==20468||review.id!==id||review.nativeElfIncluded||!review.s3Only)throw Error('PackageChanged');
const elf=path.join(root,'build/native-step-bridge-r230-reviewed/bridge.elf');if(sha256(fs.readFileSync(elf))!=='89863182dabd4c8ce63c398c8734b98c4d1079c5dc68019bc68acecdc69f253c')throw Error('ElfChanged');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const logs=[];
function adb(args,bootPoll=false){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536});logs.push({args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,action==='resume'?'resume-commands.json':'commands.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0){if(bootPoll)return '';throw Error('GuestCommandFailed');}return r.stdout+r.stderr;}
let before,current,record;
if(action==='install'){
for(const p of [guest,'/dev/rw4step230','/tmp/rw4step230.elf','/tmp/rw4step230-inspect.txt'])if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',p])))throw Error('GuestCollision');
const modules=adb(['shell','lsmod']);if(!/^\s*NAME\s+INIT\s+UNINIT\s+ARG\s+NEXPORTS\s+TEXT\s+SIZE\s+DATA\s+SIZE\s*$/.test(modules))throw Error('RegistryNotEmpty');
adb(['pull','/data/app/watchface/watchface_list.json',path.join(out,'list-before.json')]);before=JSON.parse(fs.readFileSync(path.join(out,'list-before.json'),'utf8')).watchface_list;
current=before.filter(x=>String(x.in_use)==='1'&&String(x.type)!=='2');if(current.length!==1||current[0].id!=='362130003'||before.some(x=>x.id===id))throw Error('UnexpectedBaseline');
record={checkpoint:'R231',id,sha256:review.sha256,moduleInventoryBefore:modules,activeBefore:current[0].id,snapshot:await snapshotData(),nativeElfStagedNotLoaded:true,physicalWatchUsed:false};fs.writeFileSync(path.join(out,'install.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
adb(['shell','mkdir',guest]);adb(['push',path.join(pkg,'StepPad-id-only.face'),guest+'/resource.bin']);adb(['pull',guest+'/resource.bin',path.join(out,'resource-readback.bin')]);if(!fs.readFileSync(path.join(out,'resource-readback.bin')).equals(bytes))throw Error('ReadbackMismatch');
adb(['shell','rm','/data/app/watchface/watchface_list.json']);await resetGuest();
}else{
record=JSON.parse(fs.readFileSync(path.join(out,'install.json'),'utf8'));if(record.id!==id||record.sha256!==review.sha256||fs.existsSync(path.join(out,'elf-readback.bin')))throw Error('ResumeRefused');
before=JSON.parse(fs.readFileSync(path.join(out,'list-before.json'),'utf8')).watchface_list;current=before.filter(x=>String(x.in_use)==='1'&&String(x.type)!=='2');
adb(['pull',guest+'/resource.bin',path.join(out,'resource-resume-readback.bin')]);if(!fs.readFileSync(path.join(out,'resource-resume-readback.bin')).equals(bytes)||adb(['shell','lsmod'])!==record.moduleInventoryBefore)throw Error('ResumeStateChanged');record.resumedAfterTransientEmptyCatalog=true;
}
let poll=0;
async function waitCatalog(){const deadline=Date.now()+20000;do{const capture=path.join(out,'catalog-poll-'+action+'-'+poll+++'.json');adb(['pull','/data/app/watchface/watchface_list.json',capture],true);try{const json=JSON.parse(fs.readFileSync(capture,'utf8')),rows=json.watchface_list;if(rows.length===before.length+1&&rows.some(a=>a.id===id)&&before.every(b=>rows.some(a=>a.id===b.id))&&rows.filter(a=>String(a.in_use)==='1'&&String(a.type)!=='2').length===1)return json;}catch{}await new Promise(r=>setTimeout(r,500));}while(Date.now()<deadline);throw Error('CompleteCatalogWaitExpired');}
const json=await waitCatalog();fs.writeFileSync(path.join(out,action==='resume'?'list-discovered-complete.json':'list-discovered.json'),JSON.stringify(json));
const rows=json.watchface_list,own=rows.find(x=>x.id===id),active=rows.filter(x=>String(x.in_use)==='1'&&String(x.type)!=='2');
if(!own||String(own.in_use)!=='0'||active.length!==1||before.some(b=>!rows.some(a=>a.id===b.id)))throw Error('CatalogChanged');
const sorted=rows.filter(x=>x!==own);sorted.splice(sorted.indexOf(active[0]),0,own);json.watchface_list=sorted;const cache=path.join(out,'list-test-order.json');fs.writeFileSync(cache,JSON.stringify(json),{flag:'wx'});adb(['push',cache,'/data/app/watchface/watchface_list.json']);await resetGuest();await waitCatalog();
record.activeAfterGuestRebuild=active[0].id;record.guestRebuildChangedSelection=current[0].id!==active[0].id;fs.writeFileSync(path.join(out,'install.json'),JSON.stringify(record,null,2)+'\n');
// /tmp is wiped by reset: stage only after final restart. Never load from PC.
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls','/tmp/rw4step230.elf'])))throw Error('TemporaryCollision');
adb(['push',elf,'/tmp/rw4step230.elf']);adb(['pull','/tmp/rw4step230.elf',path.join(out,'elf-readback.bin')]);if(sha256(fs.readFileSync(path.join(out,'elf-readback.bin')))!==sha256(fs.readFileSync(elf)))throw Error('ElfReadbackMismatch');
console.log(JSON.stringify({checkpoint:'R231',ownInactive:true,priorIdsPreserved:true,active:active[0].id,elfStagedNotLoaded:true,emulatorOnly:true,physicalWatchUsed:false,bluetoothOperationRequested:false}));
