// Build a bounded first-frame module for the exact PC guest. Never executes it.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
const relink=process.argv[2]==='relink';
if(process.argv.length>3||(process.argv[2]&&!relink))throw Error('Only optional relink accepted; no arbitrary target');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
const root=path.join(projectRoot,'tools/local/arm-14.3-review'),dest=path.join(projectRoot,'build/doom-first-frame');
const logs=[];
function run(exe,args,timeout=20000){
  const r=spawnSync(exe,args,{cwd:projectRoot,shell:false,windowsHide:true,encoding:'utf8',timeout,maxBuffer:2*1024*1024});
  logs.push({exe,args,status:r.status,stdout:r.stdout,stderr:r.stderr});
  if(r.error||r.status!==0)throw Error(path.basename(exe)+': '+(r.error?.message??r.stderr));return r.stdout;
}
// Core builder checks every tool, the guest and all 181 upstream Git blobs.
run(process.execPath,['tools/build-doom-audit.mjs',relink?'inspect-first':'first'],120000);
const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
if(hash(image)!==guestHash)throw Error('Guest changed');
const core=JSON.parse(fs.readFileSync(path.join(dest,'result.json')));
const symbols=new Map(),shoff=image.readUInt32LE(32),shsize=image.readUInt16LE(46),count=image.readUInt16LE(48);
for(let i=0;i<count;i++){
  const at=shoff+i*shsize;if(image.readUInt32LE(at+4)!==2)continue;
  const offset=image.readUInt32LE(at+16),size=image.readUInt32LE(at+20),stride=image.readUInt32LE(at+36);
  const link=shoff+image.readUInt32LE(at+24)*shsize;
  const strings=image.subarray(image.readUInt32LE(link+16),image.readUInt32LE(link+16)+image.readUInt32LE(link+20));
  if(stride!==16)throw Error('Unexpected pinned symtab');
  for(let p=offset;p<offset+size;p+=stride){
    if((image[p+12]&15)!==2||image.readUInt16LE(p+14)===0)continue;
    const off=image.readUInt32LE(p),end=strings.indexOf(0,off);
    symbols.set(strings.toString('ascii',off,end),image.readUInt32LE(p+4));
  }
}
const base=['-mcpu=cortex-a7','-mthumb','-mfpu=neon-vfpv4','-mfloat-abi=hard','-mlong-calls',
  '-falign-functions=4','-ffunction-sections','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common',
  '-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror',
  '-Idoom/platform-rw4','-Iexperiments/doom-first-frame'];
const engine=['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat',
  '-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h'];
