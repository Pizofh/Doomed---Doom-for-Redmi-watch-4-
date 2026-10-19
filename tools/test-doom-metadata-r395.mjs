// SPDX-License-Identifier: GPL-2.0-only
// Own guest carrier only. Never the watch, its catalog, or personal saves.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-monster-r390.mjs';import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);const vm=session('metadata-campaign'),carrier='/data/app/watchface/market/365220011',before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',carrier],'own-carrier-absent')));
const wad=path.join(root,'build/doom2-r384/doom.rwc');assert.equal(sha256(fs.readFileSync(wad)),'15db36b4806b99138ed4c2d1fd31b7b594470a778f52e51a760be9c8397a7ece');
for(const p of [carrier,carrier+'/lua'])vm.adb(['shell','mkdir',p],'own-dir');vm.adb(['push',wad,carrier+'/lua/doom2-r384.wad'],'own-wad');
for(const script of ['tools/test-doom-menu-r370.mjs','tools/test-ultimate-campaign-r374.mjs']){
 const r=spawnSync(process.execPath,[script,'--doom2-metadata-r395'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:600000,maxBuffer:1048576});fs.writeFileSync(path.join(vm.folder,path.basename(script)+'.json'),JSON.stringify({status:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr},null,2));assert(!r.error&&r.status===0,script+': '+r.stderr.slice(-2500));console.log(script+' passed');assert.equal(vm.adb(['shell','lsmod'],'after-test'),before);
}
vm.adb(['shell','rm',carrier+'/lua/doom2-r384.wad'],'own-wad-remove');for(const p of [carrier+'/lua',carrier])vm.adb(['shell','rmdir',p],'own-empty-dir');console.log('METADATA_R395_CLEAN');
