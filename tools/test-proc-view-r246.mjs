import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,procViewSource} from './proc-view-source-r246.mjs';import {procViewAssets,procCharacters} from './proc-view-assets-r246.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const out=path.join(root,'artifacts/emulator/proc-view-r246-final'),top='/tmp/rw4proc-view-tests-r246';if(fs.existsSync(out))throw Error('ExistingReport');
const source=procViewSource(),harness=fs.readFileSync(path.join(root,'experiments/native-step/proc-view-tests-r246.lua'),'utf8'),assets=procViewAssets();
if(source.includes(']====]'))throw Error('DelimiterChanged');
for(const c of procCharacters)if(!assets.records.some(([n])=>n==='g'+c.charCodeAt(0).toString(16)+'.png'))throw Error('MissingCharacter');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
if(!absent(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');
const file=path.join(out,'test.lua');fs.writeFileSync(file,'VIEW_SOURCE=[====[\n'+source+']====]\n'+harness,{flag:'wx'});
adb(['shell','mkdir',top],'mkdir');adb(['push',file,top+'/test.lua'],'push');let result;
try{result=adb(['shell','lua',top+'/test.lua'],'production-view-tests');}
finally{for(const n of ['fixture.txt','proc-view-attempt-r246.txt','test.lua'])if(!absent(adb(['shell','ls',top+'/'+n],'scratch-'+n)))adb(['shell','rm',top+'/'+n],'remove-'+n);adb(['shell','rmdir',top],'rmdir');}
if(!result.includes('RW4_PROC_VIEW_TESTS_OK 22')||!absent(adb(['shell','ls',top],'absence-after'))||adb(['shell','lsmod'],'modules-after')!==before)throw Error('TestsFailed');
const report={checkpoint:'R246',scenariosPassed:22,sourceSha256:sha256(Buffer.from(source)),harnessSha256:sha256(Buffer.from(harness)),characterResources:procCharacters.length,headLimitBytes:64,tailLimitBytes:16,realOwnedTmpfsIo:true,procAndWidgetsSimulated:true,singleSnapshotAndModeTested:true,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
