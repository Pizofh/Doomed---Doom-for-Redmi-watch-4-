// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {bootLauncher,root} from './doom-boot-r381.mjs';import {session} from './doom-ui-emulator.mjs';
import {leanLauncher} from './doom-lean-r382.mjs';
import {startLauncher} from './doom-start-r383.mjs';
const start=process.argv[2]==='--start-r383',lean=start||process.argv[2]==='--lean-r382';assert(process.argv.length===2||(lean&&process.argv.length===3));const p=(start?startLauncher:lean?leanLauncher:bootLauncher)(),vm=session('packed-boot-diagnostics'),remote='/tmp/rw4-boot-r381.lua',elf='/tmp/rw4-boot-r381.elf';
for(const [name,file]of [['script',remote],['elf',elf]])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',file],name+'-absence')));
const body=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/boot-r381.lua'),'utf8');
let ui=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/menu-ui-r370.lua'),'utf8').replaceAll('365219936',p.config.id);
if(lean)ui=ui.replace("hit(140,220).events.CLICKED();timers[1].cb()","assert(#widgets==6,'thirty diagnostic widgets must not exist before launch');hit(140,220).events.CLICKED();timers[1].cb()");
ui+=`\nbackend.tick=function()error('insufficient UMEM')end
backend.failed=function()phase='ERROR';view.status(phase)end
timers[1].cb();assert(phase=='ERROR' and image('bootstage.png') and image('bootfree.png') and image('bootmax.png'))
hit(265,267).events.CLICKED();assert(image('bootcode.png') and image('bootread.png') and image('bootsize.png'))
local digits='';for col=1,8 do for _,w in ipairs(widgets)do if w.alive and w.parent and w.parent.p.w==350 and w.p.x==112+(col-1)*25 and w.p.y==0 and w.p.src then local d=w.p.src:match('/d(%d)%.png$');if d then digits=digits..d end end end end
assert(digits=='00000201',digits);print('BOOT_UI_R381_OK')\n`;
if(lean)ui=ui.replace("\nbackend.tick=function()error('insufficient UMEM')end","\nview.status('CHECKING');local alive=0;for _,w in ipairs(widgets)do if w.alive then alive=alive+1 end end;assert(alive==6,'diagnostics must be deleted again on every start')\nbackend.tick=function()error('insufficient UMEM')end");
if(start)ui+="\nlocal s={};for i=1,72 do s[i]=0 end;s[4]=1;s[15]=4;s[16]=84;view.native(s);hit(265,267).events.CLICKED();assert(image('startflag.png') and image('readyflag.png') and image('endflag.png'));hit(265,267).events.CLICKED();assert(image('joinflag.png') and image('reasonflag.png') and image('exitflag.png'));print('START_FLAGS_R383_OK')\n";
const local=path.join(vm.folder,'tests.lua');fs.writeFileSync(local,'START_VERSION='+(start?'true':'false')+'\nMAIN=[====[\n'+p.source+']====]\nassert(load(MAIN))\n'+body+'\ndo\n'+ui+'\nend\n');
vm.adb(['push',path.join(root,'build/doom-audio-r378/rw4/doom.elf'),elf],'elf');vm.adb(['push',local,remote],'script');
let text;try{text=vm.adb(['shell','lua',remote],'test',{timeoutMs:45000});}finally{vm.adb(['shell','rm',remote],'cleanup-script');vm.adb(['shell','rm',elf],'cleanup-elf');}
const cases=start?22:16;assert(new RegExp('BOOT_R381_OK\\s+'+cases).test(text)&&text.includes('BOOT_UI_R381_OK')&&(!start||text.includes('START_FLAGS_R383_OK'))&&!text.includes('stack traceback'),text.slice(-3000));
const out=path.join(root,start?'build/doom-start-r383':lean?'build/doom-lean-r382':'build/doom-boot-r381');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'main.lua'),p.source);
const result={passed:true,cases,exactSource:p.sourceSha256,sourceBytes:Buffer.byteLength(p.source),uiErrorNumbers:true,twoCycles:true,noGuardLowering:true,preflightFaultsBeforeNative:true,diagnosticWidgetsDeferred:lean?30:0,independentStartStopDeadlines:start,physicalWatchUsed:false};fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
