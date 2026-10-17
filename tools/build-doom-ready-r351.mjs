// Offline only. Reproduce the physical Pads ELF before replacing its port shim.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256,readyRuntime,readyAdapter,readyTransport} from './doom-ready-source-r351.mjs';
const mode=process.argv[2];assert(process.argv.length===3&&['rw4','s3-ui','s3-model'].includes(mode));
const s3=mode!=='rw4',out=path.join(root,'build/doom-ready-r351',mode),old=path.join(root,'build/doom-pads-r349',mode),tc=path.join(root,'tools/local/arm-14.3-review');
assert(!fs.existsSync(path.join(out,'review.json')));fs.mkdirSync(out,{recursive:true});const logs=[];
function run(name,args,label){const r=spawnSync(path.join(tc,'bin/arm-none-eabi-'+name+'.exe'),args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:8388608});logs.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));assert(!r.error&&r.status===0,label+': '+r.stderr);return r.stdout;}
const prior=JSON.parse(fs.readFileSync(path.join(old,'review.json'))),oldElf=fs.readFileSync(path.join(old,'doom.elf'));
assert.equal(sha256(oldElf),{rw4:'98d9082e606f213633c379593bb8b7937f9de3bbdf24f0c5269fa369001a0423','s3-ui':'bbd49829f150b33c659059bc8f226599b70309de49560f2aecd7679557d94aa4','s3-model':'1876b51d475c7696313b4dab629feee961fe29d9c91993263db447420e820873'}[mode]);
for(const[p,h]of Object.entries({...prior.sourceHashes,...prior.unchangedObjectHashes}))assert.equal(sha256(fs.readFileSync(path.join(root,p))),h,p);
const link=JSON.parse(fs.readFileSync(path.join(old,'build-log.json'))).find(x=>x.label==='link').args;
run('ld',link.map(p=>p===path.join(old,'doom.elf')?path.join(out,'baseline.elf'):p),'baseline');assert.equal(sha256(fs.readFileSync(path.join(out,'baseline.elf'))),sha256(oldElf));
const target=[s3?'-march=armv7-a':'-march=armv8-m.main','-mthumb','-mfloat-abi=soft'];
const flags=[...target,'-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-I'+path.join(root,'build/doom-direct-r343',s3?'s3-ui':'rw4'),`-DRW4_GAME_WAD="/data/app/watchface/market/${s3?'365799913':'365219963'}/lua/doom1.wad"`];
const texts=[readyAdapter(),readyTransport(),readyRuntime(),fs.readFileSync(path.join(root,'doom/platform-rw4/device/slot-r351.c'),'utf8')];
for(const[i,text]of texts.entries()){
 const src=path.join(out,['adapter','transport','runtime','slot'][i]+'.c');fs.writeFileSync(src,text);
 const extra=i===0?['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h']:i===2?[...['malloc','free','fopen','fclose','fread','fseek','ftell','feof','ferror','clearerr'].map(n=>'-D'+n+'=rw4_host_'+n),'-Dnxsched_gettid=rw4_host_owner_token']:[];
 run('gcc',[...flags,...extra,'-c',src,'-o',path.join(out,'ready-'+i+'.o')],'compile-'+i);
}
let engine;
if(!s3){
 const oldDir=path.join(root,'build/doom-rw4-libc'),review=JSON.parse(fs.readFileSync(path.join(oldDir,'review.json')));assert.equal(sha256(fs.readFileSync(path.join(oldDir,'engine-libc.o'))),review.elfSha256);
 const libs=review.libraries.map(l=>{const p=run('gcc',[...target,'-print-file-name='+l.name],l.name).trim();assert(path.resolve(p).toLowerCase().startsWith(tc.toLowerCase()+path.sep));assert.equal(sha256(fs.readFileSync(p)),l.sha256);return p;});
 engine=path.join(out,'engine-libc.o');run('ld',['-r','-d','-T','doom/platform-rw4/device/module.ld',path.join(root,'build/doom-rw4-engine/engine-port.o'),path.join(out,'ready-2.o'),path.join(root,'build/doom-rw4-engine/jump.o'),path.join(oldDir,'glue.o'),'--start-group',...libs,'--end-group','-o',engine],'engine-libc');
}
const elf=path.join(out,'doom.elf'),args=link.map(p=>p===path.join(old,'doom.elf')?elf:p===path.join(old,'pads-0.o')?path.join(out,'ready-0.o'):p===path.join(old,'pads-1.o')?path.join(out,'ready-1.o'):s3&&p===path.join(root,'build/doom-ram-s3/own-0.o')?path.join(out,'ready-2.o'):!s3&&p===path.join(root,'build/doom-rw4-libc/engine-libc.o')?engine:p);
args.splice(args.indexOf('--start-group'),0,path.join(out,'ready-3.o'));run('ld',args,'link');
const re=run('readelf',['-W','-h','-A','-S','-s','-r',elf],'review');assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(re));assert(!/Tag_ABI_VFP_args: VFP registers/.test(re));fs.writeFileSync(path.join(out,'readelf.txt'),re);
function allocated(b){let n=0;for(let i=0;i<b.readUInt16LE(48);i++){const p=b.readUInt32LE(32)+i*b.readUInt16LE(46);if(b.readUInt32LE(p+8)&2)n+=b.readUInt32LE(p+20)+Math.max(0,b.readUInt32LE(p+32)-1);}return n;}
const bytes=fs.readFileSync(elf),extra=allocated(bytes)-allocated(oldElf);assert(extra>196608&&extra<212992);
const sources=['tools/doom-ready-source-r351.mjs','doom/platform-rw4/device/slot-r351.c','doom/platform-rw4/device/slot-r351.h','doom/platform-rw4/device/ready-actions-r351.c'];
const result={checkpoint:'R351',mode,elfBytes:bytes.length,elfSha256:sha256(bytes),baselineSha256:sha256(oldElf),allocatedSectionBytesWithAlignment:allocated(bytes),extraStaticBytes:extra,controlVersion:6,keys:6,graphics:s3?(mode==='s3-ui'?'real S3 UI':'modeled'):'rw4',rw4Executable:!s3,pngCodec:false,sourceSize:[320,200],approxDisplaySize:[382.5,239.0625],pixelBytes:512000,slotCapacity:196608,nativeFilesystemWrites:false,sourceHashes:Object.fromEntries(sources.map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))])),generatedHashes:{adapter:sha256(texts[0]),transport:sha256(texts[1]),runtime:sha256(texts[2])},physicalDeploymentAuthorized:false,physicalTransport:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({mode,elfBytes:bytes.length,sha256:result.elfSha256,extraStaticBytes:extra}));
