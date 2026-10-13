// Execute pure controller + fake backend in the owned Lua5.4 emulator CLI.
// No ELF, real insmod/rmmod, physical watch, or arbitrary adb target accepted.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const out=path.join(root,'artifacts/emulator/controller-r196');
if(fs.existsSync(out))throw Error('ExistingReport');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const source=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/controller.lua'),'utf8');
const tests=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/controller-tests.lua'),'utf8');
if(source.includes(']==]')||source.length>16384||tests.length>16384||/\b(?:os\.execute|io\.open|package\.loadlib)\s*\(/.test(source+tests))throw Error('UnsafeTestSource');
const bundle='RW4_CONTROLLER_SOURCE = [==[\n'+source+']==]\n'+tests;
guardEmulator();fs.mkdirSync(out,{recursive:true});
const guest='/tmp/rw4-controller-r196.lua';
const records=[];
function adb(args,label){
  const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
  fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');
  if(r.error||r.status!==0)throw Error('EmulatorTestCommandFailed');return r.stdout+r.stderr;
}
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');
const local=path.join(out,'controller-tests.lua');fs.writeFileSync(local,bundle,{flag:'wx'});
adb(['push',local,guest],'push-owned-lua');
const readback=path.join(out,'controller-readback.lua');adb(['pull',guest,readback],'readback');
if(!fs.readFileSync(readback).equals(Buffer.from(bundle)))throw Error('GuestSourceMismatch');
const result=adb(['shell','lua',guest],'run-fake-backend');
if(!/RW4_CONTROLLER_TESTS_OK 24\b/.test(result))throw Error('ControllerTestsFailed');
const after=adb(['shell','lsmod'],'modules-after');
if(before!==after)throw Error('ModuleInventoryChanged');
// Remove exactly the tmpfs file created and read back above; no recursive cleanup.
adb(['shell','rm',guest],'remove-owned-lua');
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest],'absence-after')))throw Error('ScratchRemains');
const summary={checkpoint:'R196',scope:'actual-Lua-controller-with-simulated-backend-in-S3',scenariosPassed:24,
  sourceSha256:hash(Buffer.from(source)),testsSha256:hash(Buffer.from(tests)),bundleReadbackVerified:true,
  moduleInventoryUnchanged:true,ownTmpFileRemoved:true,nativeModuleExecuted:false,physicalWatchUsed:false,
  phoneOperationRequested:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(summary));
