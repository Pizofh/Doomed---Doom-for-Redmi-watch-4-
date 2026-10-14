// Pure production Lua + real owned tmpfs. No RW4 hardware or native module.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorTestOnly');
const out=path.join(root,'artifacts/emulator/registry-r240'),top='/tmp/rw4registry-tests-r240';
if(fs.existsSync(out))throw Error('ExistingReport');
const source=fs.readFileSync(path.join(root,'experiments/native-step/registry-r240.lua'),'utf8');
const harness=fs.readFileSync(path.join(root,'experiments/native-step/registry-tests-r240.lua'),'utf8');
if(source.includes(']====]')||/\b(?:execute|remove|write|insmod|rmmod|loadfile|dofile)\s*\(|\/dev\//.test(source))throw Error('ScopeChanged');
const bundle='REGISTRY_SOURCE=[====[\n'+source+']====]\n'+harness;
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
if(!absent(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');adb(['shell','mkdir',top],'mkdir');
fs.writeFileSync(path.join(out,'test.lua'),bundle,{flag:'wx'});adb(['push',path.join(out,'test.lua'),top+'/test.lua'],'push');
let output;
try{output=adb(['shell','lua',top+'/test.lua'],'production-registry-reader');}
finally{for(const n of ['fixture.txt','test.lua'])if(!absent(adb(['shell','ls',top+'/'+n],'scratch-'+n)))adb(['shell','rm',top+'/'+n],'remove-'+n);adb(['shell','rmdir',top],'rmdir');}
if(adb(['shell','lsmod'],'modules-after')!==before||!absent(adb(['shell','ls',top],'absence-after')))throw Error('StateNotRestored');
if(!/RW4_REGISTRY_TESTS_OK 38\b/.test(output))throw Error('RegistryTestsFailed');
const report={checkpoint:'R240',scenariosPassed:38,sourceSha256:sha256(Buffer.from(source)),harnessSha256:sha256(Buffer.from(harness)),realOwnedTmpfsIo:true,procContentAndIoFailuresSimulated:true,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,nativeModuleOperationRequested:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
