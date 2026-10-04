// Static exact-guest task ABI inspection only. Never runs the guest ELF.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No external inputs accepted');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const image=path.join(packageRoot,'system-images/vela-release-4.0/nuttx');
const exe=path.join(projectRoot,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const bytes=fs.readFileSync(image);
if(hash(bytes)!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa'||
   hash(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('Static inputs differ');
const folder=path.join(projectRoot,'artifacts/package-review/task');fs.mkdirSync(folder,{recursive:true});
function run(args){const r=spawnSync(exe,[...args,image],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:32*1024*1024});
  if(r.error||r.status!==0)throw Error('Static command failed');return r.stdout;}
const wanted=/^(?:pthread_(?:create|join|exit|start|startup|completejoin)|nx_pthread_create|nxsched_gettid|clock_(?:gettime|nanosleep)|printf)$/;
const selected=run(['-t']).split(/\r?\n/).filter(l=>wanted.test(l.trim().split(/\s+/).at(-1)));
fs.writeFileSync(path.join(folder,'symbols.txt'),selected.join('\n')+'\n');
for(const name of ['pthread_create','pthread_join','pthread_exit','pthread_start','pthread_completejoin','nx_pthread_create','pthread_startup'])
  fs.writeFileSync(path.join(folder,name+'.txt'),run(['-d','--disassemble='+name]));
// Debug evidence for thread defaults only; no attributes are guessed.
const shoff=bytes.readUInt32LE(32),size=bytes.readUInt16LE(46),count=bytes.readUInt16LE(48),namesIndex=bytes.readUInt16LE(50);
const namesAt=shoff+namesIndex*size,strings=bytes.subarray(bytes.readUInt32LE(namesAt+16),bytes.readUInt32LE(namesAt+16)+bytes.readUInt32LE(namesAt+20));
const config=[];
for(let i=0;i<count;i++){
  const at=shoff+i*size,off=bytes.readUInt32LE(at),end=strings.indexOf(0,off);
  if(strings.toString('ascii',off,end)!=='.debug_str')continue;
  const p=bytes.readUInt32LE(at+16),n=bytes.readUInt32LE(at+20);
  config.push(...bytes.subarray(p,p+n).toString('latin1').split('\0').filter(s=>
    /^(?:CONFIG_(?:PTHREAD[A-Z0-9_]*|DEFAULT_TASK_STACKSIZE|SCHED[A-Z0-9_]*|SMP(?:_[A-Z0-9_]+)?) |PTHREAD_(?:CREATE|STACK|CANCELED)[A-Z0-9_]* )/.test(s)));
}
fs.writeFileSync(path.join(folder,'config.json'),JSON.stringify([...new Set(config)].sort(),null,2)+'\n');
// Keep up to300 recent type definitions through the first pthread_t typedef.
const dwarf=await new Promise((resolve,reject)=>{
  const child=spawn(exe,['--dwarf=info','--dwarf-depth=3',image],{shell:false,windowsHide:true});
  let pending='',block=[],blocks=[],found=false,done=false,total=0;
  const timer=setTimeout(()=>{child.kill();reject(Error('DWARF timeout'));},30000);
  child.on('error',reject);
  child.stdout.on('data',chunk=>{
    if(done)return;total+=chunk.length;if(total>32*1024*1024){child.kill();reject(Error('DWARF bound exceeded'));return;}
    pending+=chunk.toString('utf8');const lines=pending.split('\n');pending=lines.pop();
    for(const line of lines){
      if(/^ <1>/.test(line)){
        if(block.some(l=>/DW_TAG_(?:base_type|typedef|structure_type)/.test(l)))blocks.push(block.join('\n'));
        if(found){done=true;clearTimeout(timer);child.kill();resolve(blocks.join('\n')+'\n');break;}
        block=[];
      }
      block.push(line);
      if(/DW_AT_name\s*:\s*(?:\([^)]*\):\s*)?pthread_t\s*$/.test(line))found=true;
      if(blocks.length>300)blocks.shift();
      if(block.length>300){
        if(found){child.kill();reject(Error('pthread_t definition exceeded bound'));break;}
        block=block.slice(-10);
      }
    }
  });
  child.on('close',code=>{clearTimeout(timer);if(!done)reject(Error('pthread_t not found: '+code));});
});
fs.writeFileSync(path.join(folder,'types-dwarf.txt'),dwarf);
console.log(JSON.stringify({folder,selected,config:[...new Set(config)],staticOnly:true},null,2));
