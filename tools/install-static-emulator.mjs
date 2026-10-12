// Owned loopback emulator only. No phone/USB/Bluetooth/physical installation.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData,resetGuest} from './emulator-ui.mjs';
const mode=process.argv[2]??'raw';
if(!['raw','bridge'].includes(mode)||process.argv.length>3)throw Error('Only raw|bridge accepted');
const id='365799910',guest='/data/app/watchface/market/'+id;
const build=path.join(projectRoot,'artifacts/static-watchface-r167');
const destination=path.join(projectRoot,'artifacts/emulator/static-r168-'+mode);
const latest=path.join(projectRoot,'artifacts/emulator/static-r168-latest.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const review=JSON.parse(fs.readFileSync(path.join(build,'review.json'),'utf8'));
const bytes=fs.readFileSync(path.join(build,'RW4Probe-id-only.face'));
if(review.watchfaceId!==id||review.staticImageOnly!==true||review.luaIncluded!==false||review.nativeCodeIncluded!==false||
  hash(bytes)!==review.candidateSha256||bytes.subarray(40,49).toString('ascii')!==id||bytes[5]!==0)throw Error('Static candidate differs');
if(fs.existsSync(destination))throw Error('Existing run refused');
guardEmulator();fs.mkdirSync(destination);
function adb(args,label){
  const run=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:1048576,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(destination,'adb-'+label+'.json'),JSON.stringify({args,status:run.status,stdout:run.stdout,stderr:run.stderr},null,2)+'\n');
  if(run.error||run.status!==0)throw Error('Emulator operation failed');return run.stdout+run.stderr;
}
const listing=adb(['shell','lsmod'],'modules');
if(/\brw4(?:doom|first|winput|wframe|worker|bridge|task|time|fs|stdio)\b/.test(listing))throw Error('Own native module loaded; no reset');
if(mode==='raw'){
  const absence=adb(['shell','ls',guest],'absence');
  if(!/^nsh: ls: stat failed: 2\r?$/im.test(absence))throw Error('ID not absent');
}else{
  const prior=JSON.parse(fs.readFileSync(latest,'utf8'));
  if(prior.mode!=='raw'||prior.guest!==guest||prior.physicalTransport!==false)throw Error('No owned raw install');
  const cache=path.join(destination,'list-check.json');adb(['pull','/data/app/watchface/watchface_list.json',cache],'list-check');
  const face=JSON.parse(fs.readFileSync(cache,'utf8')).watchface_list.find(f=>f.id===id);
  if(!face||String(face.in_use)!=='0')throw Error('Select a stock face before variant');
  const before=path.join(destination,'resource-before.bin');adb(['pull',guest+'/resource.bin',before],'resource-before');
  if(hash(fs.readFileSync(before))!==prior.installedSha256)throw Error('Owned resource changed');
}
const snapshot=await snapshotData();
adb(['pull','/data/app/watchface/watchface_list.json',path.join(destination,'list-before.json')],'list-before');
const prepared=Buffer.from(bytes);if(mode==='bridge')prepared[5]=10;
const resource=path.join(destination,'resource.bin');fs.writeFileSync(resource,prepared);
const record={checkpoint:'R168',mode,id,guest,snapshot,candidateSha256:review.candidateSha256,
  installedSha256:hash(prepared),headerByte5:prepared[5],physicalTransport:false,resetRequested:false};
fs.writeFileSync(path.join(destination,'install.json'),JSON.stringify(record,null,2)+'\n');
if(mode==='raw')adb(['shell','mkdir',guest],'mkdir');
adb(['push',resource,guest+'/resource.bin'],'push');
const readback=path.join(destination,'resource-readback.bin');adb(['pull',guest+'/resource.bin',readback],'readback');
if(hash(fs.readFileSync(readback))!==hash(prepared))throw Error('Readback mismatch; no reset');
adb(['shell','rm','/data/app/watchface/watchface_list.json'],'invalidate-own-emu-cache');
await resetGuest();record.resetRequested=true;
fs.writeFileSync(path.join(destination,'install.json'),JSON.stringify(record,null,2)+'\n');
fs.writeFileSync(latest,JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({checkpoint:'R168',mode,id,readbackMatched:true,resetRequested:true,headerByte5:prepared[5],physicalTransport:false}));
