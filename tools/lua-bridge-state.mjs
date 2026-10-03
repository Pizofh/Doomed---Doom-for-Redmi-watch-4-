// Read only the own virtual device snapshot, no writes or Lua UI calls.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {guardEmulator} from './emulator-ui.mjs';
import {projectRoot, packageRoot} from './verify-emulator.mjs';
export function bridgeState() {
  guardEmulator();
  const common=['-H','127.0.0.1','-P','5039','-s','emulator-5554','shell'];
  function command(args) {
    const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),[...common,...args],
      {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536});
    if(r.error||r.status!==0) throw Error('Bridge inspection failed');
    return {args,status:r.status,stdout:r.stdout,stderr:r.stderr};
  }
  const modules=command(['lsmod']);
  const code="local r=io.open('/dev/rw4bridge','rb'); if not r then print('BRIDGE_STATE absent'); else r:setvbuf('no'); local b=assert(r:read(32)); assert(r:close()); local m,s,a,p,t,x,y,k=string.unpack('<I4I4I4I4I4I4I4I4',b); print('BRIDGE_STATE',m,s,a,p,t,x,y,k) end";
  const read=command(['lua','-e','"'+code+'"']);
  const match=read.stdout.match(/BRIDGE_STATE\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  const registered=modules.stdout.includes('rw4bridge');
  const frame=command(['ls','/dev/rw4frame']);
  const frameAbsent=/^nsh: ls: stat failed: 2\r?$/im.test(frame.stdout);
  if(frameAbsent===registered || (!frameAbsent&&!frame.stdout.includes('rw4frame')))throw Error('Frame node/module state mismatch');
  let state=null;
  if(match) {
    const [magic,sequence,active,paused,touches,x,y,op]=match.slice(1).map(Number);
    if(magic!==0x34574252||!registered)throw Error('Unexpected native snapshot');
    state={sequence,active,paused,touches,x,y,op};
  } else if(!read.stdout.includes('BRIDGE_STATE absent')||registered)throw Error('Module/node state mismatch');
  const result={registered,state,modules,read,frame,physicalTransport:false,atUtc:new Date().toISOString()};
  fs.writeFileSync(path.join(projectRoot,`artifacts/emulator/lua-bridge-state-${Date.now()}.json`),JSON.stringify(result,null,2)+'\n');
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length!==2)throw Error('No targets accepted');
  const {registered,state}=bridgeState();console.log(JSON.stringify({registered,state}));
}
