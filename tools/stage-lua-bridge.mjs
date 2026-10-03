// Fixed own payload and virtual device, owned emulator only. No physical path.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot, packageRoot} from './verify-emulator.mjs';
import {guardEmulator, snapshotData} from './emulator-ui.mjs';
const action=process.argv[2];
if(!['stage','test','cleanup'].includes(action)||process.argv.length!==3)throw Error('Expected stage|test|cleanup');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const guestHash='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if(digest(fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx')))!==guestHash)throw Error('Guest image changed');
guardEmulator();
const folder=path.join(projectRoot,`artifacts/emulator/lua-bridge-${action}-${Date.now()}`);
fs.mkdirSync(folder,{recursive:true});
function adb(args,label){
  const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:1024*1024,env:{...process.env,ADB_MDNS_AUTO_CONNECT:'0'}});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error(label+': inspect saved output before retry');
  return r.stdout+r.stderr;
}
const moduleName='rw4bridge', guestFile='/tmp/rw4-lua-bridge.elf', device='/dev/rw4bridge';
if(adb(['shell','lsmod'],'modules-before').includes(moduleName))throw Error('Own module already loaded; exit UI and inspect before staging/cleanup');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',device],'node-absence')))throw Error('Virtual node unexpectedly exists');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls','/dev/rw4frame'],'frame-absence')))throw Error('Frame node unexpectedly exists');
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/lua-native-bridge/bridge-review.json'),'utf8'));
const source=path.join(projectRoot,'build/lua-native-bridge/bridge.elf');
const bytes=fs.readFileSync(source);
if(!review.contractReviewed||review.guestSha256!==guestHash||review.sha256!==digest(bytes)||
   review.sourceSha256!==digest(fs.readFileSync(path.join(projectRoot,'experiments/lua-native-bridge/bridge.c'),'utf8').replace(/\r\n/g,'\n')))throw Error('No matching source/binary review');
if(!/\/tmp type tmpfs/.test(adb(['shell','mount'],'mounts')))throw Error('/tmp is not confirmed tmpfs');
const existing=adb(['shell','ls',guestFile],'payload-before');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(existing)) {
  const prior=path.join(folder,'payload-before.elf'); adb(['pull',guestFile,prior],'payload-check');
  if(digest(fs.readFileSync(prior))!==digest(bytes))throw Error('Existing temporary payload is not ours');
  if(action==='cleanup') {adb(['shell','rm',guestFile],'remove-payload');console.log(JSON.stringify({action,folder,physicalTransport:false}));process.exit(0);}
} else if(action==='cleanup')throw Error('Own payload already absent; no cleanup needed');
const backup=await snapshotData();
adb(['push',source,guestFile],'push');
const readback=path.join(folder,'payload-readback.elf');adb(['pull',guestFile,readback],'readback');
if(digest(fs.readFileSync(readback))!==digest(bytes))throw Error('Readback differs; not loading');
if(action==='test') {
  const loaded=adb(['shell','insmod',guestFile,moduleName],'insmod');
  if(!loaded.includes('register=0')||!adb(['shell','lsmod'],'modules-loaded').includes(moduleName))throw Error('Registration failed; inspect, no automatic reload');
  // Test state changes and paused touch rejection; no widgets or unrelated drivers.
  const code="local seq=0; local function cmd(op,x,y) seq=seq+1; local f=assert(io.open('/dev/rw4bridge','wb')); f:setvbuf('no'); assert(f:write(string.pack('<I4I4I4I4I4I4',0x34574252,seq,op,x or 0,y or 0,1))); assert(f:close()); local r=assert(io.open('/dev/rw4bridge','rb')); r:setvbuf('no'); local b=assert(r:read(32)); assert(r:close()); local m,s,a,p,t,cx,cy,k=string.unpack('<I4I4I4I4I4I4I4I4',b); assert(m==0x34574252 and s==seq and k==op); print('BRIDGE_TEST',s,a,p,t,cx,cy); return a,p,t end; cmd(1); local held=assert(io.open('/dev/rw4bridge','rb')); local ok,why,status=os.execute('rmmod rw4bridge'); assert(ok==nil and why=='exit' and status~=0); assert(held:close()); print('BRIDGE_BUSY_REJECTED'); assert(select(3,cmd(5,60,210))==1); cmd(2); assert(select(3,cmd(5,100,100))==1); cmd(3); assert(select(3,cmd(5,80,220))==2); assert(cmd(4)==0); print('BRIDGE_TEST_OK')";
  const tested=adb(['shell','lua','-e','"'+code+'"'],'lua-test');
  // All callbacks are synchronous, all test descriptors closed before removal.
  const removed=adb(['shell','rmmod',moduleName],'rmmod');
  const unloaded=!adb(['shell','lsmod'],'modules-after').includes(moduleName);
  const noNode=/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',device],'node-after'));
  const noFrame=/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls','/dev/rw4frame'],'frame-after'));
  if((!tested.includes('BRIDGE_TEST_OK')||!tested.includes('BRIDGE_BUSY_REJECTED'))||!removed.includes('unregister=0 refs=0')||!unloaded||!noNode||!noFrame)throw Error('Native test/cleanup not confirmed; inspect artifacts');
}
console.log(JSON.stringify({action,folder,backup:backup.folder,sha256:digest(bytes),physicalTransport:false}));
