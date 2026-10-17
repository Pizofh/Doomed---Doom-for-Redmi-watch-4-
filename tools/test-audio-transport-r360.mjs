// SPDX-License-Identifier: GPL-2.0-only
// Pure guard fault injection in owned S3 VM. No media/driver or physical calls.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {session} from './doom-ui-emulator.mjs';
assert.equal(process.argv.length,2);
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'build/audio-transport-r360');
assert(!fs.existsSync(out),'Output exists');
const hash=b=>createHash('sha256').update(b).digest('hex');
const verify=spawnSync(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],
 {cwd:root,windowsHide:true,encoding:'utf8',timeout:15000});
assert.equal(verify.status,0,'Reviewed inputs required');
fs.mkdirSync(out,{recursive:true});
const fixture=`#include "transport-guard.h"
#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)
static int open_play(struct doomed_audio_guard *g){
 enum doomed_audio_op ops[]={DA_OPEN,DA_PREPARE,DA_START};
 for(unsigned i=0;i<3;i++){uint32_t t=doomed_audio_begin(g,ops[i],0,100,0);
  CHECK(t);CHECK(!doomed_audio_complete(g,t,0,0));}return 0;
}
int rw4_audio_transport_test_init(void *info){
 (void)info;struct doomed_audio_guard g;uint32_t t;
 doomed_audio_guard_init(&g);CHECK(doomed_audio_unloadable(&g));
 CHECK(!doomed_audio_begin(&g,DA_WRITE,0,100,2));
 CHECK(!doomed_audio_begin(&g,DA_OPEN,0,0,0));
 CHECK(!doomed_audio_begin(&g,DA_OPEN,0,60001,0));
 CHECK(!doomed_audio_begin(&g,DA_OPEN,0,100,2));
 for(unsigned cycle=0;cycle<2;cycle++){
  CHECK(!open_play(&g));CHECK(!doomed_audio_unloadable(&g));
  CHECK(!doomed_audio_begin(&g,DA_WRITE,0,100,3));
  CHECK(!doomed_audio_begin(&g,DA_WRITE,0,100,1026));
  doomed_audio_pause(&g,1);CHECK(!doomed_audio_begin(&g,DA_WRITE,0,100,2));
  doomed_audio_pause(&g,0);t=doomed_audio_begin(&g,DA_WRITE,0,100,1024);CHECK(t);
  CHECK(!doomed_audio_begin(&g,DA_CLOSE,0,100,0));
  CHECK(doomed_audio_complete(&g,t+1,1024,0));CHECK(g.pending==t);
  CHECK(!doomed_audio_complete(&g,t,1024,0));CHECK(doomed_audio_complete(&g,t,1024,0));
  t=doomed_audio_begin(&g,DA_STOP,0,100,0);CHECK(t);CHECK(!doomed_audio_complete(&g,t,0,0));
  t=doomed_audio_begin(&g,DA_CLOSE,0,100,0);CHECK(t);CHECK(!doomed_audio_complete(&g,t,0,1));
  CHECK(doomed_audio_unloadable(&g));
 }
 /* Fail each setup step. Only explicit release permits unloading. */
 for(unsigned fail=DA_OPEN;fail<=DA_START;fail++){
  doomed_audio_guard_init(&g);
  for(unsigned op=DA_OPEN;op<=fail;op++){
   t=doomed_audio_begin(&g,(enum doomed_audio_op)op,0,100,0);CHECK(t);
   if(op<fail)CHECK(!doomed_audio_complete(&g,t,0,0));
   else CHECK(doomed_audio_complete(&g,t,-5,0));
  }
  CHECK(!doomed_audio_unloadable(&g));CHECK(!doomed_audio_begin(&g,DA_START,0,100,0));
  t=doomed_audio_begin(&g,DA_CLOSE,0,100,0);CHECK(t);
  CHECK(doomed_audio_complete(&g,t,0,1));CHECK(doomed_audio_unloadable(&g));
 }
 /* Full-send contract: zero, partial and negative writes cannot be retried. */
 const int results[]={0,2,-4,-104};
 for(unsigned i=0;i<4;i++){
  doomed_audio_guard_init(&g);CHECK(!open_play(&g));
  t=doomed_audio_begin(&g,DA_WRITE,0,100,4);CHECK(t);
  CHECK(doomed_audio_complete(&g,t,results[i],0));CHECK(g.fault);
  CHECK(!doomed_audio_begin(&g,DA_WRITE,0,100,4));CHECK(!doomed_audio_unloadable(&g));
 }
 /* Clock wrap; expiry retains the pending lease until a late completion. */
 doomed_audio_guard_init(&g);
 t=doomed_audio_begin(&g,DA_OPEN,UINT32_MAX-49,100,0);CHECK(t);
 CHECK(!doomed_audio_expired(&g,49));CHECK(doomed_audio_expired(&g,50));
 CHECK(!doomed_audio_unloadable(&g));CHECK(!doomed_audio_begin(&g,DA_CLOSE,50,100,0));
 CHECK(doomed_audio_complete(&g,t,0,0));CHECK(g.owned);
 t=doomed_audio_begin(&g,DA_CLOSE,50,100,0);CHECK(t);
 CHECK(doomed_audio_complete(&g,t,0,0)); /* missing release acknowledgement */
 CHECK(!doomed_audio_unloadable(&g));CHECK(!doomed_audio_begin(&g,DA_CLOSE,50,100,0));
 doomed_audio_guard_init(&g);t=doomed_audio_begin(&g,DA_OPEN,0,100,0);CHECK(t);
 CHECK(doomed_audio_complete(&g,t,-5,1));CHECK(doomed_audio_unloadable(&g));
 CHECK(!doomed_audio_begin(&g,DA_OPEN,0,100,0));
 doomed_audio_guard_init(&g);g.serial=UINT32_MAX;
 CHECK(!doomed_audio_begin(&g,DA_OPEN,0,100,0));
 return 0;
}`;
fs.writeFileSync(path.join(out,'faults.c'),fixture,{flag:'wx'});
function run(tool,args){const r=spawnSync(path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-'+tool+'.exe'),args,
 {cwd:root,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:1048576});assert(!r.error&&r.status===0,r.stderr);return r.stdout;}
