// Lua interpreter in guarded S3 only; widgets, events and Timer simulated.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const out=path.join(root,'artifacts/emulator/held-lua-r223'),guest='/tmp/rw4held-tests-r223.lua';if(fs.existsSync(out))throw Error('ExistingReport');
const source=fs.readFileSync(path.join(root,'experiments/lua-held/main-r223.lua'),'utf8'),harness=fs.readFileSync(path.join(root,'experiments/lua-held/tests-r223.lua'),'utf8');
if(source.includes(']====]')||/\b(?:os|io)\s*\.|insmod|rmmod|register_driver/.test(source))throw Error('ExecutionBackendRefused');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});
const file=path.join(out,'test.lua');fs.writeFileSync(file,'HELD_SOURCE=[====[\n'+source+']====]\n'+harness,{flag:'wx'});
const records=[];function adb(args){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2));if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest])))throw Error('GuestCollision');
const before=adb(['shell','lsmod']);adb(['push',file,guest]);let reply;try{reply=adb(['shell','lua',guest]);}finally{adb(['shell','rm',guest]);}
if(adb(['shell','lsmod'])!==before||!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest])))throw Error('GuestStateChanged');
if(!/RW4_HELD_TESTS_OK 14\b/.test(reply))throw Error('LuaTestsFailed');
const report={checkpoint:'R223',scenariosPassed:14,sourceSha256:sha256(Buffer.from(source)),harnessSha256:sha256(Buffer.from(harness)),widgetsAndTimerAndInputSimulated:true,realStockLongpressTested:false,singleStartAndReleaseAndOutsideAndPauseAndBudgetVerified:true,moduleInventoryUnchanged:true,ownGuestFileRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
