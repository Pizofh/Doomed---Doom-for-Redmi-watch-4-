import {imageHoldTransport} from './doom-image-hold-source-r329.mjs';
import {root,sha256,fastLauncher,fastAssets} from './doom-fast-source-r331.mjs';
export {root,sha256};export const paletteId='365219947',paletteAssets=fastAssets;
function once(s,a,b){if(s.split(a).length!==2)throw Error('PaletteTemplateChanged: '+a);return s.replace(a,()=>b);}
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
export function paletteTransport(){
 let s=once(imageHoldTransport(),'#include "png-view.h"','#include "palette-view-r333.h"');
 return once(s,'image_slot=slot;rw4_image_prepare(frames[slot].bytes+32);return 0;',`image_slot=slot;int rc=rw4_image_prepare(frames[slot].bytes+32);
            if(rc){atomic_store(&frames[slot].state,FREE);image_slot=2;}return rc;`);
}
export function paletteLauncher(elf,wad){
 const p=fastLauncher(elf,wad),base='/data/app/watchface/market/'+paletteId+'/lua/';
 const config={...p.config,id:paletteId,base,ui_base:base,module:'rw4png333',min_free:6471381};
 const w=once(p.parts.wrapper,'config.min_free==6467285','config.min_free==6471381');
 let source=once(p.source,compact(p.parts.wrapper),compact(w));
 source=source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 return {...p,config,source,sourceSha256:sha256(source),parts:{...p.parts,wrapper:w}};
}
