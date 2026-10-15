// Run pure production-controller/UI cases in the owned S3 Lua interpreter.
// All I/O, shell, native state and widgets in the harness are simulated.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {root,sha256} from './doom-launcher-source.mjs';
if(process.argv.length!==2)throw Error('No arguments accepted');
const s=session('doom-launcher-contracts'),top='/tmp/rw4-launcher-r282-tests';
const names=['controller','main'],sources=names.map(n=>fs.readFileSync(path.join(root,'doom/platform-rw4/launcher',n+'.lua'),'utf8'));
const harness=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/launcher-tests-r282.lua'),'utf8');
if([...sources,harness].some(t=>t.includes(']====]')))throw Error('DelimiterChanged');
const source='CONTROLLER_SOURCE=[====[\n'+sources[0]+']====]\nMAIN_SOURCE=[====[\n'+sources[1]+']====]\n'+harness;
const before=s.adb(['shell','lsmod'],'modules-before');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');const test=path.join(s.folder,'test.lua');fs.writeFileSync(test,source);
let output;
try{s.adb(['push',test,top+'/test.lua'],'push');output=s.adb(['shell','lua',top+'/test.lua'],'contracts');}
finally{s.adb(['shell','rm',top+'/test.lua'],'remove-test');s.adb(['shell','rmdir',top],'remove-directory');}
if(s.adb(['shell','lsmod'],'modules-after')!==before)throw Error('NativeInventoryChanged');
const match=output.match(/RW4_DOOM_LAUNCHER_TESTS_OK (\d+)/);if(!match)throw Error('LuaContractsFailed');
const result={checkpoint:'R282',passed:true,scenarios:Number(match[1]),controllerSha256:sha256(Buffer.from(sources[0])),mainSha256:sha256(Buffer.from(sources[1])),shellAndNativeSimulated:true,widgetsAndIoSimulated:true,physicalTransport:false};
fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
