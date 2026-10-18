// SPDX-License-Identifier: GPL-2.0-only
// Profile-specific transforms; accepted shareware sources remain intact.
import fs from 'node:fs';import path from 'node:path';
import {root,once} from './doom-ready-source-r351.mjs';
export const ultimateProfile=Object.freeze(JSON.parse(fs.readFileSync(path.join(root,'doom/platform-rw4/ultimate-profile-r374.json'),'utf8')));
export function ultimateWadPath(mode){return mode==='rw4'?'/data/app/watchface/market/'+ultimateProfile.id+'/lua/doom.wad':'/data/app/watchface/market/365799913/lua/doom-ultimate-r374.wad';}
export function ultimateAdapter(source){
 let s=source.replaceAll('4196020u',ultimateProfile.wadBytes+'u').replaceAll('371943786u',ultimateProfile.wadCrc32+'u');
 return once(s,'gameepisode!=1||gamemap<1||gamemap>9','gameepisode<1||gameepisode>4||gamemap<1||gamemap>9');
}
export function ultimateSlot(source){
 let s=source.replaceAll('371943786u',ultimateProfile.wadCrc32+'u');
 return once(s,'bytes[41]!=1','(bytes[41]<1||bytes[41]>4)');
}
export function ultimateSfx(source){return once(source,'#define CACHE_BYTES (544u*1024u)','#define CACHE_BYTES (672u*1024u)');}
