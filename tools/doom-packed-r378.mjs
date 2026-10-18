// SPDX-License-Identifier: GPL-2.0-only
import assert from 'node:assert/strict';
import {ultimateLauncher,ultimateAssets,root,sha256} from './doom-ultimate-r374.mjs';
import {packedConfig} from './doom-packed-source-r378.mjs';import {once} from './doom-ready-source-r351.mjs';
import {png} from './first-c-assets.mjs';
export {root,sha256};
export const packedProfile=Object.freeze({id:'365220002',module:'rw4packed378',product:'DoomPacked',minFree:7366211,minLargest:4194320});
export function packedLauncher(elf,templateWad){
 const old=ultimateLauncher(elf,templateWad),{p,gamePath}=packedConfig('rw4'),base='/data/app/watchface/market/'+packedProfile.id+'/lua/';
 const config={...old.config,id:packedProfile.id,module:packedProfile.module,base,ui_base:base,wad_path:gamePath,
  min_free:packedProfile.minFree,packed_bytes:p.packedBytes,packed_pages:p.pages,packed_index_crc:p.indexCrc32,packed_header_crc:p.headerCrc32};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=source.replaceAll('365220001',packedProfile.id).replaceAll('rw4ultimate374',packedProfile.module);
 source=once(source,'config.min_free==7153219','config.min_free=='+packedProfile.minFree);
 source=once(source,`local h=assert(f:read(12));assert(#h==12 and h:sub(1,4)=='IWAD','WAD header')
            local count,offset=string.unpack('<I4I4',h,5)
            assert(count==config.wad_lumps and offset==config.wad_directory and f:seek('end')==config.wad_bytes,'WAD layout')`,
 `local h=assert(f:read(40));assert(#h==40 and string.unpack('<I4',h)==0x31435752,'packed header')
            local version,n,c,page,count,index,physical,reserved,header=string.unpack('<'..string.rep('I4',9),h,5)
            assert(version==1 and n==config.wad_bytes and c==config.wad_crc and page==65536 and count==config.packed_pages,'packed identity')
            assert(index==config.packed_index_crc and physical==config.packed_bytes and reserved==0 and header==config.packed_header_crc and f:seek('end')==config.packed_bytes,'packed layout')`);
 assert(Buffer.byteLength(source)<=32768);return {config,source,sourceSha256:sha256(source)};
}
export function packedAssets(){const a=ultimateAssets();a.preview=png(390,450,(x,y)=>
 ((x>=75&&x<315&&((y>=100&&y<118)||(y>=315&&y<333)))||
 (y>=100&&y<333&&((x>=75&&x<93)||(x>=297&&x<315)))||
 (x>=130&&x<260&&[165,205,245].some(at=>y>=at&&y<at+18)))?[90,255,180]:[16,32,48]);return a;}
