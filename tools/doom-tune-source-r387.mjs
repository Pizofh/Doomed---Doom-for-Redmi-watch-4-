// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';
import {root,once} from './doom-ready-source-r351.mjs';import {doom2Worker} from './doom2-source-r384.mjs';
export function tuneWorker(source){
 let s=doom2Worker(source);
 s=once(s,'static atomic_uint primed;',`static atomic_uint primed;
/* Existing host tick contract is 100us. Pace even if media buffers a write
 * immediately. Slow service calls discard timing debt, never burst catch-up. */
static uint64_t deadline;static unsigned remainder;
static int pace(unsigned samples){
 unsigned scaled=samples*10000u+remainder;deadline+=scaled/22050u;remainder=scaled%22050u;
 uint64_t now=rw4_host_clock_ticks();if(now>deadline){deadline=now;remainder=0;return 0;}
 while(now<deadline&&!atomic_load(&stop)){
  uint64_t ticks=deadline-now;unsigned us=ticks>50?5000:(unsigned)ticks*100;
  if(rw4_host_usleep(us))return -5;now=rw4_host_clock_ticks();
 }return 0;
}`);
 s=once(s,'int rc=rw4_audio_device_open();','int rc=rw4_audio_device_open();deadline=rw4_host_clock_ticks();remainder=0;');
 s=once(s,'if(p!=was_paused){rc=rw4_audio_device_pause(p);was_paused=p;}',
 'if(p!=was_paused){deadline=rw4_host_clock_ticks();remainder=0;rc=rw4_audio_device_pause(p);was_paused=p;}');
 s=once(s,'atomic_fetch_add(&primed,1);','atomic_fetch_add(&primed,1);if(pace(512)){rc=-5;break;}');
 s=once(s,'if(p){if(rw4_host_usleep(5000)){rc=-5;break;}continue;}',
 'if(p){deadline=rw4_host_clock_ticks();remainder=0;if(rw4_host_usleep(5000)){rc=-5;break;}continue;}');
 s=once(s,'rc=0;atomic_fetch_add(&blocks,1);','rc=pace(n);if(rc)break;atomic_fetch_add(&blocks,1);');
 return s;
}
export function tuneView(){let s=fs.readFileSync(path.join(root,'doom/platform-rw4/device/direct-wide-r347.c'),'utf8');
 s=once(s,'306/256 uniform scale.','288/256 uniform scale; physical corner inset.');
 s=once(s,'(image,30)','(image,39)');return once(s,'(image,306)','(image,288)');}
