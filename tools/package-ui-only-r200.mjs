// UI-only PC package, no physical profile or native code. Pinned compiler, no ADB.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
import {uiOnlyAssets} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('FixedUiPackageOnly');
const work=path.join(root,'artifacts/ui-only-r200'),base=path.join(root,'experiments/hello-native-rw4');
if(fs.existsSync(work))throw Error('ExistingPackage');
const factory=fs.readFileSync(path.join(base,'ui-r199.lua'),'utf8');
const template=fs.readFileSync(path.join(base,'main-ui-r200.lua'),'utf8');
const test=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/ui-r199/summary.json'),'utf8'));
if(test.scenariosPassed!==6||test.sourceSha256!==sha256(Buffer.from(factory))||test.nativeExecutionBackendIncluded!==false||!test.moduleInventoryUnchanged||!test.ownGuestFileRemoved||template.split('__UI_FACTORY__').length!==2)throw Error('UntestedUi');
const source=template.replace('__UI_FACTORY__',factory);
if(/\b(?:io|os)\s*\.|\bload\s*\(/.test(source.replace(/^--.*$/gm,''))||Buffer.byteLength(source)>16384)throw Error('UiExecutionBackendRefused');
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||
 sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||
 sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const dir of ['app/lua','images','output'])fs.mkdirSync(path.join(work,dir),{recursive:true});
const assets=uiOnlyAssets(),entries=[['main.lua',Buffer.from(source)],['legend.png',assets.legend],['run.png',assets.run]];
for(const [name,value] of entries)fs.writeFileSync(path.join(work,'app/lua',name),value,{flag:'wx'});
fs.writeFileSync(path.join(work,'images/preview.png'),assets.preview,{flag:'wx'});
const project=fs.readFileSync(path.join(base,'UiOnly.fprj'));
fs.writeFileSync(path.join(work,'UiOnly.fprj'),project,{flag:'wx'});
const id='365219997',result=spawnSync(compiler,['-b',path.join(work,'UiOnly.fprj'),path.join(work,'output'),'UiOnly.face',id],
 {cwd:work,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2097152,
  env:{...process.env,TEMP:work,TMP:work,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(work,'compiler-result.json'),JSON.stringify({status:result.status,stdout:result.stdout,stderr:result.stderr},null,2)+'\n');
if(result.error||result.status!==0||!/No Errors/.test(result.stdout)||!/Watch:\s*RedmiWatch4/.test(result.stdout)||!/adb util is missing, skipping to upload/.test(result.stdout))throw Error('CompilerFailed');
const bytes=fs.readFileSync(path.join(work,'output/UiOnly.face'));
if(bytes.length<168||bytes.length>32768||bytes.subarray(0,4).toString('hex')!=='5aa53412'||bytes[5]!==0||bytes[49]!==0)throw Error('PackageRefused');
bytes.write(id,40,9,'ascii');
const records=[];
for(const [name,value] of entries){
 const needle=Buffer.from('lua/'+name),p=bytes.indexOf(needle);
 if(p<20||bytes.indexOf(needle,p+needle.length)!==-1)throw Error('PathNotUnique');
 const word=bytes.readUInt32LE(p-20),size=word&0xffffff,nl=word>>>24,start=p+nl;
 if(nl!==needle.length||size!==value.length||start+size>bytes.length||!bytes.subarray(start,start+size).equals(value))throw Error('ReadbackMismatch');
 records.push({name,size,sha256:sha256(value)});
}
fs.writeFileSync(path.join(work,'UiOnly-id-only.face'),bytes,{flag:'wx'});
const report={checkpoint:'R200',id,size:bytes.length,sha256:sha256(bytes),sourceSha256:sha256(Buffer.from(source)),
 factorySha256:sha256(Buffer.from(factory)),entries:records,serializedRecordsVerified:true,
 nativeCodeIncluded:false,nativeExecutionBackendIncluded:false,dynamicLoadUsed:false,
 physicalProfileRegistered:false,physicalTransferEnabled:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(work,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
