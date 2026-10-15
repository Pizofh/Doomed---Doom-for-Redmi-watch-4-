import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {root,sha256,memorySource,memoryAssets} from './memory-preflight-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const s=session('memory-preflight-tests'),top='/tmp/rw4-memory-r283-tests';
const source=memorySource(),parser=fs.readFileSync(path.join(root,'experiments/memory-preflight/parser.lua'),'utf8'),harness=fs.readFileSync(path.join(root,'experiments/memory-preflight/tests.lua'),'utf8');
const assets=memoryAssets();if([source,parser].some(t=>t.includes(']====]')))throw Error('Delimiter');
const before=s.adb(['shell','lsmod'],'modules-before');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
s.adb(['shell','mkdir',top],'mkdir');
const file=path.join(s.folder,'tests.lua');fs.writeFileSync(file,'PARSER_SOURCE=[====[\n'+parser+']====]\nVIEW_SOURCE=[====[\n'+source+']====]\nACTUAL_VELA=true\n'+harness);
let output;try{s.adb(['push',file,top+'/tests.lua'],'push');output=s.adb(['shell','lua',top+'/tests.lua'],'tests');}
finally{s.adb(['shell','rm',top+'/tests.lua'],'remove');s.adb(['shell','rmdir',top],'rmdir');}
if(s.adb(['shell','lsmod'],'modules-after')!==before)throw Error('ModulesChanged');
const match=output.match(/RW4_MEMORY_TESTS_OK (\d+)/);if(!match)throw Error('TestsFailed');
const pools=[...output.matchAll(/MEMORY_POOL\s+([A-Z0-9_-]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(MAXFREE|LARGEST)/g)].map(m=>({name:m[1],total:Number(m[2]),free:Number(m[3]),max:Number(m[4]),maxLabel:m[5]}));
if(!pools.length)throw Error('MissingEmulatorSnapshot');
const report={checkpoint:'R283',passed:true,scenarios:Number(match[1]),sourceSha256:sha256(Buffer.from(source)),assetsSha256:sha256(Buffer.concat(assets.records.flatMap(([n,b])=>[Buffer.from(n),b]))),emulatorPools:pools,realProcfsRead:true,widgetsSimulated:true,moduleInventoryUnchanged:true,physicalWatchUsed:false,bluetoothOperationRequested:false};
fs.mkdirSync(path.join(root,'artifacts/memory-preflight-r283'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/memory-preflight-r283/tests.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
