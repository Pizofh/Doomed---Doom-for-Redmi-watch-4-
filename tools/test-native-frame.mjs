// Exercise only the reviewed own virtual frame stream in the owned PC guest.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot,packageRoot} from './verify-emulator.mjs';
import {guardEmulator} from './emulator-ui.mjs';
import {bridgeState} from './lua-bridge-state.mjs';
if(process.argv.length!==2)throw Error('No targets accepted');
guardEmulator();if(bridgeState().registered)throw Error('Native bridge already loaded');
const folder=path.join(projectRoot,`artifacts/emulator/native-frame-${Date.now()}`);fs.mkdirSync(folder);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function adb(args,label){
  const r=spawnSync(path.join(packageRoot,'platform-tools/adb.exe'),['-H','127.0.0.1','-P','5039','-s','emulator-5554',...args],
    {encoding:'utf8',windowsHide:true,shell:false,timeout:20000,maxBuffer:65536});
  fs.writeFileSync(path.join(folder,label+'.json'),JSON.stringify({args,status:r.status,stdout:r.stdout,stderr:r.stderr},null,2)+'\n');
  if(r.error||r.status!==0)throw Error('ADB failed: '+label);return r.stdout+r.stderr;
}
const native=path.join(folder,'native-readback.elf');adb(['pull','/tmp/rw4-lua-bridge.elf',native],'native-readback');
if(hash(fs.readFileSync(native))!=='69b1b6a607aec62e6a7def95dcf9e53933cc0f3dbd7bb7b7732863a661eea88e')throw Error('Unreviewed native payload');
const guest='/tmp/rw4-frame-test.lua',copies=['/tmp/rw4-frame-test-0.bin','/tmp/rw4-frame-test-1.bin'];
for(const [i,file] of [guest,...copies].entries())if(!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell','ls',file],'absence-'+i)))throw Error('Test path already exists');
const suffix=`
RW4_NATIVE_BRIDGE.start()
local reference
for phase=0,1 do
    if phase==1 then RW4_NATIVE_BRIDGE.touch(60,210) end
    local src=RW4_NATIVE_BRIDGE.frame()
    local reader <close> = assert(io.open(src,'rb'))
    local bytes=assert(reader:read(89612)); assert(#bytes==89612 and reader:read(1)==nil); assert(reader:close())
    reference=bytes
    local writer <close> = assert(io.open('/tmp/rw4-frame-test-'..phase..'.bin','wb'))
    assert(writer:write(bytes)); assert(writer:close())
end
local held <close> = assert(io.open('/dev/rw4frame','rb'))
held:setvbuf('no'); assert(held:read(17)==reference:sub(1,17))
do
    local other <close> = assert(io.open('/dev/rw4frame','rb')); other:setvbuf('no')
    assert(other:read(12)==reference:sub(1,12)); assert(other:close())
    assert(held:read(17)==reference:sub(18,34))
end
local ok,why,status=os.execute('rmmod rw4bridge')
print('RW4_FRAME_TEST: unload result',tostring(ok),tostring(why),tostring(status))
assert(ok==nil and why=='exit' and status~=0); print('RW4_FRAME_TEST: busy rejected')
assert(held:close())
RW4_NATIVE_BRIDGE.pause(); assert(io.open('/dev/rw4frame','rb')==nil)
RW4_NATIVE_BRIDGE.resume(); print('RW4_FRAME_TEST: paused open rejected')
RW4_NATIVE_BRIDGE.exit(); print('RW4_FRAME_TEST: done')
`;
const bytes=Buffer.concat([fs.readFileSync(path.join(projectRoot,'experiments/lua-native-bridge/control.lua')),Buffer.from(suffix)]);
const source=path.join(folder,'test.lua');fs.writeFileSync(source,bytes);adb(['push',source,guest],'push');
const reread=path.join(folder,'test-readback.lua');adb(['pull',guest,reread],'readback');if(hash(fs.readFileSync(reread))!==hash(bytes))throw Error('Lua readback differs');
const output=adb(['shell','lua',guest],'lua');const after=bridgeState();
if(after.registered||!output.includes('RW4_FRAME_TEST: done')||!output.includes('RW4_FRAME_TEST: busy rejected')||!output.includes('RW4_FRAME_TEST: paused open rejected'))throw Error('Native frame test failed; inspect before cleanup');
const frames=[];
const colors=[0xf800,0x07e0,0x001f,0xffff,0xffe0,0x07ff,0xf81f,0];
for(const [phase,file] of copies.entries()){
  const dest=path.join(folder,'frame-'+phase+'.bin');adb(['pull',file,dest],'frame-'+phase);const b=fs.readFileSync(dest);
  const expected=Buffer.alloc(89612);Buffer.from([0x19,0x12,0,0,0x40,1,0x8c,0,0x80,2,0,0]).copy(expected);
  for(let y=0;y<140;y++)for(let x=0;x<320;x++)expected.writeUInt16LE(y<70?colors[(Math.floor(x/40)+phase)&7]:((Math.floor(x/16)^Math.floor(y/16)^phase)&1?0xffff:0),12+2*(y*320+x));
  const matched=b.equals(expected);frames.push({phase,bytes:b.length,sha256:hash(b),matched});
  if(!matched)throw Error('Native frame differs; inspect retained artifacts');
  adb(['shell','rm',file],'remove-frame-'+phase);
}
adb(['shell','rm',guest],'remove-script');
fs.writeFileSync(path.join(folder,'result.json'),JSON.stringify({passed:true,frames,after,physicalTransport:false},null,2)+'\n');
console.log(JSON.stringify({passed:true,frames,folder,physicalTransport:false}));
