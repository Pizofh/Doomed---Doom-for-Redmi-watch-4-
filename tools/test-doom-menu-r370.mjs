// SPDX-License-Identifier: GPL-2.0-only
// Real Doom menus, keys, map/spawn, saves and audio threads; graphics modeled.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';
import {doom2Profile} from './doom2-source-r384.mjs';
const monster=process.argv[2]==='--doom2-monster-r390',final=monster||process.argv[2]==='--doom2-final-r388',tune=final||process.argv[2]==='--doom2-tune-r387',adpcm=tune||process.argv[2]==='--doom2-adpcm-r386',doom2=adpcm||process.argv[2]==='--doom2-r384';
const packed=doom2||process.argv[2]==='--packed-r378';
const ultimate=packed||process.argv[2]==='--ultimate-r374';
const startup=ultimate||process.argv[2]==='--startup-r372';
const quitOnly=process.argv[2]==='--quit-only';assert(process.argv.length===2||(process.argv.length===3&&(quitOnly||startup)));
const out=path.join(root,monster?'build/doom-audio-r390/s3-model':final?'build/doom-audio-r388/s3-model':tune?'build/doom-audio-r387/s3-model':adpcm?'build/doom-audio-r386/s3-model':doom2?'build/doom-audio-r384/s3-model':packed?'build/doom-audio-r378/s3-model':ultimate?'build/doom-audio-r374/s3-model':startup?'build/doom-audio-r372/s3-model':'build/doom-audio-r370/s3-model'),elf=path.join(out,'doom.elf');
const review=JSON.parse(fs.readFileSync(path.join(out,'review.json'),'utf8'));
assert.equal(sha256(fs.readFileSync(elf)),review.elfSha256);if(!quitOnly)assert(!fs.existsSync(path.join(out,'test-result.json')));
const owned=session(startup?'doom-startup-menu':'doom-menu');
let spawn;
if(doom2){
 const b=fs.readFileSync(path.join(root,'build/doom2-r384/doom2.wad')),dir=b.readUInt32LE(8);let marker;
 for(let i=0;i<b.readUInt32LE(4);i++)if(b.toString('ascii',dir+i*16+8,dir+i*16+16).replace(/\0.*$/,'')==='MAP01')marker=i;
 assert(marker!==undefined);const at=dir+(marker+1)*16,offset=b.readUInt32LE(at),size=b.readUInt32LE(at+4);const starts=[];
 for(let i=0;i<size;i+=10)if(b.readUInt16LE(offset+i+6)===1)starts.push({x:b.readInt16LE(offset+i),y:b.readInt16LE(offset+i+2),angle:b.readUInt16LE(offset+i+4)});
 assert.equal(starts.length,1);spawn=starts[0];
}
const render=s=>{
 let text=ultimate?s.replaceAll('rw4menu370',packed?'rw4packed378':'rw4ultimate374').replaceAll('/tmp/rw4-menu-r370',packed?'/tmp/rw4-menu-r378':'/tmp/rw4-menu-r374').replaceAll('371943786','3205409472').replaceAll('532927','684809'):startup?s.replaceAll('rw4menu370','rw4prime372').replaceAll('/tmp/rw4-menu-r370','/tmp/rw4-menu-r372'):s;
 if(doom2)text=text.replaceAll('rw4packed378','rw4doomii384').replaceAll('/tmp/rw4-menu-r378','/tmp/rw4-menu-r384')
 .replaceAll('3205409472',String(doom2Profile.wadCrc32)).replaceAll('684809',String(doom2Profile.audioSampleBytes))
 .replace('tap(8);tap(8);tap(8) -- NEW GAME, episode 1, selected difficulty','tap(8);tap(8) -- Doom II: NEW GAME, difficulty (no episode submenu)')
 .replace('initial[69]==1056*65536 and initial[70]==((-3616*65536)&0xffffffff) and initial[71]==0x40000000 and initial[72]==101',
 'initial[69]==(('+spawn.x+'*65536)&0xffffffff) and initial[70]==(('+spawn.y+'*65536)&0xffffffff) and initial[71]=='+((Math.floor(spawn.angle/45)*0x20000000)>>>0)+' and initial[72]==101');
 if(adpcm)text=text.replaceAll('rw4doomii384','rw4doomii386').replaceAll('/tmp/rw4-menu-r384','/tmp/rw4-menu-r386').replaceAll(String(doom2Profile.audioSampleBytes),'310485');
 if(tune)text=text.replaceAll('rw4doomii386','rw4doomii387').replaceAll('/tmp/rw4-menu-r386','/tmp/rw4-menu-r387');
 if(final)text=text.replaceAll('rw4doomii387','rw4doomii388').replaceAll('/tmp/rw4-menu-r387','/tmp/rw4-menu-r388');
 if(monster)text=text.replaceAll('rw4doomii388','rw4doomii390').replaceAll('/tmp/rw4-menu-r388','/tmp/rw4-menu-r390');
 return text;
};
const vm={folder:owned.folder,adb:(args,...rest)=>owned.adb(args.map(v=>typeof v==='string'?render(v):v),...rest)};
const remote=render('/tmp/rw4-menu-r370.elf'),script=render('/tmp/rw4-menu-r370.lua');
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
for(const p of [remote,script,'/dev/rw4doomready'])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',p],'absence')));
let original=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/ready-engine-r351.lua'),'utf8');
original=original.replaceAll('read(256)','read(288)').replaceAll('#b==256','#b==288').replaceAll("string.rep('I4',64)","string.rep('I4',72)").replace('s[2]==6','s[2]==8');
original=original.replaceAll('/tmp/rw4-doom-ready-r351.elf',remote).replaceAll('rw4ready351','rw4menu370');
original=original.replace('if s[6]==1 then ended=s','if s[6]==1 and s[47]==1 then ended=s');
const header=original.slice(0,original.indexOf("shell('insmod"));
const start=`
shell('insmod ${remote} rw4menu370')
state();command(1)
local title
for _=1,80 do local s=state();if s[5]==1 and s[10]>=2 and s[35]==3 then title=s;break end;wait()end
assert(title and title[65]==1 and title[66]==0 and title[67]==0,'original title, no demo or loaded map')
for _=1,60 do present();wait()end
local still=state();assert(still[35]==3 and still[67]==0,'attract demo must not start unattended')
print('MENU_TITLE_R370_OK')
`;
const newGame=`
local function tap(mask)
 command(2,mask);wait();command(2,0);wait()
end
tap(8);assert(state()[66]==1,'open original main menu')
tap(8);tap(8);tap(8) -- NEW GAME, episode 1, selected difficulty
local initial
for _=1,50 do local s=state();if s[35]==0 and s[66]==0 and s[10]>=2 then initial=s;break end;wait()end
assert(initial and initial[36]==1 and initial[37]==1 and initial[67]==0,'NEW GAME must select E1M1, never a demo')
assert(initial[69]==1056*65536 and initial[70]==((-3616*65536)&0xffffffff) and initial[71]==0x40000000 and initial[72]==101,'first level original player1 spawn')
assert(initial[41]==50 and initial[42]==100,'menu confirmation must not fire a shot')
print('MENU_NEW_GAME_R370_OK')
-- Present continuously as the real UI timer does: the first visible level
-- starts its melt only once a frame slot becomes available.
for _=1,100 do wait();present();local s=state();if s[68]>=40 then initial=s;break end end
assert(initial[68]>=40,'title-to-level melt must finish before movement tests')
for _=1,4 do wait()end;initial=state() -- fill both slots for the backpressure case
`;
let rest=original.slice(original.indexOf('reject(2,6)'));
rest=rest.replace('reject(2,64);','reject(2,128);');
rest=rest.replace("full[10]==2,'backpressure'","full[10]==initial[10],'backpressure'");
rest=rest.replace('present();local visible=state();assert(visible[23]==1',
 'local shown=state()[23];present();local visible=state();assert(visible[23]==shown+1');
