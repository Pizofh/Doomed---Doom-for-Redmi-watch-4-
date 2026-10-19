// SPDX-License-Identifier: GPL-2.0-only
// Exact codec/mixer vectors in owned S3; private real sound corpus stays ignored.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-ready-source-r351.mjs';import {session} from './doom-ui-emulator.mjs';import {encode,decode,advance} from './adpcm-reference-r386.mjs';
const out=path.join(root,'build/adpcm-r386');fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(path.join(out,'result.json')));
const s={value:0,index:0};assert.deepEqual([0,7,7,15].map(c=>advance(c,s)),[0,11,41,-22]);
const wad=fs.readFileSync(path.join(root,'build/doom2-r384/doom2.wad')),dir=wad.readUInt32LE(8),sounds=new Map();
for(let i=0;i<wad.readUInt32LE(4);i++){const p=dir+i*16,name=wad.toString('ascii',p+8,p+16).replace(/\0.*$/,'');if(name.startsWith('DS'))sounds.set(name,wad.readUInt32LE(p));}
const vectors=[],quality=[];let bytes=0;
for(const [name,at]of sounds){const rate=wad.readUInt16LE(at+2),raw=wad.subarray(at+24,at+8+wad.readUInt32LE(at+4)-16),stride=rate>=8000?2:1;
 const e=encode(raw,stride),decoded=decode(e.bytes,e.values.length);bytes+=e.bytes.length;
 let energy=0,error=0;for(let i=0;i<decoded.length;i++){energy+=e.values[i]**2;error+=(decoded[i]-e.values[i])**2;}
 quality.push({name,samples:e.values.length,bytes:e.bytes.length,snrDb:error?10*Math.log10(energy/error):99});
 // Real corpus prefixes at all alignments + full largest sample exercise bounds.
 if(vectors.length<12)vectors.push({raw:raw.subarray(0,Math.min(raw.length,255+vectors.length)),stride});
}
assert.equal(bytes,310485);assert.equal(sounds.size,107);
for(const n of [1,2,3,31,32,257,511])for(const stride of [1,2])vectors.push({raw:Buffer.from(Array.from({length:n},(_,i)=>(i*73+19)&255)),stride});
const declared=vectors.map((v,i)=>{const e=encode(v.raw,v.stride);return`static const uint8_t raw${i}[]={${[...v.raw]}},expected${i}[]={${[...e.bytes]}};\nstatic const int16_t pcm${i}[]={${decode(e.bytes,e.values.length)}};`;}).join('\n');
const checks=vectors.map((v,i)=>{const e=encode(v.raw,v.stride);return`{
 unsigned count=${e.values.length},n=${e.bytes.length};uint8_t encoded[${e.bytes.length+2}];for(unsigned j=0;j<n+2;j++)encoded[j]=0xa5;
 CHECK(doomed_adpcm_store(encoded+1,n,raw${i},sizeof(raw${i}),${v.stride})==(int)n);
 CHECK(encoded[0]==0xa5&&encoded[n+1]==0xa5);for(unsigned j=0;j<n;j++)CHECK(encoded[j+1]==expected${i}[j]);
 CHECK(doomed_adpcm_store(encoded+1,n-1,raw${i},sizeof(raw${i}),${v.stride})==-1);
 struct doomed_sample sample={encoded+1,count,22050,1};struct doomed_mixer mixer;int16_t pcm[512];
 CHECK(!doomed_mixer_init(&mixer,22050));CHECK(!doomed_mixer_start(&mixer,0,&sample,127));
 for(unsigned done=0;done<count;){unsigned block=count-done>17?17:count-done;CHECK(!doomed_mixer_render(&mixer,pcm,block));for(unsigned j=0;j<block;j++)CHECK(pcm[j]==pcm${i}[done+j]);done+=block;}
 CHECK(!mixer.voices[0].sample.data);CHECK(!doomed_mixer_render(&mixer,pcm,3));CHECK(!pcm[0]&&!pcm[1]&&!pcm[2]);
 CHECK(!doomed_mixer_start(&mixer,0,&sample,127));CHECK(!doomed_mixer_pause(&mixer,1));CHECK(!doomed_mixer_render(&mixer,pcm,9));CHECK(mixer.voices[0].position==0);
 CHECK(!doomed_mixer_pause(&mixer,0));CHECK(!doomed_mixer_render(&mixer,pcm,1));CHECK(pcm[0]==pcm${i}[0]);doomed_mixer_stop_all(&mixer);
}`;}).join('\n');
const mix=encode(Buffer.from(Array.from({length:257},(_,i)=>(i*29+19)&255)),1),linear=decode(mix.bytes,257),rates=[4000,11025,22050,48000],outputs=[8000,16000,22050,48000];
const hashes=outputs.map(rate=>{const voices=rates.map((r,i)=>({position:0,fraction:0,rate:r,volume:127-i*19}));let hash=2166136261;for(let i=0;i<754;i++){let value=0;for(const v of voices)if(v.position<linear.length){value+=Math.trunc(linear[v.position]*v.volume/127);v.fraction+=v.rate;v.position+=Math.floor(v.fraction/rate);v.fraction%=rate;}value=Math.max(-32768,Math.min(32767,value));for(const byte of [value&255,(value>>8)&255])hash=Math.imul(hash^byte,16777619)>>>0;}return hash;});
const mixerChecks=`
static const uint8_t shared[]={${[...mix.bytes]}};static const unsigned rates[4]={${rates}},outputs[4]={${outputs}},expected[4]={${hashes.map(x=>x+'u')}};
for(unsigned pass=0;pass<4;pass++){struct doomed_mixer mixer;int16_t pcm[512];CHECK(!doomed_mixer_init(&mixer,outputs[pass]));
 for(unsigned c=0;c<4;c++){struct doomed_sample s={shared,257,rates[c],1};CHECK(!doomed_mixer_start(&mixer,c,&s,127-c*19));}
 unsigned hash=2166136261u,counts[5]={1,17,127,512,97};for(unsigned k=0;k<5;k++){CHECK(!doomed_mixer_render(&mixer,pcm,counts[k]));for(unsigned j=0;j<counts[k];j++){unsigned v=(uint16_t)pcm[j];hash=(hash^(v&255))*16777619u;hash=(hash^(v>>8))*16777619u;}}CHECK(hash==expected[pass]);}
`;
const fixture=`#include "pcm-core.h"\n#include "adpcm-r386.h"\n#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)\n${declared}\nint rw4_adpcm_test_init(void *unused){(void)unused;${checks}\n${mixerChecks}\nint p=0;unsigned index=0;CHECK(!doomed_adpcm_step(7,&p,&index)&&p==11&&index==8);CHECK(doomed_adpcm_step(16,&p,&index)==-1);CHECK(!doomed_adpcm_bytes(0));return 0;}\n`;
const file=path.join(out,'vectors.c');fs.writeFileSync(file,fixture);const build=path.join(root,'build/doom-audio-r386/s3-model'),logs=JSON.parse(fs.readFileSync(path.join(build,'build-log.json'),'utf8'));
const flags=logs.find(r=>r.label==='pcm-core').args;const options=['-I'+build,...flags.slice(0,flags.indexOf('-c'))];
function run(tool,args){const r=spawnSync(path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-'+tool+'.exe'),args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:20000,maxBuffer:65536});assert.equal(r.status,0,r.stderr);return r.stdout;}
const obj=path.join(out,'vectors.o');run('gcc',[...options,'-c',file,'-o',obj]);const elf=path.join(out,'test.elf'),libgcc=run('gcc',['-march=armv7-a','-mthumb','-mfloat-abi=soft','-print-libgcc-file-name']).trim();
run('ld',['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_adpcm_test_init',obj,path.join(build,'pcm-core.o'),path.join(build,'adpcm.o'),libgcc,'-o',elf]);
assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(run('readelf',['-Ws',elf])));
const vm=session('adpcm-codec'),remote='/tmp/doomed-adpcm-r386.elf',module='adpcm386';const before=vm.adb(['shell','lsmod'],'before');assert.equal(before.trim().split(/\r?\n/).length,1);assert(/^nsh: ls: stat failed: 2\r?$/im.test(vm.adb(['shell','ls',remote],'absence')));
vm.adb(['push',elf,remote],'module');try{const text=vm.adb(['shell','insmod',remote,module],'vectors');assert(vm.adb(['shell','lsmod'],'loaded').includes(module),text);vm.adb(['shell','rmmod',module],'unload');assert.equal(vm.adb(['shell','lsmod'],'after'),before);}finally{if(vm.adb(['shell','lsmod'],'cleanup-check')===before)vm.adb(['shell','rm',remote],'remove-own');}
const result={passed:true,vectors:vectors.length,mixedFourVoicesAtFourRates:true,realCorpusEffects:107,cacheBytes:bytes,maxEncodedSampleBytes:Math.max(...quality.map(s=>s.bytes)),minSnrDb:Math.min(...quality.map(s=>s.snrDb)),meanSnrDb:quality.reduce((a,s)=>a+s.snrDb,0)/quality.length,
 goldenNibbleVector:true,boundsOddLengthsAndPauseRestart:true,referenceSha256:sha256(fs.readFileSync(path.join(root,'tools/adpcm-reference-r386.mjs'))),physicalWatchUsed:false};fs.writeFileSync(path.join(out,'quality.json'),JSON.stringify(quality,null,2)+'\n');fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
