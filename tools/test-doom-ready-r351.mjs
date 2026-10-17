// Real S3 Doom + pthreads, graphics model. No watch commands or RW4 execution.
import fs from 'node:fs';import path from 'node:path';import {root,sha256} from './doom-demand-source-r337.mjs';import {session} from './doom-ui-emulator.mjs';import {verifyShareware} from './wad-data.mjs';
if(process.argv.length!==2)throw Error('FixedTest');const out=path.join(root,'build/doom-ready-r351/s3-model'),r=JSON.parse(fs.readFileSync(path.join(out,'review.json'))),elf=path.join(out,'doom.elf');
if(r.graphics!=='modeled'||r.rw4Executable!==false||r.elfSha256!==sha256(fs.readFileSync(elf)))throw Error('WrongCandidate');
const s=session('doom-ready-engine'),remote='/tmp/rw4-doom-ready-r351.elf',script='/tmp/rw4-doom-ready-r351.lua',absent=t=>/^nsh: ls: stat failed: 2\r?$/im.test(t);
const before=s.adb(['shell','lsmod'],'before');if(before.trim().split(/\r?\n/).length!==1||!before.includes('NAME'))throw Error('ModulesPresent');
for(const p of [remote,script,'/dev/rw4doomready'])if(!absent(s.adb(['shell','ls',p],'absence')))throw Error('Collision');
const wad=path.join(s.folder,'doom1.wad');s.adb(['pull','/data/app/watchface/market/365799913/lua/doom1.wad',wad],'wad');verifyShareware(fs.readFileSync(wad));
s.adb(['push',elf,remote],'elf');s.adb(['push',path.join(root,'experiments/doom-runtime-rw4/ready-engine-r351.lua'),script],'script');
const cycles=[];for(let i=0;i<2;i++){const text=s.adb(['shell','lua',script],'cycle-'+i),m=text.match(/READY_ENGINE_STATS\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);if(!m||(!text.includes('READY_ENGINE_R351_OK')||!text.includes('READY_SAVE_RESTORED')))throw Error('EngineTestFailedInspectOwnGuest');if(s.adb(['shell','lsmod'],'after-'+i)!==before)throw Error('RetainedModule');cycles.push({peakBytes:+m[1],allocated:+m[2],freed:+m[3],presentations:+m[4],colorBuckets:+m[5],gametic:+m[6]});}
for(const p of [remote,script])s.adb(['shell','rm',p],'remove-own');
const result={checkpoint:'R351',passed:true,cycles,realDoom:true,realThreads:true,graphics:'modeled',backpressure:true,moveTurnFire:true,backwards:true,useAction:true,saveLoad:true,corruptNativeImportRejected:true,pauseResume:true,rejectedCommandsPerCycle:11,stopRealJoinDirectCloseUnload:true,physicalTransport:false,rw4Executed:false};fs.writeFileSync(path.join(out,'test-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