rest=rest.replace('visible[51]==1','visible[51]==shown+1');
rest=rest.replace("'forward/back direction'","'forward/back direction '..mask..' '..dx..' '..dy..' nav='..after[65]..' menu='..after[66]..' keys='..after[43]");
rest=rest.replace('command(2,0);wait();present();local after=state()',`local held=state();diagnostic=diagnostic..'\\nheld '..mask..' requested='..held[12]..' applied='..held[13]..' delivered='..held[43]..' x='..held[38]..' y='..held[39]..' oldx='..before[38]..' oldy='..before[39]..' tic='..held[33]..' level='..held[68]
command(2,0);wait();present();local after=state()`);
rest=rest.replace("shell('rmmod rw4menu370')",`assert(s[61]>0 and s[62]>0 and s[63]==532927 and s[64]==0,'audio pipeline')
print('AUDIO_PCM_STATS',s[61],s[62],s[63],s[64])
shell('rmmod rw4menu370')`);
rest=rest.replace("os.remove('/tmp/rw4-ready351-save.dsg')",'');
rest=rest.replace("print('READY_SAVE_RESTORED',#data,saved[60])",`local meta=assert(io.open('/tmp/rw4-menu-r370-saved.bin','wb'))
assert(meta:write(string.pack('<I4I4I4I4I4',saved[38],saved[39],saved[40],saved[41],saved[42])));assert(meta:close())
print('READY_SAVE_RESTORED',#data,saved[60])`);
// An explicit MENU press must open/close the original menu during gameplay.
rest=rest.replace('command(3);for _=1,4 do wait()end;',
 "tap(64);assert(state()[66]==1,'in-game menu');tap(64);assert(state()[66]==0);command(3);for _=1,4 do wait()end;");
