// SPDX-License-Identifier: GPL-2.0-only
// Lua controller lifecycle with native/files/shell doubles; no real media calls.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,readyLauncher} from './doom-ready-r351.mjs';
import {recoveryController} from './doom-audio-recovery-r368.mjs';
import {session} from './doom-ui-emulator.mjs';
import {menuController} from './doom-menu-r370.mjs';
const menu=process.argv[2]==='--menu-r370';assert(process.argv.length===2||(process.argv.length===3&&menu));
const prior=readyLauncher(fs.readFileSync(path.join(root,'build/doom-ready-r351/rw4/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
const controller=menu?menuController(recoveryController(prior.parts.controller)):recoveryController(prior.parts.controller);
const old=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/launcher-tests-r282.lua'),'utf8');
let fixture=old.slice(0,old.indexOf('local function test(fn)'));
fixture=fixture.replaceAll('/dev/rw4doomctl','/dev/rw4doomready').replaceAll('0x32574452','0x36445752')
 .replaceAll("string.rep('\\0',128)","string.rep('\\0',256)").replaceAll('for i=1,32','for i=1,64').replace('t.state[2]=1','t.state[2]=7;t.state[47]=options.audio_held and 0 or 1');
fixture=fixture.replace('local function fixture(options)',"config.wad_path=base..'doom1.wad'\nlocal function fixture(options)");
fixture=fixture.replace('t.state[10]=2','t.state[10]=2;t.state[45]=1;t.state[46]=1');
fixture=fixture.replace("elseif op==5 then\n                    assert(not t.image);",
 "elseif op==10 then t.state[45]=0;t.state[46]=0\n                elseif op==5 then\n                    assert(t.state[45]==0 and t.state[46]==0 and t.state[47]==1,'detach/quiet before full join');");
fixture=fixture.replace("elseif op==7 then assert(not t.image,'detach before image release')",
 "elseif op==7 then assert(t.state[45]==1);t.state[23]=(t.state[23]or 0)+1");
if(menu)fixture=fixture.replaceAll("string.rep('\\0',256)","string.rep('\\0',288)").replaceAll('for i=1,64','for i=1,72').replace('t.state[2]=7','t.state[2]=8');
const tests=`
local function test(fn)fn();cases=cases+1 end
local function playing(t)t.backend.start();t.backend.tick();t.backend.tick();assert(t.backend.phase()=='PLAYING')end
test(function()
 local t=fixture();playing(t);t.backend.stop()
 assert(t.state[45]==0 and t.state[46]==0 and t.commands[#t.commands]==4)
 t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
test(function()
 local t=fixture({audio_held=true});playing(t);t.backend.stop()
 for _=1,10 do t.backend.tick();assert(t.backend.phase()=='STOPPING')end
 t.state[47]=1;t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
test(function()
 local t=fixture({audio_held=true});playing(t);t.backend.stop();for _=1,50 do t.backend.tick()end
 assert(t.backend.phase()=='ERROR' and t.native and t.unloads==0)
 assert(t.state[45]==0 and t.state[46]==0 and t.state[7]==0)
 local loads=t.loads;t.backend.start();t.backend.tick();assert(t.loads==loads and t.unloads==0)
 for _,op in ipairs(t.commands)do assert(op~=5,'no join attempt while audio held')end
end)
test(function()
 local t=fixture({audio_held=true});playing(t);t.backend.close()
 assert(t.commands[#t.commands]==4 and t.state[45]==1,'GC must not call LVGL')
 t.backend=t.new();t.backend.recover();assert(t.state[45]==0 and t.state[46]==0)
 for _=1,50 do t.backend.tick()end;assert(t.backend.phase()=='ERROR' and t.unloads==0)
 t.state[47]=1;t.backend=t.new();t.backend.recover();t.backend.tick()
 assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
test(function()
 local t=fixture();playing(t);t.state[21]=3
 assert(not pcall(t.backend.tick));t.backend.failed()
 assert(t.state[45]==0 and t.state[46]==0 and t.unloads==0 and t.backend.phase()=='ERROR')
end)
test(function()
 local t=fixture({never_finishes=true});playing(t);t.backend.stop()
 assert(t.state[45]==0 and t.state[46]==0,'detach cannot wait for game termination')
 assert(not pcall(function()for _=1,200 do t.backend.tick()end end))
 t.backend.failed();assert(t.unloads==0 and t.state[45]==0)
end)
test(function()
 local t=fixture();playing(t);t.backend.stop();t.state[7]=1
 t.state[15]=1;t.state[18]=14;t.state[19]=14
 t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1)
end)
print('AUDIO_CONTROLLER_R368_OK',cases)
`;
const vm=session('audio-recovery-controller'),remote='/tmp/doomed-audio-controller-r368.lua';
const local=path.join(vm.folder,'test.lua');
fs.writeFileSync(local,'CONTROLLER_SOURCE=[====[\n'+controller+']====]\nMAIN_SOURCE=""\n'+fixture+tests);
const before=vm.adb(['shell','lsmod'],'before');assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
vm.adb(['push',local,remote],'script');let text;
try{text=vm.adb(['shell','lua',remote],'tests');}finally{vm.adb(['shell','rm',remote],'remove-own');}
assert(/AUDIO_CONTROLLER_R368_OK\s+7/.test(text)&&!text.includes('stack traceback'),text.slice(-1400));
assert.equal(vm.adb(['shell','lsmod'],'after'),before);
const result={passed:true,cases:7,nativeAndFilesMocked:true,physicalWatchUsed:false};
fs.writeFileSync(path.join(vm.folder,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
