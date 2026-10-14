import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,stateReadSource} from './state-trace-source-r259.mjs';import {stateReadAssets} from './state-trace-assets-r259.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const out=path.join(root,'artifacts/emulator/state-trace-r259-final'),top='/tmp/rw4state-trace-tests-r259';if(fs.existsSync(out))throw Error('ExistingReport');
const {source}=stateReadSource(),harness=fs.readFileSync(path.join(root,'experiments/native-step/state-trace-tests-r259.lua'),'utf8'),observed=fs.readFileSync(path.join(root,'artifacts/proc-photo-r248/observed.bin'));
if(source.includes(']====]')||observed.length!==66||stateReadAssets().records.length!==23)throw Error('InputsChanged');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
if(!absent(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');
fs.writeFileSync(path.join(out,'test.lua'),'STATE_SOURCE=[====[\n'+source+']====]\n'+harness,{flag:'wx'});fs.writeFileSync(path.join(out,'observed.bin'),observed,{flag:'wx'});
adb(['shell','mkdir',top],'mkdir');for(const n of ['test.lua','observed.bin'])adb(['push',path.join(out,n),top+'/'+n],'push-'+n);let result;
try{result=adb(['shell','lua',top+'/test.lua'],'production-state-trace-tests');}
finally{for(const n of ['test.lua','observed.bin','state-trace-attempt-r259.txt','registry.txt','old-marker.txt','node.bin'])if(!absent(adb(['shell','ls',top+'/'+n],'scratch-'+n)))adb(['shell','rm',top+'/'+n],'remove-'+n);adb(['shell','rmdir',top],'rmdir');}
if(!result.includes('RW4_STATE_READ_TESTS_OK 48')||!absent(adb(['shell','ls',top],'absence-after'))||adb(['shell','lsmod'],'modules-after')!==before)throw Error('TestsFailed');
const report={checkpoint:'R259',scenariosPassed:48,sourceSha256:sha256(Buffer.from(source)),harnessSha256:sha256(Buffer.from(harness)),realOwnedTmpfsIo:true,nodeRegistryAndWidgetsSimulated:true,oneNativeOpenReadCloseModeled:true,noNativeNodeWrites:true,singleAttemptGuardTested:true,postRegistryCompared:true,oldMarkerNotRequired:true,postRegistryDiagnostic:true,modeSwitchWithoutIo:true,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
