// SPDX-License-Identifier: GPL-2.0-only
// Interleaved before/after startup on the owned PC emulator; no physical IO.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-monster-r390.mjs';import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);const out=path.join(root,'build/doom-load-r391');fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(path.join(out,'startup-result.json')));
const vm=session('load-profile'),base='/data/app/watchface/market/365220010',wad=path.join(root,'build/doom2-r384/doom.rwc');assert.equal(sha256(fs.readFileSync(wad)),'15db36b4806b99138ed4c2d1fd31b7b594470a778f52e51a760be9c8397a7ece');
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',base],'own-path-absence')));
for(const dir of [base,base+'/lua'])vm.adb(['shell','mkdir',dir],'own-directory');vm.adb(['push',wad,base+'/lua/doom2-r384.wad'],'own-wad');
const remote='/tmp/rw4-load-r391.elf',script='/tmp/rw4-load-r391.lua';for(const p of [remote,script])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'absence')));
const code=`local seq=0
local function state()local f=assert(io.open('/dev/rw4doomready','rb'));f:setvbuf('no');local b=assert(f:read(288));assert(f:close());assert(#b==288);local s={string.unpack('<'..string.rep('I4',72),b)};seq=s[3];return s end
local function cmd(op)local f=assert(io.open('/dev/rw4doomready','r+b'));f:setvbuf('no');assert(f:write(string.pack('<I4I4I4I4',0x36445752,seq+1,op,0)));assert(f:close());seq=seq+1 end
assert(os.execute('insmod ${remote} loadprofile391'));state();cmd(1)
local ready,ended
for i=1,1000 do local s=state();if s[5]==1 then ready=s;break end;if s[6]==1 then ended=s;break end;assert(os.execute('usleep 25000'))end
cmd(10);cmd(4)
for _=1,200 do local s=state();if s[6]==1 and s[47]==1 then if s[7]~=1 then cmd(5)end;break end;assert(os.execute('usleep 25000'))end
local closed=state();assert(closed[7]==1);assert(os.execute('rmmod loadprofile391'))
assert(ready and not ended,'startup did not reach title');assert(ready[8]==0 and ready[35]==3 and closed[20]==0,'engine/title/cleanup');print('START_PROFILE_R391',ready[69],ready[70],ready[71]);print('LOAD_PROFILE_CLOSED')
`;
const local=path.join(vm.folder,'probe.lua');fs.writeFileSync(local,code);vm.adb(['push',local,script],'probe');
const runs=[];
for(const checkpoint of ['r391','r392','r391','r392']){
 const dir=path.join(root,'build/doom-audio-'+checkpoint+'/s3-model'),elf=path.join(dir,'doom.elf'),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));assert.equal(sha256(fs.readFileSync(elf)),r.elfSha256);
 vm.adb(['push',elf,remote],'own-'+checkpoint);const text=vm.adb(['shell','lua',script],'measure-'+checkpoint,{timeoutMs:45000});assert(text.includes('LOAD_PROFILE_CLOSED')&&!text.includes('stack traceback'),text.slice(-1200));
 const m=text.match(/START_PROFILE_R391\s+(\d+)\s+(\d+)\s+(\d+)/);assert(m,text.slice(-1200));runs.push({checkpoint,kind:checkpoint==='r391'?'original':'packed',verifyMs:+m[1],createMs:+m[2],totalMs:+m[3]});assert.equal(vm.adb(['shell','lsmod'],'after-'+checkpoint),before);vm.adb(['shell','rm',remote],'remove-own-module');
}
vm.adb(['shell','rm',script],'remove-own-script');
const result={passed:true,runs,interleaved:true,graphics:'modeled',audio:'modeled',physicalWatchUsed:false};fs.writeFileSync(path.join(out,'startup-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
// Keep owned WAD010 for subsequent native/menu/fault tests, never a watch path.
