import fs from 'node:fs';import path from 'node:path';
import {root,traceSource} from './doom-trace-source.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const p=traceSource(),s=session('doom-trace-ui'),top='/tmp/doom-trace-ui-r307',read=n=>fs.readFileSync(path.join(root,n),'utf8');
const texts={CONTROLLER_SOURCE:read('doom/platform-rw4/launcher/controller.lua'),MAIN_SOURCE:read('doom/platform-rw4/launcher/main.lua'),CRC_SOURCE:p.parts.crc,TRACE_SOURCE:p.source};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const source=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+read('experiments/doom-runtime-rw4/launcher-tests-r282.lua')+'\n'+read('experiments/doom-runtime-rw4/trace-tests-r307.lua');
const before=s.adb(['shell','lsmod'],'before');if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const f=path.join(s.folder,'test.lua');fs.writeFileSync(f,source);let output;
try{s.adb(['push',f,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'after')!==before)throw Error('NativeInventoryChanged');const m=output.match(/TRACE_UI_OK (\d+)/);if(!m)throw Error('TraceUiFailed');
const result={checkpoint:'R307',passed:true,newCases:Number(m[1]),baseCases:Number(output.match(/RW4_DOOM_LAUNCHER_TESTS_OK (\d+)/)?.[1]),sourceSha256:p.sourceSha256,nativeAndWidgetsSimulated:true,normalCleanupAfterImageError:true,oldOwnedResidentRecoveryTested:true,physicalTransport:false};
const evidence=path.join(root,'artifacts/doom-trace-r307');fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
