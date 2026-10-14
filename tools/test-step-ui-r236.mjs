// Production RW4 app in guarded S3 Lua with fake shell/native/LVGL only.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,rw4StepUiSource} from './step-ui-source-r236.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorTestOnly');
const out=path.join(root,'artifacts/emulator/step-ui-r236-final'),top='/tmp/rw4step-tests-r235';
if(fs.existsSync(out))throw Error('ExistingReport');
const {source,ui,client,adapter,elf}=rw4StepUiSource();
const harness=fs.readFileSync(path.join(root,'experiments/native-step/tests-r235.lua'),'utf8')+'\n'+fs.readFileSync(path.join(root,'experiments/native-step/tests-ui-r236.lua'),'utf8');
let bundle='STEP_ELF_HEX="'+elf.toString('hex')+'"\n';
for(const [name,text]of [['STEP_CLIENT_SOURCE',client],['STEP_ADAPTER_SOURCE',adapter],['STEP_MAIN_SOURCE',source]])bundle+=name+'=[====[\n'+text+']====]\n';
bundle+=harness;if(harness.includes(']====]')||/\breal_os\.execute\s*\(/.test(harness)||Buffer.byteLength(bundle)>65536)throw Error('HarnessRefused');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
if(!absent(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');adb(['shell','mkdir',top],'mkdir');
fs.writeFileSync(path.join(out,'test.lua'),bundle,{flag:'wx'});fs.writeFileSync(path.join(out,'candidate.elf'),elf,{flag:'wx'});
for(const name of ['test.lua','candidate.elf'])adb(['push',path.join(out,name),top+'/'+name],'push-'+name);
let output;
try{output=adb(['shell','lua',top+'/test.lua'],'production-app-simulated-native-ui');}
finally{
 for(const name of ['step.elf','step-attempt-r234.txt','step-inspect-r235.txt','test.lua','candidate.elf'])if(!absent(adb(['shell','ls',top+'/'+name],'scratch-'+name)))adb(['shell','rm',top+'/'+name],'remove-'+name);
 adb(['shell','rmdir',top],'rmdir');
}
if(adb(['shell','lsmod'],'modules-after')!==before||!absent(adb(['shell','ls',top],'absence-after')))throw Error('StateNotRestored');
const match=output.match(/RW4_STEP_UI_TESTS_OK (\d+)\b/);if(!match||Number(match[1])!==31||!/RW4_STEP_CARRIER_TESTS_OK 37\b/.test(output))throw Error('UiTestsFailed');
const report={checkpoint:'R236',uiScenariosPassed:Number(match[1]),carrierScenariosPassed:37,sourceSha256:sha256(Buffer.from(source)),uiSha256:sha256(Buffer.from(ui)),clientSha256:sha256(Buffer.from(client)),adapterSha256:sha256(Buffer.from(adapter)),harnessSha256:sha256(Buffer.from(harness)),candidateElfSha256:sha256(elf),realOwnedTmpfsIo:true,shellAndNativeDeviceSimulated:true,widgetsAndTimerAndInputSimulated:true,stockLongpressRetested:false,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,rw4NativeExecuted:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
