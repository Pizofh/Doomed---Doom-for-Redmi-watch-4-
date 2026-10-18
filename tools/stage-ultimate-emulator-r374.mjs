// SPDX-License-Identifier: GPL-2.0-only
// Fixed private IWAD, owned S3 flash path only. No physical transport.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';
import {ultimateProfile as p,ultimateWadPath} from './doom-ultimate-source-r374.mjs';
assert(process.argv.length===3&&['stage','cleanup'].includes(process.argv[2]));
const vm=session('ultimate-data'),remote=ultimateWadPath('s3-model');
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
const absent=/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence'));
if(process.argv[2]==='stage'){
 const local=path.join(root,'tools/local/doom-ultimate/doom.wad');assert.equal(sha256(fs.readFileSync(local)),p.wadSha256);
 assert(absent,'Owned test IWAD already exists');vm.adb(['push',local,remote],'push-wad');
 const copy=path.join(vm.folder,'readback.wad');vm.adb(['pull',remote,copy],'readback');assert.equal(sha256(fs.readFileSync(copy)),p.wadSha256);
 console.log(JSON.stringify({staged:true,bytes:p.wadBytes,readbackVerified:true,physicalTransport:false}));
}else{
 assert(!absent);vm.adb(['shell','rm',remote],'remove-own-wad');console.log(JSON.stringify({removed:true,physicalTransport:false}));
}
