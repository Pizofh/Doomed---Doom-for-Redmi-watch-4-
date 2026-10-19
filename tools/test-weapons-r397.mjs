// SPDX-License-Identifier: GPL-2.0-only
// Own PC emulator. Fixture changes ONLY a read-only metric and grants a shotgun
// to distinguish next/previous across three owned weapons. Not packaged.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-controls-r397.mjs';import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);const base=path.join(root,'build/doom-audio-r397/s3-model'),out=path.join(root,'build/doom-controls-r397/weapons');assert(!fs.existsSync(path.join(out,'result.json')));fs.mkdirSync(out,{recursive:true});
const r=JSON.parse(fs.readFileSync(path.join(base,'review.json'))),log=JSON.parse(fs.readFileSync(path.join(base,'build-log.json')));assert.equal(sha256(fs.readFileSync(path.join(base,'doom.elf'))),r.elfSha256);
const once=(s,a,b)=>{assert.equal(s.split(a).length,2);return s.replace(a,()=>b);};let source=fs.readFileSync(path.join(base,'adapter.c'),'utf8');
source=once(source,'static void snapshot(void)','static unsigned weapon_fixture;\nstatic void snapshot(void)');source=once(source,'player_t *p=&players[consoleplayer];mobj_t *m=p->mo;','player_t *p=&players[consoleplayer];mobj_t *m=p->mo;if(m&&!weapon_fixture){p->weaponowned[wp_shotgun]=true;weapon_fixture=1;}');source=once(source,'delivered_keys,raw_ticks()-started};','delivered_keys,(unsigned)p->readyweapon};');
const src=path.join(out,'adapter.c'),obj=path.join(out,'adapter.o'),elf=path.join(out,'doom.elf');fs.writeFileSync(src,source);
for(const [label,exe,args]of [['compile','gcc',log.find(x=>x.label==='adapter').args.map(x=>x===path.join(base,'adapter.c')?src:x===path.join(base,'adapter.o')?obj:x)],['link','ld',log.find(x=>x.label==='link').args.map(x=>x===path.join(base,'doom.elf')?elf:x===path.join(base,'adapter.o')?obj:x)]]){const c=spawnSync(path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-'+exe+'.exe'),args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000});assert(!c.error&&c.status===0,label+': '+c.stderr);}
const vm=session('weapons-controls'),before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);const remote='/tmp/rw4-weapons397.elf',script='/tmp/rw4-weapons397.lua';for(const p of [remote,script])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'absence')));
const code=`local seq=0;local presenting=true
local function state()local f=assert(io.open('/dev/rw4doomready','rb'));f:setvbuf('no');local b=assert(f:read(288));assert(f:close());local s={string.unpack('<'..string.rep('I4',72),b)};seq=s[3];assert(s[8]==0 and s[21]==0);return s end
local function cmd(op,v)local f=assert(io.open('/dev/rw4doomready','r+b'));f:setvbuf('no');local ok,why=f:write(string.pack('<I4I4I4I4',0x36445752,seq+1,op,v or 0));local closed=f:close();assert(ok,why);assert(closed);seq=seq+1;if op==3 or op==4 or op==10 then presenting=false elseif op==6 then presenting=true end end
local function wait()assert(os.execute('usleep 50000'));local s=state();if presenting and s[5]==1 and s[6]==0 then cmd(7)end end
local function tap(k)cmd(2,k);for _=1,3 do wait()end;cmd(2,0);for _=1,3 do wait()end end
assert(os.execute('insmod ${remote} weapons397'));local ok,why=xpcall(function()state();cmd(1)
for _=1,200 do if state()[5]==1 then break end;wait()end;assert(state()[35]==3)
tap(8);tap(8);tap(8)
for _=1,180 do if state()[35]==0 and state()[68]>40 then break end;wait()end
assert(state()[35]==0 and state()[44]==1,'pistol at spawn');local ammo=state()[41]
local function weapon(n)for _=1,100 do if state()[44]==n then return end;wait()end;error('weapon did not become '..n..' actual '..state()[44])end
tap(128);weapon(0);tap(256);weapon(1);cmd(2,256);weapon(2)
for _=1,25 do wait()end;assert(state()[44]==2,'held key must not cycle repeatedly');cmd(2,0)
tap(128);weapon(1);tap(128);weapon(0);tap(128);weapon(2);tap(256);weapon(0)
assert(state()[41]==ammo,'switching must not fire or consume ammunition')
cmd(2,256);cmd(3);for _=1,8 do wait()end;assert(state()[43]==0,'pause releases all nine keys');cmd(6);cmd(2,0)
cmd(10);cmd(4);for _=1,200 do local s=state();if s[6]==1 and s[47]==1 then cmd(5);break end;wait()end
local s=state();assert(s[7]==1 and s[18]==s[19] and s[20]==0);assert(os.execute('rmmod weapons397'));print('WEAPONS397_CLOSED')
end,debug.traceback)
if not ok then pcall(function()state();cmd(10);cmd(4);for _=1,250 do local s=state();if s[6]==1 and s[47]==1 then if s[7]~=1 then cmd(5)end;break end;assert(os.execute('usleep 20000'))end;if state()[7]==1 then assert(os.execute('rmmod weapons397'))end end);error(why)end`;
const local=path.join(out,'probe.lua');fs.writeFileSync(local,code);vm.adb(['push',elf,remote],'own-elf');vm.adb(['push',local,script],'own-lua');const text=vm.adb(['shell','lua',script],'test',{timeoutMs:45000});assert(text.includes('WEAPONS397_CLOSED')&&!text.includes('stack traceback'),text.slice(-2000));assert(!text.includes('RW4_DOOM_LOG:')&&!text.includes('RW4_DOOM_ERROR:'));assert.equal(vm.adb(['shell','lsmod'],'after'),before);for(const p of [remote,script])vm.adb(['shell','rm',p],'own-remove');
const result={passed:true,realEngine:true,fixtureGrantsShotgun:true,previousNextAndWrap:true,noHoldRepeats:true,noAmmoConsumed:true,pauseReleasesAllKeys:true,joinedAndUnloaded:true,normalConsoleSilent:true,physicalWatchUsed:false};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
