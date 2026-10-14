// Input-only watchface; reviewed compiler, no ADB/transport or native payload.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';import {heldAssets} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('FixedPackageOnly');
const out=path.join(root,'artifacts/held-r224');if(fs.existsSync(out))throw Error('ExistingPackage');
const source=fs.readFileSync(path.join(root,'experiments/lua-held/main-r223.lua')),test=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/held-lua-r223/summary.json'),'utf8'));
if(test.sourceSha256!==sha256(source)||test.scenariosPassed!==14||!test.moduleInventoryUnchanged||!test.ownGuestFileRemoved||/\b(?:io|os)\s*\.|insmod|rmmod|register_driver|RW4_NATIVE_BRIDGE/.test(source.toString()))throw Error('UntestedOrNativeSource');
const compilerDir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerDir,'Compiler.exe');
if(fs.lstatSync(compilerDir).isSymbolicLink()||fs.readdirSync(compilerDir).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(compilerDir,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
const assets=heldAssets(),records=[['main.lua',source],...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
const id='365219979',project='<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="HoldPad" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n';
fs.writeFileSync(path.join(out,'HoldPad.fprj'),project,{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'HoldPad.fprj'),path.join(out,'output'),'HoldPad.face',id],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2097152,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const bytes=fs.readFileSync(path.join(out,'output/HoldPad.face'));
if(bytes.length<168||bytes.length>30000||bytes.subarray(0,4).toString('hex')!=='5aa53412'||bytes[5]!==0||bytes[49]!==0)throw Error('PackageRefused');bytes.write(id,40,9,'ascii');
const entries=[];for(const [n,b]of records){const needle=Buffer.from('lua/'+n),p=bytes.indexOf(needle);if(p<20||bytes.indexOf(needle,p+needle.length)!==-1)throw Error('PathNotUnique');const word=bytes.readUInt32LE(p-20),size=word&0xffffff,nl=word>>>24,start=p+nl;if(nl!==needle.length||size!==b.length||!bytes.subarray(start,start+size).equals(b))throw Error('ReadbackMismatch');entries.push({name:n,size,sha256:sha256(b)});}
fs.writeFileSync(path.join(out,'HoldPad-id-only.face'),bytes,{flag:'wx'});
const report={checkpoint:'R224',id,size:bytes.length,sha256:sha256(bytes),sourceSha256:sha256(source),entries,serializedRecordsVerified:true,nativeCodeIncluded:false,shellIncluded:false,luaFilesystemWritesIncluded:false,globalNavigationSettingsModifiedByScript:false,physicalTransferEnabled:false,realLongpressVerified:false,bluetoothOperationRequested:false};fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
