// SPDX-License-Identifier: GPL-2.0-only
// Only the owned emulator flash path; never a physical transport.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';import {packedConfig} from './doom-packed-source-r378.mjs';
import {doom2PackedConfig} from './doom2-source-r384.mjs';
const doom2=process.argv[3]==='--doom2-r384';assert((process.argv.length===3||doom2&&process.argv.length===4)&&['stage','cleanup'].includes(process.argv[2]));const {p,gamePath}=(doom2?doom2PackedConfig:packedConfig)('s3-model'),vm=session('packed-data');
assert.equal(vm.adb(['shell','lsmod'],'modules').trim().split(/\r?\n/).length,1);
const absent=/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',gamePath],'absence'));
if(process.argv[2]==='stage'){
 assert(absent);vm.adb(['push',path.join(root,doom2?'build/doom2-r384/doom.rwc':'build/doom-packed-r378/doom.rwc'),gamePath],'packed');
 const copy=path.join(vm.folder,'readback.rwc');vm.adb(['pull',gamePath,copy],'readback');assert.equal(sha256(fs.readFileSync(copy)),p.packedSha256);
 console.log(JSON.stringify({staged:true,compressedBytes:p.packedBytes,readbackVerified:true,physicalWatchUsed:false}));
}else{assert(!absent);vm.adb(['shell','rm',gamePath],'remove-own');console.log(JSON.stringify({removed:true,physicalWatchUsed:false}));}
