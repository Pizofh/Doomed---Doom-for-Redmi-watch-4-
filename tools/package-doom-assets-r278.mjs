// Offline carrier feasibility only: no installer, ADB, radio or native launcher.
// The ignored result contains shareware data; never upload as a CI artifact.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';import {verifyShareware} from './wad-data.mjs';
import {stepAssets} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('FixedOfflinePackageOnly');
const out=path.join(root,'build/doom-assets-r278');if(fs.existsSync(out))throw Error('OutputExists');
const elf=fs.readFileSync(path.join(root,'build/doom-rw4-bindings/doom-rw4-candidate.elf')),prior=JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-bindings/review.json')));
if(sha256(elf)!==prior.elfSha256||prior.physicalDeploymentAuthorized!==false||prior.wadPathAssigned!==false||!elf.includes(Buffer.from('/not-installed/rw4-doom/doom1.wad')))throw Error('CandidateChanged');
const wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));verifyShareware(wad);
const analysis=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/deployment-r278-resolved/review.json')));
if(analysis.candidateSha256!==sha256(elf)||analysis.firmwareExecuted!==false||analysis.physicalTransport!==false)throw Error('ReviewChanged');
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
// Deliberately no io/os.execute/Timer/native calls, and no embedded hex assets.
const source=Buffer.from("local lvgl=require('lvgl')\nlocal root=lvgl.Object(nil,{w=390,h=450,bg_color=0x102030,bg_opa=lvgl.OPA(100),border_width=0})\nlvgl.Object(root,{x=45,y=100,w=300,h=180,bg_color=0x00a080,bg_opa=lvgl.OPA(100),border_width=0})\n");
const entries=[['main.lua',source],['doom.elf',elf],['doom1.wad',wad]];
for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});
for(const [n,b]of entries)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'images/preview.png'),stepAssets().preview,{flag:'wx'});
const id='365219963';
fs.writeFileSync(path.join(out,'DoomAssets.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomAssets" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n',{flag:'wx'});
const r=spawnSync(compiler,['-b',path.join(out,'DoomAssets.fprj'),path.join(out,'output'),'DoomAssets.face',id],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const b=fs.readFileSync(path.join(out,'output/DoomAssets.face'));if(b.length<elf.length+wad.length||b.length>8*1024*1024||b.readUInt32LE(0)!==0x1234a55a||b[5]!==0)throw Error('PackageLayout');
const records=entries.map(([name,original])=>{const n=Buffer.from('lua/'+name),p=b.indexOf(n);if(p<20||b.indexOf(n,p+n.length)!==-1)throw Error('RecordNotUnique');const word=b.readUInt32LE(p-20),size=word&0xffffff,nameBytes=word>>>24,start=p+nameBytes;if(nameBytes!==n.length||size!==original.length||start+size>b.length||!b.subarray(start,start+size).equals(original))throw Error('RecordMismatch');return {name:'lua/'+name,size,offset:start,sha256:sha256(original)};});
const report={checkpoint:'R278',idProposed:id,bytes:b.length,sha256:sha256(b),records,serializedPayloadsVerified:true,nativeLauncherIncluded:false,wadPathAssigned:false,extractedByPhysicalFirmware:false,
 proposedPaths:{elf:'/data/app/watchface/market/'+id+'/lua/doom.elf',wad:'/data/app/watchface/market/'+id+'/lua/doom1.wad'},
 memory:analysis.memory,default2048ByteParts:Math.ceil((b.length+26)/2044),currentInstallerMaxParts:64,currentInstallerTxBudgetBytes:32768,
 deploymentReady:false,blockers:['bounded large-file transport and resume unimplemented','production launcher and assigned WAD path pending','physical free heap and largest block unknown','runtime extraction of these resources not tested'],
 physicalTransferEnabled:false,physicalWatchUsed:false,compilerAdbAvailable:false,redistributionAuthorized:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
