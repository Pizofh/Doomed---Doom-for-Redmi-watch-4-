// Real ARM C codec in owned S3 guest; independent Node reference PNG.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {inflateSync} from 'node:zlib';
import {firstCRoot as root,sha256} from './first-c-source.mjs';import {session} from './doom-ui-emulator.mjs';import {packageRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const s=session('rw-png-palette'),out=s.folder,tc=path.join(root,'tools/local/arm-14.3-review');
const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
const chunk=(name,b)=>{const n=Buffer.from(name),h=Buffer.alloc(4),c=Buffer.alloc(4);h.writeUInt32BE(b.length);c.writeUInt32BE(crc(Buffer.concat([n,b])));return Buffer.concat([h,n,b,c]);};
function indexedReference(kind){
 const colors=[],map=new Map(),rows=Buffer.alloc(64200),rgbRows=Buffer.alloc(192200),plte=Buffer.alloc(768);
 for(let i=0;i<64000;i++){
  const v=kind==='zero'?0:kind==='bw'?(i%2?65535:0):(((i%256)*97)^0xa55a)&65535;
  if(!map.has(v)){const index=colors.length;colors.push(v);map.set(v,index);const r=v>>>11,g=(v>>>5)&63,b=v&31;plte[index*3]=(r<<3)|(r>>>2);plte[index*3+1]=(g<<2)|(g>>>4);plte[index*3+2]=(b<<3)|(b>>>2);}
  const y=Math.floor(i/320),x=i%320,index=map.get(v);rows[y*321+1+x]=index;plte.copy(rgbRows,y*961+1+x*3,index*3,index*3+3);
 }
 let a=1,b=0;for(const v of rows){a=(a+v)%65521;b=(b+a)%65521;}
 const block=Buffer.alloc(5);block[0]=1;block.writeUInt16LE(rows.length,1);block.writeUInt16LE(65535-rows.length,3);
 const adler=Buffer.alloc(4);adler.writeUInt32BE(((b<<16)|a)>>>0);
 const z=Buffer.concat([Buffer.from([120,1]),block,rows,adler]);assert(inflateSync(z).equals(rows));
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(320);ihdr.writeUInt32BE(200,4);ihdr[8]=8;ihdr[9]=3;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('PLTE',plte),chunk('IDAT',z),chunk('IEND',Buffer.alloc(0))]);
 // Independently expand every indexed sample and compare with original RGB565 expansion.
 for(let i=0;i<64000;i++){const v=colors[rows[Math.floor(i/320)*321+1+i%320]],r=v>>>11,g=(v>>>5)&63,b=v&31,pos=Math.floor(i/320)*961+1+(i%320)*3;assert.equal(rgbRows[pos],(r<<3)|(r>>>2));assert.equal(rgbRows[pos+1],(g<<2)|(g>>>4));assert.equal(rgbRows[pos+2],(b<<3)|(b>>>2));}
 return png;
}
const expected=indexedReference('pattern');assert.equal(expected.length,65048);
const fnv=bytes=>{let n=0x811c9dc5;for(const x of bytes)n=Math.imul(n^x,16777619)>>>0;return n;};
fs.writeFileSync(path.join(out,'reference.png'),expected);
assert.equal(expected.subarray(29,33).toString('hex'),'aedac899','IHDR constant differs');
const samples=[0,29,32,33,37,40,41,808,809,812,813,817,820,821,822,823,827,828,829,1148,1149,65027,65028,65031,65032,65035,65036,65047].map(p=>({p,n:Math.min(257,expected.length-p)}));
let seed=331;for(let i=0;i<200;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const p=seed%expected.length;samples.push({p,n:Math.min(1+(seed%257),expected.length-p)});}
const probe=`#include "palette-view-r333.h"
#include <stddef.h>
extern int host_printf(const char *,...);
extern void prior_prepare(const unsigned char *);extern int prior_read(const unsigned char *,unsigned,char *,unsigned);
struct stamp { int64_t sec;int32_t ns,pad; };
extern int host_clock_gettime(int,struct stamp *);
static unsigned micros(void){struct stamp t;if(host_clock_gettime(1,&t))return 0;return(unsigned)t.sec*1000000u+(unsigned)t.ns/1000u;}
static unsigned char pixels[128000];static char bytes[257];static unsigned checks;
#define CHECK(c) do{checks++;if(!(c)){host_printf("PNG_VIEW_FAIL %u\\n",checks);return -1;}}while(0)
static uint32_t hash(const char *p,unsigned n){uint32_t c=2166136261u;for(unsigned i=0;i<n;i++)c=(c^(unsigned char)p[i])*16777619u;return c;}
int rw4_png_probe_init(void *unused){(void)unused;unsigned pos=0;
CHECK(rw4_image_read(NULL,0,bytes,33)==33);CHECK(rw4_image_read(NULL,32,bytes,2)==-11);
CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES,NULL,0)==0);CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES,bytes,1)==0);
CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES+1,bytes,1)==-22);CHECK(rw4_image_read(NULL,0,NULL,1)==-22);
CHECK(rw4_image_seek(&pos,-1,0)==-22);CHECK(rw4_image_seek(&pos,0,2)==RW4_IMAGE_BYTES);
CHECK(rw4_image_seek(&pos,INT64_MAX,1)==-22);CHECK(rw4_image_seek(&pos,INT64_MIN,1)==-22);
CHECK(rw4_image_seek(&pos,1,2)==-22);CHECK(rw4_image_seek(&pos,0,3)==-22);CHECK(rw4_image_seek(NULL,0,0)==-22);
for(unsigned i=0;i<64000;i++){unsigned v=(((i%256u)*97u)^0xa55au)&65535u;pixels[2*i]=(unsigned char)v;pixels[2*i+1]=(unsigned char)(v>>8);}
CHECK(rw4_image_prepare(pixels)==0);uint32_t c=2166136261u;pos=0;
while(pos<RW4_IMAGE_BYTES){int n=rw4_image_read(pixels,pos,bytes,sizeof(bytes));CHECK(n>0&&n<=(int)sizeof(bytes));for(int i=0;i<n;i++)c=(c^(unsigned char)bytes[i])*16777619u;pos+=(unsigned)n;}
CHECK(c==${fnv(expected)}u);
${samples.map(({p,n})=>`CHECK(rw4_image_read(pixels,${p}u,bytes,${n}u)==${n});CHECK(hash(bytes,${n}u)==${fnv(expected.subarray(p,p+n))}u);`).join('\n')}
CHECK(rw4_image_prepare(NULL)==-22);CHECK(rw4_image_read(pixels,41,bytes,1)==-11);
CHECK(rw4_image_prepare(pixels)==0);CHECK(rw4_image_read(pixels,65047u,bytes,257)==1);
prior_prepare(pixels);unsigned oldprep=0,oldread=0,newprep=0,newread=0;
for(unsigned round=0;round<3;round++){
 unsigned t=micros();CHECK(t!=0);prior_prepare(pixels);oldprep+=micros()-t;
 t=micros();for(unsigned at=0;at<192278u;at+=sizeof(bytes))CHECK(prior_read(pixels,at,bytes,sizeof(bytes))>0);oldread+=micros()-t;
 t=micros();rw4_image_prepare(pixels);newprep+=micros()-t;
 t=micros();for(unsigned at=0;at<RW4_IMAGE_BYTES;at+=sizeof(bytes))CHECK(rw4_image_read(pixels,at,bytes,sizeof(bytes))>0);newread+=micros()-t;
}
host_printf("PNG_SPEED oldprep=%u oldread=%u newprep=%u newread=%u rounds=3\\n",oldprep,oldread,newprep,newread);
for(unsigned i=0;i<257;i++){unsigned v=((i*97u)^0xa55au)&65535u;pixels[2*i]=(unsigned char)v;pixels[2*i+1]=(unsigned char)(v>>8);}
CHECK(rw4_image_prepare(pixels)==-75);CHECK(rw4_image_read(pixels,33,bytes,1)==-11);
for(unsigned kind=0;kind<2;kind++){
 for(unsigned i=0;i<64000;i++){unsigned v=kind&&(i%2)?65535u:0u;pixels[2*i]=(unsigned char)v;pixels[2*i+1]=(unsigned char)(v>>8);}
 CHECK(rw4_image_prepare(pixels)==0);uint32_t h=2166136261u;
 for(unsigned at=0;at<RW4_IMAGE_BYTES;){int n=rw4_image_read(pixels,at,bytes,sizeof(bytes));CHECK(n>0);for(int j=0;j<n;j++)h=(h^(unsigned char)bytes[j])*16777619u;at+=(unsigned)n;}
 CHECK(h==(kind?${fnv(indexedReference('bw'))}u:${fnv(indexedReference('zero'))}u));
}
host_printf("PNG_VIEW_OK checks=%u bytes=%u fnv=%08lx\\n",checks,RW4_IMAGE_BYTES,(unsigned long)c);return 0;}
`;
const source=path.join(out,'probe.c');fs.writeFileSync(source,probe);const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576});logs.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'toolchain');
const flags=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4/device'];
for(const [p,n]of [[source,'probe'],['doom/platform-rw4/device/palette-view-r333.c','png'],['doom/platform-rw4/device/png-view-fast-r331.c','prior']])run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,...(n==='prior'?['-Drw4_image_prepare=prior_prepare','-Drw4_image_read=prior_read','-Drw4_image_seek=prior_seek']:[]),'-c',p,'-o',path.join(out,n+'.o')],n);
const ui=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ui/ui-review.json'))),printf=ui.bindings.find(b=>b.name==='printf')?.address;if(!ui.contractReviewed||!printf)throw Error('HostContractChanged');
const guest=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));let clock;
for(let i=0;i<guest.readUInt16LE(48);i++){const p=guest.readUInt32LE(32)+i*guest.readUInt16LE(46);if(guest.readUInt32LE(p+4)!==2)continue;const q=guest.readUInt32LE(32)+guest.readUInt32LE(p+24)*guest.readUInt16LE(46),strings=guest.subarray(guest.readUInt32LE(q+16),guest.readUInt32LE(q+16)+guest.readUInt32LE(q+20));for(let x=guest.readUInt32LE(p+16),end=x+guest.readUInt32LE(p+20);x<end;x+=16){const n=guest.readUInt32LE(x);if(strings.toString('ascii',n,strings.indexOf(0,n))==='clock_gettime'&&(guest[x+12]&15)===2&&guest.readUInt16LE(x+14))clock=guest.readUInt32LE(x+4);}}if(!clock)throw Error('MonotonicClockAbsent');
const elf=path.join(out,'probe.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_png_probe_init','--defsym=host_printf='+printf,'--defsym=host_clock_gettime='+clock,path.join(out,'probe.o'),path.join(out,'png.o'),path.join(out,'prior.o'),'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-s','-r',elf],'review');if(/\bUND[ \t]+\S+[ \t]*$/m.test(re)||fs.statSync(elf).size>32768||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('ElfContract');
const remote='/tmp/rw4-png-fast-r333.elf',module='rw4png331',before=s.adb(['shell','lsmod'],'before');
if(before.includes(module)||!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',remote],'absence')))throw Error('ScratchOccupied');
s.adb(['push',elf,remote],'push');const back=path.join(out,'readback.elf');s.adb(['pull',remote,back],'readback');assert.equal(sha256(fs.readFileSync(back)),sha256(fs.readFileSync(elf)));
const output=s.adb(['shell','insmod',remote,module],'run'),match=output.match(/PNG_VIEW_OK checks=(\d+) bytes=65048 fnv=([a-f0-9]{8})/);if(!match)throw Error('ProbeFailedInspectGuestNoAutomaticUnload');assert.equal(match[2],fnv(expected).toString(16).padStart(8,'0'));
s.adb(['shell','rmmod',module],'unload');assert.equal(s.adb(['shell','lsmod'],'after'),before);s.adb(['shell','rm',remote],'remove');
const timing=output.match(/PNG_SPEED oldprep=(\d+) oldread=(\d+) newprep=(\d+) newread=(\d+) rounds=3/);if(!timing)throw Error('TimingAbsent');const perf={oldPrepareUs:+timing[1],oldReadUs:+timing[2],newPrepareUs:+timing[3],newReadUs:+timing[4],rounds:3,emulatorOnly:true};
const result={checkpoint:'R333',perf,passed:true,checks:Number(match[1]),pngBytes:expected.length,expectedSha256:sha256(expected),fnv:match[2],codecSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/palette-view-r333.c'))),priorCodecSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/png-view-fast-r331.c'))),headerSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/palette-view-r333.h'))),nativeCExecuted:true,physicalTransport:false,flashFrameWrites:0,extraEncodedFrameAllocation:0,decoderTested:false,indexedPixelExpansionCompared:true,overflowRejected:true,moduleRemoved:true};
const evidence=path.join(root,'artifacts/doom-png-palette-r333');fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'codec-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
console.log(JSON.stringify({referenceIhdrCrc:expected.subarray(29,33).toString('hex')}));
