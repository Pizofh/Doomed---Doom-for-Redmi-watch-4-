// SPDX-License-Identifier: GPL-2.0-only
// Isolated retail profile: no changes to the accepted shareware launcher.
import assert from 'node:assert/strict';
import {menuLauncher,menuAssets} from './doom-menu-r370.mjs';
import {root,sha256,once} from './doom-ready-source-r351.mjs';
import {ultimateProfile as p,ultimateWadPath} from './doom-ultimate-source-r374.mjs';
import {png} from './first-c-assets.mjs';
export {root,sha256};
export function ultimateLauncher(elf,templateWad){
 const old=menuLauncher(elf,templateWad);
 const base='/data/app/watchface/market/'+p.id+'/lua/';
 const config={...old.config,id:p.id,module:p.module,base,ui_base:base,
  wad_path:ultimateWadPath('rw4'),wad_bytes:p.wadBytes,wad_lumps:p.wadLumps,
  wad_directory:p.wadDirectory,wad_crc:p.wadCrc32,min_free:p.minFree,min_largest:p.minLargest};
 const configLine='local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 let source=old.source.replace(/^local config=.*$/m,configLine);
 assert.notEqual(source,old.source);
 source=source.replaceAll('365219936',p.id).replaceAll('rw4menu370',p.module);
 assert.equal(source.split('371943786').length-1,3,'all three save identity guards');
 source=source.replaceAll('371943786',String(p.wadCrc32));
 source=once(source,'config.min_free==6956611','config.min_free=='+p.minFree);
 assert(!source.includes('365219963')&&!source.includes('371943786'));
 assert(Buffer.byteLength(source)<=32768);
 return {config,source,sourceSha256:sha256(source)};
}
export function ultimateAssets(){
 const assets=menuAssets();
 // Amber frame, four bars = four episodes; distinct from all accepted previews.
 assets.preview=png(390,450,(x,y)=>
  ((x>=70&&x<320&&((y>=90&&y<105)||(y>=330&&y<345)))||
   (y>=90&&y<345&&((x>=70&&x<85)||(x>=305&&x<320)))||
   (y>=145&&y<285&&[110,155,200,245].some(at=>x>=at&&x<at+25)))
   ?[255,180,30]:[16,32,48]);
 return assets;
}
