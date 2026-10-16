// Run the real Lua encoder in the owned S3 guest, then independently decode PNG on PC.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {inflateSync} from 'node:zlib';
import {session} from './doom-ui-emulator.mjs';import {root,sha256} from './doom-first-run-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const source=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/frame-png.lua'),'utf8'),crc=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/crc32.lua'),'utf8');
const raw=Buffer.alloc(128032),expected=Buffer.alloc(192200);let fnv=0x811c9dc5;
for(let y=0;y<200;y++)for(let x=0;x<320;x++){
 const r=x%32,g=y%64,b=(x+y)%32,v=(r<<11)|(g<<5)|b,at=32+2*(y*320+x);raw.writeUInt16LE(v,at);
 for(const byte of [raw[at],raw[at+1]])fnv=Math.imul(fnv^byte,16777619)>>>0;
 const p=y*961+1+3*x;expected[p]=(r<<3)|(r>>2);expected[p+1]=(g<<2)|(g>>4);expected[p+2]=(b<<3)|(b>>2);
}
[0x32464452,1,320,200,2,1,35,fnv].forEach((n,i)=>raw.writeUInt32LE(n,4*i));
const s=session('doom-frame-png'),top='/tmp/rw4-frame-png-r301-tests',before=s.adb(['shell','lsmod'],'before');
if(!/^nsh: ls: stat failed: 2\r?$/im.test(s.adb(['shell','ls',top],'absence')))throw Error('ScratchExists');
const lua=`local codec=(function()\n${source}\nend)()
local crc=(function()\n${crc}\nend)()
local top='${top}'
local original=assert(io.open(top..'/raw','rb'));local bytes=assert(original:read('*a'));assert(original:close())
local cases=0
local function test(options)
 local ins,outs,position,closed_i,closed_o=nil,nil,1,0,0
 local output={};local writes=0;local path=top..'/result.png'
 local files={open=function(p,mode)
  if p==path and mode=='rb' then
   if options.occupied then return {close=function()return true end}end
   return nil,'missing',2
  end
  if p==path and mode=='wb' then
   outs={write=function(_,b)writes=writes+1;if writes==options.fail_write then return nil end;output[#output+1]=b;return true end,
    flush=function()return not options.fail_flush end,close=function()closed_o=closed_o+1;return not options.fail_close end}
   return outs
  end
  assert(p=='/dev/rw4doomframe' and mode=='rb')
  ins={setvbuf=function(_,m)assert(m=='no');return true end,
   read=function(_,n)
    if options.read_error and position>32 then return nil,'read error' end
    local data=options.bytes or bytes
    if position>#data then return nil end
    local r=data:sub(position,position+n-1);position=position+#r;return r
   end,close=function()closed_i=closed_i+1;return true end}
  return ins
 end}
 local b=codec.new(files,crc,path);local ticks=0;local result
 local good=pcall(function()
  b.start()
  if options.cancel then b.cancel();return end
  repeat ticks=ticks+1;assert(ticks<=50);result=b.tick()until result
 end)
 b.cancel();assert(closed_i==(ins and 1 or 0) and closed_o==(outs and 1 or 0),'all opened handles closed once')
 assert(good==not not options.good,'unexpected result')
 if options.good and not options.cancel then assert(result==path and ticks==50);assert(b.tick()==nil);assert(not pcall(b.start))end
 cases=cases+1
 return table.concat(output)
end
local png=test{good=true};local f=assert(io.open(top..'/result.png','wb'));assert(f:write(png));assert(f:close())
test{occupied=true};test{read_error=true};test{bytes=bytes:sub(1,31)};test{bytes=bytes:sub(1,-2)};test{bytes=bytes..'x'}
test{bytes=bytes:sub(1,32)..string.char(bytes:byte(33)~1)..bytes:sub(34)}
for _,at in ipairs({1,5,9,13,17,21})do test{bytes=bytes:sub(1,at-1)..string.char(bytes:byte(at)~1)..bytes:sub(at+1)}end
for _,n in ipairs({1,2,3,102,202,203})do test{fail_write=n}end
test{fail_flush=true};test{fail_close=true};test{cancel=true,good=true}
print('RAW_PNG_TESTS_OK '..cases)
`;
fs.writeFileSync(path.join(s.folder,'test.lua'),lua);fs.writeFileSync(path.join(s.folder,'raw'),raw);s.adb(['shell','mkdir',top],'mkdir');let output;
try{
 s.adb(['push',path.join(s.folder,'test.lua'),top+'/test.lua'],'push-script');s.adb(['push',path.join(s.folder,'raw'),top+'/raw'],'push-raw');
 output=s.adb(['shell','lua',top+'/test.lua'],'tests');
 if(!/RAW_PNG_TESTS_OK \d+/.test(output))throw Error('LuaPngTestsFailed');
 s.adb(['pull',top+'/result.png',path.join(s.folder,'result.png')],'pull-png');
}finally{for(const name of ['test.lua','raw','result.png'])s.adb(['shell','rm',top+'/'+name],'remove-'+name.replace('.','-'));s.adb(['shell','rmdir',top],'rmdir');}
assert.equal(s.adb(['shell','lsmod'],'after'),before);
const png=fs.readFileSync(path.join(s.folder,'result.png'));assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
function crc32(b){let n=0xffffffff;for(const c of b){n^=c;for(let i=0;i<8;i++)n=(n&1)?(n>>>1)^0xedb88320:n>>>1;}return(n^0xffffffff)>>>0;}
let at=8,types=[],data=[];while(at<png.length){const n=png.readUInt32BE(at),type=png.toString('ascii',at+4,at+8),b=png.subarray(at+8,at+8+n);assert.equal(png.readUInt32BE(at+8+n),crc32(png.subarray(at+4,at+8+n)));types.push(type);if(type==='IDAT')data.push(b);if(type==='IHDR'){assert.equal(b.readUInt32BE(0),320);assert.equal(b.readUInt32BE(4),200);assert.equal(b[8],8);assert.equal(b[9],2);}at+=n+12;}
assert.equal(at,png.length);assert.deepEqual(types,['IHDR',...Array(200).fill('IDAT'),'IEND']);assert(inflateSync(Buffer.concat(data)).equals(expected));
const result={checkpoint:'R301',passed:true,luaCases:Number(output.match(/RAW_PNG_TESTS_OK (\d+)/)[1]),pixelsCompared:64000,chunkCrcsChecked:202,zlibAdlerVerified:true,sourceSha256:sha256(source),pngBytes:png.length,pngSha256:sha256(png),ticks:50,rowsPerTick:4,sourceFrameNativeSimulated:true,physicalDecoderTested:false,physicalTransport:false};
const evidence=path.join(root,'artifacts/doom-frame-png-r301');fs.mkdirSync(evidence,{recursive:true});fs.writeFileSync(path.join(evidence,'tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
