// SPDX-License-Identifier: GPL-2.0-only
// Offline only: compiler has no adb and receives no connection credentials.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {soundLauncher,soundAssets,soundId,root,sha256} from './doom-sound-r365.mjs';
import {verifyShareware} from './wad-data.mjs';
assert.equal(process.argv.length,2);
const build=path.join(root,'build/doom-audio-r365/rw4'),out=path.join(root,'build/doom-audio-r365/package');
assert(!fs.existsSync(out));
const review=JSON.parse(fs.readFileSync(path.join(build,'review.json'),'utf8')),elf=fs.readFileSync(path.join(build,'doom.elf'));
assert.equal(sha256(elf),review.elfSha256);assert.equal(review.zoneMiB,3);assert(review.rw4Executable&&!review.physicalDeploymentAuthorized);
for(const [p,h]of Object.entries(review.sourceHashes))assert.equal(sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/audio',p))),h);
const tested=JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r365/s3-model/test-result.json'),'utf8'));
assert(tested.passed&&tested.twoCyclesJoinedAndUnloaded&&tested.cycles.every(c=>c.cachedSampleBytes===532927&&c.nonSilentBlocks>0&&!c.error));
assert(JSON.parse(fs.readFileSync(path.join(root,'build/audio-media-r364/result.json'),'utf8')).passed);
const campaign=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/audio-campaign-r365/result.json'),'utf8'));
assert(campaign.passed&&campaign.maps.length===9&&campaign.maps.every(m=>m.allocated===m.freed));
const wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));verifyShareware(wad);
const p=soundLauncher(elf,wad),assets=soundAssets();
const records=[['main.lua',Buffer.from(p.source)],['doom.elf',elf],...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const compilerDir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerDir,'Compiler.exe');
assert(!fs.lstatSync(compilerDir).isSymbolicLink());assert(fs.readdirSync(compilerDir).every(n=>['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)));
assert.equal(sha256(fs.readFileSync(compiler)),'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a');
assert.equal(sha256(fs.readFileSync(path.join(compilerDir,'DeviceInfo.db'))),'7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [name,bytes]of records)fs.writeFileSync(path.join(out,'app/lua',name),bytes,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
fs.writeFileSync(path.join(out,'DoomSound.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomSound" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'DoomSound.fprj'),path.join(out,'output'),'DoomSound.face',soundId],
 {cwd:out,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2));
assert(!r.error&&r.status===0&&/No Errors/.test(r.stdout)&&/Watch:\s*RedmiWatch4/.test(r.stdout)&&/adb util is missing, skipping to upload/.test(r.stdout));
const bytes=fs.readFileSync(path.join(out,'output/DoomSound.face'));
assert(bytes.length<720000&&bytes.readUInt32LE(0)===0x1234a55a&&bytes[5]===0&&bytes[49]===0);bytes.write(soundId,40,9,'ascii');
const entries=records.map(([n,b])=>{const name=Buffer.from('lua/'+n),found=[];
 for(let at=bytes.indexOf(name);at>=0;at=bytes.indexOf(name,at+1))if(at>=20){const word=bytes.readUInt32LE(at-20);
  if((word&0xffffff)===b.length&&(word>>>24)===name.length&&bytes.subarray(at+name.length,at+name.length+b.length).equals(b))found.push(at+name.length);}
 assert.equal(found.length,1,n);return {name:n,size:b.length,offset:found[0],sha256:sha256(b)};});
fs.writeFileSync(path.join(out,'DoomSound-id-only.face'),bytes,{flag:'wx'});
const result={checkpoint:'R365',id:soundId,size:bytes.length,sha256:sha256(bytes),elfSha256:sha256(elf),sourceSha256:p.sourceSha256,entries,config:p.config,
 manualStartOnly:true,nativeExecutableIncluded:true,wadIncluded:false,physicalTransferEnabled:false,physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,entries:entries.length}));