const flags=['-mthumb','-mfloat-abi=soft','-mlong-calls','-std=c17','-Os','-ffreestanding','-fno-builtin',
 '-fno-common','-fno-pic','-falign-functions=4','-fno-unwind-tables','-fno-asynchronous-unwind-tables',
 '-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4/audio'];
const source='doom/platform-rw4/audio/transport-guard.c';
run('gcc',['-march=armv8-m.main',...flags,'-c',source,'-o',path.join(out,'rw4.o')]);
for(const [src,obj] of [[source,'guard.o'],[path.join(out,'faults.c'),'faults.o']])
 run('gcc',['-mcpu=cortex-a7',...flags,'-c',src,'-o',path.join(out,obj)]);
const elf=path.join(out,'test.elf');
run('ld',['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_audio_transport_test_init',
 path.join(out,'faults.o'),path.join(out,'guard.o'),'-o',elf]);
const meta=run('readelf',['-W','-h','-s','-r',elf]);
assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(meta));
assert([...meta.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].every(m=>m[0]==='R_ARM_ABS32'));
const bytes=fs.readFileSync(elf);assert(bytes.length<65536);assert.equal(bytes.readUInt16LE(16),1);
assert.equal(bytes.readUInt16LE(18),40);assert(bytes.readUInt32LE(24)&1);
const vm=session('audio-transport'),remote='/tmp/doomed-audio-transport-r360.elf';
const before=vm.adb(['shell','lsmod'],'before');assert(!/audio360/.test(before));
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
vm.adb(['push',elf,remote],'push');const copy=path.join(vm.folder,'readback.elf');
vm.adb(['pull',remote,copy],'readback');assert.equal(hash(fs.readFileSync(copy)),hash(bytes));
assert(!/failed|error/i.test(vm.adb(['shell','insmod',remote,'audio360'],'fault-tests')));
assert(/audio360/.test(vm.adb(['shell','lsmod'],'loaded')),'Fault assertions failed');
vm.adb(['shell','rmmod','audio360'],'unload');assert.equal(vm.adb(['shell','lsmod'],'after'),before);
vm.adb(['shell','rm',remote],'remove-own');
const result={passed:true,rw4Compiled:true,s3FaultTestsExecuted:true,firmwareAudioCalled:false,
 physicalWatchUsed:false,moduleSha256:hash(bytes),sourceSha256:hash(fs.readFileSync(path.join(root,source)))};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
