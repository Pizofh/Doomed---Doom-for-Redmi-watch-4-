// Compile-only engine audit. Output intentionally has unresolved imports; never load.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';

const mode=process.argv[2]??'build';
if(process.argv.length>3||!['build','inspect','shim','inspect-shim','first','inspect-first'].includes(mode))throw Error('Only build/inspect/shim/inspect-shim/first/inspect-first accepted; no runtime target');
const firstBuild=mode==='first'||mode==='inspect-first';
const withShim=mode==='shim'||mode==='inspect-shim'||firstBuild;
const inspectOnly=mode.startsWith('inspect');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const guestHash = '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
const root = path.join(projectRoot, 'tools/local/arm-14.3-review');
const pins = {
  'bin/arm-none-eabi-gcc.exe': '6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4',
  'bin/arm-none-eabi-objdump.exe': 'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1',
  'bin/arm-none-eabi-readelf.exe': 'e0f53e6cf812ca2a240b57fee99b6e77ec28cc515cc65c93d8ab0573b522d1c6',
  'libexec/gcc/arm-none-eabi/14.3.1/cc1.exe': '553e335a64f1bf784311202578e7102f2338930d3af3b39b7e1fa474adb0cf84',
  'arm-none-eabi/bin/as.exe': '3730b6d3752f021f4718e331b8f1295bb737ab5d9ee5b40ed7537958eb40a35f',
  'arm-none-eabi/bin/ld.exe': '041ff41f439498450235ecd561bd1365136e7969bb30705c5ddd5a2e3cba3132'
};
for (const [file, expected] of Object.entries(pins)) {
  if (hash(fs.readFileSync(path.join(root, file))) !== expected) throw new Error(`Reviewed tool changed: ${file}`);
}
const logs = [];
function run(exe, args) {
  const result = spawnSync(exe, args, { cwd: projectRoot, shell: false, windowsHide: true,
    timeout: 20000, maxBuffer: 2 * 1024 * 1024, encoding: 'utf8' });
  logs.push({ exe, args, status: result.status, stdout: result.stdout, stderr: result.stderr });
  if (result.error || result.status !== 0) throw new Error(`Tool failed: ${path.basename(exe)} ${result.error?.message ?? result.stderr}`);
  return result.stdout;
}
const manifest=JSON.parse(fs.readFileSync(path.join(projectRoot,'doom/doomgeneric-source.lock.json')));
if(manifest.revision!=='dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284'||manifest.files.length!==181)throw Error('Unexpected upstream snapshot');
const upstream=path.join(projectRoot,'third_party/doomgeneric');
for(const e of manifest.files){
  if(!/^(?:LICENSE|README\.TXT|README\.md|doomgeneric\/(?:[a-z0-9_]+\.[ch]|Makefile))$/.test(e.path))throw Error('Unsafe manifest path');
  const file=path.join(upstream,e.path);if(fs.lstatSync(file).isSymbolicLink())throw Error('Source link');
  const bytes=fs.readFileSync(file),blob=crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if(bytes.length!==e.size||blob!==e.gitBlobSha1)throw Error('Upstream source changed: '+e.path);
}
if(hash(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest image changed');
const make=fs.readFileSync(path.join(upstream,'doomgeneric/Makefile'),'utf8');
const sources=make.match(/^SRC_DOOM = (.+)$/m)[1].trim().split(/\s+/).map(n=>n.replace(/\.o$/,'.c')).filter(n=>n!=='doomgeneric_xlib.c');
if(sources.length!==80||sources.some(n=>!manifest.files.some(e=>e.path==='doomgeneric/'+n)))throw Error('Source recipe changed');
const relativeDestination=firstBuild?'build/doom-first-frame':withShim?'build/doom-shim-audit':'build/doom-audit';
const destination=path.join(projectRoot,relativeDestination);fs.mkdirSync(destination,{recursive:true});
const flags=['-mcpu=cortex-a7','-mthumb','-mfpu=neon-vfpv4','-mfloat-abi=hard','-mlong-calls',
  '-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fcommon','-fno-unwind-tables','-fno-asynchronous-unwind-tables',
  '-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-DNORMALUNIX','-D_DEFAULT_SOURCE',
  '-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Ithird_party/doomgeneric/doomgeneric'];
const baseFlagCount=flags.length;
if(withShim)flags.push('-ffunction-sections','-falign-functions=4','-DRW4_ENGINE',
  '-Idoom/platform-rw4/compat','-Idoom/platform-rw4','-include','doom/platform-rw4/runtime.h');
if(firstBuild)flags.push('-include','doom/platform-rw4/long-calls.h');
// Compiler's newlib headers are used only to find compile/import issues.
// Their FILE, stderr, struct stat and related ABI are NOT approved guest ABI.
const objects=[];
const artifact=relativeDestination+'/engine-audit.o';
const shimSources=['doom/platform-rw4/runtime.c','doom/platform-rw4/runtime.h','doom/platform-rw4/module.ld',
  'doom/platform-rw4/compat/stdio.h','doom/platform-rw4/compat/ctype.h','doom/platform-rw4/compat/sys/stat.h'];
const shimSourceSha256=withShim?hash(shimSources.map(p=>fs.readFileSync(path.join(projectRoot,p),'utf8').replace(/\r\n/g,'\n')).join('\n')):null;
if(withShim){
  let overlay=fs.readFileSync(path.join(upstream,'doomgeneric/i_system.c'),'utf8').replace(/\r\n/g,'\n');
  const replacements=[[/void I_Quit \(void\)\n\{[\s\S]*?\n\}/,'void I_Quit (void)\n{\n    rw4_exit(0);\n}'],
    [/void I_Error \(char \*error, \.\.\.\)\n\{[\s\S]*?\n\}/,'void I_Error (char *error, ...)\n{\n    va_list args;\n    va_start(args, error);\n    rw4_error(error, args);\n}']];
  for(const[match,replace]of replacements){if((overlay.match(new RegExp(match.source,'g'))??[]).length!==1)throw Error('Exit overlay anchor changed');overlay=overlay.replace(match,replace);}
  if(inspectOnly){if(fs.readFileSync(path.join(destination,'i_system.c'),'utf8')!==overlay)throw Error('Generated exit overlay changed');}
  else fs.writeFileSync(path.join(destination,'i_system.c'),overlay);
}
try{
  if(inspectOnly){
    const prior=JSON.parse(fs.readFileSync(path.join(destination,'result.json')));
    if(prior.sha256!==hash(fs.readFileSync(path.join(destination,'engine-audit.o')))||
       prior.sha256!==(firstBuild?'50d8fb8911766fb0285eedd81e3965be7b923562c7a3782abd87e068c6a21c8e':withShim?'0281a7dc95222408d41c3eb05cc83ae4531b899b104995bfb7537f0484bd4f3b':'30ba8ead4ca94fd69d661d774edd3a9fbd449dfe68696798ad4519c7daa56366')||
       (withShim&&shimSourceSha256!=='8571e1c5da855a3b46721b204c1d833810bc5a1d61cfc0df5fc409510afbc8a0')||
       JSON.stringify(prior.flags)!==JSON.stringify(flags))throw Error('Inspect only the already audited artifact');
  }else{
    for(const name of sources){
      const obj=relativeDestination+'/'+name.replace(/\.c$/,'.o');
      const src=withShim&&name==='i_system.c'?relativeDestination+'/i_system.c':'third_party/doomgeneric/doomgeneric/'+name;
      run(path.join(root,'bin/arm-none-eabi-gcc.exe'),[...flags,'-c',src,'-o',obj]);objects.push(obj);
    }
    if(withShim){
      const shimFlags=flags.slice(0,baseFlagCount); // no engine remapping in raw shim
      const obj=relativeDestination+'/runtime.o';
      run(path.join(root,'bin/arm-none-eabi-gcc.exe'),[...shimFlags,'-ffunction-sections','-falign-functions=4','-Idoom/platform-rw4','-c','doom/platform-rw4/runtime.c','-o',obj]);objects.push(obj);
    }
    run(path.join(root,'arm-none-eabi/bin/ld.exe'),['-r',...(withShim?['-T','doom/platform-rw4/module.ld']:[]),...objects,'-o',artifact]);
  }
  const readelf=run(path.join(root,'bin/arm-none-eabi-readelf.exe'),['-W','-h','-S','-s','-r',artifact]);
  fs.writeFileSync(path.join(destination,'engine-readelf.txt'),readelf);
  const imports=[...readelf.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m=>m[1]).sort();
  if(withShim&&['_impure_ptr','_ctype_','abs','exit','system','mkdir','remove','rename','fwrite','fflush','calloc','realloc','strdup','stderr'].some(n=>imports.includes(n)))throw Error('Unwrapped engine resource/private ABI import');
  // Read names from the already hash-pinned ELF; do not dump its large symtab.
  const guest=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));
  const exportedNames=new Set(),shoff=guest.readUInt32LE(32),shsize=guest.readUInt16LE(46),shcount=guest.readUInt16LE(48);
  for(let i=0;i<shcount;i++){
    const p=shoff+i*shsize;if(guest.readUInt32LE(p+4)!==2)continue;
    const offset=guest.readUInt32LE(p+16),size=guest.readUInt32LE(p+20),stride=guest.readUInt32LE(p+36);
    const linked=shoff+guest.readUInt32LE(p+24)*shsize;
    const strings=guest.subarray(guest.readUInt32LE(linked+16),guest.readUInt32LE(linked+16)+guest.readUInt32LE(linked+20));
    if(stride!==16||offset+size>guest.length)throw Error('Unexpected pinned symtab');
    for(let at=offset;at<offset+size;at+=stride){
      if(guest.readUInt16LE(at+14)===0)continue;
      const name=guest.readUInt32LE(at),end=strings.indexOf(0,name);
      if(end<name)throw Error('Unexpected pinned string');exportedNames.add(strings.toString('ascii',name,end));
    }
  }
  const stack=[];
  for(const name of [...sources,...(withShim?['runtime.c']:[])]){
    const file=path.join(destination,name.replace(/\.c$/,'.su'));
    for(const l of fs.readFileSync(file,'utf8').trim().split(/\r?\n/)){
      const [where,n,type]=l.split('\t');if(where)stack.push({where,bytes:Number(n),type});
    }
  }
  const sections=readelf.split(/\r?\n/).filter(l=>/\]\s+\.(?:text|rodata(?:\.str1\.1)?|data|bss)\s/.test(l));
  const common=[...readelf.matchAll(/^\s*\d+:\s*([a-f0-9]+)\s+(\d+)\s+\S+\s+\S+\s+\S+\s+COM\s+(\S+)/gm)]
    .map(m=>({name:m[3],size:Number(m[2]),alignment:Number.parseInt(m[1],16)}));
  const commonBytes=common.reduce((n,e)=>n+e.size,0);
  const allocatedSectionBytes=sections.reduce((n,l)=>n+Number.parseInt(l.match(/\]\s+\S+\s+\S+\s+\S+\s+\S+\s+(\S+)/)[1],16),0);
  const compilerLogs=inspectOnly?JSON.parse(fs.readFileSync(path.join(destination,'build-log.json'))):logs;
  const output=fs.readFileSync(path.join(destination,'engine-audit.o'));
  const reviewedShimImports=['__errno','clearerr','fclose','feof','ferror','fopen','fread','free','fseek','ftell','longjmp','malloc','nxsched_gettid','printf','setjmp','vsnprintf'];
  const record={revision:manifest.revision,guestSha256:guestHash,filesCompiled:sources.length,withShim,shimSourceSha256,
    overlaySha256:withShim?hash(fs.readFileSync(path.join(destination,'i_system.c'))):null,
    flags,sha256:hash(output),bytes:output.length,sections,
    unresolvedImports:imports.map(name=>({name,guestSymbolPresent:exportedNames.has(name),abiReviewed:withShim&&reviewedShimImports.includes(name)})),
    commonSymbols:common.length,commonBytes,allocatedSectionBytes,
    staticBytesBeforeAlignment:allocatedSectionBytes+commonBytes,
    largestFunctionStack:stack.toSorted((a,b)=>b.bytes-a.bytes).slice(0,12),
    dynamicStackFunctions:stack.filter(s=>s.type!=='static'),warnings:compilerLogs.reduce((n,l)=>n+[...l.stderr.matchAll(/warning:/g)].length,0),
    headers:withShim?'Owned stdio/ASCII ctype; other newlib declarations not yet approved guest ABI':'Arm newlib, compile-audit only; not runtime ABI',soundEnabled:false,x11Included:false,
    linking:'ld -r, no libc/libm/libgcc imports bound',contractReviewed:false,loadableModule:false,guestExecuted:false,physicalTransport:false};
  fs.writeFileSync(path.join(destination,'result.json'),JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify(record,null,2));
}finally{fs.writeFileSync(path.join(destination,inspectOnly?'inspect-log.json':'build-log.json'),JSON.stringify(logs,null,2)+'\n');}
