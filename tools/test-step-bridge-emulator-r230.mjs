// Real Lua/io callbacks against our reviewed C node, owned S3 only.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {projectRoot as root,packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';import {sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedS3TestOnly');
const out=path.join(root,'artifacts/emulator/step-bridge-r230'),build=path.join(root,'build/native-step-bridge-r230-reviewed');if(fs.existsSync(out))throw Error('ExistingTest');
const review=JSON.parse(fs.readFileSync(path.join(build,'review.json'),'utf8')),elf=fs.readFileSync(path.join(build,'bridge.elf'));
if(review.elfSha256!=='89863182dabd4c8ce63c398c8734b98c4d1079c5dc68019bc68acecdc69f253c'||sha256(elf)!==review.elfSha256||review.sourceSha256!==sha256(fs.readFileSync(path.join(root,'experiments/native-step/bridge-s3-r230.c')))||review.coreSha256!==sha256(fs.readFileSync(path.join(root,'experiments/native-step/core-r229.h'))))throw Error('BuildChanged');
const exe=path.join(packageRoot,'platform-tools/adb.exe');if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7')throw Error('AdbChanged');
guardEmulator();fs.mkdirSync(out,{recursive:true});const logs=[];
function adb(args){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536});logs.push({args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'commands.json'),JSON.stringify(logs,null,2)+'\n');if(r.error||r.status!==0)throw Error('TestFailedInspectGuest');return r.stdout+r.stderr;}
const initial=adb(['shell','lsmod']);if(!/^\s*NAME\s+INIT\s+UNINIT\s+ARG\s+NEXPORTS\s+TEXT\s+SIZE\s+DATA\s+SIZE\s*$/.test(initial))throw Error('RegistryNotEmpty');
const files=[['/tmp/rw4step230.elf',path.join(build,'bridge.elf')],['/tmp/rw4step230-client.lua',path.join(root,'experiments/native-step/client-s3-r230.lua')],['/tmp/rw4step230-tests.lua',path.join(root,'experiments/native-step/bridge-tests-r230.lua')]];
for(const p of ['/dev/rw4step230','/tmp/rw4step230-inspect.txt',...files.map(f=>f[0])])if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',p])))throw Error('GuestCollision');
for(const [guest,host]of files)adb(['push',host,guest]);
adb(['pull','/tmp/rw4step230.elf',path.join(out,'elf-readback.bin')]);if(!fs.readFileSync(path.join(out,'elf-readback.bin')).equals(elf))throw Error('ReadbackMismatch');
const reply=adb(['shell','lua','/tmp/rw4step230-tests.lua']);
if(!/RW4_STEP_BRIDGE_TESTS_OK 34/.test(reply)||!reply.includes('Unregister 0 refs=0 held=0')||!reply.includes('Stopped CLI'))throw Error('AssertionsIncomplete');
if(adb(['shell','lsmod'])!==initial||!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls','/dev/rw4step230'])))throw Error('UnregisterUnverified');
for(const [guest]of files){adb(['shell','rm',guest]);if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls',guest])))throw Error('FileCleanupUnverified');}
if(!/^nsh: ls: stat failed: 2\r?$/m.test(adb(['shell','ls','/tmp/rw4step230-inspect.txt'])))throw Error('CaptureRemained');
const report={checkpoint:'R230',assertionsPassed:34,scope:'real C/Lua/io in S3; no UI or RW4',elfSha256:review.elfSha256,elfBytes:elf.length,clientSha256:sha256(fs.readFileSync(files[1][1])),testSha256:sha256(fs.readFileSync(files[2][1])),heldMasksAndStepsAndPauseResumeVerified:true,invalidWriteNeutralizedAndPaused:true,unloadWhileActiveRejected:true,nativeNodeRemoved:true,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,physicalWatchUsed:false,bluetoothOperationRequested:false};fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
