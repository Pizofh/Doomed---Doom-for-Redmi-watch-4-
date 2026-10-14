// Lua carrier, PNGs and no ELF. Calling resident C still requires physical review.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,stateReadSource} from './state-match-source-r261.mjs';import {stateReadAssets} from './state-match-assets-r261.mjs';
if(process.argv.length!==2)throw Error('FixedPackageOnly');
const out=path.join(root,'artifacts/state-match-r261');if(fs.existsSync(out))throw Error('ExistingPackage');
const source=Buffer.from(stateReadSource().source),assets=stateReadAssets();
const test=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/state-match-r261-verified/summary.json'),'utf8'));
if(test.scenariosPassed!==51||test.sourceSha256!==sha256(source)||!test.noNativeNodeWrites||!test.singleAttemptGuardTested||!test.postRegistryCompared||!test.moduleInventoryUnchanged||!test.ownGuestFilesRemoved)throw Error('UntestedSource');
const records=[['main.lua',source],...assets.records];
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
const id='365219966',project='<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="StateMatch" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n';
fs.writeFileSync(path.join(out,'StateMatch.fprj'),project,{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'StateMatch.fprj'),path.join(out,'output'),'StateMatch.face',id],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const b=fs.readFileSync(path.join(out,'output/StateMatch.face'));if(b.length<168||b.length>32064||b.subarray(0,4).toString('hex')!=='5aa53412'||b[5]!==0||b[49]!==0)throw Error('PackageLayout');b.write(id,40,9,'ascii');
const entries=[];for(const [n,value]of records){const name=Buffer.from('lua/'+n),p=b.indexOf(name);if(p<20||b.indexOf(name,p+name.length)!==-1)throw Error('PathNotUnique');const word=b.readUInt32LE(p-20),nl=word>>>24,size=word&0xffffff;if(nl!==name.length||size!==value.length||!b.subarray(p+nl,p+nl+size).equals(value))throw Error('ReadbackMismatch');entries.push({name:n,size,sha256:sha256(value)});}
fs.writeFileSync(path.join(out,'StateMatch-id-only.face'),b,{flag:'wx'});
const report={checkpoint:'R261',id,size:b.length,sha256:sha256(b),sourceSha256:sha256(source),entries,serializedResourcesVerified:true,nativeExecutableIncluded:false,residentNativeCallbacksRequested:true,nativeNodeWritesRequested:false,moduleLoadUnloadRequested:false,shellRequested:false,oldFilesModified:false,physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...report,entries:entries.length}));