vm.adb(['push',elf,remote],'module');
if(quitOnly){
 const q=header+`
local function run()
 shell('insmod ${remote} rw4menu370');state();command(1)
 for _=1,80 do local s=state();if s[5]==1 and s[35]==3 then break end;wait()end
 local function tap(k)command(2,k);wait();command(2,0);wait()end
 tap(64);assert(state()[66]==1);for _=1,5 do tap(16)end
 tap(8);command(2,8) -- confirm QUIT; do not send input to a finished engine
 for _=1,80 do local s=state();if s[6]==1 and s[47]==1 then command(5);break end;wait()end
 local s=state();assert(s[7]==1 and s[16]==0 and s[18]==s[19] and s[20]==0,'original QUIT must cleanly close')
 shell('rmmod rw4menu370')
end
local ok,why=xpcall(run,debug.traceback)
if not ok then pcall(function()command(10);command(4);for _=1,40 do local s=state();if s[6]==1 and s[47]==1 then command(5);break end;wait()end;shell('rmmod rw4menu370')end);error(why)end
print('MENU_QUIT_R370_OK')
`;
 const local=path.join(vm.folder,'quit.lua');fs.writeFileSync(local,render(q));vm.adb(['push',local,script],'quit-fixture');
 const text=vm.adb(['shell','lua',script],'quit',{timeoutMs:45000});assert(text.includes('MENU_QUIT_R370_OK'),text.slice(-1500));
 assert.equal(vm.adb(['shell','lsmod'],'after-quit'),before);for(const p of [remote,script])vm.adb(['shell','rm',p],'remove-own');
 const result={passed:true,originalQuitJoinedAndUnloaded:true,physicalWatchUsed:false};
 fs.writeFileSync(path.join(out,'quit-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));process.exit(0);
}
const cycles=[];
for(let i=0;i<2;i++){
 const play=path.join(vm.folder,'play-'+i+'.lua');
 const cleanup=`
local ok,why=xpcall(run,debug.traceback)
local report=assert(io.open('/tmp/rw4-menu-r370-result.txt','wb'));assert(report:write(ok and 'PASS' or tostring(why)..diagnostic));assert(report:close())
if not ok then
 pcall(function()
  local s=state();if s[4]==1 and s[7]~=1 then command(10);command(4)end
  for _=1,40 do s=state();if s[6]==1 and s[47]==1 then if s[7]~=1 then command(5)end;break end;wait()end
  shell('rmmod rw4menu370')
 end)
 error(why)
end
`;
 fs.writeFileSync(play,render(header+"local diagnostic=''\nlocal function run()\n"+start+newGame+rest+'\nend\n'+cleanup));
 vm.adb(['push',play,script],'play-fixture');const text=vm.adb(['shell','lua',script],'play-'+i,{timeoutMs:45000});
 const report=path.join(vm.folder,'result-'+i+'.txt');vm.adb(['pull','/tmp/rw4-menu-r370-result.txt',report],'result-'+i);
 const reported=fs.readFileSync(report,'utf8');assert.equal(reported,'PASS',reported);
 vm.adb(['shell','rm','/tmp/rw4-menu-r370-result.txt'],'remove-own-result');
 const m=text.match(/AUDIO_PCM_STATS\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
 assert(text.includes('MENU_TITLE_R370_OK')&&text.includes('MENU_NEW_GAME_R370_OK')&&text.includes('READY_ENGINE_R351_OK')&&m,'Inspect own menu/game log');
 assert.equal(vm.adb(['shell','lsmod'],'after-'+i),before);cycles.push({blocks:+m[1],nonSilentBlocks:+m[2],cachedSampleBytes:+m[3],error:+m[4]});
}
const titleLoad=`
shell('insmod ${remote} rw4menu370');state();command(1)
for _=1,80 do local s=state();if s[5]==1 and s[35]==3 then break end;wait()end
assert(state()[35]==3 and state()[67]==0,'load starts at title, not a map')
command(3);for _=1,4 do wait()end
local f=assert(io.open('/tmp/rw4-ready351-save.dsg','rb'));local data=assert(f:read(196609));assert(f:close())
local m=assert(io.open('/tmp/rw4-menu-r370-saved.bin','rb'));local saved={string.unpack('<I4I4I4I4I4',assert(m:read(20)))};assert(m:close())
local crc=(function()\n${fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/crc32.lua'),'utf8')}\nend)()
local c=0xffffffff;for at=1,#data,8192 do c=crc.update(c,data:sub(at,at+8191))end
f=assert(io.open('/dev/rw4doomslot','r+b'));assert(f:setvbuf('no'));assert(f:write(string.pack('<I4I4I4I4',0x31535752,371943786,#data,crc.finish(c))))
for at=1,#data,8192 do assert(f:write(data:sub(at,at+8191)))end;assert(f:close());command(9)
local restored
for _=1,30 do wait();local s=state();if s[55]==9 and s[56]==0 then assert(s[57]==0);restored=s;break end end
assert(restored and restored[35]==0 and restored[36]==1 and restored[37]==1,'load directly from title')
for i=1,5 do assert(restored[37+i]==saved[i],'title load checkpoint field '..i)end
command(6);command(10);command(4)
for _=1,40 do local s=state();if s[6]==1 and s[47]==1 then command(5);break end;wait()end
assert(state()[7]==1);shell('rmmod rw4menu370');print('MENU_TITLE_LOAD_R370_OK')
`;
const loadFile=path.join(vm.folder,'title-load.lua');fs.writeFileSync(loadFile,render(header+titleLoad));
vm.adb(['push',loadFile,script],'title-load-fixture');assert(vm.adb(['shell','lua',script],'title-load',{timeoutMs:45000}).includes('MENU_TITLE_LOAD_R370_OK'));
assert.equal(vm.adb(['shell','lsmod'],'after-title-load'),before);
for(const p of [remote,script,'/tmp/rw4-ready351-save.dsg','/tmp/rw4-menu-r370-saved.bin'])vm.adb(['shell','rm',p],'remove-own');
const result={passed:true,checkpoint:monster?'R390':final?'R388':tune?'R387':adpcm?'R386':doom2?'R384':packed?'R378':ultimate?'R374':startup?'R372':'R370',realDoom:true,titleHeldBeyondAttractDeadline:true,originalMenuNewGame:true,originalPlayer1SpawnBothCycles:true,
 menuConfirmationDoesNotFire:true,saveLoad:true,loadDirectlyFromTitle:true,pauseResume:true,twoCyclesJoinedAndUnloaded:true,modeledAudio:true,devicePlayback:false,physicalWatchUsed:false,cycles};
fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
