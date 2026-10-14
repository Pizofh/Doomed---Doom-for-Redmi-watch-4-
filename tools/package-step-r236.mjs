// Compile fixed StepC watchface offline. ELF is embedded once in main.lua;
// manual START materializes an absent own file, with byte-exact readback.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,rw4StepUiSource} from './step-ui-source-r236.mjs';import {stepAssets} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('FixedPackageOnly');
const out=path.join(root,'artifacts/step-r236-final');if(fs.existsSync(out))throw Error('ExistingPackage');
const parts=rw4StepUiSource(),source=Buffer.from(parts.source),assets=stepAssets();
const test=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/step-ui-r236-final/summary.json'),'utf8'));
if(test.uiScenariosPassed!==31||test.carrierScenariosPassed!==37||test.sourceSha256!==sha256(source)||test.adapterSha256!==sha256(Buffer.from(parts.adapter))||test.candidateElfSha256!==sha256(parts.elf)||!test.ownGuestFilesRemoved)throw Error('UntestedSource');
const records=[['main.lua',source],...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
const id='365219977',project='<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="StepC" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n';
fs.writeFileSync(path.join(out,'StepC.fprj'),project,{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'StepC.fprj'),path.join(out,'output'),'StepC.face',id],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const b=fs.readFileSync(path.join(out,'output/StepC.face'));
if(b.length>32064||b.length<168||b.subarray(0,4).toString('hex')!=='5aa53412'||b[5]!==0||b[49]!==0)throw Error('PackageLayoutOrBudget');b.write(id,40,9,'ascii');
const entries=[];for(const [n,bytes]of records){const name=Buffer.from('lua/'+n),p=b.indexOf(name);if(p<20||b.indexOf(name,p+name.length)!==-1)throw Error('PathNotUnique');const word=b.readUInt32LE(p-20),nl=word>>>24,size=word&0xffffff;if(nl!==name.length||size!==bytes.length||!b.subarray(p+nl,p+nl+size).equals(bytes))throw Error('ResourceMismatch');entries.push({name:n,size,sha256:sha256(bytes)});}
fs.writeFileSync(path.join(out,'StepC-id-only.face'),b,{flag:'wx'});
const report={checkpoint:'R236',id,size:b.length,sha256:sha256(b),sourceSha256:sha256(source),uiSha256:sha256(Buffer.from(parts.ui)),adapterSha256:sha256(Buffer.from(parts.adapter)),elfSha256:sha256(parts.elf),elfBytes:parts.elf.length,sourceBytes:source.length,entries,nativeCodeIncluded:true,separateElfResource:false,elfMaterializedOnlyOnManualStart:true,serializedResourcesVerified:true,physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
