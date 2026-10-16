import fs from 'node:fs';import path from 'node:path';
import {root,residentCloseSource,residentCloseAssets} from './doom-resident-close-source.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const p=residentCloseSource(),assets=residentCloseAssets(),s=session('doom-resident-close'),top='/tmp/doom-resident-close-r313';
const uiTest=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/resident-info-tests-r310.lua'),'utf8').split('-- UI stays inert on opening;')[1];
if(!uiTest)throw Error('UiTestTemplateChanged');
const source='local COLLECTOR_SOURCE=[====[\n'+p.collector+']====]\n'+fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/resident-close-tests-r313.lua'),'utf8')+'\ndo local cases=0;local UI_SOURCE=[====[\n'+p.source+']====]\n-- UI stays inert on opening;'+uiTest.replaceAll('365219955','365219954').replace('RESIDENT_INFO_OK','RESIDENT_CLOSE_UI_OK')+'\nend';
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');let output;const f=path.join(s.folder,'test.lua');fs.writeFileSync(f,source);
try{s.adb(['push',f,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
const m=output.match(/RESIDENT_CLOSE_OK (\d+)/);if(!m||Number(m[1])!==14||!output.includes('RESIDENT_CLOSE_UI_OK 1'))throw Error('TestsFailed');
const result={checkpoint:'R313',passed:true,cases:15,sourceSha256:p.sourceSha256,assetCount:Object.keys(assets).length,nativeAndShellSimulated:true,boundedCleanupAndRefusalTested:true,uiIdleAndSingleAttemptTested:true,physicalTransport:false};
const out=path.join(root,'artifacts/doom-resident-close-r313');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
