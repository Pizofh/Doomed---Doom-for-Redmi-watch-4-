// Fixed small Lua/images package. Never copies or executes ELF/WAD.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,framePngSource,framePngAssets} from './doom-frame-png-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const evidence=path.join(root,'artifacts/doom-frame-png-r301'),out=path.join(evidence,'package'),p=framePngSource(),tests=JSON.parse(fs.readFileSync(path.join(evidence,'ui-tests.json')));
if(!tests.passed||tests.sourceSha256!==p.sourceSha256||!tests.binDecoderBypassed||!tests.frameChecksumBeforeImage||!tests.immutablePngRetainedAfterExit)throw Error('UntestedSource');
const encoderTests=JSON.parse(fs.readFileSync(path.join(evidence,'tests.json')));
if(!encoderTests.passed||encoderTests.pixelsCompared!==64000||encoderTests.sourceSha256!==sha256(p.parts.png))throw Error('UntestedEncoder');
if(fs.existsSync(path.join(out,'review.json')))throw Error('AlreadyPackaged');
const assets=framePngAssets(),records=[['main.lua',Buffer.from(p.source)],...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const dir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(dir,'Compiler.exe');
if(fs.lstatSync(dir).isSymbolicLink()||fs.readdirSync(dir).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(dir,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
fs.writeFileSync(path.join(out,'DoomPNG.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomPNG" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'DoomPNG.fprj'),path.join(out,'output'),'DoomPNG.face',p.config.id],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const bytes=fs.readFileSync(path.join(out,'output/DoomPNG.face'));
if(bytes.length>32064||bytes.readUInt32LE(0)!==0x1234a55a||bytes[5]!==0||bytes[49]!==0)throw Error('PackageLayout');bytes.write(p.config.id,40,9,'ascii');
const entries=records.map(([n,b])=>{
 const name=Buffer.from('lua/'+n),found=[];
 for(let at=bytes.indexOf(name);at>=0;at=bytes.indexOf(name,at+1)){
  if(at<20)continue;const word=bytes.readUInt32LE(at-20),size=word&0xffffff,length=word>>>24;
  if(size===b.length&&length===name.length&&bytes.subarray(at+length,at+length+size).equals(b))found.push(at+length);
 }
 if(found.length!==1)throw Error('ResourceMismatch');return{name:n,size:b.length,offset:found[0],sha256:sha256(b)};
});
fs.writeFileSync(path.join(out,'DoomPNG-id-only.face'),bytes,{flag:'wx'});
const result={checkpoint:'R301',id:p.config.id,size:bytes.length,sha256:sha256(bytes),sourceSha256:p.sourceSha256,entries,config:p.config,manualStartOnly:true,frozenSingleFrame:true,persistentOneShotMarker:true,cooperativeExitSeconds:30,nativeExecutableIncluded:false,existingElfWillBeLoadedOnStart:true,physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,entries:entries.length}));
