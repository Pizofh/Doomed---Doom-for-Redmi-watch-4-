// Skip expensive rendering while both immutable frame slots are occupied.
// Game tics/input continue through the original doomgeneric_Tick path.
import {root,sha256,benchTransport,benchAdapter} from './doom-bench-source-r335.mjs';
import {paletteLauncher,paletteAssets} from './doom-palette-source-r333.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const demandId='365219945';
function once(s,a,b){if(s.split(a).length!==2)throw Error('DemandTemplateChanged: '+a);return s.replace(a,()=>b);}
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
export function demandTransport(){
return once(benchTransport(),'static void game_frame_inner(',`/* Advisory only; sole producer cannot lose a FREE slot to the consumer.
 * No reservation/state/ref/sequence changes, waits, allocation or host calls. */
int rw4_game_frame_wanted(void)
{
    if(!atomic_load(&ready)||!atomic_load(&accepting)||atomic_load(&stop)||atomic_load(&paused))return 0;
    for(unsigned slot=0;slot<2;slot++)if(atomic_load(&frames[slot].state)==FREE)return 1;
    return 0;
}
static void game_frame_inner(`);
}
export function demandAdapter(){
let s=once(benchAdapter(),'#include "profile-r335.h"','#include "profile-r335.h"\n#include "demand-r337.h"');
return once(s,'uint32_t before=(uint32_t)rw4_host_clock_ticks();doomgeneric_Tick();rw4_game_tick_cost((uint32_t)rw4_host_clock_ticks()-before);',`/* Original D_Display exits early on nodrawers. TryRunTics, keys and sound
         * bookkeeping still execute; no timer scaling or renderer rewrite. */
        nodrawers=!rw4_game_frame_wanted();
        uint32_t before=(uint32_t)rw4_host_clock_ticks();doomgeneric_Tick();rw4_game_tick_cost((uint32_t)rw4_host_clock_ticks()-before);
        nodrawers=false;snapshot();`);
}
export function demandAssets(){
const a=paletteAssets();for(const n of ['refs','open','close','cerror','reads','rerror','serror','cfirst','clast','maxread','relerr','pos'])delete a[n];
for(const [n,label]of Object.entries({time:'TIME MS',tics:'TICS',images:'IMAGES'}))a[n]=png(96,20,(x,y)=>ownTextPixel(label,x,y,[16,32,48]));return a;
}
export function demandLauncher(elf,wad){
const p=paletteLauncher(elf,wad),base='/data/app/watchface/market/'+demandId+'/lua/';
const config={...p.config,id:demandId,base,ui_base:base,module:'rw4png337'};
const c=once(p.parts.controller,'s[2]==2','s[2]==3');let source=once(p.source,compact(p.parts.controller),compact(c));
source=source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
source=once(source,'local native_values,page=nil,0','local native_values,page={99999999,99999999,0},0\nlocal image_count,first_tic=0,nil');
source=once(source,"local names={{'refs','open','close'},{'cerror','reads','rerror'},{'serror','cfirst','clast'},{'maxread','relerr','pos'}}","local names={{'time','tics','images'}}");
source=once(source,`local values={}
for i=1,12 do local v=s[20+i];assert(type(v)=='number' and v>=0 and v<=4294967295 and v%1==0);values[i]=v end
native_values=values`,`if s[5]==1 and s[32]>0 then
first_tic=first_tic or s[30]
native_values={math.min(99999999,s[21]*200//s[32]),(s[30]-first_tic)&0xffffffff,image_count}
end`);
source=once(source,"if name=='ERROR' then render_record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end",`if name=='CLOSED' then page=1 end
if name=='ERROR' or name=='CLOSED' then render_record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end`);
source=once(source,'view.operation(8);assert(w==320 and h==200);view.operation(0)','view.operation(8);assert(w==320 and h==200);view.operation(0);image_count=image_count+1');
source=once(source,'backend=factory.new(config,io,os,view)',`backend=factory.new(config,io,os,view)
local original_start=backend.start
backend.start=function()
if backend.phase()=='READY' or backend.phase()=='CLOSED' then image_count=0;first_tic=nil;native_values={99999999,99999999,0};page=0 end
original_start()
end`);
source=once(source,'page=(page+1)%5','page=(page+1)%2');
if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('DemandSourceLimit');
return {...p,config,source,sourceSha256:sha256(source),parts:{...p.parts,controller:c}};
}
