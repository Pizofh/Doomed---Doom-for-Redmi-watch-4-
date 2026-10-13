// PC only: reviewed EasyFace compiler, without its adjacent ADB transfer path.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {projectRoot as root} from './verify-emulator.mjs';
import {nativeInfoPixel} from './native-info-legend.mjs';
const mode=process.argv[2]??'minimal',diagnostic=mode==='diagnostic',imageMode=mode==='image',nativeMode=mode==='native-info',carrierMode=mode==='native-carrier';
if(!['minimal','diagnostic','image','native-info','native-carrier'].includes(mode)||process.argv.length!==(process.argv[2]?3:2))throw Error('OnlyFixedLuaModesAccepted');
const id=carrierMode?'365219995':nativeMode?'365219994':imageMode?'365219993':diagnostic?'365219992':'365219991';
const name=carrierMode?'NativeCarrier':nativeMode?'NativeInfo':imageMode?'LuaImage':diagnostic?'LuaDiag':'LuaProbe';
const experiment=carrierMode?'lua-native-carrier':nativeMode?'lua-native-info':imageMode?'lua-image':diagnostic?'lua-diagnostic':'lua-minimal';
const work=path.join(root,carrierMode?'artifacts/native-carrier-r195':nativeMode?'artifacts/lua-native-info-r188':imageMode?'artifacts/lua-image-r184':diagnostic?'artifacts/lua-diagnostic-r180':'artifacts/lua-minimal-r177');
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review');
const compiler=path.join(compilerRoot,'Compiler.exe');
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=file=>{const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>33554432)throw Error('UnexpectedFile');return fs.readFileSync(file);};
function crc32(b){let c=0xffffffff;for(const byte of b){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([size,name,data,crc]);}
function png(width,height,pixel){
  const rows=Buffer.alloc((width*3+1)*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const at=y*(width*3+1)+1+x*3,color=pixel(x,y);
    for(let c=0;c<3;c++)rows[at+c]=color[c];
  }
  const hdr=Buffer.alloc(13);hdr.writeUInt32BE(width);hdr.writeUInt32BE(height,4);hdr[8]=8;hdr[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
if(fs.existsSync(work))throw Error('ExistingBuildOrArguments');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n)))throw Error('CompilerDependencies');
if(hash(read(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||hash(read(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
const template=read(path.join(root,'experiments',experiment,'main.lua'));
let source=template,payload=null;
if(carrierMode){
  payload=read(path.join(root,'build/hello-native-rw4/r194/minimal.elf'));
  const review=JSON.parse(read(path.join(root,'build/hello-native-rw4/r194/review.json')));
  if(payload.length!==784||hash(payload)!=='8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d'||review.moduleExecuted!==false||review.physicalDeploymentAuthorized!==false||review.imports.length||review.relocations.length)throw Error('CandidateChanged');
  const text=template.toString('utf8');
  if(text.split('__RW4_ELF_HEX__').length!==2||/\b(?:os\s*\.\s*execute|package\s*\.\s*loadlib)\s*\(/.test(text))throw Error('CarrierMustNotExecute');
  source=Buffer.from(text.replace('__RW4_ELF_HEX__',payload.toString('hex')));
}
const project=read(path.join(root,'experiments',experiment,name+'.fprj'));
fs.mkdirSync(path.join(work,'app/lua'),{recursive:true});fs.mkdirSync(path.join(work,'images'));fs.mkdirSync(path.join(work,'output'));
fs.writeFileSync(path.join(work,'app/lua/main.lua'),source);
if(payload)fs.writeFileSync(path.join(work,'app/lua/minimal.elf'),payload,{flag:'wx'});
fs.writeFileSync(path.join(work,name+'.fprj'),project);
// Original procedural asset, not copied from any upstream example or Doom WAD.
const asset=nativeMode?png(180,242,nativeInfoPixel):(imageMode||carrierMode)?png(96,64,(x,y)=>{
  if(x>=44&&x<52||y>=28&&y<36)return[255,255,255];
  return y<32?(x<48?[255,0,0]:[0,255,0]):(x<48?[0,0,255]:[255,128,0]);
}):null;
const assetFilename=nativeMode?'legend.png':'pattern.png';
if(asset)fs.writeFileSync(path.join(work,'app/lua',assetFilename),asset);
// Procedural preview with a cyan field and ten white steps, no external assets.
const rows=Buffer.alloc((390*3+1)*450);
for(let y=0;y<450;y++)for(let x=0;x<390;x++){
  const at=y*(390*3+1)+1+x*3;
  // Diagnostic preview is black with a small white X, never Lua's magenta
  // rectangle/yellow/green markers. Keep it inset from the full display edges.
  const bar=carrierMode ? y>=190&&y<220&&x>=105&&x<285&&(x-105)%60<30 : nativeMode ? x>=140&&x<250&&((y>=190&&y<205)||(y>=235&&y<250)) : imageMode ? x>=175&&x<215&&y>=190&&y<260 : diagnostic ? x>=125&&x<265&&y>=155&&y<295&&
    (Math.abs(x-125-(y-155))<6||Math.abs(x-125+(y-155)-139)<6) :
    y>=160&&y<290&&x>=40&&x<350&&((x-40)%31)<24;
  rows[at]=bar?240:diagnostic||imageMode||nativeMode||carrierMode?0:8;rows[at+1]=bar?240:diagnostic||imageMode||nativeMode||carrierMode?0:48;rows[at+2]=bar?240:diagnostic||imageMode||nativeMode||carrierMode?0:64;
}
const hdr=Buffer.alloc(13);hdr.writeUInt32BE(390);hdr.writeUInt32BE(450,4);hdr[8]=8;hdr[9]=2;
fs.writeFileSync(path.join(work,'images/preview.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
const run=spawnSync(compiler,['-b',path.join(work,name+'.fprj'),path.join(work,'output'),name+'.face',id],
  {cwd:work,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2097152,
    env:{...process.env,TEMP:work,TMP:work,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(work,'compiler-result.json'),JSON.stringify({status:run.status,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
if(run.error||run.status!==0||!/No Errors/.test(run.stdout)||!/Watch:\s*RedmiWatch4/.test(run.stdout)||!/adb util is missing, skipping to upload/.test(run.stdout))throw Error('CompilerFailed');
const original=read(path.join(work,'output',name+'.face'));
if(original.length<168||original.length>32768||original.subarray(0,4).toString('hex')!=='5aa53412'||original[5]!==0||original[49]!==0||!/^\d{9}$/.test(original.subarray(40,49).toString('ascii'))||!original.includes(Buffer.from('lua/main.lua'))||!original.includes(source))throw Error('UnexpectedPackage');
if(asset&&(!original.includes(Buffer.from('lua/'+assetFilename))||!original.includes(asset)))throw Error('PackagedImageChanged');
if(payload&&(!original.includes(Buffer.from('lua/minimal.elf'))||!original.includes(payload)))throw Error('PackagedElfChanged');
const candidate=Buffer.from(original);candidate.write(id,40,9,'ascii');
fs.writeFileSync(path.join(work,name+'-id-only.face'),candidate,{flag:'wx'});
const report={checkpoint:carrierMode?'R195':nativeMode?'R188':imageMode?'R184':diagnostic?'R180':'R177',id,size:candidate.length,sha256:hash(candidate),sourceSha256:hash(source),projectSha256:hash(project),
  ...(carrierMode?{templateSha256:hash(template),elfSha256:hash(payload),elfSize:payload.length,embeddedElfExact:true,nativeExecutionEnabled:false}:{}),
  ...(asset?{imageFilename:assetFilename,imageSize:asset.length,imageSha256:hash(asset),embeddedImageExact:true}:{}),
  originalSha256:hash(original),originalId:original.subarray(40,49).toString('ascii'),headerByte5:0,
  embeddedSourceExact:true,compilerAdbAvailable:false,nativeCodeIncluded:carrierMode,emulatorValidated:false,physicalValidated:false,
  physicalTransferEnabled:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(work,'review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
