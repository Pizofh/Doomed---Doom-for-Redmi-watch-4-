// Offline reviewed compiler only. Outputs with WAD/ELF stay ignored/private.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256,launcherSource} from './doom-launcher-source.mjs';
import {launcherAssets} from './doom-launcher-assets.mjs';import {verifyShareware} from './wad-data.mjs';
const lowMemory=process.argv[2]==='rw4-low-memory',target=lowMemory?'rw4':process.argv[2];
if(process.argv.length!==3||!['rw4','s3'].includes(target))throw Error('Expected rw4|s3|rw4-low-memory');
const out=lowMemory?path.join(root,'build/doom-low-memory-rw4-r285'):path.join(root,'build/doom-launcher-r282',target),review=JSON.parse(fs.readFileSync(path.join(out,'review.json')));
if(lowMemory&&(review.checkpoint!=='R285'||review.zoneMiB!==4||review.nativeLoadEnabled!==false))throw Error('LowMemoryReviewMismatch');
const elf=fs.readFileSync(path.join(out,'doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));verifyShareware(wad);
if(review.target!==target||review.elfSha256!==sha256(elf)||!review.wadPathAssigned||review.physicalDeploymentAuthorized!==false)throw Error('ReviewMismatch');
const {source,config}=launcherSource(target,elf,wad),assets=launcherAssets();
if(config.base+'doom1.wad'!==review.wadPath||config.allow_native!==(target==='s3'))throw Error('TargetMismatch');
const entries=[['main.lua',Buffer.from(source)],['doom.elf',elf],['doom1.wad',wad],...Object.entries(assets).filter(([name])=>name!=='preview').map(([name,b])=>[name+'.png',b])];
for(const directory of ['app/lua','images','output'])fs.mkdirSync(path.join(out,directory),{recursive:true});
for(const [name,b]of entries)fs.writeFileSync(path.join(out,'app/lua',name),b);
fs.writeFileSync(path.join(out,'images/preview.png'),assets.preview);
fs.writeFileSync(path.join(out,'DoomLauncher.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="DoomLauncher" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n');
const dir=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(dir,'Compiler.exe');
if(fs.lstatSync(dir).isSymbolicLink()||fs.readdirSync(dir).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(dir,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
const r=spawnSync(compiler,['-b',path.join(out,'DoomLauncher.fprj'),path.join(out,'output'),'DoomLauncher.face',config.id],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
const b=fs.readFileSync(path.join(out,'output/DoomLauncher.face'));
if(b.readUInt32LE(0)!==0x1234a55a||b[5]!==0||b[49]!==0)throw Error('PackageHeader');b.write(config.id,40,9,'ascii');if(target==='s3')b[5]=10;
const records=entries.map(([name,original])=>{
 const n=Buffer.from('lua/'+name),found=[];
 for(let p=b.indexOf(n);p>=0;p=b.indexOf(n,p+1)){
  if(p<20)continue;const word=b.readUInt32LE(p-20),length=word>>>24,size=word&0xffffff,start=p+length;
  // A pathname may also occur INSIDE the ELF or Lua source. Only an exact
  // header/size/name/payload tuple constitutes a serialized resource record.
  if(length===n.length&&size===original.length&&start+size<=b.length&&b.subarray(start,start+size).equals(original))found.push(start);
 }
 if(found.length!==1)throw Error('ResourceRecordMismatch:'+name);
 return{name:'lua/'+name,size:original.length,offset:found[0],sha256:sha256(original)};
});
const ordered=[...records].sort((a,c)=>a.offset-c.offset);for(let i=1;i<ordered.length;i++)if(ordered[i-1].offset+ordered[i-1].size>ordered[i].offset)throw Error('OverlappingRecords');
const file=path.join(out,'DoomLauncher-'+target+'.face');
if(fs.existsSync(file)){if(sha256(fs.readFileSync(file))!==sha256(b))throw Error('PreviouslyPackagedPayloadChanged');}
else fs.writeFileSync(file,b,{flag:'wx'});
const parts=Math.ceil((b.length+26)/2044),wire=b.length+26+parts*19;
const worker=fs.readFileSync(path.join(root,'experiments/pc-rfcomm/LargeSessionWorker.cs'),'utf8');
const workerLimit=Number(worker.match(/\bByteLimit\s*=\s*(\d+)/)?.[1]);if(!Number.isSafeInteger(workerLimit))throw Error('WorkerBudgetAbsent');
const result={checkpoint:lowMemory?'R285':'R282',target,...(lowMemory?{zoneMiB:4}:{}),id:config.id,bytes:b.length,sha256:sha256(b),sourceSha256:sha256(Buffer.from(source)),records,wadPath:review.wadPath,wadPathAssigned:true,manualStartOnly:true,fontIndependent:true,nativeLoadEnabled:config.allow_native,physicalDeploymentAuthorized:false,physicalTransport:false,
 upload:{defaultParts:parts,wireBytesWithoutControl:wire,existingWorkerByteLimit:workerLimit,fitsExistingWorker:wire+8192<=workerLimit},config};
if(fs.existsSync(path.join(out,'package.json'))&&!fs.existsSync(path.join(out,'package-initial-review.json')))fs.copyFileSync(path.join(out,'package.json'),path.join(out,'package-initial-review.json'));
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,records:records.length}));
