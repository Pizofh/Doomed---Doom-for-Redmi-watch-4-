// Offline package. Compiler is isolated from adb; no device/radio operation.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
import {root,sha256,wideLauncher as directLauncher,wideAssets as directAssets,wideId as directId} from './doom-wide-r347.mjs';import {verifyShareware} from './wad-data.mjs';
if(process.argv.length!==2)throw Error('FixedPackageOnly');
const build=path.join(root,'build/doom-wide-r347/rw4'),out=path.join(root,'build/doom-wide-r347/package');assert(!fs.existsSync(out),'OutputExists');
const elf=fs.readFileSync(path.join(build,'doom.elf')),review=JSON.parse(fs.readFileSync(path.join(build,'review.json'))),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));verifyShareware(wad);
assert.equal(review.elfSha256,sha256(elf));assert.equal(elf.length,607116);assert.equal(review.extraStaticBytes,242);assert.equal(sha256(elf),'408caa1de2e6f6c697012be26b0a43645fd502e88b5259d932acff9b6d4a8275');assert.equal(review.pngCodec,false);assert.equal(review.physicalDeploymentAuthorized,false);
const p=directLauncher(elf,wad),ui=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/wide-launcher-r347/result.json')));
assert(ui.passed&&ui.cases===9&&ui.sourceSha256===p.sourceSha256);
for(const mode of ['s3-model','s3-ui']){
 const r=JSON.parse(fs.readFileSync(path.join(root,'build/doom-direct-r343',mode,'review.json')));
 for(const name of ['doom/platform-rw4/device/direct-transport-r343.c','doom/platform-rw4/device/direct-view-r342.c'])assert.equal(r.sourceHashes[name],sha256(fs.readFileSync(path.join(root,name))));
}
const engine=JSON.parse(fs.readFileSync(path.join(root,'build/doom-direct-r343/s3-model/test-result.json'))),visible=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/doom-direct-ui-r343-stage/test-result.json'))),clean=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/doom-direct-ui-r343-stage/cleanup.json')));
assert(engine.passed&&engine.rejectedCommandsPerCycle===6&&engine.stopRealJoinDirectCloseUnload&&engine.cycles.length===2);
assert(visible.passed&&visible.realS3Ui&&visible.cycles.length===2&&visible.cycles.every(c=>c.exactPixels&&c.allocated===c.freed));assert(clean.restored&&clean.moduleAndNodeAbsent);
const touchUi=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/wide-ui-r347/result.json'))),touchClean=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/wide-ui-r347/cleanup.json')));assert(touchUi.passed&&touchUi.exactProductionMain&&touchUi.productionSourceSha256===p.sourceSha256&&touchClean.restored&&touchClean.moduleAndNodeAbsent);
const assets=directAssets(),records=[['main.lua',Buffer.from(p.source)],['doom.elf',elf],...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const dir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(dir,'Compiler.exe');
assert(!fs.lstatSync(dir).isSymbolicLink());assert(fs.readdirSync(dir).every(n=>['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)));
assert.equal(sha256(fs.readFileSync(compiler)),'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a');assert.equal(sha256(fs.readFileSync(path.join(dir,'DeviceInfo.db'))),'7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});for(const[n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
fs.writeFileSync(path.join(out,'DoomWide.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomWide" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'DoomWide.fprj'),path.join(out,'output'),'DoomWide.face',directId],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2));
assert(!r.error&&r.status===0&&/No Errors/.test(r.stdout)&&/Watch:\s*RedmiWatch4/.test(r.stdout)&&/adb util is missing, skipping to upload/.test(r.stdout),'Compiler');
const bytes=fs.readFileSync(path.join(out,'output/DoomWide.face'));assert(bytes.length<700000&&bytes.readUInt32LE(0)===0x1234a55a&&bytes[5]===0&&bytes[49]===0);bytes.write(directId,40,9,'ascii');
const entries=records.map(([n,b])=>{const name=Buffer.from('lua/'+n),found=[];for(let at=bytes.indexOf(name);at>=0;at=bytes.indexOf(name,at+1)){if(at<20)continue;const word=bytes.readUInt32LE(at-20);if((word&0xffffff)===b.length&&(word>>>24)===name.length&&bytes.subarray(at+name.length,at+name.length+b.length).equals(b))found.push(at+name.length);}assert.equal(found.length,1,'Resource '+n);return{name:n,size:b.length,offset:found[0],sha256:sha256(b)};});
fs.writeFileSync(path.join(out,'DoomWide-id-only.face'),bytes,{flag:'wx'});
const result={checkpoint:'R347',id:directId,size:bytes.length,sha256:sha256(bytes),sourceSha256:p.sourceSha256,elfSha256:review.elfSha256,entries,config:p.config,manualStartOnly:true,nativeExecutableIncluded:true,wadIncluded:false,pngFrameCodec:false,physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,entries:entries.length}));
