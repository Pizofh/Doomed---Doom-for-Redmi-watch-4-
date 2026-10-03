// Close the own CLI Lua VM normally or with a controlled error, never kill it.
// Fixed owned emulator, reviewed native payload, no UI or arbitrary Lua input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {bridgeState} from './lua-bridge-state.mjs';
const mode=process.argv[2];
if(!['normal','error'].includes(mode)||process.argv.length!==3)throw Error('Expected normal|error');
guardEmulator();
if(bridgeState().registered)throw Error('Module already loaded; inspect before testing');
const folder=path.join(projectRoot,`artifacts/emulator/lua-bridge-close-${mode}-${Date.now()}`);
fs.mkdirSync(folder);
function adb(args,label){
  const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {shell:false,windowsHide:true,encoding:'utf8',timeout:15000,maxBuffer:65536});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message??null},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label);
  return r.stdout+r.stderr;
}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const review=JSON.parse(fs.readFileSync(path.join(projectRoot,'build/lua-native-bridge/bridge-review.json')));
const native=path.join(folder,'native-readback.elf');
adb(['pull','/tmp/rw4-lua-bridge.elf',native],'native-readback');
if(!review.contractReviewed||hash(fs.readFileSync(native))!==review.sha256||review.sha256!=='69b1b6a607aec62e6a7def95dcf9e53933cc0f3dbd7bb7b7732863a661eea88e')throw Error('Native payload is not reviewed');
const guest='/tmp/rw4-bridge-close-test.lua';
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',guest],'absence')))throw Error('Test filename already exists');
const prefix=fs.readFileSync(path.join(projectRoot,'experiments/lua-native-bridge/control.lua'));
const test="\nRW4_NATIVE_BRIDGE.start()\ncollectgarbage('collect')\n"+
  "do local f <close> = assert(io.open('/dev/rw4bridge','rb')); f:setvbuf('no'); local b=assert(f:read(32)); local m,s,a=string.unpack('<I4I4I4',b); assert(m==0x34574252 and a==1); end\n"+
  "print('RW4_CLOSE_TEST: retained after GC')\n"+
  (mode==='error'?"local function fail() local held <close> = assert(io.open('/dev/rw4bridge','rb')); error('RW4_CONTROLLED_CLOSE_ERROR') end; fail()\n":"print('RW4_CLOSE_TEST: normal return')\n");
const source=path.join(folder,'test.lua');
const bytes=Buffer.concat([prefix,Buffer.from(test)]);fs.writeFileSync(source,bytes);
adb(['push',source,guest],'push');
const reread=path.join(folder,'test-readback.lua');adb(['pull',guest,reread],'readback');
if(hash(fs.readFileSync(reread))!==hash(bytes))throw Error('Lua readback differs; not executing');
const output=adb(['shell','lua',guest],'lua');
const after=bridgeState();
const passed=output.includes('RW4_CLOSE_TEST: retained after GC')&&output.includes('cleanup unloaded lua-close')&&
  output.includes('unregister=0 refs=0')&&output.includes('finalizer end clean=true')&&!after.registered&&
  (mode==='normal'?output.includes('RW4_CLOSE_TEST: normal return'):output.includes('RW4_CONTROLLED_CLOSE_ERROR'));
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify({mode,passed,after,sourceSha256:hash(bytes),controlSha256:hash(prefix),physicalTransport:false},null,2)+'\n');
// A failure is preserved even if the host can remove the reviewed module.
if(!passed&&after.registered)adb(['shell','rmmod','rw4bridge'],'failure-cleanup');
adb(['shell','rm',guest],'remove-test');
console.log(JSON.stringify({mode,passed,folder,physicalTransport:false}));
if(!passed)throw Error('Lua closure cleanup not confirmed; inspect result');
