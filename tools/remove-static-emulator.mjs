// Remove only this project's inactive static test from the owned emulator.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('No arguments accepted');
const id='365799910',guest='/data/app/watchface/market/'+id;
const record=JSON.parse(fs.readFileSync(path.join(projectRoot,'artifacts/emulator/static-r168-latest.json'),'utf8'));
if(record.id!==id||record.guest!==guest||record.physicalTransport!==false)throw Error('Not an owned install');
const destination=path.join(projectRoot,'artifacts/emulator/static-r168-remove-final');
if(fs.existsSync(destination))throw Error('Existing removal refused');
guardEmulator();fs.mkdirSync(destination);
function adb(args,label){
  const run=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:1048576});
  fs.writeFileSync(path.join(destination,'adb-'+label+'.json'),JSON.stringify({args,status:run.status,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
  if(run.error||run.status!==0)throw Error('Emulator operation failed');return run.stdout+run.stderr;
}
const listFile=path.join(destination,'list-before.json');adb(['pull','/data/app/watchface/watchface_list.json',listFile],'list-before');
const own=JSON.parse(fs.readFileSync(listFile,'utf8')).watchface_list.find(f=>f.id===id);
if(!own||String(own.in_use)!=='0')throw Error('Own face active or missing');
const backup=path.join(destination,'resource-before.bin');adb(['pull',guest+'/resource.bin',backup],'resource-before');
if(createHash('sha256').update(fs.readFileSync(backup)).digest('hex')!==record.installedSha256)throw Error('Resource ownership mismatch');
const listing=adb(['shell','ls',guest],'directory-before');
const names=listing.split(/\s+/).filter(n=>n&&n!==guest&&n!==guest+'/'&&n!==guest+':'&&n!==guest+'/:');
if(!names.includes('resource.bin')||names.some(n=>!['resource.bin','preview.bin','config.json'].includes(n)))throw Error('Unknown child files; no delete performed');
const snapshot=await snapshotData();
for(const name of names)adb(['shell','rm',guest+'/'+name],'remove-'+name.replaceAll('.','-'));
adb(['shell','rmdir',guest],'remove-empty-owned-directory');
const absent=adb(['shell','ls',guest],'absence');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(absent))throw Error('Removal not verified');
adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-emu-cache');await resetGuest();
fs.writeFileSync(path.join(destination,'removal.json'),JSON.stringify({id,guest,snapshot,names,absenceVerified:true,physicalTransport:false},null,2)+'\n');
console.log(JSON.stringify({checkpoint:'R168',ownedFilesRemoved:true,absenceVerified:true,physicalTransport:false,
  note:'Filesystem removal in emulator; NOT Xiaomi protocol DELETE validation'}));
