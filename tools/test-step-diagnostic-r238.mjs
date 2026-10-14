// Diagnostic production Lua with real tmpfs, simulated UI/shell only.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,stepDiagnosticSource} from './step-diagnostic-source-r238.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorTestOnly');
const out=path.join(root,'artifacts/emulator/step-diag-r238'),top='/tmp/rw4stepdiag-tests-r238';if(fs.existsSync(out))throw Error('ExistingReport');
const {source,elfComparisonBytes:elf}=stepDiagnosticSource(),harness=fs.readFileSync(path.join(root,'experiments/native-step/diagnostic-tests-r238.lua'),'utf8');
if(source.includes(']====]')||/\breal_os\.execute\s*\(/.test(harness))throw Error('HarnessRefused');
const bundle='DIAG_SOURCE=[====[\n'+source+']====]\n'+harness;if(Buffer.byteLength(bundle)>65536)throw Error('HarnessLimit');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
if(!absent(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');adb(['shell','mkdir',top],'mkdir');
fs.writeFileSync(path.join(out,'test.lua'),bundle,{flag:'wx'});fs.writeFileSync(path.join(out,'candidate.elf'),elf,{flag:'wx'});
for(const n of ['test.lua','candidate.elf'])adb(['push',path.join(out,n),top+'/'+n],'push-'+n);
let output;
try{output=adb(['shell','lua',top+'/test.lua'],'production-diagnostic-simulated-shell-ui');}
finally{
 for(const n of ['diag-attempt-r238.txt','diag-capture-r238.txt','old-step.elf','old-step-attempt-r234.txt','old-step-inspect-r235.txt','test.lua','candidate.elf'])if(!absent(adb(['shell','ls',top+'/'+n],'scratch-'+n)))adb(['shell','rm',top+'/'+n],'remove-'+n);
 adb(['shell','rmdir',top],'rmdir');
}
if(adb(['shell','lsmod'],'modules-after')!==before||!absent(adb(['shell','ls',top],'absence-after')))throw Error('StateNotRestored');
if(!/RW4_STEP_DIAG_TESTS_OK 19\b/.test(output))throw Error('DiagnosticTestsFailed');
const report={checkpoint:'R238',scenariosPassed:19,sourceSha256:sha256(Buffer.from(source)),harnessSha256:sha256(Buffer.from(harness)),realOwnedTmpfsIo:true,widgetsAndShellSimulated:true,priorFilesReadOnly:true,nativeNodeOpened:false,moduleOperationRequested:false,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
