// Offline, pinned compiler only. No emulator install/ADB/physical transport.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {firstCRoot as root,firstCSource,sha256} from './first-c-source-r202.mjs';
import {firstCAssets} from './first-c-assets.mjs';
if(process.argv.length!==2)throw Error('FixedPackageOnly');
const work=path.join(root,'artifacts/first-c-r202');
if(fs.existsSync(work))throw Error('ExistingPackage');
const {source,controller,adapter,template,ui,normalizer,elf}=firstCSource(),assets=firstCAssets();
const test=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/adapter-r202/summary.json'),'utf8'));
if(test.scenariosPassed!==38||test.sourceSha256!==sha256(Buffer.from(source))||test.adapterSha256!==sha256(Buffer.from(adapter))||
  test.controllerSha256!==sha256(Buffer.from(controller))||!test.manualActivationVerified||!test.moduleInventoryUnchanged||!test.ownGuestFilesRemoved||test.nativeModuleExecuted!==false||
  !test.doubleSeparatorPathVerified||!test.priorPhysicalModuleBlocksLoadAndUnload||!test.globalLoadNotRequired||!test.uiPreservedOnBackendFailure)throw Error('UntestedSources');
const visual=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/ui-only-r200/validation.json'),'utf8'));
const visualBuild=JSON.parse(fs.readFileSync(path.join(root,'artifacts/ui-only-r200/review.json'),'utf8'));
const pathTest=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/path-r201/summary.json'),'utf8'));
if(!visual.labelsAndButtonPixelsVerified||!visual.realTouchCallbackObserved||!visual.luaCloseObserved||visualBuild.factorySha256!==sha256(Buffer.from(ui))||
 pathTest.scenariosPassed!==16||pathTest.sourceSha256!==sha256(Buffer.from(normalizer)))throw Error('UiOrPathNotValidated');
const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||
  sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||
  sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
for(const dir of ['app/lua','images','output'])fs.mkdirSync(path.join(work,dir),{recursive:true});
for(const [name,value] of [['main.lua',Buffer.from(source)],['minimal.elf',elf],['legend.png',assets.legend],['run.png',assets.run]])fs.writeFileSync(path.join(work,'app/lua',name),value,{flag:'wx'});
fs.writeFileSync(path.join(work,'images/preview.png'),assets.preview,{flag:'wx'});
const project=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/FirstC2.fprj'));
fs.writeFileSync(path.join(work,'FirstC2.fprj'),project,{flag:'wx'});
const id='365219998';
const result=spawnSync(compiler,['-b',path.join(work,'FirstC2.fprj'),path.join(work,'output'),'FirstC2.face',id],
  {cwd:work,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:2097152,
    env:{...process.env,TEMP:work,TMP:work,PATH:path.join(process.env.SystemRoot,'System32')}});
fs.writeFileSync(path.join(work,'compiler-result.json'),JSON.stringify({status:result.status,stdout:result.stdout,stderr:result.stderr},null,2)+'\n');
if(result.error||result.status!==0||!/No Errors/.test(result.stdout)||!/Watch:\s*RedmiWatch4/.test(result.stdout)||!/adb util is missing, skipping to upload/.test(result.stdout))throw Error('CompilerFailed');
const original=fs.readFileSync(path.join(work,'output/FirstC2.face'));
if(original.length<168||original.length>32768||original.subarray(0,4).toString('hex')!=='5aa53412'||original[5]!==0||original[49]!==0)throw Error('PackageRefused');
const bytes=Buffer.from(original);bytes.write(id,40,9,'ascii');
const entries=[];
for(const [name,value] of [['main.lua',Buffer.from(source)],['minimal.elf',elf],['legend.png',assets.legend],['run.png',assets.run]]){
  const needle=Buffer.from('lua/'+name),p=bytes.indexOf(needle);
  if(p<20||bytes.indexOf(needle,p+needle.length)!==-1)throw Error('PathNotUnique');
  const word=bytes.readUInt32LE(p-20),size=word&0xffffff,nl=word>>>24,start=p+nl;
  if(nl!==needle.length||size!==value.length||start+size>bytes.length||!bytes.subarray(start,start+size).equals(value))throw Error('ReadbackMismatch');
  entries.push({name,size,sha256:sha256(value),recordOffset:p-20,payloadOffset:start});
}
fs.writeFileSync(path.join(work,'FirstC2-id-only.face'),bytes,{flag:'wx'});
const report={checkpoint:'R202',id,size:bytes.length,sha256:sha256(bytes),sourceSha256:sha256(Buffer.from(source)),
  controllerSha256:sha256(Buffer.from(controller)),adapterSha256:sha256(Buffer.from(adapter)),templateSha256:sha256(Buffer.from(template)),
  projectSha256:sha256(project),elfSha256:sha256(elf),uiSha256:sha256(Buffer.from(ui)),normalizerSha256:sha256(Buffer.from(normalizer)),
  entries,serializedRecordsVerified:true,nativeCodeIncluded:true,priorModuleBlocked:'rw4minr197',globalLoadRequired:false,
  nativeExecutionRequiresManualClick:true,nativeExecutionEnabledInPackage:true,physicalTransferEnabled:false,
  actualNativeExecutionVerified:false,actualUiRenderingVerified:false,compilerAdbAvailable:false,bluetoothOperationRequested:false};
fs.writeFileSync(path.join(work,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
