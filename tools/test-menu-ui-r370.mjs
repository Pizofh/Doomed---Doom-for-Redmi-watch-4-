// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,menuLauncher} from './doom-menu-r370.mjs';import {session} from './doom-ui-emulator.mjs';
import {ultimateLauncher} from './doom-ultimate-r374.mjs';
const ultimate=process.argv[2]==='--ultimate-r374';assert(process.argv.length===2||(ultimate&&process.argv.length===3));
const version=ultimate?'r374':'r370';
const p=(ultimate?ultimateLauncher:menuLauncher)(fs.readFileSync(path.join(root,'build/doom-audio-'+version+'/rw4/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
const vm=session('menu-ui-contract'),remote='/tmp/rw4-menu-ui-r370.lua';
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
const local=path.join(vm.folder,'fixture.lua');
fs.writeFileSync(local,'MAIN=[====[\n'+p.source+']====]\nassert(load(MAIN))\n'+fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/menu-ui-r370.lua'),'utf8').replaceAll('365219936',p.config.id));
vm.adb(['push',local,remote],'fixture');let text;
try{text=vm.adb(['shell','lua',remote],'test');}finally{vm.adb(['shell','rm',remote],'remove-own');}
assert(text.includes('MENU_UI_R370_OK'),text.slice(-1500));
const result={passed:true,exactProductionMain:p.sourceSha256,widgetsAndNativeMocked:true,contextLabels:true,menuKey64:true,watchPauseSaveLoadPreserved:true,physicalWatchUsed:false};
fs.writeFileSync(path.join(root,'build/doom-audio-'+version+'/ui-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
