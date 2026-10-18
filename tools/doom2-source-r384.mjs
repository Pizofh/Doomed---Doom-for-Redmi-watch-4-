// SPDX-License-Identifier: GPL-2.0-only
// An isolated Doom II profile; previous reviewed builds remain reproducible.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256,once} from './doom-ready-source-r351.mjs';
import {startupWorker} from './doom-audio-startup-r372.mjs';
export const doom2Profile=Object.freeze({id:'365220006',product:'DoomII',module:'rw4doomii384',
 archiveSha256:'995a8b4b0e546ac706069b0854989665976810a78c15116d5d52a92ef01395b2',
 wadSha256:'10d67824b11025ddd9198e8cfc87ca335ee6e2d3e63af4180fa9b8a471893255',
 wadBytes:14604584,wadCrc32:3968280027,wadLumps:2919,wadDirectory:14557880,maps:32,
 audioCacheBytes:640*1024,audioSampleBytes:620164,slotCapacity:196608,zoneMiB:3});
export function doom2Adapter(s){
 s=s.replaceAll('12408292u',doom2Profile.wadBytes+'u').replaceAll('3205409472u',doom2Profile.wadCrc32+'u');
 return once(s,'gameepisode<1||gameepisode>4||gamemap<1||gamemap>9','gameepisode!=1||gamemap<1||gamemap>32');
}
export function doom2Slot(s){
 return once(s.replaceAll('3205409472u',doom2Profile.wadCrc32+'u'),'(bytes[41]<1||bytes[41]>4)||bytes[42]<1||bytes[42]>9',
  'bytes[41]!=1||bytes[42]<1||bytes[42]>32');
}
export function doom2Sfx(s){
 // All effects, including the super shotgun, in the existing RAM budget.
 // Average adjacent unsigned PCM samples and halve their source rate. No
 // extra buffers or decoding in the realtime mixer; original WAD untouched.
 s=once(s,'#define CACHE_BYTES (672u*1024u)','#define CACHE_BYTES (640u*1024u)');
 s=once(s,'doomed_dmx_decode(dmx,length,&s)||s.length>CACHE_BYTES-used','doomed_dmx_decode(dmx,length,&s)');
 return once(s,'uint8_t *dst=cache+used;for(unsigned i=0;i<s.length;i++)dst[i]=s.data[i];',
 `unsigned count=s.rate>=8000?(s.length+1)/2:s.length;
 if(count>CACHE_BYTES-used)return -1;
 uint8_t *dst=cache+used;
 if(s.rate>=8000){for(unsigned i=0;i<count;i++){unsigned j=i*2,k=j+1<s.length?j+1:j;dst[i]=(uint8_t)(((unsigned)s.data[j]+s.data[k]+1)/2);}s.rate/=2;s.length=count;}
 else for(unsigned i=0;i<s.length;i++)dst[i]=s.data[i];`);
}
export function doom2Worker(s){
 s=startupWorker(s);
 s=once(s,'i<4;i++','i<16;i++');
 // Keep the media pipe fed even before the first effect. A silent empty queue
 // must not repeatedly underrun/restart the speaker. Calls remain on the worker.
 return once(s,'if(p||!got){if(rw4_host_usleep(5000)){rc=-5;break;}continue;}',
 `if(p){if(rw4_host_usleep(5000)){rc=-5;break;}continue;}
  if(!got){n=512;for(unsigned i=0;i<n;i++)pcm[i]=0;}`);
}
export function doom2PackedConfig(mode){
 const out=path.join(root,'build/doom2-r384'),p=JSON.parse(fs.readFileSync(path.join(out,'packed.json'),'utf8'));
 assert.equal(p.originalSha256,doom2Profile.wadSha256);assert.equal(p.originalBytes,doom2Profile.wadBytes);
 assert.equal(sha256(fs.readFileSync(path.join(out,'doom.rwc'))),p.packedSha256);
 const gamePath='/data/app/watchface/market/'+(mode==='rw4'?doom2Profile.id:'365799913')+'/lua/doom2-r384.wad';
 const defs={RW4_PACK_ORIGINAL_BYTES:p.originalBytes,RW4_PACK_ORIGINAL_CRC:p.originalCrc32,RW4_PACK_PAGES:p.pages,
 RW4_PACK_INDEX_CRC:p.indexCrc32,RW4_PACK_HEADER_CRC:p.headerCrc32,RW4_PACK_BYTES:p.packedBytes};
 const header=Object.entries(defs).map(([k,v])=>'#define '+k+' '+v+'u').join('\n')+'\n';
 const lock=JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/packed/tinf-r378.lock.json'),'utf8'));
 for(const [name,hash]of Object.entries(lock.files))assert.equal(sha256(fs.readFileSync(path.join(root,'third_party/tinf-r378',path.basename(name)))),hash);
 return{p,gamePath,header,lock};
}
