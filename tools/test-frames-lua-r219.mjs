import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,sha256,framesSource} from './frames-source-r219.mjs';
import {packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {verifyFrame} from './frame-pattern-r218.mjs';
if(process.argv.length!==2)throw Error('FixedEmulatorTestOnly');
const out=path.join(root,'artifacts/emulator/frames-lua-r219'),top='/tmp/rw4frames-tests-r219';
if(fs.existsSync(out))throw Error('ExistingReport');
const {source,controller,adapter,ui,elf}=framesSource(),harness=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/frames-tests-r219.lua'),'utf8');
let bundle='FRAME_ELF_BASE64="'+elf.toString('base64')+'"\n';for(const [name,text] of [['FRAME_MAIN_SOURCE',source],['FRAME_CONTROLLER_SOURCE',controller],['FRAME_ADAPTER_SOURCE',adapter]]){if(text.includes(']====]'))throw Error('Delimiter');bundle+=name+'=[====[\n'+text+']====]\n';}bundle+=harness;
if(/\breal_os\.execute\s*\(/.test(harness)||Buffer.byteLength(bundle)>65536)throw Error('HarnessRefused');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const records=[];
function adb(args,label){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});records.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(records,null,2)+'\n');if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
const absent=t=>/^nsh: ls: stat failed: 2\r?$/m.test(t);
if(!absent(adb(['shell','ls',top],'absence')))throw Error('GuestCollision');
const before=adb(['shell','lsmod'],'modules-before');adb(['shell','mkdir',top],'mkdir');
const names=['test.lua','frames.elf'];fs.writeFileSync(path.join(out,'test.lua'),bundle,{flag:'wx'});fs.writeFileSync(path.join(out,'frames.elf'),elf,{flag:'wx'});
for(let i=0;i<4;i++){const name='reference'+i+'.png',bytes=fs.readFileSync(path.join(root,`artifacts/emulator/frames-c-r218/frame${i}-r218.png`));verifyFrame(bytes,i);fs.writeFileSync(path.join(out,name),bytes,{flag:'wx'});names.push(name);}
for(const name of names)adb(['push',path.join(out,name),top+'/'+name],'push-'+name);
let output;
try{output=adb(['shell','lua',top+'/test.lua'],'production-lua-mocked-exec-ui');}
finally{
 for(const name of ['frames-attempt-r218.txt','frames-inspect-r218.txt',...Array.from({length:4},(_,i)=>`frame${i}-r218.png`)])if(!absent(adb(['shell','ls',top+'/'+name],'scratch-'+name)))adb(['shell','rm',top+'/'+name],'remove-scratch-'+name);
 for(const name of names)adb(['shell','rm',top+'/'+name],'remove-'+name);
 adb(['shell','rmdir',top],'rmdir');
}
if(adb(['shell','lsmod'],'modules-after')!==before||!absent(adb(['shell','ls',top],'absence-after')))throw Error('StateNotRestored');
if(!/RW4_FRAME_TESTS_OK 24\b/.test(output))throw Error('FrameLuaTestsFailed');
const report={checkpoint:'R219',scenariosPassed:24,sourceSha256:sha256(Buffer.from(source)),uiSha256:sha256(Buffer.from(ui)),adapterSha256:sha256(Buffer.from(adapter)),controllerSha256:sha256(Buffer.from(controller)),harnessSha256:sha256(Buffer.from(harness)),realOwnedTmpfsIo:true,shellSimulated:true,widgetsAndTimerSimulated:true,manualStartAndSingleAttemptVerified:true,autoAndManualAndPauseExitVerified:true,detachBeforeUnlinkVerified:true,moduleInventoryUnchanged:true,ownTmpfsFilesRemoved:true,rw4NativeExecuted:false,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
