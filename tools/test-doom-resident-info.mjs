import fs from 'node:fs';import path from 'node:path';
import {root,residentInfoSource,residentInfoAssets} from './doom-resident-info-source.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const p=residentInfoSource(),assets=residentInfoAssets(),s=session('doom-resident-info'),top='/tmp/doom-resident-info-r310';
const source='local COLLECTOR_SOURCE=[====[\n'+p.collector+']====]\nlocal UI_SOURCE=[====[\n'+p.source+']====]\n'+fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/resident-info-tests-r310.lua'),'utf8');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');let output;const f=path.join(s.folder,'test.lua');fs.writeFileSync(f,source);
try{s.adb(['push',f,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
const m=output.match(/RESIDENT_INFO_OK (\d+)/);if(!m||Number(m[1])!==14)throw Error('TestsFailed');
const result={checkpoint:'R310',passed:true,cases:14,sourceSha256:p.sourceSha256,assetCount:Object.keys(assets).length,nativeAndWidgetsSimulated:true,readOnlyAndHandleCleanupTested:true,physicalTransport:false};
const out=path.join(root,'artifacts/doom-resident-info-r310');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
