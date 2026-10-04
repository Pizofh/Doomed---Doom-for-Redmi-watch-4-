// Fixed own module, PC emulator only. No USB, native stop/kill or arbitrary target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator,snapshotData} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
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
    const code="local f=io.open('/dev/rw4winput','rb'); if not f then print('WORKER_ABSENT'); return end; f:setvbuf('no'); local b=assert(f:read(128)); assert(f:close()); assert(#b==128); local v={string.unpack('<'..string.rep('I4',32),b)}; assert(v[1]==0x34574c52 and v[16]==0 and v[20]==0); print('WORKER_STATE',table.concat(v,','))";
    const out=adb(['shell','lua','-e','"'+code+'"'],'state');
    if(out.includes('WORKER_ABSENT'))return null;
    const m=out.match(/WORKER_STATE\s+([\d,]+)/);if(!m)throw Error('Invalid snapshot');
    const v=m[1].split(',').map(Number);
    if(v.length!==33||v[0]!==0x34574c52||v[15]!==0||v[19]!==0||v[32]!==129)throw Error('Snapshot contract differs');
    const names=['magic','seq','pending','stop','ready','tid','steps','reason','owner','detached','error','live','cycle','paused','init','reserved','produced','readers','blocked','frameReserved','requested','applied','queued','changes','overflows','cancels','epoch','ack','consumed','key_events','accepting','producer_busy'];
    return Object.fromEntries(names.map((n,i)=>[n,v[i]]));
  }
  return {folder,adb,state};
}
export function reviewedPayload() {
  const source=path.join(projectRoot,'build/native-worker-input/input.elf');
  const bytes=fs.readFileSync(source),r=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/native-worker-input/input-review.json')));
  if(!r.contractReviewed||r.guestSha256!==guestHash||r.sha256!==hash(bytes)||
    r.sha256!=='54facb91f2d27c3e1172bba174c3d2ac85a07343aa0ca2574f621a13e362f00c'||
    r.sourceSha256!==hash(fs.readFileSync(path.join(projectRoot,'experiments/native-worker-input/worker-input.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('Payload/source review differs');
  return {source,bytes,sha256:r.sha256};
}
export function requireOwnedLauncher(s,payload=reviewedPayload()) {
  if(s.state()!==null)throw Error('Begin at inactive owned launcher');
  const elf=path.join(s.folder,'preflight-payload.elf');s.adb(['pull','/tmp/rw4-worker-input.elf',elf],'preflight-payload');
  if(hash(fs.readFileSync(elf))!==payload.sha256)throw Error('Staged payload differs');
  const faceFile=path.join(s.folder,'preflight-faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',faceFile],'preflight-faces');
  const active=JSON.parse(fs.readFileSync(faceFile)).watchface_list.filter(f=>String(f.type)==='1'&&String(f.in_use)==='1');
  if(active.length!==1||active[0].id!=='365799903')throw Error('UIProbe not active');
  const sourceFile=path.join(s.folder,'preflight-main.lua');s.adb(['pull','/data/app/watchface/market/365799903/lua/main.lua',sourceFile],'preflight-source');
  if(!fs.readFileSync(sourceFile).equals(fs.readFileSync(path.join(projectRoot,'experiments/native-worker-input/main.lua'))))throw Error('Extracted Lua differs');
  const pkg=JSON.parse(fs.readFileSync(path.join(projectRoot,'artifacts/package-review/ui-probe-package.json')));
  if(pkg.workerInputMode!==true)throw Error('Expected winput package');
  const label=path.basename(s.folder)+'-preflight';
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),label],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.status!==0)throw Error('Preflight capture failed');
  const a=readScreenshot(path.join(projectRoot,'artifacts/emulator/screenshots',label+'.png'));
  for(const [x,y,color]of [[20,200,[16,24,32]],[60,285,[57,114,128]],[60,390,[57,114,128]]]) {
    const p=(y*390+x)*a.bpp;
    if(!color.every((v,i)=>Math.abs(a.pixels[p+i]-v)<=6))throw Error('Owned launcher not recognized');
  }
}
if(path.resolve(process.argv[1]??'')===fileURLToPath(import.meta.url)) {
  const action=process.argv[2];if(process.argv.length!==3||!['stage','state','cleanup'].includes(action))throw Error('Expected stage|state|cleanup');
  const s=session('worker-input-'+action);
  if(action==='state')console.log(JSON.stringify({folder:s.folder,state:s.state()}));
  else {
    const payload=reviewedPayload(),target='/tmp/rw4-worker-input.elf';
    let modules=s.adb(['shell','lsmod'],'modules');
    if(action==='cleanup'&&modules.includes('rw4winput')) throw Error('Reenter the owned UI to retire C and clear its image caches first; no host unload');
    if(['rw4wframe','rw4worker','rw4winput','rw4bridge','rw4task','rw4time','rw4fs','rw4stdio'].some(n=>modules.includes(n)))throw Error('Own module loaded; inspect before mutation');
    if(s.state()!==null)throw Error('Worker node remains');
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls','/dev/rw4wistream'],'stream-absence')))throw Error('Stream remains');
    for(let i=0;i<2;i++)if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls','/tmp/rw4-worker-input-'+i+'.bin'],'frame-copy-'+i)))throw Error('Frame copy remains; collect via UI first');
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
