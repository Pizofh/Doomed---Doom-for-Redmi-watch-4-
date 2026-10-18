// Actual product Lua with in-memory filesystem/device mocks. Never physical I/O.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-r351.mjs';import {session} from './doom-ui-emulator.mjs';
const packed=process.argv[2]==='--packed-r378',ultimate=packed||process.argv[2]==='--ultimate-r374';assert(process.argv.length===2||(ultimate&&process.argv.length===3));const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const inputs={STORE_SOURCE:read('doom/platform-rw4/launcher/slot-store-r351.lua'),WRAPPER_SOURCE:read('doom/platform-rw4/launcher/ready-wrapper-r351.lua'),CRC_SOURCE:read('doom/platform-rw4/launcher/crc32.lua')};
let fixture=read('experiments/doom-runtime-rw4/ready-store-tests-r351.lua');
if(ultimate){
 inputs.STORE_SOURCE=inputs.STORE_SOURCE.replaceAll('371943786','3205409472');
 inputs.WRAPPER_SOURCE=inputs.WRAPPER_SOURCE.replaceAll('6956611',packed?'7366211':'7153219');
 fixture=fixture.replaceAll('371943786','3205409472').replaceAll('6956611',packed?'7366211':'7153219');
 // A shareware bank has a valid CRC yet must still be rejected without import.
 fixture=fixture.replace("bank(new,2,1)","bank(new,2,371943786)");
}
const source=Object.entries(inputs).map(([k,v])=>{assert(!v.includes(']====]'));return k+'=[====[\n'+v+']====]\n';}).join('')+fixture;
const s=session('ready-store-tests'),remote='/tmp/rw4-ready-store-r351.lua',file=path.join(s.folder,'tests.lua');
assert(/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',remote],'absence')));fs.writeFileSync(file,source);s.adb(['push',file,remote],'script');const text=s.adb(['shell','lua',remote],'test');assert(/READY_STORE_R351_OK\s+23/.test(text)&&!/stack traceback/.test(text),text.slice(-1500));s.adb(['shell','rm',remote],'remove-own');
const result={passed:true,cases:23,actualProductLua:true,twoBanks:true,corruptAndTruncatedFallback:true,writeAndImportFailures:true,crcCache:true,ramGuard:true,sourceHashes:Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,sha256(v)])),physicalTransport:false};
const out=path.join(root,packed?'artifacts/research/packed-store-r378':ultimate?'artifacts/research/ultimate-store-r374':'artifacts/research/ready-store-r351');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({...result,foreignSharewareBankRejected:ultimate},null,2));console.log(JSON.stringify(result));
