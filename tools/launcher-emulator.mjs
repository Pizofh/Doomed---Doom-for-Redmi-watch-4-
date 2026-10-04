// Fixed own module, PC emulator only. No USB, native stop/kill or arbitrary target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData} from './emulator-ui.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
export function session(label) {
  if(!/^[a-z-]+$/.test(label))throw Error('Invalid label');
  guardEmulator();
  const exe=path.join(packageRoot,'platform-tools/adb.exe');
  if(hash(fs.readFileSync(exe))!=='0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7'||
    hash(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Reviewed inputs changed');
  const folder=path.join(projectRoot,'artifacts/emulator/'+label+'-'+Date.now());fs.mkdirSync(folder);
  let serial=0;
  function adb(args,name) {
    const r=spawnSync(exe,['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
      {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
    fs.writeFileSync(path.join(folder,(++serial)+'-'+name+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
    if(r.error||r.status!==0)throw Error('ADB failed: '+name);return r.stdout+r.stderr;
  }
  function state() {
    const code="local f=io.open('/dev/rw4worker','rb'); if not f then print('WORKER_ABSENT'); return end; f:setvbuf('no'); local b=assert(f:read(64)); assert(f:close()); assert(#b==64); local v={string.unpack('<I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4',b)}; assert(v[1]==0x34574c52 and v[16]==0); print('WORKER_STATE',table.concat(v,','))";
    const out=adb(['shell','lua','-e','"'+code+'"'],'state');
    if(out.includes('WORKER_ABSENT'))return null;
    const m=out.match(/WORKER_STATE\s+([\d,]+)/);if(!m)throw Error('Invalid snapshot');
    const v=m[1].split(',').map(Number);
    if(v.length!==17||v[0]!==0x34574c52||v[15]!==0||v[16]!==65)throw Error('Snapshot contract differs');
    const names=['magic','seq','pending','stop','ready','tid','steps','reason','owner','detached','error','live','cycle','paused','init','reserved'];
    return Object.fromEntries(names.map((n,i)=>[n,v[i]]));
  }
  return {folder,adb,state};
}
export function reviewedPayload() {
  const source=path.join(projectRoot,'build/native-launcher/launcher.elf');
  const bytes=fs.readFileSync(source),r=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-launcher/launcher-review.json')));
  if(!r.contractReviewed||r.guestSha256!==guestHash||r.sha256!==hash(bytes)||
    r.sha256!=='72a7f070468f6d2670de52079e57fd144feb0e6667583ffd2f23e0023f4edba9'||
    r.sourceSha256!==hash(fs.readFileSync(path.join(projectRoot,'experiments/native-launcher/launcher.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('Payload/source review differs');
  return {source,bytes,sha256:r.sha256};
}
if(path.resolve(process.argv[1]??'')===fileURLToPath(import.meta.url)) {
  const action=process.argv[2];if(process.argv.length!==3||!['stage','state','cleanup'].includes(action))throw Error('Expected stage|state|cleanup');
  const s=session('launcher-'+action);
  if(action==='state')console.log(JSON.stringify({folder:s.folder,state:s.state()}));
  else {
    const payload=reviewedPayload(),target='/tmp/rw4-launcher.elf';
    let modules=s.adb(['shell','lsmod'],'modules');
    if(action==='cleanup'&&modules.includes('rw4worker')) {
      const st=s.state();if(!st||st.stop!==1||st.reason!==1||st.detached!==1||st.live!==0||st.error!==0)throw Error('Not safely retired; retain module');
      s.adb(['shell','rmmod','rw4worker'],'unload');modules=s.adb(['shell','lsmod'],'modules-after');
    }
    if(['rw4wframe','rw4worker','rw4bridge','rw4task','rw4time','rw4fs','rw4stdio'].some(n=>modules.includes(n)))throw Error('Own module loaded; inspect before mutation');
    if(s.state()!==null)throw Error('Worker node remains');
    const absence=s.adb(['shell','ls',target],'payload-before');
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(absence)) {
      const prior=path.join(s.folder,'prior.elf');s.adb(['pull',target,prior],'prior');
      if(hash(fs.readFileSync(prior))!==payload.sha256)throw Error('Existing payload differs');
      if(action==='stage')throw Error('Already staged');
    } else if(action==='cleanup')throw Error('Already absent');
    if(action==='stage') {
      if(!/\/tmp type tmpfs/.test(s.adb(['shell','mount'],'mounts')))throw Error('Not tmpfs');
      const backup=await snapshotData();s.adb(['push',payload.source,target],'push');
      const readback=path.join(s.folder,'readback.elf');s.adb(['pull',target,readback],'readback');
      if(hash(fs.readFileSync(readback))!==payload.sha256)throw Error('Readback differs');
      console.log(JSON.stringify({action,folder:s.folder,sha256:payload.sha256,backup:backup.folder,physicalTransport:false}));
    } else {
      s.adb(['shell','rm',target],'remove-own-payload');
      if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',target],'payload-after')))throw Error('Payload remains');
      console.log(JSON.stringify({action,folder:s.folder,moduleAbsent:true,nodeAbsent:true,payloadRemoved:true,physicalTransport:false}));
    }
  }
}
