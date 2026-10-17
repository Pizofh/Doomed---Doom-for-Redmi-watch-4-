// Guarded RW4 controller + main syntax in Lua; ALL native/file/shell ops mocked.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256,readyLauncher as directLauncher} from './doom-ready-r351.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('FixedTest');
const p=directLauncher(fs.readFileSync(path.join(root,'build/doom-ready-r351/rw4/doom.elf')),fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
const old=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/launcher-tests-r282.lua'),'utf8');
let fixture=old.slice(0,old.indexOf('local function test(fn)'));
fixture=fixture.replaceAll('/dev/rw4doomctl','/dev/rw4doomready').replaceAll('0x32574452','0x36445752').replaceAll('string.rep(\'\\0\',128)','string.rep(\'\\0\',256)').replaceAll('for i=1,32','for i=1,64').replace('t.state[2]=1','t.state[2]=6');
fixture=fixture.replace('local function fixture(options)',"config.wad_path=base..'doom1.wad'\nlocal function fixture(options)");
fixture=fixture.replace("elseif op==7 then assert(not t.image,'detach before image release')","elseif op==7 then assert(not t.image,'no Lua Image expected');t.state[23]=(t.state[23]or 0)+1");
const tests=`
assert(load(main_source,'main','t',_ENV))
local function test(fn)fn();cases=cases+1 end
local function fails(t,fn)local ok=pcall(fn);assert(not ok);t.backend.failed();assert(t.backend.phase()=='ERROR')end
test(function()local t=fixture({disabled=true});t.backend.start();assert(t.backend.phase()=='BLOCKED' and t.loads==0)end)
test(function()
local t=fixture();assert(t.opens==0 and t.loads==0);t.backend.start();t.backend.tick();t.backend.tick()
assert(t.backend.phase()=='PLAYING' and not t.image and t.commands[#t.commands]==7)
for _,key in ipairs({1,2,4,8,16,32})do t.backend.input(key);assert(t.state[12]==key);t.backend.release(key);assert(t.state[12]==0)end
t.backend.input(16);t.backend.input(32);t.backend.release(16);assert(t.state[12]==32);t.backend.release(32);assert(t.state[12]==0)
t.backend.pause();assert(t.backend.phase()=='PAUSED');t.backend.pause()
t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED' and t.unloads==1 and not t.native)
t.backend.start();t.backend.tick();t.backend.tick();t.backend.stop();t.backend.tick();assert(t.unloads==2)
for _,e in ipairs(t.events)do assert(e~='frame' and e~='detach')end
end)
test(function()local t=fixture();t.backend.start();t.backend.tick();t.backend.tick();t.state[21]=2;t.state[22]=4;fails(t,t.backend.tick);assert(t.unloads==0 and t.native)end)
test(function()local t=fixture({bad_cleanup=true});t.backend.start();t.backend.tick();t.backend.tick();t.backend.stop();fails(t,t.backend.tick);assert(t.unloads==0)end)
test(function()local t=fixture({unload_fail=true});t.backend.start();t.backend.tick();t.backend.tick();t.backend.stop();fails(t,t.backend.tick);assert(t.native)end)
test(function()local t=fixture({foreign=true});fails(t,t.backend.start);assert(t.loads==0)end)
test(function()local t=fixture();t.backend.start();t.backend.close();assert(t.unloads==0 and t.commands[#t.commands]==4)end)
test(function()local t=fixture({bad_state=true});fails(t,t.backend.start);assert(t.unloads==0)end)
test(function()
local t=fixture();t.backend.start();t.backend.tick();t.backend.tick()
local before,rows=t.opens,#t.rows
for i=1,100 do t.backend.tick()end
assert(t.opens-before==200,'one snapshot and one command per frame')
assert(#t.rows==rows,'no repeated PLAYING updates')
t.backend.stop();t.backend.tick();assert(t.backend.phase()=='CLOSED')
end)
test(function()
for _,reason in ipairs({1,2,3})do
local t=fixture();t.backend.start();t.backend.tick();t.backend.tick()
t.state[6]=1;t.state[7]=1;t.state[15]=reason;t.state[16]=0;t.state[18]=14;t.state[19]=14;t.state[20]=0
t.backend.tick();assert(t.unloads==1 and t.backend.phase()==(reason==3 and 'ERROR' or 'CLOSED'))
end
end)
print('READY_LAUNCHER_R351_OK',cases)
`;
for(const text of [p.parts.controller,p.source])assert(!text.includes(']====]'));
const source='CONTROLLER_SOURCE=[====[\n'+p.parts.controller+']====]\nMAIN_SOURCE=[====[\n'+p.source+']====]\n'+fixture+tests;
const s=session('ready-launcher-tests'),remote='/tmp/rw4-ready-launcher-r351.lua',file=path.join(s.folder,'tests.lua');fs.writeFileSync(file,source);
const before=s.adb(['shell','lsmod'],'before');assert(/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',remote],'absence')));
s.adb(['push',file,remote],'script');const text=s.adb(['shell','lua',remote],'tests');assert(/READY_LAUNCHER_R351_OK\s+10/.test(text)&&!/stack traceback/.test(text),text.slice(-1200));
s.adb(['shell','rm',remote],'remove-own');assert.equal(s.adb(['shell','lsmod'],'after'),before);
const result={checkpoint:'R351',passed:true,cases:10,normalQuitClosedAfterCleanup:true,mainSyntax:true,nativeAndFilesMocked:true,noLuaFrameImage:true,controlOpensPerFrame:2,repeatedPlayingUpdates:0,sourceSha256:p.sourceSha256,sourceBytes:Buffer.byteLength(p.source),controllerSha256:sha256(p.parts.controller),physicalTransport:false};
fs.mkdirSync(path.join(root,'artifacts/research/ready-launcher-r351'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/research/ready-launcher-r351/result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
