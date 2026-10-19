// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {bootLauncher,root} from './doom-boot-r381.mjs';import {session} from './doom-ui-emulator.mjs';
import {leanLauncher} from './doom-lean-r382.mjs';
import {startLauncher} from './doom-start-r383.mjs';
import {doom2Launcher} from './doom2-r384.mjs';
import {fitLauncher} from './doom-fit-r386.mjs';
import {tuneLauncher} from './doom-tune-r387.mjs';
import {finalLauncher} from './doom-final-r388.mjs';
import {monsterLauncher} from './doom-monster-r390.mjs';
import {quickLauncher} from './doom-quick-r393.mjs';
import {controlsLauncher} from './doom-controls-r397.mjs';
import {fastLauncher} from './doom-fast-r396.mjs';
import {loadMeterLauncher} from './doom-load-meter-r394.mjs';
const controls=process.argv[2]==='--controls-r397',fast=controls||process.argv[2]==='--fast-r396',meter=process.argv[2]==='--load-meter-r394',quick=fast||meter||process.argv[2]==='--quick-r393',monster=quick||process.argv[2]==='--monster-r390',final=monster||process.argv[2]==='--final-r388',tune=final||process.argv[2]==='--tune-r387',fit=tune||process.argv[2]==='--fit-r386',doom2=fit||process.argv[2]==='--doom2-r384',start=doom2||process.argv[2]==='--start-r383',lean=start||process.argv[2]==='--lean-r382';assert(process.argv.length===2||(lean&&process.argv.length===3));const p=(controls?controlsLauncher:fast?fastLauncher:meter?loadMeterLauncher:quick?quickLauncher:monster?monsterLauncher:final?finalLauncher:tune?tuneLauncher:fit?fitLauncher:doom2?doom2Launcher:start?startLauncher:lean?leanLauncher:bootLauncher)(),vm=session('packed-boot-diagnostics'),remote='/tmp/rw4-boot-r381.lua',elf='/tmp/rw4-boot-r381.elf';
for(const [name,file]of [['script',remote],['elf',elf]])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',file],name+'-absence')));
let body=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/boot-r381.lua'),'utf8');
if(fast)body=body.replace('for _=1,90 do','for _=1,'+(Math.ceil(p.config.elf_bytes/8192)+16)+' do');
if(doom2){
 body=body.replace('for _=1,199 do','for _=1,499 do');
 body=body.replace("elseif op==4 then if kind~='stop-hang'then t.state[6]=1;t.state[47]=1 end",
  "elseif op==4 then if kind~='stop-hang'then t.state[6]=1;t.state[47]=kind=='audio-slow'and 0 or 1 end");
 body=body.replace("print('BOOT_R381_OK',cases)",`
do
 local t=fixture('audio-slow');t.start();t.safe(t.backend.tick);t.safe(t.backend.stop)
 for _=1,310 do t.safe(t.backend.tick)end
 assert(t.backend.phase()=='STOPPING' and t.native and t.unloads==0 and t.boot.stage==82,'slow audio must remain quarantined, not fail at old 50 limit')
 t.state[47]=1;t.safe(t.backend.tick);assert(t.backend.phase()=='CLOSED' and t.unloads==1);cases=cases+1
end
do
 local t=fixture('audio-slow');t.start();t.safe(t.backend.tick);t.safe(t.backend.stop)
 for _=1,500 do t.safe(t.backend.tick)end
 assert(t.backend.phase()=='ERROR' and t.boot.code==709 and t.native and t.unloads==0,'held audio cannot unload at timeout');cases=cases+1
end
print('BOOT_R381_OK',cases)`);
}
if(fit){
 body=body.replaceAll("c.base..'doom.elf'","(c.elf_base or c.base)..'doom.elf'").replaceAll("c.base..'doom.elf '","(c.elf_base or c.base)..'doom.elf '").replaceAll('t.config.min_free==7366211','t.config.min_free=='+p.config.min_free);
 body=body.replace('local free,max=8000000,7000000',"local free,max=8000000,7000000\n if kind=='observed-free'then free=7270920;max=7192944 end");
 body=body.replace("print('BOOT_R381_OK',cases)","do local t=fixture('observed-free');t.start();t.safe(t.backend.tick);assert(t.backend.phase()=='PLAYING' and t.boot.free==7270920 and t.boot.max==7192944);t.safe(t.backend.stop);t.safe(t.backend.tick);assert(t.backend.phase()=='CLOSED');cases=cases+1 end\nprint('BOOT_R381_OK',cases)");
}
if(final&&!meter){
 body=body.replace("local factory,c,boot=assert(load(prefix,'boot-factory','t',env))()",`env.load=function(text,name,...)if name=='@import388' then assert(text==IMPORT_SOURCE);return function()return{new=function()return{tick=function()if kind=='import-fail'then error('import fault')end;return kind~='import-wait'end,close=function()t.import_closed=true end}end}end end;return load(text,name,...)end
 local factory,c,boot=assert(load(prefix,'boot-factory','t',env))()`);
 body=body.replace('local record=c.module',"t.data[c.base..'import.lua']=IMPORT_SOURCE\n local record=c.module");
 body=body.replace("print('BOOT_R381_OK',cases)","do local t=fixture('import-fail');t.start();assert(t.backend.phase()=='ERROR' and t.loads==0 and t.boot.stage==12);cases=cases+1 end\ndo local t=fixture('import-wait');t.start();assert(t.backend.phase()=='CHECKING' and t.loads==0);t.safe(t.backend.stop);assert(t.backend.phase()=='CLOSED' and t.import_closed and t.loads==0);cases=cases+1 end\nprint('BOOT_R381_OK',cases)");
}
let ui=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/menu-ui-r370.lua'),'utf8').replaceAll('365219936',p.config.id);
if(tune){
 const routing=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/touch-shield-r387.lua'),'utf8');
 ui=ui.replace("hit(140,220).events.CLICKED();timers[1].cb()",routing+"\nassert(route(195,100)==nil,'idle background must reach stock');hit(140,220).events.CLICKED();timers[1].cb();assert_shield()");
 ui=ui.replace("assert(phase=='PAUSED' and image('pad_save.png') and image('pad_load.png'))","assert(phase=='PAUSED' and image('pad_save.png') and image('pad_load.png'));assert_shield()");
 ui=ui.replace("print('MENU_UI_R370_OK')","assert(route(195,100)==nil and route(195,445)==nil,'CLOSED must release background');print('MENU_UI_R370_OK')");
}
if(lean)ui=ui.replace("hit(140,220).events.CLICKED();timers[1].cb()","assert(#widgets==6,'thirty diagnostic widgets must not exist before launch');hit(140,220).events.CLICKED();timers[1].cb()");
ui+=`\nbackend.tick=function()error('insufficient UMEM')end
backend.failed=function()phase='ERROR';view.status(phase)end
timers[1].cb();assert(phase=='ERROR' and image('bootstage.png') and image('bootfree.png') and image('bootmax.png'))
hit(265,267).events.CLICKED();assert(image('bootcode.png') and image('bootread.png') and image('bootsize.png'))
local digits='';for col=1,8 do for _,w in ipairs(widgets)do if w.alive and w.parent and w.parent.p.w==350 and w.p.x==112+(col-1)*25 and w.p.y==0 and w.p.src then local d=w.p.src:match('/d(%d)%.png$');if d then digits=digits..d end end end end
assert(digits=='00000201',digits);print('BOOT_UI_R381_OK')\n`;
if(lean)ui=ui.replace("\nbackend.tick=function()error('insufficient UMEM')end","\nview.status('CHECKING');local alive=0;for _,w in ipairs(widgets)do if w.alive then alive=alive+1 end end;assert(alive==6,'diagnostics must be deleted again on every start')\nbackend.tick=function()error('insufficient UMEM')end");
if(start)ui+="\nlocal s={};for i=1,72 do s[i]=0 end;s[4]=1;s[15]=4;s[16]=84;view.native(s);hit(265,267).events.CLICKED();assert(image('startflag.png') and image('readyflag.png') and image('endflag.png'));hit(265,267).events.CLICKED();assert(image('joinflag.png') and image('reasonflag.png') and image('exitflag.png'));print('START_FLAGS_R383_OK')\n";
if(controls){
 ui=ui.replaceAll('hit(18,402)','hit(48,42)').replace("hit(88,402).events.CLICKED();assert(phase=='PAUSED'","hit(230,42).events.CLICKED();assert(phase=='PAUSED'").replace("hit(88,402).events.CLICKED();assert(phase=='PLAYING')","hit(26,388).events.CLICKED();assert(phase=='PLAYING')");
 ui=ui.replace("assert(not image('pad_ok.png') and not image('pad_menu_back.png'))",`assert(not image('pad_ok.png') and not image('pad_menu_back.png'))
 assert(image('pad_weapon_prev.png') and image('pad_weapon_next.png'))
 for _,p in ipairs({{26,128},{208,256}})do local w=hit(p[1],402);w.events.PRESSED();w.events.PRESS_LOST();assert(pressed[#pressed-1]==p[2] and pressed[#pressed]==-p[2])end
 assert(not image('pad_exit.png'),'exit only in pause')`);
 ui=ui.replace("env.pageOnPause();assert(phase=='CLOSED' and not image('pad_menu.png'))",`env.pageOnPause();assert(phase=='CLOSED' and not image('pad_menu.png'))
 assert(not image('time.png'),'normal close must not create diagnostics')
 hit(265,267).events.CLICKED();assert(image('time.png'),'details are available on demand')`);
}
if(meter){
 const base=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/menu-ui-r370.lua'),'utf8');
 ui=base.slice(0,base.indexOf('hit(140,220).events.CLICKED();timers[1].cb()')).replaceAll('365219936',p.config.id)+`
hit(140,220).events.CLICKED();assert(phase=='PLAYING');timers[1].cb();assert(phase=='CLOSED','automatic close after presentation');assert(image('load_check.png')and image('load_elf.png')and image('load_total.png'));hit(265,267).events.CLICKED();assert(image('load_verify.png')and image('load_init.png')and image('load_ready.png'));hit(265,267).events.CLICKED();assert(image('load_frame.png')and image('load_close.png')and image('load_clock.png'));print('BOOT_UI_R381_OK');print('START_FLAGS_R383_OK')`;
 body='METER_LIBRARY=[====['+p.library+']====]\n'+fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/load-timing-r394.lua'),'utf8')+'\n'+body;
}
const local=path.join(vm.folder,'tests.lua');fs.writeFileSync(local,(final&&!meter?'IMPORT_SOURCE=[====['+p.importer.toString()+']====]\n':'')+'START_VERSION='+(start?'true':'false')+'\nMAIN=[====[\n'+p.source+']====]\nassert(load(MAIN))\n'+body+'\ndo\n'+ui+'\nend\n');
vm.adb(['push',path.join(root,controls?'build/doom-audio-r397/rw4/doom.elf':fast?'build/doom-audio-r396/rw4/doom.elf':meter?'build/doom-audio-r394/rw4/doom.elf':quick?'build/doom-audio-r393/rw4/doom.elf':monster?'build/doom-audio-r390/rw4/doom.elf':final?'build/doom-audio-r388/rw4/doom.elf':tune?'build/doom-audio-r387/rw4/doom.elf':fit?'build/doom-audio-r386/rw4/doom.elf':doom2?'build/doom-audio-r384/rw4/doom.elf':'build/doom-audio-r378/rw4/doom.elf'),elf],'elf');vm.adb(['push',local,remote],'script');
let text;try{text=vm.adb(['shell','lua',remote],'test',{timeoutMs:45000});}finally{vm.adb(['shell','rm',remote],'cleanup-script');vm.adb(['shell','rm',elf],'cleanup-elf');}
const cases=meter?25:final?27:fit?25:doom2?24:start?22:16;assert(new RegExp('BOOT_R381_OK\\s+'+cases).test(text)&&text.includes('BOOT_UI_R381_OK')&&(!start||text.includes('START_FLAGS_R383_OK'))&&!text.includes('stack traceback'),text.slice(-3000));
const out=path.join(root,controls?'build/doom-controls-r397':fast?'build/doom-fast-r396':meter?'build/doom-load-meter-r394':quick?'build/doom-quick-r393':monster?'build/doom-monster-r390':final?'build/doom-final-r388':tune?'build/doom-tune-r387':fit?'build/doom-fit-r386':doom2?'build/doom2-r384':start?'build/doom-start-r383':lean?'build/doom-lean-r382':'build/doom-boot-r381');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'main.lua'),p.source);
const result={passed:true,cases,exactSource:p.sourceSha256,sourceBytes:Buffer.byteLength(p.source),uiErrorNumbers:true,twoCycles:true,activeBackgroundShield:tune,noGuardLowering:!fit,guardDerivedFromResidentSavings:fit,preflightFaultsBeforeNative:true,diagnosticWidgetsDeferred:lean?30:0,independentStartStopDeadlines:start,physicalWatchUsed:false};fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
