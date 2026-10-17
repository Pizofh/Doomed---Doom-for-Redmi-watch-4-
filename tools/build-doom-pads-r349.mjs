// Reproduce Wide byte-for-byte, then replace only the key adapter and transport.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256,padsAdapter,padsTransport} from './doom-pads-source-r349.mjs';
const mode=process.argv[2];assert(process.argv.length===3&&['rw4','s3-ui','s3-model'].includes(mode));
const baseMode=mode==='s3-model'?'s3-ui':mode;
const old=path.join(root,'build/doom-wide-r347',baseMode),out=path.join(root,'build/doom-pads-r349',mode),tc=path.join(root,'tools/local/arm-14.3-review/bin');
assert(!fs.existsSync(path.join(out,'review.json')));fs.mkdirSync(out,{recursive:true});
const prior=JSON.parse(fs.readFileSync(path.join(old,'review.json'))),oldElf=fs.readFileSync(path.join(old,'doom.elf'));
assert.equal(sha256(oldElf),mode==='rw4'?'408caa1de2e6f6c697012be26b0a43645fd502e88b5259d932acff9b6d4a8275':'04e4b4f3f0ee3d3c1c36d15ec0522703d0fc60b78fb06082b7f785c4a261109a');
for(const[p,h]of Object.entries({...prior.sourceHashes,...prior.unchangedObjectHashes}))assert.equal(sha256(fs.readFileSync(path.join(root,p))),h,p);
const logs=[];function run(name,args,label){const r=spawnSync(path.join(tc,'arm-none-eabi-'+name+'.exe'),args,{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:8388608});logs.push({label,args,status:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync(path.join(out,'build-log.json'),JSON.stringify(logs,null,2));assert(!r.error&&r.status===0,label+': '+r.stderr);return r.stdout;}
const link=JSON.parse(fs.readFileSync(path.join(old,'build-log.json'))).find(l=>l.label==='link').args;
assert.equal(sha256(fs.readFileSync(path.join(old,'wide.o'))),sha256(fs.readFileSync(link.find(p=>p.endsWith('wide.o')))));
run('ld',link.map(p=>p===path.join(old,'doom.elf')?path.join(out,'baseline.elf'):p),'baseline');assert.equal(sha256(fs.readFileSync(path.join(out,'baseline.elf'))),sha256(oldElf));
const direct=path.join(root,'build/doom-direct-r343',baseMode),s3=mode!=='rw4';
const flags=[s3?'-march=armv7-a':'-march=armv8-m.main','-mthumb','-mfloat-abi=soft','-mlong-calls','-std=gnu17','-Os','-ffreestanding','-fno-builtin','-fno-common','-fno-pic','-ffunction-sections','-falign-functions=8','-fno-unwind-tables','-fno-asynchronous-unwind-tables','-fno-stack-protector','-fstack-usage','-Wall','-Wextra','-Werror','-Wno-misleading-indentation','-Idoom/platform-rw4','-Idoom/platform-rw4/device','-I'+direct,`-DRW4_GAME_WAD="/data/app/watchface/market/${s3?'365799913':'365219963'}/lua/doom1.wad"`];
for(const[i,text]of [padsAdapter(),padsTransport()].entries()){
 const src=path.join(out,i?'transport.c':'adapter.c');fs.writeFileSync(src,text);
 const extra=i?[]:['-DRW4_ENGINE','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Idoom/platform-rw4/compat','-Ithird_party/doomgeneric/doomgeneric','-include','doom/platform-rw4/runtime.h','-include','doom/platform-rw4/long-calls.h'];
 run('gcc',[...flags,...extra,'-c',src,'-o',path.join(out,'pads-'+i+'.o')],'compile-'+i);
}
const elf=path.join(out,'doom.elf');run('ld',link.map(p=>p===path.join(old,'doom.elf')?elf:p===path.join(direct,'direct-0.o')?path.join(out,'pads-0.o'):p===path.join(direct,'direct-1.o')?path.join(out,'pads-1.o'):mode==='s3-model'&&p===path.join(old,'wide.o')?path.join(root,'build/doom-direct-r343/s3-model/direct-2.o'):p),'link');
const re=run('readelf',['-W','-h','-A','-S','-s',elf],'review');assert(!/\bUND[ \t]+\S+[ \t]*$/m.test(re));assert(!/Tag_ABI_VFP_args: VFP registers/.test(re));fs.writeFileSync(path.join(out,'readelf.txt'),re);
function allocated(b){let n=0;for(let i=0;i<b.readUInt16LE(48);i++){const p=b.readUInt32LE(32)+i*b.readUInt16LE(46);if(b.readUInt32LE(p+8)&2)n+=b.readUInt32LE(p+20)+Math.max(0,b.readUInt32LE(p+32)-1);}return n;}
const bytes=fs.readFileSync(elf),extra=allocated(bytes)-allocated(oldElf);assert((mode==='s3-model'||extra>=0)&&extra<4096);
const result={...prior,checkpoint:'R349',mode,elfBytes:bytes.length,elfSha256:sha256(bytes),baselineSha256:sha256(oldElf),extraStaticBytes:extra,allocatedSectionBytesWithAlignment:allocated(bytes),controlVersion:5,keys:6,graphics:mode==='s3-model'?'modeled':mode,rw4Executable:!s3,sourceHashes:{...prior.sourceHashes,'tools/doom-pads-source-r349.mjs':sha256(fs.readFileSync(path.join(root,'tools/doom-pads-source-r349.mjs')))},generatedHashes:{adapter:sha256(padsAdapter()),transport:sha256(padsTransport())}};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({mode,bytes:bytes.length,sha256:result.elfSha256,extraStaticBytes:extra}));
