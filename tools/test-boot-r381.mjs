// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {bootLauncher,root} from './doom-boot-r381.mjs';import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);const p=bootLauncher(),vm=session('packed-boot-diagnostics'),remote='/tmp/rw4-boot-r381.lua',elf='/tmp/rw4-boot-r381.elf';
for(const [name,file]of [['script',remote],['elf',elf]])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',file],name+'-absence')));
const body=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/boot-r381.lua'),'utf8');
let ui=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/menu-ui-r370.lua'),'utf8').replaceAll('365219936',p.config.id);
ui+=`\nbackend.tick=function()error('insufficient UMEM')end
backend.failed=function()phase='ERROR';view.status(phase)end
timers[1].cb();assert(phase=='ERROR' and image('bootstage.png') and image('bootfree.png') and image('bootmax.png'))
hit(265,267).events.CLICKED();assert(image('bootcode.png') and image('bootread.png') and image('bootsize.png'))
local digits='';for col=1,8 do for _,w in ipairs(widgets)do if w.alive and w.parent and w.parent.p.w==350 and w.p.x==112+(col-1)*25 and w.p.y==0 and w.p.src then local d=w.p.src:match('/d(%d)%.png$');if d then digits=digits..d end end end end
assert(digits=='00000201',digits);print('BOOT_UI_R381_OK')\n`;
const local=path.join(vm.folder,'tests.lua');fs.writeFileSync(local,'MAIN=[====[\n'+p.source+']====]\nassert(load(MAIN))\n'+body+'\ndo\n'+ui+'\nend\n');
vm.adb(['push',path.join(root,'build/doom-audio-r378/rw4/doom.elf'),elf],'elf');vm.adb(['push',local,remote],'script');
let text;try{text=vm.adb(['shell','lua',remote],'test',{timeoutMs:45000});}finally{vm.adb(['shell','rm',remote],'cleanup-script');vm.adb(['shell','rm',elf],'cleanup-elf');}
assert(/BOOT_R381_OK\s+16/.test(text)&&text.includes('BOOT_UI_R381_OK')&&!text.includes('stack traceback'),text.slice(-3000));
const out=path.join(root,'build/doom-boot-r381');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'main.lua'),p.source);
const result={passed:true,cases:16,exactSource:p.sourceSha256,sourceBytes:Buffer.byteLength(p.source),uiErrorNumbers:true,twoCycles:true,noGuardLowering:true,preflightFaultsBeforeNative:true,physicalWatchUsed:false};fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
