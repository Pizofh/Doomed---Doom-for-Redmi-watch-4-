// Same R329 controller/UI logic; only identity and pinned ELF change.
import {root,sha256,holdLauncher,holdAssets} from './doom-hold-source-r329.mjs';
export {root,sha256};export const fastId='365219948';export const fastAssets=holdAssets;
export function fastLauncher(elf,wad){
 const p=holdLauncher(elf,wad),base='/data/app/watchface/market/'+fastId+'/lua/';
 const config={...p.config,id:fastId,base,ui_base:base,module:'rw4png331'};
 const source=p.source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 return {...p,config,source,sourceSha256:sha256(source)};
}
