// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {startLauncher,startAssets,root,sha256} from './doom-start-r383.mjs';
import {packedAssets} from './doom-packed-r378.mjs';import {once} from './doom-ready-source-r351.mjs';
import {doom2Profile as p,doom2PackedConfig} from './doom2-source-r384.mjs';
import {crc32} from './static-watchface-transfer.mjs';import {png} from './first-c-assets.mjs';
export {root,sha256};
export function doom2Launcher(){
 const prior=startLauncher(),elf=fs.readFileSync(path.join(root,'build/doom-audio-r384/rw4/doom.elf'));
 const reviewed=JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r384/rw4/review.json'),'utf8'));
 assert.equal(sha256(elf),reviewed.elfSha256);assert.deepEqual(reviewed.doom2.profile,p);
 assert.equal(reviewed.doom2.sourceSha256,sha256(fs.readFileSync(path.join(root,'tools/doom2-source-r384.mjs'))));
 const {p:packed,gamePath}=doom2PackedConfig('rw4'),base='/data/app/watchface/market/'+p.id+'/lua/';
 const config={...prior.config,id:p.id,module:p.module,base,ui_base:base,assets_base:base,wad_path:gamePath,
  wad_bytes:p.wadBytes,wad_crc:p.wadCrc32,wad_lumps:p.wadLumps,wad_directory:p.wadDirectory,
  elf_bytes:elf.length,elf_sha:sha256(elf),elf_crc:crc32(elf),packed_bytes:packed.packedBytes,
  packed_pages:packed.pages,packed_index_crc:packed.indexCrc32,packed_header_crc:packed.headerCrc32};
 let source=prior.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=source.replaceAll('rw4packed378',p.module).replaceAll('3205409472',String(p.wadCrc32));
 // Separate quarantine from the game stop budget: a slow media CLOSE must not
 // become an immediate generic error. Never force a join or unload on expiry.
 source=once(source,'local mask,sequence,wait_ticks,registry_key=0,0,0,nil','local mask,sequence,wait_ticks,registry_key=0,0,0,nil\n    local audio_wait=0');
 source=once(source,'command(1);boot.stage=60;wait_ticks=0','command(1);boot.stage=60;audio_wait=0;wait_ticks=0');
 source=once(source,"wait_ticks=wait_ticks+1\n                    if wait_ticks>=50 then mask=0;status('ERROR')end",
  "boot.stage=82;audio_wait=audio_wait+1\n                    assert(audio_wait<500,'audio close timeout')");
 source=once(source,'command(5);s=state()','boot.stage=83;command(5);s=state()');
 source=once(source,"assert(capture('rmmod '..config.module)=='','unload reported an error')","boot.stage=84;assert(capture('rmmod '..config.module)=='','unload reported an error')");
 source=once(source,"detach();command(4);stopping=true;mask=0;wait_ticks=0;status('STOPPING')","boot.stage=80;detach();boot.stage=81;command(4);stopping=true;mask=0;wait_ticks=0;audio_wait=0;status('STOPPING')");
 source=once(source,"assert(wait_ticks<200,'worker stop timeout')","assert(wait_ticks<500,'worker stop timeout')");
 source=once(source,"{'registry changed',708}","{'registry changed',708},{'audio close timeout',709}");
 // Hide the input overlay as soon as STOPPING, so callbacks from the previous
 // page cannot submit gameplay actions during shutdown.
 source=once(source,"if name=='CHECKING' then if panel", "if name=='STOPPING' or name=='RECOVERING'then remove_overlay()end\nif name=='CHECKING' then if panel");
 assert(!source.includes('365220002')&&!source.includes('365220005'));
 assert.equal(config.min_free,7366211);assert.equal(config.min_largest,4194320);
 assert(Buffer.byteLength(source)<=32768);return{source,config,sourceSha256:sha256(source)};
}
export function doom2Assets(){
 const a={...packedAssets(),...startAssets()};
 // Red frame and two bars distinguish this full independent data carrier.
 a.preview=png(390,450,(x,y)=>((x>=65&&x<325&&y>=90&&y<345&&(x<80||x>=310||y<105||y>=330))||
  (y>=145&&y<290&&[150,215].some(at=>x>=at&&x<at+25)))?[255,80,60]:[16,32,48]);return a;
}
