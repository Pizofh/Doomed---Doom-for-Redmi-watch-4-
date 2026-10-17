// Independent diagnostic payload. Existing physical candidates stay immutable.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,paletteLauncher,paletteAssets,paletteTransport} from './doom-palette-source-r333.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};export const benchId='365219946';
function once(s,a,b){if(s.split(a).length!==2)throw Error('BenchTemplateChanged: '+a);return s.replace(a,()=>b);}
const compact=s=>s.replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
export function benchTransport(){
 let s=once(paletteTransport(),'#include "runtime.h"','#include "runtime.h"\n#include "profile-r335.h"');
 s=once(s,'static atomic_uint image_diag[11];',`static atomic_uint image_diag[11];
static atomic_uint profile[8],profile_begin,profile_end,profile_cal;
static uint32_t profile_clock(void){return (uint32_t)rw4_host_clock_ticks();}
int rw4_game_calibrate(void)
{
    if(atomic_load(&profile_cal))return -16;
    uint32_t minimum=UINT32_MAX;
    for(unsigned i=0;i<3;i++){
        uint32_t before=profile_clock();
        if(rw4_host_usleep(200000u))return -5;
        uint32_t elapsed=profile_clock()-before;
        if(!elapsed||elapsed>UINT32_MAX/25u)return -5;
        if(elapsed<minimum)minimum=elapsed;
    }
    atomic_store(&profile_cal,minimum);return 0;
}
void rw4_game_tick_cost(uint32_t ticks){atomic_fetch_add(&profile[4],ticks);atomic_fetch_add(&profile[6],1);}
void rw4_game_sleep_cost(uint32_t ticks){atomic_fetch_add(&profile[5],ticks);}`);
 s=once(s,'void rw4_game_ready(void){atomic_store(&accepting,1);atomic_store(&ready,1);}',
 'void rw4_game_ready(void){atomic_store(&profile_begin,profile_clock());atomic_store(&accepting,1);atomic_store(&ready,1);}');
 s=once(s,'void rw4_game_frame(const uint32_t *pixels,unsigned tic)','static void game_frame_inner(const uint32_t *pixels,unsigned tic)');
 s=once(s,'static void *worker(void *unused)',`void rw4_game_frame(const uint32_t *pixels,unsigned tic)
{uint32_t before=profile_clock();game_frame_inner(pixels,tic);atomic_fetch_add(&profile[3],profile_clock()-before);}
static void *worker(void *unused)`);
 s=once(s,'atomic_store(&finished,1);return NULL;','atomic_store(&profile_end,profile_clock());atomic_store(&finished,1);return NULL;');
 s=once(s,'uint32_t initial[20]={RW4_CONTROL_MAGIC,2,','uint32_t initial[20]={RW4_CONTROL_MAGIC,3,');
 s=once(s,`    out[0]=atomic_load(&image_ref);
    for(unsigned i=0;i<11;i++)out[i+1]=atomic_load(&image_diag[i]);`,
 `    unsigned done=atomic_load(&finished),is_ready=atomic_load(&ready);
    out[0]=is_ready?(done?atomic_load(&profile_end):profile_clock())-atomic_load(&profile_begin):0;
    for(unsigned i=0;i<8;i++)out[1+i]=atomic_load(&profile[i]);
    out[9]=atomic_load(&metrics[0]);out[10]=atomic_load(&metrics[1]);
    out[11]=atomic_load(&profile_cal);`);
 // Order tail: elapsed, prepare, read, bytes, copy, tick, sleep, calls, maxread,
 // gametic, drawn, calibration. Lua below uses the corresponding indices.
 s=once(s,'int rc=rw4_image_prepare(frames[slot].bytes+32);','uint32_t before=profile_clock();int rc=rw4_image_prepare(frames[slot].bytes+32);atomic_fetch_add(&profile[0],profile_clock()-before);');
 s=once(s,'int rc=image_read_inner(f,b,n);',`uint32_t before=profile_clock();int rc=image_read_inner(f,b,n);
    uint32_t elapsed=profile_clock()-before;atomic_fetch_add(&profile[1],elapsed);
    if(rc>0)atomic_fetch_add(&profile[2],(unsigned)rc);
    unsigned longest=atomic_load(&profile[7]);
    while(elapsed>longest&&!atomic_compare_exchange_weak(&profile[7],&longest,elapsed)){}`);
 return s;
}
export function benchAdapter(){
 let s=fs.readFileSync(path.join(root,'build/doom-low-memory-r284/adapter-low.c'),'utf8');
 if(sha256(s)!=='2e7e2146aa6678818c2cd43740dccf05509d77417c970c4b726d04e8bdf20bfe')throw Error('LowAdapterChanged');
 s=once(s,'#include "runtime.h"','#include "runtime.h"\n#include "profile-r335.h"');
 s=once(s,'(void)unused;started=raw_ticks();initializing=1;','(void)unused;if(rw4_game_calibrate())rw4_exit(77);started=raw_ticks();initializing=1;');
 s=once(s,'    if(rw4_host_usleep(ms*1000u))rw4_exit(77);',`    unsigned measured=!initializing&&!waiting;uint32_t before=(uint32_t)rw4_host_clock_ticks();
    if(rw4_host_usleep(ms*1000u))rw4_exit(77);
    if(measured)rw4_game_sleep_cost((uint32_t)rw4_host_clock_ticks()-before);`);
 return once(s,'        doomgeneric_Tick();','        uint32_t before=(uint32_t)rw4_host_clock_ticks();doomgeneric_Tick();rw4_game_tick_cost((uint32_t)rw4_host_clock_ticks()-before);');
}
export const benchNames={cal:'CAL TICK',engms:'ENG MS',drawms:'DRAW MS',engtics:'ENG TICS',drawtics:'DRAW TIC',images:'IMAGES',prepms:'PREP MS',readms:'READ MS',copyms:'FRAME MS',tickms:'TICK MS',sleepms:'SLEEP MS',gapms:'GAP MS'};
export function benchAssets(){const a=paletteAssets();for(const k of ['refs','open','close','cerror','reads','rerror','serror','cfirst','clast','maxread','relerr','pos'])delete a[k];for(const [k,v]of Object.entries(benchNames))a[k]=png(96,20,(x,y)=>ownTextPixel(v,x,y,[16,32,48]));return a;}
export function benchLauncher(elf,wad){
 const p=paletteLauncher(elf,wad),base='/data/app/watchface/market/'+benchId+'/lua/';
 const config={...p.config,id:benchId,base,ui_base:base,module:'rw4png335'};
 let c=once(p.parts.controller,'s[2]==2','s[2]==3');
 c=once(c,'if not paused and s[10]>0 then','if not paused and s[10]>0 and (not view.should_frame or view.should_frame())then');
 const w=once(p.parts.wrapper,'native=view.native})','native=view.native,should_frame=view.should_frame})');
 let source=once(once(p.source,compact(p.parts.controller),compact(c)),compact(p.parts.wrapper),compact(w));
 source=source.replace(/^local config=[^\n]+/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 const benchmark=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/benchmark-r335.lua'),'utf8');
 source=once(source,'local native_values,page=nil,0','local benchmark=(function()\n'+compact(benchmark)+'end)()\nlocal bench=benchmark.new()\nlocal page=0');
 source=once(source,"local names={{'refs','open','close'},{'cerror','reads','rerror'},{'serror','cfirst','clast'},{'maxread','relerr','pos'}}",'local names='+JSON.stringify(Object.keys(benchNames).reduce((a,k,i)=>{if(i%3===0)a.push([]);a.at(-1).push(k);return a;},[])).replaceAll('[','{').replaceAll(']','}'));
 source=once(source,'local value=native_values and native_values[(page-1)*3+row]or 99999999','local value=bench.values()[(page-1)*3+row]');
 source=once(source,`local values={}
for i=1,12 do local v=s[20+i];assert(type(v)=='number' and v>=0 and v<=4294967295 and v%1==0);values[i]=v end
native_values=values`,'bench.observe(s)');
 source=once(source,"if name=='ERROR' then render_record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end",`if name=='CLOSED' then page=1 end
if name=='ERROR' or name=='CLOSED' then render_record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end`);
 source=once(source,'view.operation(8);assert(w==320 and h==200);view.operation(0)','view.operation(8);assert(w==320 and h==200);view.operation(0);bench.image()');
 source=once(source,'backend=factory.new(config,io,os,view)',`view.should_frame=function()return bench.should_frame()end
backend=factory.new(config,io,os,view)
local original_start,original_tick=backend.start,backend.tick
backend.start=function()if backend.phase()=='READY' or backend.phase()=='CLOSED' then bench=benchmark.new();page=0 end;original_start()end
backend.tick=function()original_tick();if bench.take_stop()then backend.stop()end end
backend.input=function()end;backend.release=function()end;backend.pause=function()end`);
 if(Buffer.byteLength(source)>28672||/__[A-Z_]+__/.test(source))throw Error('BenchSourceLimit');
 return {...p,config,source,sourceSha256:sha256(source),parts:{...p.parts,controller:c,wrapper:w,benchmark}};
}
