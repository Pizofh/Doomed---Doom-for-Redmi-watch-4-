// SPDX-License-Identifier: GPL-2.0-only
// Fixed offline compiler invocation only. No ADB, BLE, target/auth, or upload path.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha,config,identitySource,identityAssets} from './touch-identity-r404.mjs';import {profile} from './touch-read-contract-r402.mjs';
assert.equal(process.argv.length,2,'NoArguments');
const source=Buffer.from(identitySource()),assets=identityAssets();
const reportDir=path.join(root,'artifacts/research/touch-id-r404-'+sha(source).slice(0,12));
const tests=JSON.parse(fs.readFileSync(path.join(reportDir,'tests.json')));
assert(tests.passed&&tests.cases===30&&tests.sourceSha256===sha(source)&&tests.persistentAttemptBeforeMemoryRead&&tests.reopenBlocked&&tests.manualStartOnly);
assert.equal(tests.assetsSha256,sha(Buffer.concat(assets.records.flatMap(([n,b])=>[Buffer.from(n),b]))));
const contract=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/rw4-touch-r402-contract-6ee7d73c4c90/review.json')));
assert.equal(contract.modelSha256,sha(fs.readFileSync(path.join(root,'tools/touch-read-contract-r402.mjs'))));
assert.equal(contract.imageSha256,profile.imageSha256);assert(contract.cases===38&&!contract.physicalTransport);
for(const [address] of profile.pins)assert.equal(parseInt(address,16)%4,0);
const out=path.join(root,'build/touch-id-r404/package');assert(!fs.existsSync(out),'ExistingPackage');
const compilerDir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerDir,'Compiler.exe');
assert(!fs.lstatSync(compilerDir).isSymbolicLink());
assert(fs.readdirSync(compilerDir).every(n=>['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)));
assert.equal(sha(fs.readFileSync(compiler)),'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a');
assert.equal(sha(fs.readFileSync(path.join(compilerDir,'DeviceInfo.db'))),'7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76');
const records=[['main.lua',source],...assets.records];
for(const dir of ['app/lua','images','output'])fs.mkdirSync(path.join(out,dir),{recursive:true});
for(const [name,b] of records)fs.writeFileSync(path.join(out,'app/lua',name),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
const project=path.join(out,'TouchID.fprj');
fs.writeFileSync(project,'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="TouchID" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const run=spawnSync(compiler,['-b',project,path.join(out,'output'),'TouchID.face',config.id],{
  cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,
  env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}
});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:run.status,stdout:run.stdout,stderr:run.stderr},null,2)+'\n',{flag:'wx'});
assert(!run.error&&run.status===0&&/No Errors/.test(run.stdout)&&/Watch:\s*RedmiWatch4/.test(run.stdout)&&/adb util is missing, skipping to upload/.test(run.stdout),'OfflineCompilerFailed');
const original=fs.readFileSync(path.join(out,'output/TouchID.face')),b=Buffer.from(original);
assert(b.length>=168&&b.length<65536&&b.readUInt32LE(0)===0x1234a55a&&b[5]===0&&b[49]===0);
assert(/^\d{9}$/.test(b.subarray(40,49).toString('ascii')));b.write(config.id,40,9,'ascii');
const entries=records.map(([name,data])=>{
  const n=Buffer.from('lua/'+name),found=[];
  for(let p=b.indexOf(n);p>=0;p=b.indexOf(n,p+1))if(p>=20){
    const word=b.readUInt32LE(p-20),length=word>>>24,size=word&0xffffff;
    if(length===n.length&&size===data.length&&b.subarray(p+length,p+length+size).equals(data))found.push(p+length);
  }
  assert.equal(found.length,1,'SerializedResource:'+name);return {name,size:data.length,offset:found[0],sha256:sha(data)};
});
const ordered=[...entries].sort((a,c)=>a.offset-c.offset);
for(let i=1;i<ordered.length;i++)assert(ordered[i-1].offset+ordered[i-1].size<=ordered[i].offset);
const file=path.join(out,'TouchID-id-only.face');fs.writeFileSync(file,b,{flag:'wx'});
const review={checkpoint:'R404',id:config.id,product:config.product,bytes:b.length,sha256:sha(b),sourceSha256:sha(source),
  entries,config,requiredFirmware:config.firmware,firmwareConfirmedCurrent:false,manualStartOnly:true,
  persistentSingleAttemptMarker:true,maxMemoryWords:9,newNativeExecutableIncluded:false,gameOrSaveDataIncluded:false,
  writesOwnCaptureAndMarker:true,updatesDriverOrPanelFirmware:false,physicalTransport:false,
  compilerAdbAvailable:false,deviceEmulatorUsed:false,uploadAuthorized:false,physicalReadAuthorized:false,
  physicalReadEnabledByManualButtonIfInstalled:true};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(review,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({...review,entries:entries.length,file:path.relative(root,file)}));