const prefix='build/doom-first-frame/';
try{
  run(path.join(root,'bin/arm-none-eabi-gcc.exe'),[...base,...engine,'-c','experiments/doom-first-frame/adapter.c','-o',prefix+'adapter.o']);
  run(path.join(root,'bin/arm-none-eabi-gcc.exe'),[...base,'-c','experiments/doom-first-frame/lifecycle.c','-o',prefix+'lifecycle.o']);
  run(path.join(root,'arm-none-eabi/bin/ld.exe'),['-r','-d','-T','doom/platform-rw4/module.ld',prefix+'engine-audit.o',prefix+'adapter.o',prefix+'lifecycle.o','-o',prefix+'combined.o']);
  const table=run(path.join(root,'bin/arm-none-eabi-readelf.exe'),['-W','-s',prefix+'combined.o']);
  const imports=[...table.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m=>m[1]).sort();
  const allowed=['__aeabi_ldivmod','__errno','atof','atoi','clearerr','clock_gettime','clock_nanosleep','fabs','fclose','feof','ferror','fopen','fread','free','fseek','ftell','fwrite','longjmp','malloc','memcpy','memset','nxsched_gettid','printf','pthread_attr_destroy','pthread_attr_init','pthread_attr_setstacksize','pthread_create','pthread_join','putchar','puts','setjmp','sscanf','strcasecmp','strcmp','strlen','strncasecmp','strncmp','strncpy','strrchr','strstr','vsnprintf'];
  const bindings=imports.map(name=>{
    const address=symbols.get(name);if(!allowed.includes(name)||address===undefined||(!(address&1)&&(address&3)!==0))throw Error('Unreviewed import '+name);
    return {name,address:'0x'+address.toString(16)};
  });
  const output=prefix+'doom-first.elf';
  run(path.join(root,'arm-none-eabi/bin/ld.exe'),['-r','-e','rw4_doom_first_init',...bindings.map(s=>'--defsym='+s.name+'='+s.address),prefix+'combined.o','-o',output]);
  const elf=fs.readFileSync(path.join(projectRoot,output));
  const readelf=run(path.join(root,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-A','-S','-r','-s',output]);
  const types=[...new Set([...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m=>m[0]))];
  // Exact guest up_relocate switch10 -> 0x65c744 handles Thumb BL encoding.
  // Only four self-recursive calls within the same .text section are admitted.
  const thumbCalls=[...readelf.matchAll(/^([a-f0-9]+)\s+[a-f0-9]+\s+R_ARM_THM_CALL\s+([a-f0-9]+)\s+(\S+)$/gm)].map(m=>({offset:parseInt(m[1],16),value:parseInt(m[2],16),name:m[3]}));
  const recursive=['P_RecursiveSound','P_CrossBSPNode','R_RenderBSPNode','SHA1_Update'];
  const validThumb=thumbCalls.length===4&&thumbCalls.every(c=>{
    if(!recursive.includes(c.name))return false;
    const s=readelf.match(new RegExp('\\d+:\\s+([a-f0-9]+)\\s+(\\d+)\\s+FUNC\\s+\\S+\\s+\\S+\\s+1\\s+'+c.name+'\\s*$','m'));
    if(!s||(c.value&1)!==1)return false;const start=parseInt(s[1],16)&~1;
    return c.offset>=start&&c.offset+4<=start+Number(s[2])&&c.value===parseInt(s[1],16);
  });
  fs.writeFileSync(path.join(dest,'first-readelf.txt'),readelf);
  fs.writeFileSync(path.join(dest,'first-disassembly.txt'),['rw4_doom_first_init','rw4_first_body','DG_DrawFrame','DG_GetTicksMs','DG_SleepMs']
    .map(n=>run(path.join(root,'bin/arm-none-eabi-objdump.exe'),['-dr','--disassemble='+n,output])).join('\n'));
  if(elf.readUInt16LE(16)!==1||elf.readUInt16LE(18)!==40||(elf.readUInt32LE(24)&3)!==1||elf.readUInt32LE(36)!==0x5000000||
    elf.length>1024*1024||types.some(t=>!['R_ARM_ABS32','R_ARM_THM_CALL'].includes(t))||!validThumb||/\bUND[ \t]+\S+[ \t]*$/m.test(readelf)||/\bCOM[ \t]+\S+[ \t]*$/m.test(readelf))throw Error('Unreviewed module layout; not loadable');
  const inputs=['experiments/doom-first-frame/adapter.c','experiments/doom-first-frame/lifecycle.c','experiments/doom-first-frame/first-frame.h',
    'doom/platform-rw4/runtime.c','doom/platform-rw4/runtime.h','doom/platform-rw4/module.ld','doom/platform-rw4/long-calls.h',
    'doom/platform-rw4/compat/stdio.h','doom/platform-rw4/compat/ctype.h','doom/platform-rw4/compat/sys/stat.h'];
  const sourceSha256=hash(inputs.map(p=>fs.readFileSync(path.join(projectRoot,p),'utf8').replace(/\r\n/g,'\n')).join('\n'));
  const known={source:'a1125230f83a3bd515287967d3a3f5d366dc16ac66cfb00b1e64443b89e92dcc',binary:'f0f55f55cd72fab7052a3caaca40cbb43567ac9cf5bdcf4326280a8fa11a7539'};
  const record={guestSha256:guestHash,revision:core.revision,sha256:hash(elf),sourceSha256,inputs,bytes:elf.length,entry:elf.readUInt32LE(24),
    baseFlags:base,engineFlags:engine,bindings,relocationTypes:types,thumbCalls,relocations:[...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].length,
    coreSha256:core.sha256,overlaySha256:core.overlaySha256,contractReviewed:sourceSha256===known.source&&hash(elf)===known.binary,
    guestExecuted:false,physicalTransport:false};
  fs.writeFileSync(path.join(dest,'first-review.json'),JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify({bytes:record.bytes,entry:record.entry,sha256:record.sha256,sourceSha256,imports:bindings.length,
    relocations:record.relocations,types,contractReviewed:record.contractReviewed},null,2));
}finally{fs.writeFileSync(path.join(dest,'first-build-log.json'),JSON.stringify(logs,null,2)+'\n');}
