// SPDX-License-Identifier: GPL-2.0-only
// Interleaved complete ELF CRC, 40ms timer spacing, owned S3 guest only.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {controlsLauncher,root,sha256} from './doom-controls-r397.mjs';import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);const p=controlsLauncher(),out=path.join(root,'build/doom-controls-r397/checking');assert(!fs.existsSync(path.join(out,'result.json')));fs.mkdirSync(out,{recursive:true});
const vm=session('checking-chunks'),remote='/tmp/rw4-checking397.elf',script='/tmp/rw4-checking397.lua';for(const f of [remote,script])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',f],'absence')));
const elf=path.join(root,'build/doom-audio-r397/rw4/doom.elf');assert.equal(sha256(fs.readFileSync(elf)),p.config.elf_sha);vm.adb(['push',elf,remote],'own-elf');
const crc=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/crc32.lua'),'utf8').replace('#bytes<=8192','#bytes<=16384');
const code=`local crc=(function()\n${crc}\nend)()
for _,chunk in ipairs({8192,16384,8192,16384})do
 local start=os.clock();local f=assert(io.open('${remote}','rb'));local value,total,peak,callbacks=0xffffffff,0,0,0
 while true do local t=os.clock();local b=assert(f:read(chunk)or '');if #b==0 then break end;total=total+#b;value=crc.update(value,b);peak=math.max(peak,os.clock()-t);callbacks=callbacks+1;assert(os.execute('usleep 40000'))end
 assert(f:close());assert(total==${p.config.elf_bytes} and crc.finish(value)==${p.config.elf_crc});print('CHECKING397',chunk,math.floor((os.clock()-start)*1000),math.floor(peak*1000),callbacks)
end`;
const local=path.join(out,'probe.lua');fs.writeFileSync(local,code);vm.adb(['push',local,script],'own-lua');const text=vm.adb(['shell','lua',script],'benchmark',{timeoutMs:45000});assert(!text.includes('stack traceback'));const runs=[...text.matchAll(/CHECKING397\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/g)].map(m=>({chunk:+m[1],elapsedMs:+m[2],maxCallbackMs:+m[3],callbacks:+m[4]}));assert.equal(runs.length,4);for(const f of [script,remote])vm.adb(['shell','rm',f],'own-remove');
const result={passed:true,fullElfCrcEveryRun:true,timerSpacingMs:40,interleaved:true,physicalWatchUsed:false,runs};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
