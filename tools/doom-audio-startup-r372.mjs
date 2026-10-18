// SPDX-License-Identifier: GPL-2.0-only
// Separate local candidate: do not alter the accepted R369/R370 source inputs.
import {once} from './doom-ready-source-r351.mjs';
export function startupSfx(source){
 let s=once(source,'#include "doom-sfx.h"','#include "doom-sfx.h"\n#include "startup-r372.h"');
 s=once(s,' enabled=0;used=dropped=paused=clock_set=0;',
  ' rw4_audio_startup_reset();\n enabled=0;used=dropped=paused=clock_set=0;');
 s=once(s,'if(!enabled||paused){clock_set=0;return;}',
  'if(!enabled||paused||!rw4_audio_startup_ready()){clock_set=0;return;}');
 s=once(s,'void doomed_sfx_end(void){enabled=0;',
  'void doomed_sfx_end(void){rw4_audio_startup_reset();enabled=0;');
 return s;
}
export function startupWorker(source){
 let s=once(source,'#include "doom-sfx.h"','#include "doom-sfx.h"\n#include "startup-r372.h"');
 s=once(s,'static unsigned joined=1;','static unsigned joined=1;\nstatic atomic_uint primed;');
 s=once(s,' int rc=rw4_audio_device_open();',` int rc=rw4_audio_device_open();
 /* Open/start acknowledgement is not proof of audible output. Feed one
  * queue's worth (4 x 512 samples, ~93ms) of silence before advancing effects.
  * Existing synchronous calls may still block; stop is checked between calls.
  * This is a tested startup policy, not a measured speaker-ready guarantee. */
 for(unsigned i=0;i<512;i++)pcm[i]=0;
 for(unsigned i=0;!rc&&!atomic_load(&stop)&&i<4;i++){
  int sent=rw4_audio_device_write(pcm,sizeof(pcm));
  if(sent!=(int)sizeof(pcm)){rc=sent<0?sent:-104;break;}
  atomic_fetch_add(&primed,1);
 }
 if(!rc&&!atomic_load(&stop))rw4_audio_startup_publish();`);
 s=once(s,'atomic_store(&error,0);atomic_store(&blocks,0);atomic_store(&nonzero,0);',
  'atomic_store(&error,0);atomic_store(&blocks,0);atomic_store(&nonzero,0);atomic_store(&primed,0);');
 s=once(s,'if(id==2)return atomic_load(&error);return 0;',
  'if(id==2)return atomic_load(&error);if(id==3)return atomic_load(&primed);if(id==4)return rw4_audio_startup_ready();return 0;');
 return s;
}
