import fs from 'node:fs';import path from 'node:path';
import {root,ramPngLauncher} from './doom-ram-png-source.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const elf=fs.readFileSync(path.join(root,'build/doom-ram-png-r304/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),p=ramPngLauncher(elf,wad),s=session('doom-ram-png-ui'),top='/tmp/doom-ram-png-ui-r304';
const read=n=>fs.readFileSync(path.join(root,n),'utf8'),texts={CONTROLLER_SOURCE:read('doom/platform-rw4/launcher/controller.lua'),MAIN_SOURCE:read('doom/platform-rw4/launcher/main.lua'),PNG_CONTROLLER:p.parts.controller,PNG_WRAPPER:p.parts.wrapper,PNG_MAIN:p.source,MEMORY_SOURCE:p.parts.parser,CRC_SOURCE:p.parts.crc};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const script=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+read('experiments/doom-runtime-rw4/launcher-tests-r282.lua')+'\n'+read('experiments/doom-runtime-rw4/ram-png-tests-r304.lua');
const before=s.adb(['shell','lsmod'],'before');if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const file=path.join(s.folder,'test.lua');fs.writeFileSync(file,script);let output;
try{s.adb(['push',file,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'after')!==before)throw Error('NativeInventoryChanged');
const match=output.match(/RAM_PNG_UI_OK (\d+)/);if(!match)throw Error('RamPngUiFailed');
const result={checkpoint:'R304',passed:true,baseCases:Number(output.match(/RW4_DOOM_LAUNCHER_TESTS_OK (\d+)/)?.[1]),newCases:Number(match[1]),sourceSha256:p.sourceSha256,sharedWad:p.config.wad_path,sameInstanceSecondStartSkipsFullCrc:true,reopeningRechecksFullCrc:true,nativeAndWidgetsSimulated:true,physicalTransport:false};
fs.writeFileSync(path.join(root,'artifacts/doom-ram-png-r304/ui-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
