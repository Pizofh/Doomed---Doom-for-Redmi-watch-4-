// SPDX-License-Identifier: GPL-2.0-only
// Private package containing the user's IWAD. Never upload this to a release.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256,doom2Launcher,doom2Assets} from './doom2-r384.mjs';import {doom2Profile as p,doom2PackedConfig} from './doom2-source-r384.mjs';
const json=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
assert.equal(process.argv.length,2);const build=path.join(root,'build/doom-audio-r384/rw4'),out=path.join(root,'build/doom2-r384/package');assert(!fs.existsSync(out));
const r=json('build/doom-audio-r384/rw4/review.json'),elf=fs.readFileSync(path.join(build,'doom.elf'));assert.equal(sha256(elf),r.elfSha256);
assert(r.rw4Executable&&!r.physicalDeploymentAuthorized);assert.deepEqual(r.doom2.profile,p);
assert.equal(r.doom2.sourceSha256,sha256(fs.readFileSync(path.join(root,'tools/doom2-source-r384.mjs'))));
const packed=doom2PackedConfig('rw4');assert.deepEqual(r.packed, {...packed,readerSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/packed/reader-r378.c'))),runtimeSha256:sha256(fs.readFileSync(path.join(build,'runtime.c')))});
for(const field of ['sourceHashes','recoverySourceHashes','menuSourceHashes','startupSourceHashes'])for(const [f,h]of Object.entries(r[field]))
 assert.equal(sha256(fs.readFileSync(path.join(root,field==='sourceHashes'?'doom/platform-rw4/audio/'+f:f))),h);
for(const [n,h]of Object.entries(r.generatedHashes))assert.equal(sha256(fs.readFileSync(path.join(build,n==='menu'?'m_menu.c':n+'.c'))),h);
function alloc(b){const offset=b.readUInt32LE(32),size=b.readUInt16LE(46),count=b.readUInt16LE(48);let n=0;for(let i=0;i<count;i++){const at=offset+i*size;if(b.readUInt32LE(at+8)&2)n+=b.readUInt32LE(at+20);}return n;}
const prior=alloc(fs.readFileSync(path.join(root,'build/doom-audio-r378/rw4/doom.elf'))),current=alloc(elf);assert(current<=prior,'Do not retain the old RAM guard for a larger static allocation');
const campaign=json('artifacts/research/doom2-campaign-r384/result.json');assert(campaign.passed&&campaign.maps.length===32&&campaign.allMapsStartSaveLoad);
const tested=json('build/doom-audio-r384/s3-model/test-result.json');assert(tested.passed&&tested.twoCyclesJoinedAndUnloaded&&tested.originalMenuNewGame&&tested.loadDirectlyFromTitle);
assert(tested.cycles.every(c=>c.cachedSampleBytes===p.audioSampleBytes&&c.nonSilentBlocks>0&&!c.error));
assert(json('build/doom-audio-r384/s3-hold/test-result.json').passed);assert(json('build/audio-startup-r384/result.json').passed);
const launcher=doom2Launcher(),ui=json('build/doom2-r384/test-result.json');assert(ui.passed&&ui.exactSource===launcher.sourceSha256);
const assets=doom2Assets(),records=[['main.lua',Buffer.from(launcher.source)],['doom.elf',elf],['doom2-r384.wad',fs.readFileSync(path.join(root,'build/doom2-r384/doom.rwc'))],
 ...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const compilerDir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerDir,'Compiler.exe');
assert(!fs.lstatSync(compilerDir).isSymbolicLink());assert(fs.readdirSync(compilerDir).every(n=>['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)));
assert.equal(sha256(fs.readFileSync(compiler)),'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a');
assert.equal(sha256(fs.readFileSync(path.join(compilerDir,'DeviceInfo.db'))),'7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
const project=path.join(out,'DoomII.fprj');fs.writeFileSync(project,'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomII" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const compiled=spawnSync(compiler,['-b',project,path.join(out,'output'),'DoomII.face',p.id],{cwd:out,windowsHide:true,shell:false,encoding:'utf8',timeout:60000,maxBuffer:1048576,
 env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:compiled.status,stdout:compiled.stdout,stderr:compiled.stderr},null,2));
assert(!compiled.error&&compiled.status===0&&/No Errors/.test(compiled.stdout)&&/Watch:\s*RedmiWatch4/.test(compiled.stdout)&&/adb util is missing, skipping to upload/.test(compiled.stdout));
const b=fs.readFileSync(path.join(out,'output/DoomII.face'));assert(b.length>7100000&&b.length<7400000&&b.readUInt32LE(0)===0x1234a55a&&b[5]===0&&b[49]===0);b.write(p.id,40,9,'ascii');
const entries=records.map(([name,data])=>{const n=Buffer.from('lua/'+name),found=[];for(let at=b.indexOf(n);at>=0;at=b.indexOf(n,at+1))if(at>=20){const w=b.readUInt32LE(at-20);if((w&0xffffff)===data.length&&(w>>>24)===n.length&&b.subarray(at+n.length,at+n.length+data.length).equals(data))found.push(at+n.length);}
 assert.equal(found.length,1,name);return{name,size:data.length,offset:found[0],sha256:sha256(data)};});
fs.writeFileSync(path.join(out,'DoomII-id-only.face'),b,{flag:'wx'});
const result={checkpoint:'R384',id:p.id,size:b.length,sha256:sha256(b),elfSha256:sha256(elf),sourceSha256:launcher.sourceSha256,config:launcher.config,entries,
 originalWadSha256:p.wadSha256,packedWadSha256:packed.p.packedSha256,manualStartOnly:true,wadIncluded:true,privateCommercialData:true,
 staticAllocBytes:current,previousStaticAllocBytes:prior,ramGuardUnchanged:true,physicalTransferEnabled:false,physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,entries:entries.length}));
