// Owned assets on PC guest FAT only. No physical transport, arbitrary destination or overwrite.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {session,reviewedPayload,persistentDoomDir as directory} from './doom-ui-emulator.mjs';
import {snapshotData} from './emulator-ui.mjs';
import {projectRoot} from './verify-emulator.mjs';
import {verifyShareware,shareware} from './wad-data.mjs';
if(process.argv.length!==3||!['install','verify','remove'].includes(process.argv[2]))throw Error('Expected install|verify|remove');
const action=process.argv[2],s=session('doom-storage-'+action),payload=reviewedPayload();
const recordFile=path.join(projectRoot,'artifacts/emulator/doom-storage-install.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const inputs=[{name:'doom.elf',source:payload.source,bytes:payload.bytes.length,sha256:payload.sha256},
  {name:'doom1.wad',source:path.join(projectRoot,'tools/local/doom-shareware/doom1.wad'),sha256:shareware.sha256}];
verifyShareware(fs.readFileSync(inputs[1].source));
// Derive size from the inspected local file, not an assumed shareware property name.
inputs[1].bytes=fs.statSync(inputs[1].source).size;
function absent(f){if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',f],'absence')))throw Error('Not absent: '+f);}
function verify(){
  for(const a of inputs){const f=path.join(s.folder,a.name);s.adb(['pull',directory+'/'+a.name,f],'readback-'+a.name);
    const b=fs.readFileSync(f);if(b.length!==a.bytes||hash(b)!==a.sha256)throw Error('Persisted asset differs: '+a.name);}
  const files=s.adb(['shell','ls',directory],'files'),names=files.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.endsWith(':'));
  if(names.length!==2||names.some(n=>!inputs.some(a=>a.name===n)))throw Error('Unexpected persistent directory contents');
}
if(action==='install'){
  if(fs.existsSync(recordFile))throw Error('Existing install record: inspect, do not overwrite');
  if(s.state()!==null||s.adb(['shell','lsmod'],'modules').includes('rw4doom'))throw Error('Complete native lifecycle first');
  for(const f of ['/tmp/rw4-doom-ui.elf','/tmp/rw4-doom1.wad','/tmp/rw4-doom-frame-0.bin','/tmp/rw4-doom-frame-1.bin','/dev/rw4doomstream'])absent(f);
  absent(directory);
  const face=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',face],'faces');
  const own=JSON.parse(fs.readFileSync(face)).watchface_list.find(f=>f.id==='365799903');if(!own||String(own.in_use)!=='0')throw Error('Own watchface must be installed and inactive');
  const prior=JSON.parse(fs.readFileSync(path.join(projectRoot,'artifacts/emulator/watchface-365799903/latest-install.json')));
  if(prior.id!=='365799903'||prior.physicalTransport!==false)throw Error('Owned prior install missing');
  if(!/^\s*\/data type fatfs\s*$/m.test(s.adb(['shell','mount'],'mount')))throw Error('Expected reviewed FAT /data');
  const m=s.adb(['shell','df'],'df').match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\/data\s*$/m);
  if(!m||Number(m[1])*Number(m[4])<16*1024*1024)throw Error('Insufficient known free space');
  const backup=await snapshotData(),record={phase:'installing',directory,inputs,backup,folder:s.folder,physicalTransport:false};
  fs.writeFileSync(recordFile,JSON.stringify(record,null,2)+'\n');
  s.adb(['shell','mkdir',directory],'mkdir');
  for(const a of inputs)s.adb(['push',a.source,directory+'/'+a.name],'push-'+a.name);
  verify();Object.assign(record,{phase:'installed',sha256ReadbackMatched:true});fs.writeFileSync(recordFile,JSON.stringify(record,null,2)+'\n');
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(record,null,2)+'\n');
}else{
  const r=JSON.parse(fs.readFileSync(recordFile));if(r.phase!=='installed'||r.directory!==directory||r.physicalTransport!==false)throw Error('Owned completed install missing');
  verify();
  if(action==='remove'){
    if(s.state()!==null||s.adb(['shell','lsmod'],'modules').includes('rw4doom'))throw Error('Native lifecycle incomplete');
    const file=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',file],'faces');
    const own=JSON.parse(fs.readFileSync(file)).watchface_list.find(f=>f.id==='365799903');if(!own||String(own.in_use)!=='0')throw Error('Select another watchface before removal');
    const backup=await snapshotData();
    for(const a of inputs){s.adb(['shell','rm',directory+'/'+a.name],'remove-'+a.name);absent(directory+'/'+a.name);}
    s.adb(['shell','rmdir',directory],'remove-empty-directory');absent(directory);
    Object.assign(r,{phase:'removed',removalFolder:s.folder,removalBackup:backup});fs.writeFileSync(recordFile,JSON.stringify(r,null,2)+'\n');
  }
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify({passed:true,directory,sha256ReadbackMatched:true,removed:action==='remove',physicalTransport:false},null,2)+'\n');
}
console.log(JSON.stringify({action,folder:s.folder,directory,sha256ReadbackMatched:true,physicalTransport:false}));
