// Lua error-path regression only; physical package and source stay immutable.
import fs from 'node:fs';import path from 'node:path';
import {root,readersLauncher} from './doom-readers-source-r318.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const elf=fs.readFileSync(path.join(root,'build/doom-png-readers-r317/final/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),p=readersLauncher(elf,wad),s=session('doom-readers-errors'),top='/tmp/doom-readers-errors-r320';
const read=n=>fs.readFileSync(path.join(root,n),'utf8'),texts={CONTROLLER_SOURCE:read('doom/platform-rw4/launcher/controller.lua'),MAIN_SOURCE:read('doom/platform-rw4/launcher/main.lua'),PNG_CONTROLLER:p.parts.controller,PNG_WRAPPER:p.parts.wrapper,PNG_MAIN:p.source,MEMORY_SOURCE:p.parts.parser,CRC_SOURCE:p.parts.crc};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const script=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+read('experiments/doom-runtime-rw4/launcher-tests-r282.lua')+'\n'+read('experiments/doom-runtime-rw4/ram-png-tests-r304.lua')+'\n'+read('experiments/doom-runtime-rw4/readers-launcher-tests-r318.lua')+'\n'+read('experiments/doom-runtime-rw4/readers-error-tests-r320.lua');
const before=s.adb(['shell','lsmod'],'before');if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const file=path.join(s.folder,'test.lua');fs.writeFileSync(file,script);let output;
try{s.adb(['push',file,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'after')!==before)throw Error('NativeInventoryChanged');
if(!output.includes('READERS_ERROR_PATHS_OK 2')||!output.includes('READERS_EXTRA_OK 7')||/lua:|stack traceback/.test(output))throw Error('ErrorPathsFailed');
const result={checkpoint:'R320',passed:true,baseCases:22,gameCases:7,cleanupCases:7,errorPaths:2,sourceSha256:p.sourceSha256,modeledOpenAndWriteBoth3016:true,firstFaultOverwritten:true,cleanupRetriesBlocked:true,filesNativeAndWidgetsSimulated:true,physicalTransport:false};
fs.writeFileSync(path.join(root,'artifacts/research/image-vfs-r320/error-path-tests.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
