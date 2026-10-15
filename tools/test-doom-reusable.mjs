// Owned S3 interpreter: file/device/shell/LVGL contracts simulated, real WAD CRC.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {root,reusableSource} from './doom-reusable-source.mjs';import {firstRunSource} from './doom-first-run-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const p=reusableSource(),old=firstRunSource(),s=session('doom-reusable-contracts'),top='/tmp/rw4-reusable-r294-tests';
const read=n=>fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4',n),'utf8');
const texts={CONTROLLER_SOURCE:p.parts.controller,MAIN_SOURCE:fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/main.lua'),'utf8'),FIRST_RUN_SOURCE:p.parts.first,MEMORY_SOURCE:p.parts.parser,CRC_SOURCE:p.parts.crc,COMPOSED_SOURCE:old.source,REUSABLE_SOURCE:p.parts.reusable,COMPOSED_REUSABLE_SOURCE:p.source};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const source=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+read('launcher-tests-r282.lua')+'\n'+read('first-run-tests-r291.lua')+'\n'+read('reusable-tests-r294.lua');
const before=s.adb(['shell','lsmod'],'modules-before');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const file=path.join(s.folder,'test.lua');fs.writeFileSync(file,source);
let output;try{s.adb(['push',file,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'contracts');}
finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'modules-after')!==before)throw Error('NativeInventoryChanged');
const counts=['RW4_DOOM_LAUNCHER_TESTS_OK','RW4_FIRST_RUN_TESTS_OK','RW4_REUSABLE_TESTS_OK'].map(n=>{const m=output.match(new RegExp(n+' (\\d+)'));if(!m)throw Error('ReusableContractsFailed');return Number(m[1]);});
const result={checkpoint:'R294',passed:true,baseCases:counts[0],firstRunCases:counts[1],reusableCases:counts[2],sourceSha256:p.sourceSha256,twoCyclesSameFiles:true,idleInputRoutingVerifiedInModel:true,fullWadCrcRead:true,nativeAndWidgetsSimulated:true,moduleInventoryUnchanged:true,physicalTransport:false};
const out=path.join(root,'artifacts/doom-reusable-r294');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
