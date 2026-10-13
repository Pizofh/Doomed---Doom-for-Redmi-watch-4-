// Source-level UI fault handling, fake widgets only, in the owned S3 Lua CLI.
// No ELF, native execution, watchface install, physical transport or screenshot.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedUiTestOnly');
const hash=b=>createHash('sha256').update(b).digest('hex');
const source=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/ui-r199.lua'),'utf8');
const tests=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/ui-tests-r199.lua'),'utf8');
if(source.includes(']====]')||/\b(?:io|os)\s*\.|\bload\s*\(/.test(source.replace(/^--.*$/gm,'')))throw Error('UiMustHaveNoExecutionBackend');
const bundle=Buffer.from('RW4_UI_SOURCE = [====[\n'+source+']====]\n'+tests);
if(bundle.length>32768)throw Error('BoundExceeded');
const exe=path.join(packageRoot,'platform-tools/adb.exe');
if(hash(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
const out=path.join(root,'artifacts/emulator/ui-r199'),guest='/tmp/rw4-ui-only-r199.lua';
if(fs.existsSync(out))throw Error('ExistingReport');
guardEmulator();fs.mkdirSync(out,{recursive:true});
const records=[];
function adb(args,label){
  const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
  fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');
  if(r.error||r.status!==0)throw Error('OwnedEmulatorCommandFailed');return r.stdout+r.stderr;
}
const absent=text=>/^nsh: ls: stat failed: 2\r?$/m.test(text);
if(!absent(adb(['shell','ls',guest],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');
const local=path.join(out,'ui-tests.lua');fs.writeFileSync(local,bundle,{flag:'wx'});
adb(['push',local,guest],'push-owned-lua');
const rb=path.join(out,'readback.lua');adb(['pull',guest,rb],'readback');
if(!fs.readFileSync(rb).equals(bundle))throw Error('ReadbackMismatch');
let result;
try { result=adb(['shell','lua',guest],'run-fake-widgets'); }
finally { adb(['shell','rm',guest],'remove-owned-lua'); }
if(!absent(adb(['shell','ls',guest],'absence-after')))throw Error('GuestScratchRemains');
if(adb(['shell','lsmod'],'modules-after')!==before)throw Error('ModuleInventoryChanged');
if(!/RW4_UI_ONLY_TESTS_OK 6\b/.test(result))throw Error('UiTestsFailed');
const report={checkpoint:'R199',scenariosPassed:6,sourceSha256:hash(Buffer.from(source)),
  harnessSha256:hash(Buffer.from(tests)),widgetsSimulated:true,realLvglRenderVerified:false,
  nativeExecutionBackendIncluded:false,moduleInventoryUnchanged:true,ownGuestFileRemoved:true,
  physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
