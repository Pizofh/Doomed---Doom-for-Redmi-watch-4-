// Fixed packages, compiler without ADB. Emulator fixture contains NO ELF/shell.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,sha256,framesSource,frameId} from './frames-source-r219.mjs';
import {framesAssets} from './first-c-assets.mjs';
import {verifyFrame} from './frame-pattern-r218.mjs';
const mode=process.argv[2]??'rw4';
if(process.argv.length>3||!['rw4','emulator'].includes(mode))throw Error('FixedPackageOnly');
const work=path.join(root,'artifacts/frames-r220-'+mode);if(fs.existsSync(work))throw Error('ExistingPackage');
const parts=framesSource(),assets=framesAssets(),id=mode==='rw4'?frameId:'365219981',title=mode==='rw4'?'NativeFrames':'FramesUI';
const test=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/frames-lua-r219/summary.json'),'utf8'));
const native=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/frames-c-r218/summary.json'),'utf8'));
if(test.scenariosPassed!==24||test.sourceSha256!==sha256(Buffer.from(parts.source))||test.uiSha256!==sha256(Buffer.from(parts.ui))||!test.detachBeforeUnlinkVerified||!test.autoAndManualAndPauseExitVerified||!native.s3NativeModuleExecuted||native.rw4NativeModuleExecuted||native.sourceSha256!==sha256(fs.readFileSync(path.join(root,'experiments/hello-native-rw4/frames-r218.c'))))throw Error('UntestedSource');
let source=parts.source;
if(mode==='emulator')source=`local lvgl=require("lvgl")\nlocal ui=(function()\n${parts.ui}\nend)().new(lvgl,SCRIPT_PATH,function(s) print("RW4_FRAMES_UI: "..s) end)\nassert(ui.built)\nlocal paths={}\nfor i=0,3 do paths[i+1]=SCRIPT_PATH.."frame"..i.."-r218.png" end\nui.arm(function() print("RW4_FRAMES_UI: SimulatedStart");return {status="Complete",file_verified=true,marker_confirmed=true,load_observed=true,message_verified=true,unload_confirmed=true,paths=paths} end,function() print("RW4_FRAMES_UI: Detached");return true end)\nfunction pageOnPause() ui.pause() end\nui.retain();RW4_FRAMES_UI_LIFETIME=ui.lifetime\nprint("RW4_FRAMES_UI: Ready")\n`;
if(mode==='emulator'&&(/insmod|rmmod|os\.execute|elf_hex/.test(source)))throw Error('EmulatorNativeBackendRefused');
const records=[['main.lua',Buffer.from(source)],['legend.png',assets.legend],['run.png',assets.run],['exit.png',assets.exit]];
if(mode==='rw4')records.push(['frames.elf',parts.elf]);
else for(let i=0;i<4;i++)verifyFrame(fs.readFileSync(path.join(root,`artifacts/emulator/frames-c-r218/frame${i}-r218.png`)),i);
// The emulator fixture installs raw C images separately, like production C.
// This also avoids a >64KB resource package, unneeded for the UI-only test.
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const name of ['app/lua','images','output'])fs.mkdirSync(path.join(work,name),{recursive:true});
for(const [name,bytes] of records)fs.writeFileSync(path.join(work,'app/lua',name),bytes,{flag:'wx'});
fs.writeFileSync(path.join(work,'images/preview.png'),assets.preview,{flag:'wx'});
const project=`<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="${title}" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n`;
fs.writeFileSync(path.join(work,title+'.fprj'),project,{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(work,title+'.fprj'),path.join(work,'output'),title+'.face',id],{cwd:work,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2097152,env:{...process.env,TEMP:work,TMP:work,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(work,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const bytes=fs.readFileSync(path.join(work,'output',title+'.face'));
if(bytes.length<168||bytes.length>(mode==='rw4'?32064:131072)||bytes.subarray(0,4).toString('hex')!=='5aa53412'||bytes[5]!==0||bytes[49]!==0)throw Error('PackageRefused');
bytes.write(id,40,9,'ascii');
const entries=[];
for(const [name,value] of records){const needle=Buffer.from('lua/'+name),p=bytes.indexOf(needle);if(p<20||bytes.indexOf(needle,p+needle.length)!==-1)throw Error('PathNotUnique');const word=bytes.readUInt32LE(p-20),size=word&0xffffff,nl=word>>>24,start=p+nl;if(nl!==needle.length||size!==value.length||!bytes.subarray(start,start+size).equals(value))throw Error('ReadbackMismatch');entries.push({name,size,sha256:sha256(value),recordOffset:p-20,payloadOffset:start});}
fs.writeFileSync(path.join(work,title+'-id-only.face'),bytes,{flag:'wx'});
const report={checkpoint:'R220',mode,id,title,size:bytes.length,sha256:sha256(bytes),sourceSha256:sha256(Buffer.from(source)),uiSha256:sha256(Buffer.from(parts.ui)),elfSha256:mode==='rw4'?sha256(parts.elf):null,entries,serializedRecordsVerified:true,nativeCodeIncluded:mode==='rw4',nativeCallsIncluded:mode==='rw4',physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(work,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
