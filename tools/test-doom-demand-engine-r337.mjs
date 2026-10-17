// Execute the S3-only candidate twice; no physical backend or native RW4 ELF.
import fs from 'node:fs';import path from 'node:path';
import {session} from './doom-ui-emulator.mjs';import {firstCRoot as root,sha256} from './first-c-source.mjs';import {verifyShareware} from './wad-data.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const out=path.join(root,'build/doom-demand-r337/s3'),review=JSON.parse(fs.readFileSync(path.join(out,'review.json'))),elf=path.join(out,'doom.elf');
if(review.rw4Executable!==false||review.realEngine!==true||review.elfSha256!==sha256(fs.readFileSync(elf)))throw Error('WrongCandidate');
const s=session('doom-demand-engine'),top='/tmp/rw4-doom-demand-r337',remote=top+'.elf',script=top+'.lua';
const absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t);
const before=s.adb(['shell','lsmod'],'before-modules');if(before.trim().split(/\r?\n/).length!==1||!before.includes('NAME'))throw Error('ModulesPresent');
for(const p of [remote,script,'/dev/rw4doomctl','/dev/rw4doomframe','/dev/rw4doomimage.png'])if(!absent(s.adb(['shell','ls',p],'absence')))throw Error('Collision');
if(/not found|usage|invalid|failed/i.test(s.adb(['shell','usleep','1'],'delay-command')))throw Error('NoDelayCommand');
const wad=path.join(s.folder,'doom1.wad');s.adb(['pull','/data/app/watchface/market/365799913/lua/doom1.wad',wad],'wad');verifyShareware(fs.readFileSync(wad));
s.adb(['push',elf,remote],'elf');const readback=path.join(s.folder,'elf-readback.elf');s.adb(['pull',remote,readback],'readback');if(sha256(fs.readFileSync(readback))!==review.elfSha256)throw Error('ElfChanged');
s.adb(['push',path.join(root,'experiments/doom-runtime-rw4/demand-engine-r337.lua'),script],'script');
const cycles=[];
for(let cycle=0;cycle<2;cycle++){
 const text=s.adb(['shell','lua',script],'cycle-'+cycle),m=text.match(/DEMAND_STATS\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
 if(!text.includes('RW4_DEMAND_OK')||!text.includes('DEMAND_FULL')||!m)throw Error('LowMemoryTestFailedInspectArtifacts');
 if(s.adb(['shell','lsmod'],'after-'+cycle)!==before)throw Error('ModuleRetained');
 cycles.push({peakBytes:Number(m[1]),allocated:Number(m[2]),freed:Number(m[3]),uniqueColors:Number(m[4])});
}
for(const p of [remote,script])s.adb(['shell','rm',p],'remove');
const result={checkpoint:'R337',passed:true,zoneMiB:4,cycles,originalE1M1:true,movementTurnFire:true,pauseResume:true,stopJoinUnload:true,physicalTransport:false,rw4Executable:false};
fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
