// SPDX-License-Identifier: GPL-2.0-only
// Execute C adapter fault vectors with a pure fake service in the owned S3 VM.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);const root=fileURLToPath(new URL('../',import.meta.url));
const out=path.join(root,'build/audio-media-r367');assert(!fs.existsSync(out));
const verify=spawnSync(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],{cwd:root,encoding:'utf8',windowsHide:true,timeout:15000});assert.equal(verify.status,0);
fs.mkdirSync(out,{recursive:true});const hash=b=>createHash('sha256').update(b).digest('hex');
function run(name,args){const r=spawnSync(path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-'+name+'.exe'),args,
 {cwd:root,encoding:'utf8',windowsHide:true,timeout:15000});assert(!r.error&&r.status===0,r.stderr);return r.stdout;}
const flags=['-mthumb','-mfloat-abi=soft','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common',
 '-fno-pic','-falign-functions=4','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector',
 '-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4/audio'];
run('gcc',['-march=armv8-m.main',...flags,'-c','doom/platform-rw4/audio/media-sink.c','-o',path.join(out,'rw4.o')]);
for(const [src,obj] of [['doom/platform-rw4/audio/media-sink.c','sink.o'],['experiments/audio/media-faults-r364.c','faults.o']])
 run('gcc',['-mcpu=cortex-a7',...flags,'-c',src,'-o',path.join(out,obj)]);
const elf=path.join(out,'test.elf');run('ld',['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_audio_media_test_init',path.join(out,'sink.o'),path.join(out,'faults.o'),'-o',elf]);
const meta=run('readelf',['-W','-s','-r',elf]);assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(meta));
assert([...meta.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].every(m=>m[0]==='R_ARM_ABS32'));
const bytes=fs.readFileSync(elf);assert(bytes.length<65536);
const vm=session('audio-media'),remote='/tmp/doomed-audio-media-r367.elf';
const before=vm.adb(['shell','lsmod'],'before');assert(!/audio364/.test(before));
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
vm.adb(['push',elf,remote],'push');const copy=path.join(vm.folder,'readback.elf');vm.adb(['pull',remote,copy],'readback');assert.equal(hash(fs.readFileSync(copy)),hash(bytes));
assert(!/failed|error/i.test(vm.adb(['shell','insmod',remote,'audio364'],'faults')));
assert(/audio364/.test(vm.adb(['shell','lsmod'],'loaded')),'C adapter assertion failed');
vm.adb(['shell','rmmod','audio364'],'unload');assert.equal(vm.adb(['shell','lsmod'],'after'),before);vm.adb(['shell','rm',remote],'remove-own');
const result={passed:true,rw4Compiled:true,cFaultVectorsExecuted:true,physicalWatchUsed:false,firmwareAudioCalled:false,moduleSha256:hash(bytes)};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
