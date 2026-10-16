import fs from 'node:fs';import path from 'node:path';
import {root,faultLauncher} from './doom-fault-source-r321.mjs';import {readersLauncher} from './doom-readers-source-r318.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const elf=fs.readFileSync(path.join(root,'build/doom-png-readers-r317/final/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),p=faultLauncher(elf,wad),prior=readersLauncher(elf,wad),s=session('doom-fault-ui'),top='/tmp/doom-fault-ui-r321';
const read=n=>fs.readFileSync(path.join(root,n),'utf8'),texts={CONTROLLER_SOURCE:read('doom/platform-rw4/launcher/controller.lua'),MAIN_SOURCE:read('doom/platform-rw4/launcher/main.lua'),PNG_CONTROLLER:prior.parts.controller,PNG_WRAPPER:prior.parts.wrapper,PNG_MAIN:prior.source,MEMORY_SOURCE:p.parts.parser,CRC_SOURCE:p.parts.crc,FAULT_CONTROLLER:p.parts.controller,FAULT_WRAPPER:p.parts.wrapper,FAULT_RECORDER:p.parts.recorder,FAULT_MAIN:p.source};
if(Object.values(texts).some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const script=Object.entries(texts).map(([k,v])=>k+'=[====[\n'+v+']====]\n').join('')+['launcher-tests-r282.lua','ram-png-tests-r304.lua','readers-launcher-tests-r318.lua','fault-tests-r321.lua'].map(n=>read('experiments/doom-runtime-rw4/'+n)).join('\n');
const before=s.adb(['shell','lsmod'],'before');if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const file=path.join(s.folder,'test.lua');fs.writeFileSync(file,script);let output;
try{s.adb(['push',file,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'tests');}finally{s.adb(['shell','rm',top+'/test.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'after')!==before)throw Error('NativeInventoryChanged');
if(!output.includes('FAULT_RECORD_OK 12')||!output.includes('READERS_EXTRA_OK 7')||/lua:|stack traceback/.test(output))throw Error('FaultUiFailed: '+output.slice(-1500));
const result={checkpoint:'R321',passed:true,priorCases:36,newCases:12,sourceSha256:p.sourceSha256,sourceBytes:Buffer.byteLength(p.source),firstFaultPreserved:true,controlOpenWriteCloseDistinguished:true,dimensionsAndUiTested:true,nativeFilesAndWidgetsSimulated:true,physicalTransport:false};
fs.mkdirSync(path.join(root,'artifacts/doom-fault-r321'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/doom-fault-r321/ui-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
