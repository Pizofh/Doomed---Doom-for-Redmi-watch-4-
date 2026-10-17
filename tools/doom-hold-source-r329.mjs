// Keep the current Image until the producer has published another READY frame.
import {root,sha256,leaseLauncher,leaseAssets} from './doom-lease-source-r327.mjs';
export {root,sha256};export const holdId='365219949';export const holdAssets=leaseAssets;
function once(s,a,b){if(s.split(a).length!==2)throw Error('HoldUiTemplateChanged: '+a);return s.replace(a,()=>b);}
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
export function holdLauncher(elf,wad){
 const p=leaseLauncher(elf,wad),base='/data/app/watchface/market/'+holdId+'/lua/';
 const config={...p.config,id:holdId,base,ui_base:base,module:'rw4png329'};
 let c=p.parts.controller;
 c=once(c,'local function acquire_image()','local function image_command(op)');
 c=once(c,'view.command(8)','view.command(op)');
 c=once(c,'sequence+1,8,0','sequence+1,op,0');
 c=once(c,"checkpoint(24);detach();checkpoint(25)\n            if acquire_image()then view.frame(image_path);status('PLAYING')end",`checkpoint(25)
            if image_command(9)then
                checkpoint(24);detach();checkpoint(25)
                if image_command(8)then view.frame(image_path);status('PLAYING')end
            end`);
 let source=once(p.source,compact(p.parts.controller),compact(c));
 source=source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 if(Buffer.byteLength(source)>24576)throw Error('HoldSourceLimit');
 return {...p,source,config,sourceSha256:sha256(source),parts:{...p.parts,controller:c}};
}
