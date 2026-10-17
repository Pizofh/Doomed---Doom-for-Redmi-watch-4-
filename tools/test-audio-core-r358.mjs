// Compile the pure PCM core for RW4, execute S3-only vectors in the owned VM.
// No audio device, WAD, LVGL, radio, driver ioctl or filesystem code in module.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {session} from './doom-ui-emulator.mjs';
import {createMonoMixer} from './audio-reference-r356.mjs';
if (process.argv.length !== 2) throw Error('Fixed emulator test only');
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'build/audio-core-r358-cortex-a7');
assert(!fs.existsSync(out), 'Output exists');
const tc = path.join(root, 'tools/local/arm-14.3-review');
function run(name, args) {
  const result = spawnSync(path.join(tc, 'bin/arm-none-eabi-' + name + '.exe'), args,
    {cwd: root, windowsHide: true, shell: false, encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024});
  assert(!result.error && result.status === 0, result.stderr || 'Compiler failed'); return result.stdout;
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(fs.readFileSync(path.join(tc, 'bin/arm-none-eabi-gcc.exe'))),
  '6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4');
const verify = spawnSync(process.execPath, ['tools/build-rw4-file-r214.mjs', 'verify-inputs'],
  {cwd: root, windowsHide: true, shell: false, encoding: 'utf8', timeout: 15000});
assert.equal(verify.status, 0, 'Reviewed toolchain required');
fs.mkdirSync(out, {recursive: true});
const data = Buffer.from(Array.from({length: 96}, (_, i) => (i * 73 + 19) & 255));
const rates = [4000, 11025, 22050, 48000], outputRates = [8000, 16000, 22050, 48000];
const expected = outputRates.map(rate => {
  const mixer = createMonoMixer(rate);
  for (let i = 0; i < 4; i++) mixer.start(i, {rate: rates[i], samples: data}, 127 - i * 19);
  mixer.render(17); mixer.pause(true); assert(mixer.render(31).every(v => v === 0)); mixer.pause(false);
  let checksum = 2166136261;
  for (const count of [1, 127, 512, 97]) for (const value of mixer.render(count))
    for (const byte of [value & 255, (value >> 8) & 255]) checksum = Math.imul(checksum ^ byte, 16777619) >>> 0;
  return checksum;
});
const fixture = `#include "pcm-core.h"
void *memset(void *p,int value,size_t n){volatile unsigned char *b=p;for(size_t i=0;i<n;i++)b[i]=(unsigned char)value;return p;}
static const uint8_t samples[96]={${[...data]}};
static const uint32_t rates[4]={${rates}},outputs[4]={${outputRates}},expected[4]={${expected.map(n=>n+'u')}};
int rw4_audio_core_test_init(void *info){
 (void)info;struct doomed_mixer m;int16_t pcm[512];struct doomed_sample s;
 uint8_t dmx[104]={3,0,0x11,0x2b,96,0,0,0};
 if(doomed_dmx_decode(dmx,104,&s)||s.length!=64||s.rate!=11025||s.data!=dmx+24)return -1;
 if(!doomed_dmx_decode(dmx,103,&s)||!doomed_dmx_decode(0,104,&s))return -2;
 dmx[4]=48;if(!doomed_dmx_decode(dmx,104,&s))return -3;
 if(!doomed_mixer_init(&m,0)||doomed_mixer_init(&m,22050))return -4;
 if(!doomed_mixer_render(&m,pcm,513)||!doomed_mixer_render(&m,pcm,0))return -5;
 for(unsigned pass=0;pass<4;pass++){
  if(doomed_mixer_init(&m,outputs[pass]))return -6;
  for(unsigned c=0;c<4;c++){s.data=samples;s.length=96;s.rate=rates[c];if(doomed_mixer_start(&m,c,&s,127-c*19))return -7;}
  if(!doomed_mixer_start(&m,4,&s,127)||!doomed_mixer_start(&m,0,&s,128))return -8;
  if(doomed_mixer_render(&m,pcm,17)||doomed_mixer_pause(&m,1)||doomed_mixer_render(&m,pcm,31))return -9;
  for(unsigned j=0;j<31;j++)if(pcm[j])return -10;
  if(doomed_mixer_pause(&m,0))return -11;
  const unsigned counts[4]={1,127,512,97};uint32_t sum=2166136261u;
  for(unsigned b=0;b<4;b++){if(doomed_mixer_render(&m,pcm,counts[b]))return -12;
   for(unsigned j=0;j<counts[b];j++){uint16_t v=(uint16_t)pcm[j];sum=(sum^(v&255))*16777619u;sum=(sum^(v>>8))*16777619u;}}
  if(sum!=expected[pass])return -13;
  if(doomed_mixer_start(&m,0,&s,127)||doomed_mixer_stop(&m,0))return -14;
  doomed_mixer_stop_all(&m);if(doomed_mixer_render(&m,pcm,512))return -15;
  for(unsigned j=0;j<512;j++)if(pcm[j])return -16;
 }
 return 0;
}`;
fs.writeFileSync(path.join(out, 'vectors.c'), fixture, {flag: 'wx'});
const flags = ['-mthumb','-mfloat-abi=soft','-mlong-calls','-std=c17','-Os','-ffreestanding',
  '-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=4',
  '-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror',
  '-Idoom/platform-rw4/audio'];
