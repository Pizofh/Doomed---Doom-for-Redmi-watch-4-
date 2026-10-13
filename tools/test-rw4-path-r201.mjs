// Pure path and legacy-constructor tests in the owned S3 Lua CLI. No C/module/file IO from Lua.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedPathTestOnly');
const base=path.join(root,'experiments/hello-native-rw4');
const source=fs.readFileSync(path.join(base,'path-r201.lua'),'utf8');
const legacy=fs.readFileSync(path.join(base,'shell-adapter.lua'),'utf8');
const tests=fs.readFileSync(path.join(base,'path-tests-r201.lua'),'utf8');
const host=path.join(root,'artifacts/emulator/host-stdout.txt');
if(fs.statSync(host).size>16777216)throw Error('LogBound');
const log=fs.readFileSync(host,'utf8');
const matches=[...log.matchAll(/pmain: script path: (\/data\/app\/watchface\/market\/365219997\/\/lua\/)/g)];
if(!matches.length)throw Error('OwnedRuntimePathNotObserved');
const raw=matches.at(-1)[1];
let bundle='';
for(const [name,value] of [['RW4_PATH_SOURCE',source],['RW4_LEGACY_ADAPTER',legacy],['RW4_OBSERVED_PATH',raw]]){
 if(value.includes(']====]'))throw Error('DelimiterChanged');bundle+=name+' = [====['+value+']====]\n';
}
bundle+=tests;
const out=path.join(root,'artifacts/emulator/path-r201'),guest='/tmp/rw4-path-r201.lua';
if(fs.existsSync(out))throw Error('ExistingReport');
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){
 const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
 records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
 fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');
 if(r.error||r.status!==0)throw Error('OwnedGuestCommandFailed');return r.stdout+r.stderr;
}
const absent=text=>/^nsh: ls: stat failed: 2\r?$/m.test(text);
if(!absent(adb(['shell','ls',guest],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');
const local=path.join(out,'path-tests.lua');fs.writeFileSync(local,bundle,{flag:'wx'});
adb(['push',local,guest],'push-owned');
const rb=path.join(out,'readback.lua');adb(['pull',guest,rb],'readback');
if(fs.readFileSync(rb,'utf8')!==bundle)throw Error('ReadbackMismatch');
let result;try {result=adb(['shell','lua',guest],'run-pure-path-tests');}
finally {adb(['shell','rm',guest],'remove-owned');}
if(!absent(adb(['shell','ls',guest],'absence-after'))||adb(['shell','lsmod'],'modules-after')!==before)throw Error('GuestStateChanged');
if(!/RW4_PATH_TESTS_OK 16\b/.test(result))throw Error('PathTestsFailed');
const report={checkpoint:'R201',scenariosPassed:16,sourceSha256:sha256(Buffer.from(source)),
 observedScope:'S3-own-UiOnly-watchface',internalDoubleSeparatorObserved:true,
 legacyAdapterRejectsObservedSeparatorForm:true,normalizedConstructorAccepted:true,
 metacharactersTraversalForeignIdAndRelativePathsRejected:true,shellCalls:0,
 moduleInventoryUnchanged:true,ownGuestFileRemoved:true,physicalTransport:false,
 physicalRuntimePathVerified:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
