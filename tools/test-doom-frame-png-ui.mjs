import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {firstRunSource} from './doom-first-run-source.mjs';import {root,framePngSource} from './doom-frame-png-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const p=framePngSource(),old=firstRunSource(),s=session('doom-frame-png-ui'),top='/tmp/rw4-frame-png-ui-r301-tests';
const texts={CONTROLLER_SOURCE:old.parts.controller,MAIN_SOURCE:fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/main.lua'),'utf8'),FIRST_RUN_SOURCE:old.parts.first,MEMORY_SOURCE:old.parts.parser,CRC_SOURCE:old.parts.crc,COMPOSED_SOURCE:old.source,PNG_SOURCE:p.source};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const source=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+['launcher-tests-r282.lua','first-run-tests-r291.lua','frame-png-tests-r301.lua'].map(n=>fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4',n),'utf8')).join('\n');
const before=s.adb(['shell','lsmod'],'before');if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const file=path.join(s.folder,'test.lua');fs.writeFileSync(file,source);let output;
try{s.adb(['push',file,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}
finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'after')!==before)throw Error('NativeInventoryChanged');
const counts=['RW4_DOOM_LAUNCHER_TESTS_OK','RW4_FIRST_RUN_TESTS_OK','RW4_FRAME_PNG_UI_TESTS_OK'].map(n=>{const m=output.match(new RegExp(n+' (\\d+)'));if(!m)throw Error('PngUiTestsFailed');return Number(m[1]);});
const result={checkpoint:'R301',passed:true,baseCases:counts[0],firstRunCases:counts[1],pngUiCases:counts[2],sourceSha256:p.sourceSha256,binDecoderBypassed:true,frameChecksumBeforeImage:true,immutablePngRetainedAfterExit:true,physicalDecoderTested:false,nativeAndWidgetsSimulated:true,physicalTransport:false};
const out=path.join(root,'artifacts/doom-frame-png-r301');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'ui-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
