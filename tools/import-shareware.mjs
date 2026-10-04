// Extract exactly one verified data file from a local Debian tar.gz; no installers.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {projectRoot} from './verify-emulator.mjs';
import {digest,verifyShareware} from './wad-data.mjs';
export function readTar(bytes){
  if(bytes.length%512!==0||bytes.length>8*1024*1024)throw Error('Invalid bounded tar');
  const entries=[];let p=0,ended=false;
  while(p+512<=bytes.length){
    const h=bytes.subarray(p,p+512);
    if(h.every(b=>b===0)){
      if(p+1024>bytes.length||!bytes.subarray(p+512,p+1024).every(b=>b===0)||bytes.subarray(p).some(b=>b!==0))throw Error('Invalid tar end');
      ended=true;break;
    }
    const text=(a,b)=>{const part=h.subarray(a,b),end=part.indexOf(0);return part.toString('ascii',0,end<0?part.length:end);};
    const oct=(a,b)=>{const s=text(a,b).trim();if(!/^[0-7]+$/.test(s))throw Error('Unsupported tar number');return Number.parseInt(s,8);};
    let sum=0;for(let i=0;i<512;i++)sum+=i>=148&&i<156?32:h[i];
    if(sum!==oct(148,156))throw Error('Tar header checksum differs');
    const prefix=text(345,500),name=(prefix?prefix+'/':'')+text(0,100),type=h[156],size=oct(124,136);
    if(!name||name.startsWith('/')||name.includes('\\')||name.split('/').some(x=>x==='..')||!name.split('/').every(x=>/^[a-zA-Z0-9._-]*$/.test(x)))throw Error('Unsafe tar name');
    if(![0,48,53].includes(type)||(type===53&&size!==0))throw Error('Unsupported tar entry/link');
    const start=p+512,next=start+Math.ceil(size/512)*512;
    if(next>bytes.length)throw Error('Truncated tar body');
    entries.push({name,type,size,bytes:bytes.subarray(start,start+size)});p=next;
  }
  if(!ended)throw Error('Missing tar terminator');return entries;
}
export function importShareware(){
  const root=path.join(projectRoot,'tools/local/doom-shareware');
  const archive=path.join(root,'doom-wad-shareware_1.9.fixed.orig.tar.gz');
  const st=fs.lstatSync(archive);if(!st.isFile()||st.isSymbolicLink()||st.size>4*1024*1024)throw Error('Invalid local archive');
  const packed=fs.readFileSync(archive);
  // Local review pin from R63, not a claim of upstream signature authentication.
  if(packed.length!==1756095||digest(packed)!=='e02c8b5e01be7373d4c53f82556118e2aaaf8f83fa2af5eee1efadf9c55c4eb1')throw Error('Archive differs from locally reviewed R63 data');
  const tar=zlib.gunzipSync(packed,{maxOutputLength:8*1024*1024});
  const entries=readTar(tar),wads=entries.filter(e=>[0,48].includes(e.type)&&e.name.split('/').at(-1)==='doom1.wad');
  if(wads.length!==1)throw Error('Archive must contain exactly one doom1.wad');
  const review=verifyShareware(wads[0].bytes),destination=path.join(root,'doom1.wad');
  if(fs.existsSync(destination)){
    if(fs.lstatSync(destination).isSymbolicLink()||digest(fs.readFileSync(destination))!==review.sha256)throw Error('Existing own WAD differs');
  }else fs.writeFileSync(destination,wads[0].bytes,{flag:'wx'});
  const record={...review,source:'https://ftp.psnc.pl/linux/debian/pool/non-free/d/doom-wad-shareware/doom-wad-shareware_1.9.fixed.orig.tar.gz',
    archiveSha256:digest(packed),archiveBytes:packed.length,archiveEntries:entries.map(({name,type,size})=>({name,type,size})),
    identityChecks:['Debian game-data-packager size, MD5 and SHA1','IWAD bounds and E1 map/resource directory'],
    archiveSignatureVerified:false,sha256PublishedUpstreamCompared:false,executedDownloadedCode:false,redistributed:false};
  fs.writeFileSync(path.join(root,'review.json'),JSON.stringify(record,null,2)+'\n');return record;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.length!==2)throw Error('Only the fixed project-local archive accepted');
  console.log(JSON.stringify(importShareware(),null,2));
}
