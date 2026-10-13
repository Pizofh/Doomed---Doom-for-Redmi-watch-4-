// One explicitly selected image from the pinned stock package, as data only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folder=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193');
const output=path.join(root,'artifacts/research/rw4-native-image-r193.json');
const nativeFile=path.join(folder,'vela-ap-inspection-only.bin');
const expected='d9dee6871ca6dc893000214d04ef6f5429a1b0f9ea57c79d8db9caf83cff6321';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?(n>>>1)^0xedb88320:n>>>1;return n>>>0;});
function crc32(bytes){let n=0xffffffff;for(const b of bytes)n=(n>>>8)^crcTable[(n^b)&255];return (n^0xffffffff)>>>0;}
function check(ok){if(!ok)throw Error('InputRefused');}
try{
  check(!fs.existsSync(output)&&!fs.existsSync(nativeFile));
  const stat=fs.lstatSync(path.join(folder,'rw4-stock-2.2.86-candidate.bin'));check(stat.isFile()&&!stat.isSymbolicLink()&&stat.size===53979532);
  const b=fs.readFileSync(path.join(folder,'rw4-stock-2.2.86-candidate.bin'));check(hash(b)===expected);
  const containers=JSON.parse(fs.readFileSync(path.join(root,'artifacts/research/rw4-firmware-containers-r193.json'),'utf8'));check(containers.inputSha256===expected);
  const candidates=containers.zipCandidates.filter(c=>c.centralAndLocalBoundsVerified).flatMap(c=>c.entries).filter(e=>e.name==='vela_ap.bin');
  check(candidates.length===1);const e=candidates[0];
  check(e.method===8&&!(e.flags&1)&&e.size===6636408&&e.packed===3824102&&e.dataOffset>=30&&e.dataOffset+e.packed<=b.length);
  check(b.readUInt32LE(e.localOffset)===0x04034b50&&b.readUInt16LE(e.localOffset+8)===e.method);
  const nameLength=b.readUInt16LE(e.localOffset+26),extraLength=b.readUInt16LE(e.localOffset+28);
  check(b.subarray(e.localOffset+30,e.localOffset+30+nameLength).toString('utf8')==='vela_ap.bin'&&e.localOffset+30+nameLength+extraLength===e.dataOffset);
  const data=inflateRawSync(b.subarray(e.dataOffset,e.dataOffset+e.packed),{maxOutputLength:8388608,info:true});
  check(data.engine.bytesWritten===e.packed&&data.buffer.length===e.size&&crc32(data.buffer)===e.crc32);
  const image=data.buffer;
  const markers=['2.2.86','NuttX','M2315W1','Redmi Watch 4','BES2700','STAR-MC1','Cortex-M','Cortex-A','armv7','armv8',
    'CONFIG_BUILD_FLAT','CONFIG_BUILD_PROTECTED','CONFIG_BUILD_KERNEL','insmod','rmmod','lsmod','iwasm',
    'modlib','elf_load','up_checkarch','g_symtab','g_nsymbols','allsyms','module_initialize','module_uninitialize',
    'dlopen','loadlib','/dev/fb0','lvgl','Lua 5.4','printf','malloc','pthread_create','register_driver'];
  const hits=markers.map(marker=>{
    const needle=Buffer.from(marker,'ascii'),offsets=[];
    for(let offset=image.indexOf(needle);offset>=0;offset=image.indexOf(needle,offset+needle.length)){
      offsets.push(offset);check(offsets.length<=100000);
    }
    return {marker,count:offsets.length,offsets};
  });
  const result={checkpoint:'R193',sourcePackageSha256:expected,imageSha256:hash(image),imageBytes:image.length,
    zipPayloadCrcVerified:true,headerHex:image.subarray(0,128).toString('hex'),markers:hits,
    nativeContractVerified:false,firmwareExecuted:false,watchCommandRequested:false};
  fs.writeFileSync(nativeFile,image,{flag:'wx',mode:0o600});
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({...result,markers:hits.map(({marker,count})=>({marker,count}))}));
}catch{console.error('Native image inspection refused; no raw strings exported or firmware executed.');process.exitCode=1;}
