// Static, offline, fixed-input inspection. Never executes firmware or contacts hardware.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('FixedInputOnly');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const folder=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193');
const file=path.join(folder,'rw4-stock-2.2.86-candidate.bin');
const output=path.join(root,'artifacts/research/rw4-firmware-static-r193.json');
try{
  if(fs.existsSync(output))throw Error('ExistingReport');
  const record=JSON.parse(fs.readFileSync(path.join(folder,'download.json'),'utf8'));
  const stat=fs.lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size<=0||stat.size>67108864||record.status!=='DownloadedAsData'||
    record.host!=='res-abroad-cdn.home.mi.com'||record.metadataMd5Verified!==true||record.contentLength!==stat.size)throw Error('InputRefused');
  const bytes=fs.readFileSync(file);
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  if(sha256!==record.sha256)throw Error('HashMismatch');
  const markers=['M2315W1','Redmi Watch 4','2.2.86','NuttX','BES2700','STAR-MC1','Cortex-M','Cortex-A',
    'CONFIG_BUILD_FLAT','CONFIG_BUILD_PROTECTED','CONFIG_BUILD_KERNEL','insmod','rmmod','lsmod','iwasm',
    '/dev/fb0','lvgl','Lua 5.4'];
  const hits=markers.map(marker=>{
    const needle=Buffer.from(marker,'ascii'),offsets=[];
    for(let offset=bytes.indexOf(needle);offset>=0;offset=bytes.indexOf(needle,offset+needle.length)){
      offsets.push(offset);if(offsets.length>100000)throw Error('MarkerLimit');
    }
    return {marker,count:offsets.length,offsets};
  });
  const magics=[['ELF',[0x7f,0x45,0x4c,0x46]],['ZIP-local',[0x50,0x4b,3,4]],['gzip',[0x1f,0x8b,8]],['xz',[0xfd,0x37,0x7a,0x58,0x5a,0]],['LZ4-frame',[4,0x22,0x4d,0x18]]];
  const containers=magics.map(([format,magic])=>{
    const needle=Buffer.from(magic),offsets=[];
    for(let offset=bytes.indexOf(needle);offset>=0;offset=bytes.indexOf(needle,offset+1)){
      offsets.push(offset);if(offsets.length>100000)throw Error('MagicLimit');
    }
    return {format,count:offsets.length,offsets};
  });
  const result={checkpoint:'R193',sizeBytes:bytes.length,sha256,metadataMd5Verified:true,headerHex:bytes.subarray(0,32).toString('hex'),
    markers:hits,magicCandidates:containers,magicMatchesAreNotValidatedContainers:true,modelCompatibilityVerified:false,
    firmwareExecuted:false,networkRequested:false,watchCommandRequested:false};
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({...result,markers:hits.map(({marker,count})=>({marker,count})),magicCandidates:containers.map(({format,count})=>({format,count}))}));
}catch{console.error('Static firmware inspection refused; no raw firmware/log text exported.');process.exitCode=1;}
