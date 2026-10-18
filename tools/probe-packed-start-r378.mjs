// SPDX-License-Identifier: GPL-2.0-only
// Owned emulator diagnostics only. Never opens the physical transport.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';
const vm=session('packed-start'),remote='/tmp/rw4-packed-start-r378.elf',script='/tmp/rw4-packed-start-r378.lua';
assert.equal(vm.adb(['shell','lsmod'],'before').trim().split(/\r?\n/).length,1);
// Failed R378 fixtures own these names; never a user/physical watch path.
for(const p of ['/tmp/rw4-menu-r378.elf','/tmp/rw4-menu-r378.lua','/tmp/rw4-menu-r378-result.txt']){
 const absent=/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'check-own'));
 if(!absent)vm.adb(['shell','rm',p],'tidy-own');
}
const code=`local sequence=0
local function state()
local f=assert(io.open('/dev/rw4doomready','rb'));f:setvbuf('no');local b=assert(f:read(288));assert(f:close());local s={string.unpack('<'..string.rep('I4',72),b)};sequence=s[3];return s end
local function command(op)local f=assert(io.open('/dev/rw4doomready','r+b'));f:setvbuf('no');assert(f:write(string.pack('<I4I4I4I4',0x36445752,sequence+1,op,0)));assert(f:close());sequence=sequence+1 end
assert(os.execute('insmod ${remote} packedstart378'));state();command(1)
local last
for i=1,300 do local s=state();if s[5]==1 or s[6]==1 then last=s;print('PACKED_START_RESULT',i,table.concat(s,','));break end;os.execute('usleep 100000')end
assert(last,'startup timed out');command(10);command(4)
for i=1,80 do local s=state();if s[6]==1 and s[47]==1 then command(5);break end;os.execute('usleep 25000')end
local closed=state();assert(closed[7]==1);print('PACKED_CLOSED_RESULT',table.concat(closed,','));assert(os.execute('rmmod packedstart378'))
`;
const file=path.join(vm.folder,'probe.lua');fs.writeFileSync(file,code);
vm.adb(['push',path.join(root,'build/doom-audio-r378/s3-model/doom.elf'),remote],'module');vm.adb(['push',file,script],'fixture');
const text=vm.adb(['shell','lua',script],'probe',{timeoutMs:45000}),m=text.match(/PACKED_START_RESULT\s+(\d+)\s+([\d,]+)/);assert(m,text);
for(const p of [remote,script])vm.adb(['shell','rm',p],'remove-own');assert.equal(vm.adb(['shell','lsmod'],'after').trim().split(/\r?\n/).length,1);
const s=m[2].split(',').map(Number),closed=text.match(/PACKED_CLOSED_RESULT\s+([\d,]+)/);assert(closed);const c=closed[1].split(',').map(Number);console.log(JSON.stringify({polls:+m[1],ready:s[4],finished:s[5],error:s[7],reason:c[14],exitCode:c[15],peakDynamic:c[16],cleanupError:c[19],gameState:s[34],physicalWatchUsed:false}));
