// Production backend/UI in Lua5.4 with REAL owned tmpfs I/O and FAKE exec/widgets.
// No direct adb targets, real insmod/rmmod, watch commands or kernel C execution.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {firstCRoot as root,firstCSource,sha256} from './first-c-source.mjs';
import {firstCAssets} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('FixedTestOnly');
const out=path.join(root,'artifacts/emulator/adapter-r197-v3');
if(fs.existsSync(out))throw Error('ExistingReport');
const {source,controller,adapter,elf}=firstCSource();
const harness=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/adapter-tests.lua'),'utf8');
const assets=firstCAssets();
let bundle='';
for(const [name,value] of [['RW4_CONTROLLER_SOURCE',controller],['RW4_ADAPTER_SOURCE',adapter],['RW4_MAIN_SOURCE',source]]){
  if(value.includes(']====]'))throw Error('DelimiterChanged');bundle+=name+' = [====[\n'+value+']====]\n';
}
bundle+=harness;
if(/\bos_real\.execute\s*\(/.test(harness)||Buffer.byteLength(bundle)>65536)throw Error('UnsafeHarness');
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});
const top='/tmp/rw4firstc-r197',base=top+'/365219996/lua';
const records=[];
function adb(args,label){
  const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
  fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');
  if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;
}
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');
for(const dir of [top,top+'/365219996',base])adb(['shell','mkdir',dir],'mkdir-owned');
for(const [name,bytes] of [['adapter-tests.lua',Buffer.from(bundle)],['minimal.elf',elf],['legend.png',assets.legend],['run.png',assets.run]]){
  const file=path.join(out,name);fs.writeFileSync(file,bytes,{flag:'wx'});
  adb(['push',file,base+'/'+name],'push-'+name);
  const readback=path.join(out,'readback-'+name);adb(['pull',base+'/'+name,readback],'readback-'+name);
  if(!fs.readFileSync(readback).equals(bytes))throw Error('GuestBytesChanged');
}
const result=adb(['shell','lua',base+'/adapter-tests.lua'],'run-production-lua-fake-exec');
if(!/RW4_ADAPTER_TESTS_OK 29\b/.test(result))throw Error('AdapterTestsFailed');
if(adb(['shell','lsmod'],'modules-after')!==before)throw Error('ModuleInventoryChanged');
for(const name of ['adapter-tests.lua','minimal.elf','legend.png','run.png'])adb(['shell','rm',base+'/'+name],'remove-'+name);
for(const dir of [base,top+'/365219996',top])adb(['shell','rmdir',dir],'rmdir-owned');
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',top],'absence-after')))throw Error('ScratchRemains');
const report={checkpoint:'R197',scenariosPassed:29,sourceSha256:sha256(Buffer.from(source)),controllerSha256:sha256(Buffer.from(controller)),
  adapterSha256:sha256(Buffer.from(adapter)),harnessSha256:sha256(Buffer.from(harness)),realOwnedTmpfsIo:true,
  shellLoadUnloadSimulated:true,widgetsSimulated:true,manualActivationVerified:true,moduleInventoryUnchanged:true,
  ownGuestFilesRemoved:true,nativeModuleExecuted:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
