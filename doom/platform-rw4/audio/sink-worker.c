/* SPDX-License-Identifier: GPL-2.0-only */
#include "platform.h"
#include "sink-worker.h"
#include "doom-sfx.h"
static atomic_uint running,stop,paused,finished,error,blocks,nonzero;
static int32_t thread;
static unsigned joined=1;
static void *audio_worker(void *unused){
 (void)unused;int16_t pcm[512];unsigned n,was_paused=0;
 int rc=rw4_audio_device_open();
 if(rc)atomic_store(&error,(unsigned)(rc<0?-rc:rc));
 while(!rc&&!atomic_load(&stop)){
  unsigned p=atomic_load(&paused);
  if(p!=was_paused){rc=rw4_audio_device_pause(p);was_paused=p;}
  if(rc)break;
  int got=doomed_sfx_pop(pcm,&n);
  if(got<0){rc=-22;break;}
  if(p||!got){if(rw4_host_usleep(5000)){rc=-5;break;}continue;}
  rc=rw4_audio_device_write(pcm,n*2);
  if(rc!=(int)(n*2)){if(rc>=0)rc=-104;break;}
  rc=0;atomic_fetch_add(&blocks,1);
  for(unsigned i=0;i<n;i++)if(pcm[i]){atomic_fetch_add(&nonzero,1);break;}
 }
 if(rc)atomic_store(&error,(unsigned)(rc<0?-rc:rc));
 /* A failed/blocked close never claims quiet or permits unload. */
 int closed=rw4_audio_device_close();
 if(closed){atomic_store(&error,(unsigned)(closed<0?-closed:closed));return 0;}
 atomic_store(&finished,1);return 0;
}
int rw4_audio_sink_begin(void){
 if(!joined)return -16;
 atomic_store(&stop,0);atomic_store(&paused,0);atomic_store(&finished,0);
 atomic_store(&error,0);atomic_store(&blocks,0);atomic_store(&nonzero,0);
 struct rw4_device_attr attr;int rc=rw4_host_attr_init(&attr);if(rc)return rc;
 rc=rw4_host_attr_stack(&attr,16384);
 if(!rc)rc=rw4_host_thread_create(&thread,&attr,audio_worker,0);
 int destroyed=rw4_host_attr_destroy(&attr);
 if(rc)return rc;
 joined=0;atomic_store(&running,1);
 if(destroyed)atomic_store(&error,5);
 return 0;
}
void rw4_audio_sink_stop(void){atomic_store(&stop,1);}
void rw4_audio_sink_pause(unsigned p){atomic_store(&paused,!!p);}
int rw4_audio_sink_quiet(void){return !atomic_load(&running)||atomic_load(&finished);}
int rw4_audio_sink_join(void){
 if(joined)return 0;if(!atomic_load(&finished))return -16;
 void *result=0;int rc=rw4_host_thread_join(thread,&result);
 if(rc||result)return -5;
 joined=1;atomic_store(&running,0);return 0;
}
unsigned rw4_audio_sink_metric(unsigned id){
 if(id==0)return atomic_load(&blocks);if(id==1)return atomic_load(&nonzero);
 if(id==2)return atomic_load(&error);return 0;
}
