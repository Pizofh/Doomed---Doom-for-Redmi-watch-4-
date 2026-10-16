// Real ARM C codec in owned S3 guest; independent Node reference PNG.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {inflateSync} from 'node:zlib';
import {firstCRoot as root,sha256} from './first-c-source.mjs';import {session} from './doom-ui-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const s=session('rw-png-view'),out=s.folder,tc=path.join(root,'tools/local/arm-14.3-review');
const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
const chunk=(name,b)=>{const n=Buffer.from(name),h=Buffer.alloc(4),c=Buffer.alloc(4);h.writeUInt32BE(b.length);c.writeUInt32BE(crc(Buffer.concat([n,b])));return Buffer.concat([h,n,b,c]);};
const rows=Buffer.alloc(192200);let a=1,b=0;
for(let i=0;i<64000;i++){const v=((i*97)^0xa55a)&65535,p=Math.floor(i/320)*961+1+(i%320)*3,r=v>>>11,g=(v>>>5)&63,blue=v&31;rows[p]=(r<<3)|(r>>>2);rows[p+1]=(g<<2)|(g>>>4);rows[p+2]=(blue<<3)|(blue>>>2);}
for(const v of rows){a=(a+v)%65521;b=(b+a)%65521;}
const z=[Buffer.from([120,1])];for(let p=0;p<rows.length;p+=65535){const n=Math.min(65535,rows.length-p),h=Buffer.alloc(5);h[0]=p+n===rows.length?1:0;h.writeUInt16LE(n,1);h.writeUInt16LE(65535-n,3);z.push(h,rows.subarray(p,p+n));}
const adler=Buffer.alloc(4);adler.writeUInt32BE(((b<<16)|a)>>>0);z.push(adler);assert(inflateSync(Buffer.concat(z)).equals(rows));
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(320);ihdr.writeUInt32BE(200,4);ihdr[8]=8;ihdr[9]=2;
const expected=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',Buffer.concat(z)),chunk('IEND',Buffer.alloc(0))]);assert.equal(expected.length,192278);
const fnv=bytes=>{let n=0x811c9dc5;for(const x of bytes)n=Math.imul(n^x,16777619)>>>0;return n;};
fs.writeFileSync(path.join(out,'reference.png'),expected);
assert.equal(expected.subarray(29,33).toString('hex'),'1666affc','IHDR constant differs');
const samples=[0,29,32,33,37,40,41,42,43,47,48,1000,65576,65578,65582,65583,131116,131118,192258,192261,192265,192266,192277].map(p=>({p,n:Math.min(257,expected.length-p)}));
const probe=`#include "png-view.h"
#include <stddef.h>
extern int host_printf(const char *,...);
static unsigned char pixels[128000];static char bytes[257];static unsigned checks;
#define CHECK(c) do{checks++;if(!(c)){host_printf("PNG_VIEW_FAIL %u\\n",checks);return -1;}}while(0)
static uint32_t hash(const char *p,unsigned n){uint32_t c=2166136261u;for(unsigned i=0;i<n;i++)c=(c^(unsigned char)p[i])*16777619u;return c;}
int rw4_png_probe_init(void *unused){(void)unused;unsigned pos=0;
CHECK(rw4_image_read(NULL,0,bytes,41)==41);CHECK(rw4_image_read(NULL,40,bytes,2)==-11);
CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES,NULL,0)==0);CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES,bytes,1)==0);
CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES+1,bytes,1)==-22);CHECK(rw4_image_read(NULL,0,NULL,1)==-22);
CHECK(rw4_image_seek(&pos,-1,0)==-22);CHECK(rw4_image_seek(&pos,0,2)==RW4_IMAGE_BYTES);
CHECK(rw4_image_seek(&pos,INT64_MAX,1)==-22);CHECK(rw4_image_seek(&pos,INT64_MIN,1)==-22);
CHECK(rw4_image_seek(&pos,1,2)==-22);CHECK(rw4_image_seek(&pos,0,3)==-22);CHECK(rw4_image_seek(NULL,0,0)==-22);
for(unsigned i=0;i<64000;i++){unsigned v=((i*97u)^0xa55au)&65535u;pixels[2*i]=(unsigned char)v;pixels[2*i+1]=(unsigned char)(v>>8);}
rw4_image_prepare(pixels);uint32_t c=2166136261u;pos=0;
while(pos<RW4_IMAGE_BYTES){int n=rw4_image_read(pixels,pos,bytes,sizeof(bytes));CHECK(n>0&&n<=(int)sizeof(bytes));for(int i=0;i<n;i++)c=(c^(unsigned char)bytes[i])*16777619u;pos+=(unsigned)n;}
CHECK(c==${fnv(expected)}u);
${samples.map(({p,n})=>`CHECK(rw4_image_read(pixels,${p}u,bytes,${n}u)==${n});CHECK(hash(bytes,${n}u)==${fnv(expected.subarray(p,p+n))}u);`).join('\n')}
rw4_image_prepare(NULL);CHECK(rw4_image_read(pixels,41,bytes,1)==-11);
rw4_image_prepare(pixels);CHECK(rw4_image_read(pixels,192277u,bytes,257)==1);
host_printf("PNG_VIEW_OK checks=%u bytes=%u fnv=%08lx\\n",checks,RW4_IMAGE_BYTES,(unsigned long)c);return 0;}
`;
const source=path.join(out,'probe.c');fs.writeFileSync(source,probe);const logs=[];
function run(exe,args,label){const r=spawnSync(exe,args,{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:30000,maxBuffer:1048576});logs.push({label,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));if(r.error||r.status!==0)throw Error('BuildFailed:'+label);return r.stdout;}
run(process.execPath,['tools/build-rw4-file-r214.mjs','verify-inputs'],'toolchain');
const flags=['-mcpu=cortex-a7','-mthumb','-mfloat-abi=hard','-mgeneral-regs-only','-mlong-calls','-ffunction-sections','-falign-functions=8','-std=c17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-Wall','-Wextra','-Werror','-Idoom/platform-rw4/device'];
for(const [p,n]of [[source,'probe'],['doom/platform-rw4/device/png-view.c','png']])run(path.join(tc,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',p,'-o',path.join(out,n+'.o')],n);
const ui=JSON.parse(fs.readFileSync(path.join(root,'build/doom-ui/ui-review.json'))),printf=ui.bindings.find(b=>b.name==='printf')?.address;if(!ui.contractReviewed||!printf)throw Error('HostContractChanged');
const elf=path.join(out,'probe.elf');run(path.join(tc,'arm-none-eabi/bin/ld.exe'),['-r','-T','doom/platform-rw4/device/module.ld','-e','rw4_png_probe_init','--defsym=host_printf='+printf,path.join(out,'probe.o'),path.join(out,'png.o'),'-o',elf],'link');
const re=run(path.join(tc,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-s','-r',elf],'review');if(/\bUND[ \t]+\S+[ \t]*$/m.test(re)||fs.statSync(elf).size>32768||[...re.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].some(m=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(m[0])))throw Error('ElfContract');
const remote='/tmp/rw4-png-view-r304.elf',module='rw4png304',before=s.adb(['shell','lsmod'],'before');
if(before.includes(module)||!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',remote],'absence')))throw Error('ScratchOccupied');
s.adb(['push',elf,remote],'push');const back=path.join(out,'readback.elf');s.adb(['pull',remote,back],'readback');assert.equal(sha256(fs.readFileSync(back)),sha256(fs.readFileSync(elf)));
const output=s.adb(['shell','insmod',remote,module],'run'),match=output.match(/PNG_VIEW_OK checks=(\d+) bytes=192278 fnv=([a-f0-9]{8})/);if(!match)throw Error('ProbeFailedInspectGuestNoAutomaticUnload');assert.equal(match[2],fnv(expected).toString(16).padStart(8,'0'));
s.adb(['shell','rmmod',module],'unload');assert.equal(s.adb(['shell','lsmod'],'after'),before);s.adb(['shell','rm',remote],'remove');
const result={checkpoint:'R304',passed:true,checks:Number(match[1]),pngBytes:expected.length,expectedSha256:sha256(expected),fnv:match[2],codecSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/png-view.c'))),headerSha256:sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/png-view.h'))),nativeCExecuted:true,physicalTransport:false,flashFrameWrites:0,extraEncodedFrameAllocation:0,decoderTested:false,moduleRemoved:true};
const evidence=path.join(root,'artifacts/doom-ram-png-r304');fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'codec-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
console.log(JSON.stringify({referenceIhdrCrc:expected.subarray(29,33).toString('hex')}));
