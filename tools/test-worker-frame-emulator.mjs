// Full frame content, worker ownership and cleanup: own PC emulator only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {session,reviewedPayload} from './worker-frame-emulator.mjs';
import {gesture} from './emulator-ui.mjs';
import {readScreenshot} from './assert-ui-probe.mjs';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No targets accepted');
const payload=reviewedPayload();const s=session('worker-frame-test');
if(s.state())throw Error('Begin from own launcher with native module absent');
const elf=path.join(s.folder,'payload-readback.elf');s.adb(['pull','/tmp/rw4-worker-frame.elf',elf],'payload-preflight');
if(crypto.createHash('sha256').update(fs.readFileSync(elf)).digest('hex')!==payload.sha256)throw Error('Staged ELF differs');
const faces=path.join(s.folder,'faces.json');s.adb(['pull','/data/app/watchface/watchface_list.json',faces],'faces');
const active=JSON.parse(fs.readFileSync(faces)).watchface_list.filter(x=>String(x.in_use)==='1'&&String(x.type)==='1');
if(active.length!==1||active[0].id!=='365799903')throw Error('Own UIProbe required');
const source=path.join(s.folder,'main.lua');s.adb(['pull','/data/app/watchface/market/365799903/lua/main.lua',source],'source');
if(!fs.readFileSync(source).equals(fs.readFileSync(path.join(projectRoot,'experiments/native-worker-frame/main.lua'))))throw Error('Extracted Lua differs');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const colors=[[255,0,0],[0,255,0],[0,0,255],[255,255,255],[255,255,0],[0,255,255],[255,0,255],[0,0,0]];
function capture(name) {
  const label=path.basename(s.folder)+'-'+name;
  const r=spawnSync(process.execPath,[path.join(projectRoot,'tools/emulator-screenshot.mjs'),label],{shell:false,windowsHide:true,encoding:'utf8',timeout:15000});
  if(r.error||r.status!==0)throw Error('Capture failed');
  const file=path.join(projectRoot,'artifacts/emulator/screenshots',label+'.png');return {file,...readScreenshot(file)};
}
function pixel(a,x,y){return [...a.pixels.subarray((y*390+x)*a.bpp,(y*390+x)*a.bpp+3)];}
function launcher(a) {
  for(const [x,y,color] of [[20,200,[16,24,32]],[60,285,[57,114,128]],[60,390,[57,114,128]]])
    if(!pixel(a,x,y).every((v,i)=>Math.abs(v-color[i])<=6))throw Error('Owned launcher not recognized');
}
function assertFrame(a) {
  let generation=0;
  for(let bit=0;bit<32;bit++) {
    const p=pixel(a,35+bit*10+5,208);
    if(p.every(v=>v>=253))generation=(generation+2**bit)>>>0;
    else if(p.some(v=>v>2))throw Error('Barcode has a mixed pixel');
  }
  if(!generation)throw Error('No generated frame');
  for(let y=0;y<140;y++)for(let x=0;x<320;x++) {
    const rgb=y<8?colors[(generation>>>Math.floor(x/10))&1?3:7]:y<70?colors[(Math.floor(x/40)+generation)&7]:colors[(Math.floor(x/16)^Math.floor(y/16)^generation)&1?3:7];
    if(!pixel(a,x+35,y+205).every((v,i)=>Math.abs(v-rgb[i])<=2))throw Error(`Mixed frame ${generation} at ${x},${y}`);
  }
  return generation;
}
function noFiles() {
  for(let i=0;i<2;i++)if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls','/tmp/rw4-worker-frame-'+i+'.bin'],'copy-absence-'+i)))throw Error('Frame copy remains');
}
const observations=[],cycles=[];
function sample(label) {
  const a=capture(label),generation=assertFrame(a),state=s.state();
  if(!state||state.live!==1||state.error!==0||state.detached!==1||state.owner===state.init)throw Error('Worker lifecycle differs');
  const o={label,file:a.file,generation,state,atUtc:new Date().toISOString()};observations.push(o);
  fs.writeFileSync(path.join(s.folder,'observations.json'),JSON.stringify(observations,null,2)+'\n');return o;
}
launcher(capture('before'));noFiles();const freeBefore=s.adb(['shell','free'],'free-before');
for(let cycle=0;cycle<2;cycle++) {
  await gesture(195,285,195,285);await delay(400);
  const first=sample('started-'+cycle);
  const ps=s.adb(['shell','ps'],'ps-active-'+cycle),row=ps.split(/\r?\n/).find(l=>new RegExp('^\\s*'+first.state.tid+'\\s+'+first.state.owner+'\\s').test(l));
  if(!row||!row.includes('pthread'))throw Error('Worker not in UI group');
  for(let i=0;i<4;i++){await delay(250);sample('frame-'+cycle+'-'+i);}
  const generations=observations.slice(-5).map(o=>o.generation);
  if(new Set(generations).size<4||generations.some((n,i)=>i&&n<generations[i-1]))throw Error('Display did not advance coherently');
  let pause=null;
  if(cycle===0) {
    try {
      await gesture(195,410,195,40);const panel=capture('panel');
      if(pixel(panel,195,80).some(v=>v!==0)||pixel(panel,195,300).some(v=>v>50)||pixel(panel,365,300).every(v=>v<100))throw Error('Stock panel failed');
      const a=s.state();await delay(350);const b=s.state();
      if(!a||!b||a.paused!==1||b.paused!==1||a.produced!==b.produced||a.steps!==b.steps||b.readers!==0)throw Error('Production did not pause');
      pause={before:a,after:b,panel:panel.file};
    }finally{await gesture(195,40,195,410);}
    sample('resumed');
    // Two held descriptors, split reads and EOF. No os.execute while they are
    // open: NSH descriptor inheritance was unsafe in an earlier experiment.
    const guest='/tmp/rw4-wframe-readers.lua';
    if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',guest],'reader-script-absence')))throw Error('Reader script exists');
    for(let i=1;i<=2;i++)if(!/^nsh: ls: stat failed: 2\r?$/im.test(
      s.adb(['shell','ls','/tmp/rw4-wframe-reader-'+i+'.bin'],'reader-output-absence-'+i)))throw Error('Reader output exists; inspect before overwriting');
    const code=`local function stats()
 local f <close> = assert(io.open('/dev/rw4wframe','rb'));f:setvbuf('no');local b=assert(f:read(80));assert(f:close());return {string.unpack('<I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4I4',b)} end
local first=io.open('/dev/rw4wstream','rb');if not first then print('WFRAME_READERS_RETRY');return end
local a <close> = first;a:setvbuf('no')
local second=io.open('/dev/rw4wstream','rb');if not second then assert(a:close());print('WFRAME_READERS_RETRY');return end
local b <close> = second;b:setvbuf('no')
assert(io.open('/dev/rw4wstream','rb')==nil);assert(stats()[18]==2)
local prefix=assert(a:read(17));local other=assert(b:read(89612));assert(#other==89612 and b:read(1)==nil)
local parts={prefix};local left=89612-17
while left>0 do local n=math.min(257,left);local chunk=assert(a:read(n));assert(#chunk==n);parts[#parts+1]=chunk;left=left-n end
assert(a:read(1)==nil);assert(a:close());assert(b:close());assert(stats()[18]==0)
for i,bytes in ipairs({table.concat(parts),other}) do
 local w <close> = assert(io.open('/tmp/rw4-wframe-reader-'..i..'.bin','wb'));assert(w:write(bytes));assert(w:close()) end
print('WFRAME_READERS_OK exclusive=2 third_rejected=1 split=17+257 eof=1')`;
    const local=path.join(s.folder,'readers.lua');fs.writeFileSync(local,code);s.adb(['push',local,guest],'push-readers');
    let readersPassed=false,retries=0;
    for(let attempt=0;attempt<12;attempt++) {
      const out=s.adb(['shell','lua',guest],'readers-'+attempt);
      if(out.includes('WFRAME_READERS_OK')) { readersPassed=true;break; }
      if(!out.includes('WFRAME_READERS_RETRY'))throw Error('Reader contract failed');
      retries++;await delay(120);
    }
    if(!readersPassed)throw Error('No window with two ready buffers; retain evidence');
    const nativeFrames=[];
    for(let i=1;i<=2;i++) {
      const copy=path.join(s.folder,'reader-'+i+'.bin');s.adb(['pull','/tmp/rw4-wframe-reader-'+i+'.bin',copy],'reader-copy-'+i);
      const bytes=fs.readFileSync(copy);if(bytes.length!==89612||!bytes.subarray(0,12).equals(Buffer.from([0x19,0x12,0,0,0x40,1,0x8c,0,0x80,2,0,0])))throw Error('Frame layout differs');
      let gen=0;for(let bit=0;bit<32;bit++){const p=bytes.readUInt16LE(12+20*bit);if(p===65535)gen=(gen+2**bit)>>>0;else if(p!==0)throw Error('Barcode bytes differ');}
      const palette=[0xf800,0x07e0,0x001f,0xffff,0xffe0,0x07ff,0xf81f,0];
      for(let y=0;y<140;y++)for(let x=0;x<320;x++) {
        const expected=y<8?((gen>>>Math.floor(x/10))&1?65535:0):y<70?palette[(Math.floor(x/40)+gen)&7]:((Math.floor(x/16)^Math.floor(y/16)^gen)&1?65535:0);
        if(bytes.readUInt16LE(12+2*(y*320+x))!==expected)throw Error('Native stream mixed frames');
      }
      nativeFrames.push({generation:gen,bytes:bytes.length,exactPixels:44800});s.adb(['shell','rm','/tmp/rw4-wframe-reader-'+i+'.bin'],'remove-reader-'+i);
    }
    s.adb(['shell','rm',guest],'remove-readers-script');fs.writeFileSync(path.join(s.folder,'reader-result.json'),JSON.stringify({passed:true,nativeFrames,simultaneousReaders:2,thirdRejected:true,partialRead:true,eof:true,retries},null,2));
    sample('after-readers');
  }
  const last=s.state();if(!last||last.blocked<1)throw Error('Bounded buffers did not exert backpressure');
  await gesture(195,390,195,390);let gone=false;
  for(let i=0;i<12;i++){if(s.state()===null){gone=true;break;}await delay(150);}
  if(!gone||s.adb(['shell','lsmod'],'after-exit-'+cycle).includes('rw4wframe'))throw Error('EXIT did not unload');
  if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls','/dev/rw4wstream'],'stream-after-'+cycle)))throw Error('Stream remains');
  const afterPs=s.adb(['shell','ps'],'ps-after-'+cycle);if(afterPs.split(/\r?\n/).some(l=>new RegExp('^\\s*'+first.state.tid+'\\s').test(l)))throw Error('Worker remains');
  noFiles();launcher(capture('exited-'+cycle));cycles.push({workerTid:first.state.tid,task:row,last,pause,workerGone:true,moduleGone:true,nodesGone:true,filesGone:true});
}
const freeAfter=s.adb(['shell','free'],'free-after');
const result={passed:true,folder:s.folder,cycles,screenshotFrames:observations.length,pixelsPerScreenshot:44800,freeBefore,freeAfter,
  noDoom:true,noWad:true,physicalTransport:false,rebootForExit:false};
fs.writeFileSync(path.join(s.folder,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
