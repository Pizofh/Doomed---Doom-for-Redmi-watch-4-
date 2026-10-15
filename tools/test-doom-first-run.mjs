// Emulator Lua only; real WAD read, all native calls and LVGL in fixtures.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {root,sha256,firstRunSource} from './doom-first-run-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const p=firstRunSource(),s=session('doom-first-run-contracts'),top='/tmp/rw4-first-run-r291-tests';
const harness=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/launcher-tests-r282.lua'),'utf8');
const extra=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/first-run-tests-r291.lua'),'utf8');
const texts={CONTROLLER_SOURCE:p.parts.controller,MAIN_SOURCE:fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/main.lua'),'utf8'),FIRST_RUN_SOURCE:p.parts.first,MEMORY_SOURCE:p.parts.parser,CRC_SOURCE:p.parts.crc,COMPOSED_SOURCE:p.source};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const source=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+harness+'\n'+extra;
const before=s.adb(['shell','lsmod'],'modules-before');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const file=path.join(s.folder,'test.lua');fs.writeFileSync(file,source);
let output;try{s.adb(['push',file,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'contracts');}
finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'modules-after')!==before)throw Error('NativeInventoryChanged');
const a=output.match(/RW4_DOOM_LAUNCHER_TESTS_OK (\d+)/),b=output.match(/RW4_FIRST_RUN_TESTS_OK (\d+)/);if(!a||!b)throw Error('FirstRunContractsFailed');
const result={checkpoint:'R291',passed:true,baseCases:Number(a[1]),firstRunCases:Number(b[1]),sourceSha256:p.sourceSha256,fullWadCrcRead:true,nativeAndWidgetsSimulated:true,moduleInventoryUnchanged:true,physicalTransport:false};
const out=path.join(root,'artifacts/doom-first-run-r291');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
