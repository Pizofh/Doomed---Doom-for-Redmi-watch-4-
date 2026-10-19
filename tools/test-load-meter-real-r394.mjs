// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256,loadMeterLauncher} from './doom-load-meter-r394.mjs';import {crc32} from './static-watchface-transfer.mjs';import {session} from './doom-ui-emulator.mjs';
const p=loadMeterLauncher(),out=path.join(root,'build/doom-load-meter-r394');assert(!fs.existsSync(path.join(out,'real-test.json')));fs.mkdirSync(out,{recursive:true});
const model=path.join(root,'build/doom-audio-r394/s3-model'),elf=fs.readFileSync(path.join(model,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(model,'review.json')));assert.equal(sha256(elf),r.elfSha256);
const config={...p.config,elf_bytes:elf.length,elf_sha:sha256(elf),elf_crc:crc32(elf)},source=p.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
const vm=session('load-meter-real'),before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
const carrier='/data/app/watchface/market/365220011',own='/data/app/watchface/market/365220012',remote='/tmp/rw4-load-meter-r394.lua';for(const f of [carrier,own,remote])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',f],'absence')));
for(const dir of [carrier,carrier+'/lua',own,own+'/lua'])vm.adb(['shell','mkdir',dir],'own-directory');
const wad=path.join(root,'build/doom2-r384/doom.rwc');assert.equal(sha256(fs.readFileSync(wad)),'15db36b4806b99138ed4c2d1fd31b7b594470a778f52e51a760be9c8397a7ece');vm.adb(['push',wad,carrier+'/lua/doom2-r384.wad'],'own-wad');vm.adb(['push',path.join(model,'doom.elf'),own+'/lua/doom.elf'],'own-model');
const local=path.join(vm.folder,'fixture.lua');fs.writeFileSync(local,'MAIN=[====[\n'+source+']====]\n'+fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/load-meter-real-r394.lua'),'utf8'));vm.adb(['push',local,remote],'fixture');
const text=vm.adb(['shell','lua',remote],'two-automatic-cycles',{timeoutMs:45000});assert(text.includes('LOAD_METER_REAL_CLOSED_R394')&&!text.includes('stack traceback'),text.slice(-2500));assert.equal(vm.adb(['shell','lsmod'],'after'),before);
const cycles=[...text.matchAll(/LOAD_METER_REAL_R394\s+(\d+)\s+([\d,]+)/g)].map(m=>({cycle:+m[1],values:m[2].split(',').map(Number)}));assert.equal(cycles.length,2);
// Exact owned paths only; no catalog or watchface files belonging to the VM UI.
for(const f of [remote,own+'/lua/doom.elf',carrier+'/lua/doom2-r384.wad',carrier+'/lua/launcher-shell.txt'])vm.adb(['shell','rm',f],'remove-own');for(const dir of [own+'/lua',own,carrier+'/lua',carrier])vm.adb(['shell','rmdir',dir],'own-empty-directory');
const result={passed:true,realLuaController:true,realModuleLoader:true,realDoomAndThreads:true,modeledLvglWidgets:true,modeledAudioAndGraphics:true,automaticCloseBothCycles:true,clockError:0,cycles,sourceSha256:p.sourceSha256,modelElfSha256:r.elfSha256,physicalWatchUsed:false};fs.writeFileSync(path.join(out,'real-test.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
