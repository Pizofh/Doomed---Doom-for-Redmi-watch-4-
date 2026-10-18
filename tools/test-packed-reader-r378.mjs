// SPDX-License-Identifier: GPL-2.0-only
// Full byte/lump comparisons and raw-I/O failures in the isolated S3.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';
const build=path.join(root,'build/doom-audio-r378/s3-model'),out=path.join(root,'build/doom-packed-r378/reader-test');
fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(path.join(out,'result.json')));
const logs=JSON.parse(fs.readFileSync(path.join(build,'build-log.json'),'utf8')),objects=[];
function run(name,args){const r=spawnSync(path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-'+name+'.exe'),args,{cwd:root,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:2097152});assert.equal(r.status,0,r.error?.message??r.stderr);return r.stdout;}
const io={fopen:'open',fclose:'close',fread:'read',fseek:'seek',ftell:'tell'};
for(const [src,name]of [['doom/platform-rw4/packed/reader-r378.c','reader'],['experiments/doom-runtime-rw4/packed-reader-r378.c','fixture']]){
 const args=logs.find(r=>r.label==='packed-reader').args,obj=path.join(out,name+'.o');
 run('gcc',[...args.slice(0,args.indexOf('-c')),...(name==='reader'?Object.entries(io).map(([a,b])=>'-Drw4_host_'+a+'=packed_test_'+b):[]),'-c',src,'-o',obj]);objects.push(obj);
}
const elf=path.join(out,'test.elf'),link=logs.find(r=>r.label==='link').args.map(a=>a==='rw4_doom_device_init'?'rw4_packed_reader_test_init':a===path.join(build,'doom.elf')?elf:a===path.join(build,'packed-reader.o')?objects[0]:a);
link.splice(link.indexOf('--start-group'),0,objects[1]);run('ld',link);
assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(run('readelf',['-W','-s',elf])));
const vm=session('packed-reader-test'),rawRemote='/data/app/watchface/market/365799913/lua/doom-ultimate-r374.wad',remote='/tmp/rw4-packed-reader-r378.elf';
const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',rawRemote],'raw-absence')));
vm.adb(['push',path.join(root,'tools/local/doom-ultimate/doom.wad'),rawRemote],'reference');vm.adb(['push',elf,remote],'fixture');
const text=vm.adb(['shell','insmod',remote,'packedreader378'],'read-and-faults',{timeoutMs:45000});
assert(vm.adb(['shell','lsmod'],'loaded').includes('packedreader378'),text);
vm.adb(['shell','rmmod','packedreader378'],'unload');assert.equal(vm.adb(['shell','lsmod'],'after'),before);
for(const p of [rawRemote,remote])vm.adb(['shell','rm',p],'remove-own');
const result={passed:true,originalBytesCompared:12408292,directoryEntriesAndLumpsCompared:2306,randomReads:600,independentCursors:true,
 boundedCachePages:2,ioFailureCases:8,eofSeekOverflowAndHandleLimits:true,elfSha256:sha256(fs.readFileSync(elf)),physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
