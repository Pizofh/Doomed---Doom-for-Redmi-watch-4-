// Own reviewed PC module only: cooperative STOP while pointer still holds FIRE.
// No LVGL from CLI, no forced kill/unload. UI performs cache and module cleanup.
import fs from 'node:fs';
import path from 'node:path';
import {session,reviewedPayload,requireOwnedLauncher} from './worker-input-emulator.mjs';
import {gesture,rpc} from './emulator-ui.mjs';
if(process.argv.length!==2)throw Error('No external targets accepted');
const payload=reviewedPayload(),s=session('worker-input-held-stop');
requireOwnedLauncher(s,payload);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function integer(v){const b=[];do{b.push((v&127)|(v>127?128:0));v=Math.floor(v/128);}while(v);return Buffer.from(b);}
async function pointer(down){await rpc('sendMouse',Buffer.concat([Buffer.from([8]),integer(310),Buffer.from([16]),integer(305),Buffer.from([24,down])]));}
await gesture(195,285,195,285);await delay(500);
let before;
try{
  await pointer(1);await delay(700);before=s.state();
  if(!before||before.applied!==8||before.requested!==8||before.error!==0||before.live!==1)throw Error('FIRE not held');
  const code="local r <close> = assert(io.open('/dev/rw4winput','rb'));r:setvbuf('no');local b=assert(r:read(128));assert(r:close());local v={string.unpack('<'..string.rep('I4',32),b)};local w <close> = assert(io.open('/dev/rw4winput','wb'));w:setvbuf('no');local ok,e,n=w:write(string.pack('<I4I4I4',0x34574c52,v[2]+1,2));assert(w:close());if ok then print('OWN_STOP_OK') else print('OWN_STOP_RETRY',n) end";
  let sent=false;
  for(let i=0;i<6;i++){
    const out=s.adb(['shell','lua','-e','"'+code+'"'],'stop-'+i);
    if(out.includes('OWN_STOP_OK')){sent=true;break;}
    if(!/OWN_STOP_RETRY\s+22/.test(out))throw Error('STOP failed');await delay(50);
  }
  if(!sent)throw Error('STOP sequence raced; retain evidence');
  let absent=false;
  for(let i=0;i<12;i++){if(s.state()===null){absent=true;break;}await delay(150);}
  if(!absent||s.adb(['shell','lsmod'],'modules').includes('rw4winput'))throw Error('UI did not collect');
  if(new RegExp('^\\s*'+before.tid+'\\s','m').test(s.adb(['shell','ps'],'ps')))throw Error('Worker remains');
  for(const file of ['/dev/rw4wistream','/tmp/rw4-worker-input-0.bin','/tmp/rw4-worker-input-1.bin'])
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',file],'absence')))throw Error('Copy/node remains');
  const result={passed:true,before,stopCooperative:true,heldPointerDuringRetirement:true,hostUnload:false,
    moduleAbsent:true,workerGone:true,copiesAbsent:true,physicalTransport:false,rebootForExit:false};
  fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(s.folder);
}finally{await pointer(0);await delay(350);}
