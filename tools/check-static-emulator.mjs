// Read-only cache inspection of the owned emulator, never physical transport.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('No arguments accepted');
guardEmulator();
const file=path.join(projectRoot,'artifacts/emulator/static-r168-cache.json');
const run=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),
  ['-H','127.0.0.1','-P','5039','-s','emulator-5554','pull','/data/app/watchface/watchface_list.json',file],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:32768});
if(run.error||run.status!==0)throw Error('Emulator cache read failed');
const list=JSON.parse(fs.readFileSync(file,'utf8')).watchface_list;
const own=list.find(face=>face.id==='365799910');
console.log(JSON.stringify({checkpoint:'R168',registered:!!own,ownFace:own??null,
  activeIds:list.filter(face=>String(face.in_use)==='1').map(face=>face.id),physicalTransport:false}));
