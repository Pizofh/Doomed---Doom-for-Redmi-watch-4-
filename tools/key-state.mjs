// Read-only snapshot of the own native controls. Does not consume key events.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {guardEmulator} from './emulator-ui.mjs';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No targets accepted');
guardEmulator();
const code="local f <close> = io.open('/dev/rw4bridge','rb'); if not f then print('KEY_STATE absent'); return end; f:setvbuf('no'); local b=assert(f:read(64)); assert(f:close()); local v={string.unpack('<I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4',b)}; for i=1,16 do io.write(tostring(v[i]),' ') end; io.write('KEY_SNAPSHOT_END')";
const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554','shell','lua','-e','"'+code+'"'],
  {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536});
if(r.error||r.status!==0)throw Error('Snapshot read failed');
const match=r.stdout.match(/((?:\d+\s+){16})KEY_SNAPSHOT_END/);
let state=null;
if(match){
  const v=match[1].trim().split(/\s+/).map(Number);
  if(v[0]!==0x34574252||v[15]!==32||v[9]>32||v[8]>15)throw Error('Unexpected key contract');
  state={sequence:v[1],active:v[2],paused:v[3],held:v[8],queued:v[9],changes:v[10],overflows:v[11],cancels:v[12],sampled:v[13],steps:v[14]};
}else if(!r.stdout.includes('KEY_STATE absent'))throw Error('Snapshot not recognized');
const record={state,physicalTransport:false,atUtc:new Date().toISOString()};
fs.writeFileSync(path.join(projectRoot,'artifacts/emulator/key-state-'+Date.now()+'.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record));
