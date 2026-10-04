// Test the own bounded key queue through CLI Lua, never kill its VM.
// Fixed owned emulator, reviewed native payload, no UI or arbitrary Lua input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {bridgeState} from './lua-bridge-state.mjs';
const mode='keys';
if(process.argv.length!==2)throw Error('No targets accepted');
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
if(!review.contractReviewed||hash(fs.readFileSync(native))!==review.sha256||review.sha256!=='ec7b6d5d1eab951a27423607a82ef8801778c9ccc6dfd515a2c50a4891e0a844')throw Error('Native payload is not reviewed');
const guest='/tmp/rw4-key-test.lua';
if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',guest],'absence')))throw Error('Test filename already exists');
const prefix=fs.readFileSync(path.join(projectRoot,'experiments/lua-native-bridge/control.lua'));
const test=String.raw`
local b=RW4_NATIVE_BRIDGE
b.start()
local function state(held,queued) local s=b.key_state(); assert(s.held==held and s.queued==queued); return s end
local function events(expected)
    local got=b.drain_keys(); assert(#got==#expected)
    for i,v in ipairs(expected) do assert(got[i].key==v[1] and got[i].down==v[2]) end
end
b.input(1); b.input(1); assert(state(1,1).changes==1)
events({{0xad,1}})
b.input(3); events({{0xac,1}})
b.input(5); events({{0xac,0},{0xae,1}})
b.input(0); events({{0xad,0},{0xae,0}}); state(0,0)
print('RW4_KEY_TEST: edges and dedup OK')
b.input(8); state(8,1)
local ok,why,status=os.execute('rmmod rw4bridge')
assert(ok==nil and why=='exit' and status~=0); state(8,1)
print('RW4_KEY_TEST: held unload refused OK')
b.pause(); local s=state(0,4); assert(s.paused==1)
assert(not pcall(b.input,1)); state(0,4)
events({{0xad,0},{0xac,0},{0xae,0},{0xa3,0}})
b.resume(); state(0,0)
assert(not pcall(b.input,6)); state(0,0)
print('RW4_KEY_TEST: pause and invalid masks OK')
for i=1,32 do b.input(i%2) end
state(0,32); b.input(1); s=state(0,4); assert(s.paused==1 and s.overflows==1)
events({{0xad,0},{0xac,0},{0xae,0},{0xa3,0}})
b.resume(); b.input(8); events({{0xa3,1}}); b.pause()
events({{0xad,0},{0xac,0},{0xae,0},{0xa3,0}}); state(0,0)
print('RW4_KEY_TEST: overflow cancels and flushes OK')
b.exit(); print('RW4_KEY_TEST: done')
`;
const source=path.join(folder,'test.lua');
const bytes=Buffer.concat([prefix,Buffer.from(test)]);fs.writeFileSync(source,bytes);
adb(['push',source,guest],'push');
const reread=path.join(folder,'test-readback.lua');adb(['pull',guest,reread],'readback');
if(hash(fs.readFileSync(reread))!==hash(bytes))throw Error('Lua readback differs; not executing');
const output=adb(['shell','lua',guest],'lua');
const after=bridgeState();
const markers=['edges and dedup OK','held unload refused OK','pause and invalid masks OK','overflow cancels and flushes OK','done'];
const passed=markers.every(m=>output.includes('RW4_KEY_TEST: '+m))&&output.includes('unregister=0 refs=0')&&!after.registered;
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify({mode,passed,after,sourceSha256:hash(bytes),controlSha256:hash(prefix),physicalTransport:false},null,2)+'\n');
// A failure is preserved even if the host can remove the reviewed module.
if(!passed&&after.registered)adb(['shell','rmmod','rw4bridge'],'failure-cleanup');
adb(['shell','rm',guest],'remove-test');
console.log(JSON.stringify({mode,passed,folder,physicalTransport:false}));
if(!passed)throw Error('Native key queue not confirmed; inspect result');
