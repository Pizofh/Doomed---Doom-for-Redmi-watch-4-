// SPDX-License-Identifier: GPL-2.0-only
// Local candidate only. No physical gate or deployment command is provided.
import {once} from './doom-ready-source-r351.mjs';
export function recoveryTransport(source){
 let s=once(source,'#include "sink-worker.h"','#include "sink-worker.h"\n#include "media-sink.h"\n#include "direct-detach-r368.h"');
 s=once(s,'    while(!rw4_audio_sink_quiet())(void)rw4_host_usleep(20000);\n    if(rw4_audio_sink_join())atomic_store(&error,1);\n','');
 s=once(s,'op>9','op>10');
 s=once(s,'DIRECT_MAGIC,6,sequence','DIRECT_MAGIC,7,sequence');
 s=once(s,'if(op>=8){',`if(op==10){
        if(!started||joined)return -16;
        atomic_store(&stop,1);atomic_store(&requested,0);atomic_fetch_add(&epoch,1);
        rc=rw4_direct_detach(&display);
    }else if(op>=8){`);
 s=once(s,'rc=rw4_direct_close(&display,1);if(rc){atomic_store(&error,1);return rc;}',
 `rc=rw4_direct_retire(&display,1);if(rc){atomic_store(&error,1);return rc;}
        /* Game join and graphics retirement do not prove audio quiescence. */
        if(!rw4_audio_sink_quiet())return -16;
        rc=rw4_audio_sink_join();if(rc){atomic_store(&error,1);return rc;}`);
 s=once(s,'snapshot[44]=atomic_load(&tick_cost);snapshot[45]=atomic_load(&sleep_cost);snapshot[46]=atomic_load(&tick_calls);',
 'snapshot[44]=display.image!=NULL;snapshot[45]=display.hooked;snapshot[46]=rw4_audio_sink_quiet();snapshot[47]=rw4_audio_device_stage();');
 s=once(s,'if(atomic_load(&error)||(started&&!joined)',
 'if(!rw4_audio_sink_quiet()||atomic_load(&error)||(started&&!joined)');
 return s;
}
export function recoveryController(controller){
 let s=once(controller,'s[2]==6','s[2]==7');
 s=once(s,"local function detach()end -- C retires its Image only after real worker join.",
 "local function detach()command(10)end -- UI only: remove Image, retain C/buffers until joins.");
 s=once(s,'if s[6]==1 then\n            if s[7]~=1 then detach();command(5);s=state()end',
 `if s[6]==1 then
            if s[7]~=1 then
                detach()
                if s[47]~=1 then
                    wait_ticks=wait_ticks+1
                    if wait_ticks>=50 then mask=0;status('ERROR')end -- audio quarantined, never rmmod
                    return
                end
                command(5);s=state()
            end`);
 // Recovery and error handling execute in the UI context. GC keeps the old
 // command(4) path, which only sets atomics and never calls LVGL.
 s=once(s,"if s[7]~=1 then command(4)end;status('RECOVERING')",
 "if s[7]~=1 then detach();command(4)end;status('RECOVERING')");
 s=once(s,"function b.failed()\n        if loaded then pcall(function()command(4)end)end",
 "function b.failed()\n        if loaded then pcall(detach);pcall(function()command(4)end)end");
 return s;
}
