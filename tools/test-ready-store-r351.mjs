// Actual product Lua with in-memory filesystem/device mocks. Never physical I/O.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-r351.mjs';import {session} from './doom-ui-emulator.mjs';
assert(process.argv.length===2);const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const inputs={STORE_SOURCE:read('doom/platform-rw4/launcher/slot-store-r351.lua'),WRAPPER_SOURCE:read('doom/platform-rw4/launcher/ready-wrapper-r351.lua'),CRC_SOURCE:read('doom/platform-rw4/launcher/crc32.lua')};
const source=Object.entries(inputs).map(([k,v])=>{assert(!v.includes(']====]'));return k+'=[====[\n'+v+']====]\n';}).join('')+read('experiments/doom-runtime-rw4/ready-store-tests-r351.lua');
const s=session('ready-store-tests'),remote='/tmp/rw4-ready-store-r351.lua',file=path.join(s.folder,'tests.lua');
assert(/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',remote],'absence')));fs.writeFileSync(file,source);s.adb(['push',file,remote],'script');const text=s.adb(['shell','lua',remote],'test');assert(/READY_STORE_R351_OK\s+23/.test(text)&&!/stack traceback/.test(text),text.slice(-1500));s.adb(['shell','rm',remote],'remove-own');
const result={passed:true,cases:23,actualProductLua:true,twoBanks:true,corruptAndTruncatedFallback:true,writeAndImportFailures:true,crcCache:true,ramGuard:true,sourceHashes:Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,sha256(v)])),physicalTransport:false};
const out=path.join(root,'artifacts/research/ready-store-r351');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
