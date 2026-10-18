// SPDX-License-Identifier: GPL-2.0-only
// All 36 real maps, save/load and joins, with modeled graphics/audio in owned S3.
// Per-map -warp adapters are test fixtures and never packaged.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256,once} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';
import {ultimateProfile as p} from './doom-ultimate-source-r374.mjs';
assert.equal(process.argv.length,2);
const dir=path.join(root,'build/doom-audio-r374/s3-model'),out=path.join(root,'artifacts/research/ultimate-campaign-r374');
assert(!fs.existsSync(out));fs.mkdirSync(out,{recursive:true});
const review=JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8')),logs=JSON.parse(fs.readFileSync(path.join(dir,'build-log.json'),'utf8'));
assert.equal(sha256(fs.readFileSync(path.join(dir,'doom.elf'))),review.elfSha256);
const adapter=fs.readFileSync(path.join(dir,'adapter.c'),'utf8');assert.equal(sha256(adapter),review.generatedHashes.adapter);
const vm=session('ultimate-campaign'),remote='/tmp/rw4-ultimate-map-r374.elf',script='/tmp/rw4-ultimate-map-r374.lua';
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
for(const n of [remote,script,'/dev/rw4doomready','/dev/rw4doomslot'])assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',n],'absence')));
function run(name,args){const r=spawnSync(path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-'+name+'.exe'),args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:15000,maxBuffer:65536});assert(!r.error&&r.status===0,r.stderr);}
const maps=[];
for(let episode=1;episode<=4;episode++)for(let map=1;map<=9;map++){
 const label='E'+episode+'M'+map,src=path.join(out,label+'.c'),obj=path.join(out,label+'.o'),elf=path.join(out,label+'.elf');
 let text=once(adapter,'char *argv[]={"doom","-iwad",RW4_GAME_WAD,"-mb","3",NULL};',
  'char *argv[]={"doom","-iwad",RW4_GAME_WAD,"-warp","'+episode+'","'+map+'","-skill","2","-mb","3",NULL};');
 text=once(text,'doomgeneric_Create(5,argv)','doomgeneric_Create(10,argv)');fs.writeFileSync(src,text);
 run('gcc',logs.find(r=>r.label==='adapter').args.map(v=>v===path.join(dir,'adapter.c')?src:v===path.join(dir,'adapter.o')?obj:v));
 run('ld',logs.find(r=>r.label==='link').args.map(v=>v===path.join(dir,'doom.elf')?elf:v===path.join(dir,'adapter.o')?obj:v));
 const code=`local sequence=0
local function state(allow_error)
 local f=assert(io.open('/dev/rw4doomready','rb'));assert(f:setvbuf('no'));local b=assert(f:read(288));assert(f:close());assert(#b==288)
 local s={string.unpack('<'..string.rep('I4',72),b)};assert(s[1]==0x36445752 and s[2]==8);sequence=s[3]
 if not allow_error then assert(s[8]==0 and s[21]==0,'native error '..s[8]..' '..s[21])end;return s
end
local function command(op,value)
 local f=assert(io.open('/dev/rw4doomready','r+b'));assert(f:setvbuf('no'));assert(f:write(string.pack('<I4I4I4I4',0x36445752,sequence+1,op,value or 0)));assert(f:close());sequence=sequence+1
end
local function wait()assert(os.execute('usleep 100000'))end
local function shell(c)local ok,why,n=os.execute(c);assert(ok and why=='exit' and n==0)end
local stats
local function run()
 shell('insmod ${remote} rw4ultmap374');state();command(1);local ready
 for _=1,120 do local s=state();if s[5]==1 then ready=s;break end;assert(s[6]==0,'stopped before map: '..s[15]..'/'..s[16]);wait()end
 assert(ready and ready[35]==0 and ready[36]==${episode} and ready[37]==${map},'map startup')
 assert(ready[63]==${p.audioSampleBytes} and ready[64]==0,'all effects cached')
 for _=1,6 do command(7);wait()end;command(3);for _=1,4 do wait()end
 command(8);local saved
 for _=1,30 do wait();local s=state();if s[56]==0 and s[55]==8 then assert(s[57]==0 and s[58]==1,'save failed '..s[57]);saved=s;break end end
 assert(saved and saved[59]>=51 and saved[59]<=${p.slotCapacity},'save size/timeout')
 command(9);local loaded
 for _=1,30 do wait();local s=state();if s[56]==0 and s[55]==9 then assert(s[57]==0,'load failed '..s[57]);loaded=s;break end end
 assert(loaded and loaded[36]==${episode} and loaded[37]==${map},'load episode/map')
 for i=38,42 do assert(loaded[i]==saved[i],'checkpoint field '..i)end
 command(10);command(4);local ended
 for _=1,40 do local s=state();if s[6]==1 and s[47]==1 then ended=s;break end;wait()end
 assert(ended,'finish/quiet');command(5);local s=state();assert(s[7]==1 and s[27]==2 and s[18]==s[19] and s[20]==0 and s[16]==0 and s[30]==1,'cleanup')
 stats=string.format('MAP_OK ${label} %d %d %d %d %d %d',saved[59],s[17],s[18],s[19],s[63],s[64]);shell('rmmod rw4ultmap374')
end
local ok,why=xpcall(run,debug.traceback)
if not ok then pcall(function()
 local s=state(true);if s[4]==1 and s[7]~=1 then command(10);command(4)end
 for _=1,40 do s=state(true);if s[6]==1 and s[47]==1 then if s[7]~=1 then command(5)end;break end;wait()end
 if state(true)[7]==1 then shell('rmmod rw4ultmap374')end
end)end
local f=assert(io.open('/tmp/rw4-ultimate-map-r374-result.txt','wb'));assert(f:write(ok and stats or tostring(why)));assert(f:close())
if not ok then error(why)end
`;
 const local=path.join(out,label+'.lua');fs.writeFileSync(local,code);vm.adb(['push',elf,remote],'elf-'+label);vm.adb(['push',local,script],'lua-'+label);
 vm.adb(['shell','lua',script],'run-'+label,{timeoutMs:45000});
 const resultFile=path.join(vm.folder,label+'.txt');vm.adb(['pull','/tmp/rw4-ultimate-map-r374-result.txt',resultFile],'result-'+label);
 const result=fs.readFileSync(resultFile,'utf8'),m=result.match(/^MAP_OK (E\dM\d) (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)$/);assert(m,result);
 assert.equal(vm.adb(['shell','lsmod'],'after-'+label),before);
 maps.push({map:m[1],saveBytes:+m[2],peakDynamic:+m[3],allocated:+m[4],freed:+m[5],cachedSamples:+m[6],audioError:+m[7]});
 for(const n of [remote,script,'/tmp/rw4-ultimate-map-r374-result.txt'])vm.adb(['shell','rm',n],'remove-own');
 fs.writeFileSync(path.join(out,'progress.json'),JSON.stringify(maps,null,2)+'\n');console.log(label+' passed ('+maps.length+'/36)');
}
const result={passed:true,maps,all36MapsStartSaveLoad:true,zoneMiB:p.zoneMiB,audioCacheBytes:p.audioCacheBytes,
 maxSaveBytes:Math.max(...maps.map(m=>m.saveBytes)),maxPeakDynamic:Math.max(...maps.map(m=>m.peakDynamic)),
 realEngine:true,realThreads:true,graphicsAndAudioModeled:true,wholeCampaignPlaythrough:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,maps:maps.length}));
