import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,registrySource} from './registry-source-r241.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorTestOnly');
const out=path.join(root,'artifacts/emulator/registry-r241-final');if(fs.existsSync(out))throw Error('ExistingReport');
const {reader,source}=registrySource();
const core=fs.readFileSync(path.join(root,'experiments/native-step/registry-tests-r240.lua'),'utf8'),ui=fs.readFileSync(path.join(root,'experiments/native-step/registry-ui-tests-r241.lua'),'utf8');
if([reader,source].some(s=>s.includes(']====]')))throw Error('DelimiterChanged');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
const before=adb(['shell','lsmod'],'modules-before');
for(const [name,top,bundle,expected,files]of [
 ['core','/tmp/rw4registry-tests-r240','REGISTRY_SOURCE=[====[\n'+reader+']====]\n'+core,'RW4_REGISTRY_TESTS_OK 38',['fixture.txt','test.lua']],
 ['ui','/tmp/rw4registry-ui-tests-r241','UI_SOURCE=[====[\n'+source+']====]\n'+ui,'RW4_REGISTRY_UI_TESTS_OK 17',['fixture.txt','registry-attempt-r241.txt','test.lua']]
]){
 if(!absent(adb(['shell','ls',top],name+'-absence')))throw Error('GuestCollision');
 const local=path.join(out,name+'.lua');fs.writeFileSync(local,bundle,{flag:'wx'});adb(['shell','mkdir',top],name+'-mkdir');adb(['push',local,top+'/test.lua'],name+'-push');let result;
 try{result=adb(['shell','lua',top+'/test.lua'],name+'-production-test');}
 finally{for(const n of files)if(!absent(adb(['shell','ls',top+'/'+n],name+'-scratch-'+n)))adb(['shell','rm',top+'/'+n],name+'-remove-'+n);adb(['shell','rmdir',top],name+'-rmdir');}
 if(!result.includes(expected)||!absent(adb(['shell','ls',top],name+'-absence-after')))throw Error('TestsFailed');
}
if(adb(['shell','lsmod'],'modules-after')!==before)throw Error('StateNotRestored');
const report={checkpoint:'R241',readerScenariosPassed:38,uiScenariosPassed:17,sourceSha256:sha256(Buffer.from(source)),readerSha256:sha256(Buffer.from(reader)),uiHarnessSha256:sha256(Buffer.from(ui)),realOwnedTmpfsIo:true,procAndWidgetsSimulated:true,noQueryOnSelection:true,singleQueryGuardTested:true,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
