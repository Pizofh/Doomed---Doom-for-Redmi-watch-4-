// Read/disassemble fixed firmware data; never executes firmware or uses hardware.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const imageFile=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const out=path.join(root,'artifacts/research/rw4-loader-r194');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db';
if(fs.existsSync(out))throw Error('ExistingOutput');
const image=fs.readFileSync(imageFile);
if(image.length!==6636408||hash(image)!==expected||hash(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('UnreviewedInput');
const selected=[];
for(let p=0;p<image.length;){
  if(image[p]<32||image[p]>126){p++;continue;}
  const start=p;while(p<image.length&&image[p]>=32&&image[p]<=126)p++;
  if(image[p]!==0||p-start<3||p-start>512)continue;
  const value=image.subarray(start,p).toString('ascii');
  if(/^(?:insmod|rmmod|lsmod|printf|puts|malloc|free|memcpy|memset|open|close|read|write|__errno|pthread_create|lv_obj_create|lua_gettop|symtab_[A-Za-z0-9_]+|modlib_[A-Za-z0-9_]+|.*(?:modlib\/|module\/|armv8-m\/|arm_elf|symtab).*\.c|.*ELF.*|.*(?:[Mm]odule|[Ss]ymbol).*)$/.test(value))selected.push({offset:start,value});
}
if(selected.length>2000)throw Error('StringLimit');
const run=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address=16','--stop-address=256',imageFile],{shell:false,windowsHide:true,encoding:'utf8',timeout:10000,maxBuffer:65536});
if(run.error||run.status!==0)throw Error('DisassemblyRefused');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'startup-thumb.txt'),run.stdout,{flag:'wx'});
fs.writeFileSync(path.join(out,'strings.json'),JSON.stringify({checkpoint:'R194',imageSha256:expected,strings:selected,stringsDoNotEstablishExports:true,firmwareExecuted:false,watchCommandRequested:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R194',selectedStrings:selected.length,startupDisassembled:true,imageSha256:expected,firmwareExecuted:false,watchCommandRequested:false}));
