// One native+UI update. WAD remains in the existing carrier; no radio or upload.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,holdLauncher,holdId,holdAssets} from './doom-hold-source-r329.mjs';import {png} from './first-c-assets.mjs';import {verifyShareware} from './wad-data.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const build=path.join(root,'build/doom-image-hold-r329'),out=path.join(root,'build/doom-hold-r329/package');if(fs.existsSync(path.join(out,'review.json')))throw Error('ReviewedOutputExists');
const elf=fs.readFileSync(path.join(build,'doom.elf')),review=JSON.parse(fs.readFileSync(path.join(build,'review.json'))),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));verifyShareware(wad);
if(elf.length!==605796||sha256(elf)!=='de82634e961871d34b675b38dc4a715578ac0642ff93062eb6fa6f1ab2a3f6ce'||review.elfSha256!==sha256(elf)||review.newFirmwareBindings!==false||review.zoneMiB!==4||review.physicalDeploymentAuthorized!==false)throw Error('ElfReviewChanged');
const p=holdLauncher(elf,wad),tests=JSON.parse(fs.readFileSync(path.join(root,'artifacts/doom-hold-r329/ui-tests.json')));if(!tests.passed||tests.newCases!==4||tests.sourceSha256!==p.sourceSha256)throw Error('UntestedUi');
const assets=holdAssets();assets.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=155&&y<285&&(y-155)%26<16?[0,190,230]:[16,32,48]);
const records=[['main.lua',Buffer.from(p.source)],['doom.elf',elf],...Object.entries(assets).filter(([n])=>n!=='preview').map(([n,b])=>[n+'.png',b])];
const dir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(dir,'Compiler.exe');
if(fs.lstatSync(dir).isSymbolicLink()||fs.readdirSync(dir).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(dir,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview,{flag:'wx'});
fs.writeFileSync(path.join(out,'DoomHold.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomHold" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'DoomHold.fprj'),path.join(out,'output'),'DoomHold.face',holdId],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const bytes=fs.readFileSync(path.join(out,'output/DoomHold.face'));if(bytes.length>700000||bytes.readUInt32LE(0)!==0x1234a55a||bytes[5]!==0||bytes[49]!==0)throw Error('PackageLayout');bytes.write(holdId,40,9,'ascii');
const entries=records.map(([n,b])=>{const name=Buffer.from('lua/'+n),found=[];for(let at=bytes.indexOf(name);at>=0;at=bytes.indexOf(name,at+1)){if(at<20)continue;const word=bytes.readUInt32LE(at-20),size=word&0xffffff,length=word>>>24;if(size===b.length&&length===name.length&&bytes.subarray(at+length,at+length+size).equals(b))found.push(at+length);}if(found.length!==1)throw Error('ResourceMismatch');return{name:n,size:b.length,offset:found[0],sha256:sha256(b)};});
fs.writeFileSync(path.join(out,'DoomHold-id-only.face'),bytes,{flag:'wx'});
const result={checkpoint:'R329',id:holdId,size:bytes.length,sha256:sha256(bytes),sourceSha256:p.sourceSha256,elfSha256:review.elfSha256,entries,config:p.config,manualStartOnly:true,nativeExecutableIncluded:true,wadIncluded:false,frameFlashWrites:0,physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,entries:entries.length}));