run('gcc', ['-march=armv8-m.main',...flags,'-c','doom/platform-rw4/audio/pcm-core.c','-o',path.join(out,'rw4-core.o')]);
const s3Flags = ['-mcpu=cortex-a7', ...flags];
for (const [source, object] of [['doom/platform-rw4/audio/pcm-core.c','s3-core.o'],[path.join(out,'vectors.c'),'vectors.o']])
  run('gcc', [...s3Flags,'-c',source,'-o',path.join(out,object)]);
const elf = path.join(out,'s3-test.elf');
run('ld', ['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_audio_core_test_init',path.join(out,'vectors.o'),path.join(out,'s3-core.o'),'-o',elf]);
const elfBytes = fs.readFileSync(elf), readelf = run('readelf',['-W','-h','-s','-r',elf]);
assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(readelf));
assert([...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].every(m=>m[0]==='R_ARM_ABS32'));
assert.equal(elfBytes.readUInt16LE(16),1); assert.equal(elfBytes.readUInt16LE(18),40);
assert(elfBytes.readUInt32LE(24)&1); assert(elfBytes.length<65536);
fs.writeFileSync(path.join(out,'readelf.txt'),readelf);
const vm = session('audio-core'), remote='/tmp/doomed-audio-core-r358-verified.elf';
const before = vm.adb(['shell','lsmod'],'before');
assert(!/audio358/.test(before));
assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
vm.adb(['push',elf,remote],'push');
const copy=path.join(vm.folder,'readback.elf');vm.adb(['pull',remote,copy],'readback');
assert.equal(hash(fs.readFileSync(copy)),hash(elfBytes));
const loaded = vm.adb(['shell','insmod',remote,'audio358'],'run-vectors');
assert(!/failed|error/i.test(loaded));
assert(/audio358/.test(vm.adb(['shell','lsmod'],'loaded')),'C vector initializer did not pass');
vm.adb(['shell','rmmod','audio358'],'unload');
assert.equal(vm.adb(['shell','lsmod'],'after'),before);
vm.adb(['shell','rm',remote],'remove-own');
const result={passed:true,checksums:expected,rw4CoreCompiled:true,s3CoreExecuted:true,
  sourceSha256:hash(fs.readFileSync(path.join(root,'doom/platform-rw4/audio/pcm-core.c'))),
  moduleSha256:hash(elfBytes),firmwareAudioCalled:false,physicalWatchUsed:false,devicePlayback:false};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
