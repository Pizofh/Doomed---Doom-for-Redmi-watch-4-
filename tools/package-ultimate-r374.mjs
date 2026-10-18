// SPDX-License-Identifier: GPL-2.0-only
// Private offline package. Contains the user's commercial IWAD; never release it.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {root,sha256,ultimateLauncher,ultimateAssets} from './doom-ultimate-r374.mjs';
import {ultimateProfile as p} from './doom-ultimate-source-r374.mjs';
const json=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const build=path.join(root,'build/doom-audio-r374/rw4'),out=path.join(root,'build/doom-audio-r374/package');
assert(!fs.existsSync(out),'refuse overwrite');
const review=json('build/doom-audio-r374/rw4/review.json'),elf=fs.readFileSync(path.join(build,'doom.elf'));
assert.equal(sha256(elf),review.elfSha256);assert(review.rw4Executable&&!review.physicalDeploymentAuthorized);
assert.deepEqual(review.ultimate.profile,p);
for(const field of ['sourceHashes','recoverySourceHashes','menuSourceHashes','startupSourceHashes'])
 for(const [file,hash]of Object.entries(review[field])){
  const source=field==='sourceHashes'?'doom/platform-rw4/audio/'+file:file;
  assert.equal(sha256(fs.readFileSync(path.join(root,source))),hash,source);
 }
const tested=json('build/doom-audio-r374/s3-model/test-result.json');
assert(tested.passed&&tested.twoCyclesJoinedAndUnloaded&&tested.originalMenuNewGame&&tested.loadDirectlyFromTitle);
assert(tested.cycles.every(c=>c.cachedSampleBytes===p.audioSampleBytes&&c.nonSilentBlocks>0&&!c.error));
assert(json('build/doom-audio-r374/s3-hold/test-result.json').passed);
assert(json('build/audio-startup-r372/result.json').passed);
const campaign=json('artifacts/research/ultimate-campaign-r374/result.json');
assert(campaign.passed&&campaign.maps.length===36);
const wad=fs.readFileSync(path.join(root,'tools/local/doom-ultimate/doom.wad'));
assert.equal(wad.length,p.wadBytes);assert.equal(sha256(wad),p.wadSha256);
const launcher=ultimateLauncher(elf,fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
assert.equal(json('build/doom-audio-r374/ui-result.json').exactProductionMain,launcher.sourceSha256);
const assets=ultimateAssets(),records=[['main.lua',Buffer.from(launcher.source)],['doom.elf',elf],['doom.wad',wad],
 ...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const compilerDir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerDir,'Compiler.exe');
assert(!fs.lstatSync(compilerDir).isSymbolicLink());
assert(fs.readdirSync(compilerDir).every(n=>['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)));
assert.equal(sha256(fs.readFileSync(compiler)),'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a');
assert.equal(sha256(fs.readFileSync(path.join(compilerDir,'DeviceInfo.db'))),'7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [name,bytes]of records)fs.writeFileSync(path.join(out,'app/lua',name),bytes,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
const project=path.join(out,p.product+'.fprj');
fs.writeFileSync(project,'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="'+p.product+'" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const r=spawnSync(compiler,['-b',project,path.join(out,'output'),p.product+'.face',p.id],{cwd:out,windowsHide:true,shell:false,
 encoding:'utf8',timeout:60000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2));
assert(!r.error&&r.status===0&&/No Errors/.test(r.stdout)&&/Watch:\s*RedmiWatch4/.test(r.stdout)&&/adb util is missing, skipping to upload/.test(r.stdout));
const bytes=fs.readFileSync(path.join(out,'output',p.product+'.face'));
assert(bytes.length>13000000&&bytes.length<13200000&&bytes.readUInt32LE(0)===0x1234a55a&&bytes[5]===0&&bytes[49]===0);
bytes.write(p.id,40,9,'ascii');
const entries=records.map(([name,b])=>{
 const n=Buffer.from('lua/'+name),found=[];
 for(let at=bytes.indexOf(n);at>=0;at=bytes.indexOf(n,at+1))if(at>=20){const w=bytes.readUInt32LE(at-20);
  if((w&0xffffff)===b.length&&(w>>>24)===n.length&&bytes.subarray(at+n.length,at+n.length+b.length).equals(b))found.push(at+n.length);}
 assert.equal(found.length,1,name);return {name,size:b.length,offset:found[0],sha256:sha256(b)};
});
fs.writeFileSync(path.join(out,p.product+'-id-only.face'),bytes,{flag:'wx'});
const result={checkpoint:'R374',id:p.id,size:bytes.length,sha256:sha256(bytes),elfSha256:sha256(elf),wadSha256:sha256(wad),sourceSha256:launcher.sourceSha256,
 config:launcher.config,entries,manualStartOnly:true,wadIncluded:true,privateCommercialData:true,physicalTransferEnabled:false,physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,entries:entries.length}));
