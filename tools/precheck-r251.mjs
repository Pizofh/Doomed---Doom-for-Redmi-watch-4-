// Fixed Lua/PNG diagnostic; no C node, shell, module operations or phone access.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {root,sha256} from './state-read-source-r249.mjs';
import {stateReadAssets} from './state-read-assets-r249.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
import {packageRoot} from './verify-emulator.mjs';import {guardEmulator} from './emulator-ui.mjs';
const action=process.argv[2];if(process.argv.length!==3||!['test','package'].includes(action))throw Error('FixedActionOnly');
const normalizer=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/path-r201.lua'),'utf8');
if(sha256(Buffer.from(normalizer))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('NormalizerChanged');
const backend=fs.readFileSync(path.join(root,'experiments/native-step/precheck-r251.lua'),'utf8');
let main=fs.readFileSync(path.join(root,'experiments/native-step/state-read-main-r249.lua'),'utf8');
for(const [a,b]of [['365219972','365219971'],['RW4_STATE_READ_LIFETIME','RW4_PRECHECK_LIFETIME'],['180,220','180,242'],['i=1,10','i=1,11'],['dots[10]','dots[11]'],['show(10','show(11'],['i=1,64','i=1,8'],["type(bytes)=='string'and #bytes==32","type(bytes)=='string'and #bytes==8"],["local text=(bytes:gsub('.',function(c)return string.format('%02X',c:byte())end))","local text=bytes"]])main=main.replaceAll(a,b);
main=main.replace('__PATH_SOURCE__',()=>normalizer).replace('__BACKEND_SOURCE__',()=>backend);
// Move the length/format line below eleven rows.
main=main.replace("image('frame.png',40,258,120,20)","image('frame.png',40,286,120,20)").replace('282+math.floor','310+math.floor');
if(/__[A-Z_]+__|\/dev\/|\b(?:execute|remove|insmod|rmmod|register_driver|unregister_driver|loadfile|dofile)\s*\(/.test(main)||Buffer.byteLength(main)>24576)throw Error('ScopeChanged');
const source=Buffer.from(main),labels=['MARK','REG OPEN','REG READ','REG EOF','REG CLOSE','REG SHAPE','OLD OPEN','OLD READ','OLD CLOSE','OLD MATCH','FINAL'];
const records=[['main.lua',source],...stateReadAssets().records.filter(([n])=>/^g/.test(n)),
 ['title.png',png(120,20,(x,y)=>ownTextPixel('PRECHECK',x,y))],
 ['legend.png',png(180,242,(x,y)=>ownTextPixel(labels[Math.floor(y/22)]??'',x,y%22))],
 ['frame.png',png(120,20,(x,y)=>ownTextPixel('LEN CODE',x,y))],
 ['read.png',png(96,20,(x,y)=>ownTextPixel('CHECK',x,y,[36,92,128]))]];
const testDir=path.join(root,'artifacts/emulator/precheck-r251-verified'),out=path.join(root,'artifacts/precheck-r251');
if(action==='test'){
 if(fs.existsSync(testDir))throw Error('ExistingReport');
 const harness=fs.readFileSync(path.join(root,'experiments/native-step/precheck-tests-r251.lua'),'utf8');
 const observed=fs.readFileSync(path.join(root,'artifacts/proc-photo-r248/observed.bin'));
 const exe=path.join(packageRoot,'platform-tools/adb.exe');
 if(sha256(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7'||observed.length!==66)throw Error('InputChanged');
 guardEmulator();fs.mkdirSync(testDir,{recursive:true});const log=[],top='/tmp/rw4precheck-tests-r251';
 function adb(args){const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});log.push({args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(testDir,'commands.json'),JSON.stringify(log,null,2));if(r.error||r.status!==0)throw Error('EmulatorCommandFailed');return r.stdout+r.stderr;}
 const absent=s=>/^nsh: ls: stat failed: 2\r?$/m.test(s);
 if(!absent(adb(['shell','ls',top])))throw Error('GuestCollision');
 const before=adb(['shell','lsmod']);
 fs.writeFileSync(path.join(testDir,'test.lua'),'PRECHECK_SOURCE=[====[\n'+main+']====]\nPRECHECK_BACKEND=[====[\n'+backend+']====]\n'+harness);
 fs.writeFileSync(path.join(testDir,'observed.bin'),observed);
 adb(['shell','mkdir',top]);for(const n of ['test.lua','observed.bin'])adb(['push',path.join(testDir,n),top+'/'+n]);let result;
 try{result=adb(['shell','lua',top+'/test.lua']);}finally{for(const n of ['test.lua','observed.bin','attempt.txt','registry.txt','old.txt'])if(!absent(adb(['shell','ls',top+'/'+n])))adb(['shell','rm',top+'/'+n]);adb(['shell','rmdir',top]);}
 const count=Number(result.match(/RW4_PRECHECK_TESTS_OK (\d+)/)?.[1]);
 if(count!==25||adb(['shell','lsmod'])!==before||!absent(adb(['shell','ls',top])))throw Error('TestsFailed');
 const report={checkpoint:'R251',scenariosPassed:count,sourceSha256:sha256(source),realOwnedTmpfsIo:true,registryAndWidgetsSimulated:true,noNativeNodeAccess:true,oldFilesReadOnly:true,singleAttemptGuardTested:true,moduleInventoryUnchanged:true,ownGuestFilesRemoved:true,physicalWatchUsed:false};
 fs.writeFileSync(path.join(testDir,'summary.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}else{
 if(fs.existsSync(out))throw Error('ExistingPackage');
 const t=JSON.parse(fs.readFileSync(path.join(testDir,'summary.json'),'utf8'));if(t.sourceSha256!==sha256(source)||t.scenariosPassed!==25||!t.noNativeNodeAccess)throw Error('UntestedSource');
 const compilerRoot=path.join(root,'tools/local/easyface-v4.23-review'),compiler=path.join(compilerRoot,'Compiler.exe');
 if(fs.lstatSync(compilerRoot).isSymbolicLink()||fs.readdirSync(compilerRoot).some(n=>!['Compiler.exe','DeviceInfo.db','EasyFace_en.exe'].includes(n))||sha256(fs.readFileSync(compiler))!=='bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a'||sha256(fs.readFileSync(path.join(compilerRoot,'DeviceInfo.db')))!=='7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76')throw Error('CompilerChanged');
 for(const d of ['app/lua','images','output'])fs.mkdirSync(path.join(out,d),{recursive:true});for(const [n,b]of records)fs.writeFileSync(path.join(out,'app/lua',n),b,{flag:'wx'});
 fs.writeFileSync(path.join(out,'images/preview.png'),png(390,450,(x,y)=>x>=150&&x<240&&y>=160&&y<264&&(y-160)%26<16?[255,160,0]:[0,0,0]));
 fs.writeFileSync(path.join(out,'PreCheck.fprj'),'<?xml version="1.0" encoding="utf-8" ?>\n<FaceProject DeviceType="365"><Screen Title="PreCheck" Bitmap="preview.png"><Widget Shape="34" Name="app_lua%2Fmain.lua" X="0" Y="0" Width="390" Height="450" Alpha="0" Visible_Src="0" /></Screen></FaceProject>\n');
 const r=spawnSync(compiler,['-b',path.join(out,'PreCheck.fprj'),path.join(out,'output'),'PreCheck.face','365219971'],{cwd:out,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576,env:{...process.env,TEMP:out,TMP:out,PATH:path.join(process.env.SystemRoot,'System32')}});
 fs.writeFileSync(path.join(out,'compiler-result.json'),JSON.stringify({status:r.status,stdout:r.stdout,stderr:r.stderr},null,2));
 if(r.error||r.status!==0||!/No Errors/.test(r.stdout)||!/Watch:\s*RedmiWatch4/.test(r.stdout)||!/adb util is missing, skipping to upload/.test(r.stdout))throw Error('CompilerFailed');
 const b=fs.readFileSync(path.join(out,'output/PreCheck.face'));if(b.length<168||b.length>32064||b.subarray(0,4).toString('hex')!=='5aa53412'||b[5]!==0||b[49]!==0)throw Error('PackageLayout');b.write('365219971',40,9,'ascii');
 for(const [n,value]of records){const name=Buffer.from('lua/'+n),p=b.indexOf(name);if(p<20||b.indexOf(name,p+name.length)!==-1)throw Error('PathNotUnique');const w=b.readUInt32LE(p-20),nl=w>>>24,size=w&0xffffff;if(nl!==name.length||size!==value.length||!b.subarray(p+nl,p+nl+size).equals(value))throw Error('ReadbackMismatch');}
 fs.writeFileSync(path.join(out,'PreCheck-id-only.face'),b,{flag:'wx'});
 const report={checkpoint:'R251',id:'365219971',size:b.length,sha256:sha256(b),sourceSha256:sha256(source),resources:records.length,serializedResourcesVerified:true,nativeExecutableIncluded:false,residentNativeCallbacksRequested:false,oldFilesModified:false,shellRequested:false,physicalTransferEnabled:false,physicalWatchUsed:false};
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
