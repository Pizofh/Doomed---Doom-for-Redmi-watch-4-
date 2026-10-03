// Static DWARF inspection of the exact reviewed guest; no guest execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {projectRoot, packageRoot} from './verify-emulator.mjs';
const digest = b => crypto.createHash('sha256').update(b).digest('hex');
const executable = path.join(projectRoot,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const image = path.join(packageRoot,'system-images/vela-release-4.0/nuttx');
if (digest(fs.readFileSync(executable)) !== 'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1' ||
    digest(fs.readFileSync(image)) !== '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa') throw Error('Unreviewed input');
const result = await new Promise((resolve,reject) => {
  const child = spawn(executable,['--dwarf=info','--dwarf-depth=3',image],{shell:false,windowsHide:true});
  let pending='', current=[], collecting=false, finished=false, bytes=0;
  const timer=setTimeout(()=>{child.kill();reject(Error('Static inspection timeout'));},30000);
  child.on('error',reject);
  child.stdout.on('data',chunk=>{
    bytes+=chunk.length;
    if(bytes>32*1024*1024&&!finished){child.kill();reject(Error('DWARF search exceeds bound'));return;}
    pending+=chunk.toString('utf8');
    const lines=pending.split('\n'); pending=lines.pop();
    for(const line of lines){
      if(finished) break;
      if(/^ <1>/.test(line)) {
        if(collecting) { finished=true; clearTimeout(timer); child.kill(); resolve(current.join('\n')+'\n'); break; }
        current=[];
      }
      current.push(line);
      if(/DW_AT_name\s*:\s*(?:\([^)]*\):\s*)?file_operations\s*$/.test(line)) collecting=true;
      if(current.length>180) {
        if(collecting){child.kill();reject(Error('Unexpected structure length'));break;}
        current=current.slice(-10);
      }
    }
  });
  child.on('close',code=>{clearTimeout(timer);if(!finished)reject(Error('file_operations definition not found: '+code));});
});
fs.writeFileSync(path.join(projectRoot,'artifacts/package-review/bridge-file-operations-dwarf.txt'),result);
console.log(result);
