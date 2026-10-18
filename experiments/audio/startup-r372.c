/* SPDX-License-Identifier: GPL-2.0-only */
/* Deterministic scheduling/service double, no OS thread, device or WAD. */
#include "platform.h"
#include "doom-sfx.h"
#include "sink-worker.h"
#include "startup-r372.h"
#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)
void *memset(void *p,int value,size_t n){unsigned char *b=p;for(size_t i=0;i<n;i++)b[i]=(unsigned char)value;return p;}
static unsigned now;
static int setup(void){
 unsigned char dmx[104]={3,0,0x22,0x56,96,0,0,0};
 for(unsigned i=8;i<sizeof(dmx);i++)dmx[i]=192;
 CHECK(!doomed_sfx_begin());CHECK(!doomed_sfx_cache(1,dmx,sizeof(dmx)));
 now=0;doomed_sfx_update(now);now=100;doomed_sfx_update(now);
 CHECK(!doomed_sfx_start(0,1,127));now=200;doomed_sfx_update(now);return 0;
}
#ifdef TEST_BASELINE
int rw4_audio_startup_test_init(void *info){
 (void)info;CHECK(!setup());CHECK(!doomed_sfx_playing(0));
 int16_t pcm[512];unsigned n,blocks=0;
 while(doomed_sfx_pop(pcm,&n)>0){blocks++;for(unsigned i=0;i<n;i++)CHECK(!pcm[i]);}
 CHECK(blocks==4&&doomed_sfx_dropped()>0);doomed_sfx_end();return 0;
}
#else
static void *(*entry)(void *);
static unsigned scenario,writes,positive,closes,pauses,sleeps,violation;
int rw4_host_attr_init(struct rw4_device_attr *a){(void)a;return 0;}
int rw4_host_attr_stack(struct rw4_device_attr *a,unsigned n){(void)a;return n==16384?0:-22;}
int rw4_host_attr_destroy(struct rw4_device_attr *a){(void)a;return 0;}
int rw4_host_thread_create(int32_t *id,const struct rw4_device_attr *a,void *(*fn)(void *),void *arg){
 (void)a;(void)arg;*id=17;entry=fn;return 0;
}
int rw4_host_thread_join(int32_t id,void **result){if(id!=17)return -22;*result=0;entry=0;return 0;}
int rw4_audio_device_open(void){
 /* Let the game keep running while open is delayed by 600ms. */
 for(unsigned i=0;i<6;i++){now+=100;doomed_sfx_update(now);if(!doomed_sfx_playing(0))violation=1;}
 return scenario==1?-4005:0;
}
int rw4_audio_device_write(const int16_t *pcm,unsigned bytes){
 writes++;
 if(writes<=4){
  if(bytes!=1024||rw4_audio_startup_ready())violation=2;
  for(unsigned i=0;i<bytes/2;i++)if(pcm[i])violation=3;
  if(scenario==2&&writes==2)return -7004;
  if(scenario==3&&writes==2)rw4_audio_sink_stop();
 }else{
  if(!rw4_audio_startup_ready())violation=4;
  for(unsigned i=0;i<bytes/2;i++)if(pcm[i]){positive++;if(pcm[i]!=16384)violation=5;}
  rw4_audio_sink_stop();
 }
 return (int)bytes;
}
int rw4_audio_device_pause(unsigned p){pauses+=!!p;return 0;}
int rw4_audio_device_close(void){closes++;return scenario==5?-8005:0;}
int rw4_host_usleep(unsigned us){
 (void)us;if(++sleeps>12){violation=6;rw4_audio_sink_stop();return 0;}
 now+=5;
 if(scenario==4&&sleeps==1){doomed_sfx_pause(0);rw4_audio_sink_pause(0);}
 doomed_sfx_update(now);return 0;
}
int rw4_audio_startup_test_init(void *info){
 (void)info;
 /* Close failure goes last: production correctly retains ownership. There
  * are no real resources/callbacks in this standalone fake fixture. */
 const unsigned cases[]={0,1,2,3,4,6,5};
 for(unsigned c=0;c<sizeof(cases)/sizeof(cases[0]);c++){
  scenario=cases[c];writes=positive=closes=pauses=sleeps=violation=0;
  CHECK(!setup());CHECK(doomed_sfx_playing(0)&&!rw4_audio_startup_ready());
  int16_t pcm[512];unsigned n;CHECK(!doomed_sfx_pop(pcm,&n));
  CHECK(!rw4_audio_sink_begin()&&entry);
  if(scenario==4){doomed_sfx_pause(1);rw4_audio_sink_pause(1);}
  if(scenario==6)rw4_audio_sink_stop();
  CHECK(!entry(0));CHECK(!violation&&closes==1);
  if(scenario==0||scenario==4||scenario==5){
   CHECK(positive==64&&writes==5&&rw4_audio_sink_metric(3)==4);
   CHECK(rw4_audio_sink_metric(0)==1&&rw4_audio_sink_metric(1)==1);
   if(scenario==4)CHECK(pauses==1);
  }else CHECK(!positive&&!rw4_audio_startup_ready());
  if(scenario==1)CHECK(rw4_audio_sink_metric(2)==4005&&!writes);
  else if(scenario==2)CHECK(rw4_audio_sink_metric(2)==7004&&writes==2&&rw4_audio_sink_metric(3)==1);
  else if(scenario==3)CHECK(!rw4_audio_sink_metric(2)&&writes==2);
  else if(scenario==6)CHECK(!writes);
  else if(scenario==5)CHECK(rw4_audio_sink_metric(2)==8005&&!rw4_audio_sink_quiet()&&rw4_audio_sink_join()==-16);
  else CHECK(!rw4_audio_sink_metric(2));
  if(scenario!=5)CHECK(rw4_audio_sink_quiet()&&!rw4_audio_sink_join());
  doomed_sfx_end();CHECK(!rw4_audio_startup_ready());
 }
 return 0;
}
#endif
