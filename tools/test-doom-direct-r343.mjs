// Real S3 Doom + pthreads, graphics model. No watch commands or RW4 execution.
import fs from 'node:fs';import path from 'node:path';import {root,sha256} from './doom-demand-source-r337.mjs';import {session} from './doom-ui-emulator.mjs';import {verifyShareware} from './wad-data.mjs';
if(process.argv.length!==2)throw Error('FixedTest');const out=path.join(root,'build/doom-direct-r343/s3-model'),r=JSON.parse(fs.readFileSync(path.join(out,'review.json'))),elf=path.join(out,'doom.elf');
if(r.graphics!=='modeled'||r.rw4Executable!==false||r.elfSha256!==sha256(fs.readFileSync(elf)))throw Error('WrongCandidate');
const s=session('doom-direct-engine'),remote='/tmp/rw4-doom-direct-r343.elf',script='/tmp/rw4-doom-direct-r343.lua',absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t);
const before=s.adb(['shell','lsmod'],'before');if(before.trim().split(/\r?\n/).length!==1||!before.includes('NAME'))throw Error('ModulesPresent');
for(const p of [remote,script,'/dev/rw4doomdirect'])if(!absent(s.adb(['shell','ls',p],'absence')))throw Error('Collision');
const wad=path.join(s.folder,'doom1.wad');s.adb(['pull','/data/app/watchface/market/365799913/lua/doom1.wad',wad],'wad');verifyShareware(fs.readFileSync(wad));
s.adb(['push',elf,remote],'elf');s.adb(['push',path.join(root,'experiments/doom-runtime-rw4/direct-engine-r343.lua'),script],'script');
const cycles=[];for(let i=0;i<2;i++){const text=s.adb(['shell','lua',script],'cycle-'+i),m=text.match(/DIRECT_ENGINE_STATS\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);if(!m||!text.includes('DIRECT_ENGINE_R343_OK'))throw Error('EngineTestFailedInspectOwnGuest');if(s.adb(['shell','lsmod'],'after-'+i)!==before)throw Error('RetainedModule');cycles.push({peakBytes:+m[1],allocated:+m[2],freed:+m[3],presentations:+m[4],colorBuckets:+m[5],gametic:+m[6]});}
for(const p of [remote,script])s.adb(['shell','rm',p],'remove-own');
const result={checkpoint:'R343',passed:true,cycles,realDoom:true,realThreads:true,graphics:'modeled',backpressure:true,moveTurnFire:true,pauseResume:true,rejectedCommandsPerCycle:6,stopRealJoinDirectCloseUnload:true,physicalTransport:false,rw4Executed:false};fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
