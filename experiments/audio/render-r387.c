/* SPDX-License-Identifier: GPL-2.0-only */
/* Deterministic fake media/clock. No sound endpoint or actual thread. */
#include "platform.h"
#include "doom-sfx.h"
#include "sink-worker.h"
#include "startup-r372.h"
#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)
static uint8_t dmx[8192];
static uint64_t ticks,last_write,resume_at;
static unsigned scenario,writes,closes,violation,nonzero,pauses;
static void *(*entry)(void *);
static int setup(void){
 for(unsigned i=0;i<sizeof(dmx);i++)dmx[i]=192;
 dmx[0]=3;dmx[1]=0;dmx[2]=0x22;dmx[3]=0x56;
 unsigned n=sizeof(dmx)-8;for(unsigned i=0;i<4;i++)dmx[4+i]=(uint8_t)(n>>(i*8));
 CHECK(!doomed_sfx_begin());CHECK(!doomed_sfx_cache(1,dmx,sizeof(dmx)));CHECK(!doomed_sfx_alias(2,1));return 0;
}
static int mailboxes(void){
 int16_t pcm[512];unsigned n=77;CHECK(!setup());
 CHECK(doomed_sfx_start(4,1,127)==-1&&doomed_sfx_start(0,127,127)==-1&&doomed_sfx_start(0,1,128)==-1);
 CHECK(!doomed_sfx_start(0,1,127)&&doomed_sfx_playing(0));
 doomed_sfx_update(0);doomed_sfx_update(999999);CHECK(!doomed_sfx_pop(pcm,&n)&&n==77&&doomed_sfx_playing(0));
 rw4_audio_startup_publish();CHECK(doomed_sfx_pop(pcm,&n)==1&&n==512);
 for(unsigned i=0;i<n;i++)CHECK(pcm[i]==16384);
 /* A stalled/no-update game must not insert silence or advance the voice. */
 doomed_sfx_update(4000000);CHECK(doomed_sfx_pop(pcm,&n)==1);for(unsigned i=0;i<n;i++)CHECK(pcm[i]==16384);
 doomed_sfx_pause(1);CHECK(!doomed_sfx_pop(pcm,&n));doomed_sfx_pause(0);
 CHECK(doomed_sfx_pop(pcm,&n)==1&&pcm[0]==16384);
 doomed_sfx_stop(0);CHECK(!doomed_sfx_playing(0));CHECK(doomed_sfx_pop(pcm,&n)==1);for(unsigned i=0;i<n;i++)CHECK(!pcm[i]);
 /* Latest request per channel wins; retrigger and completion use generations. */
 for(unsigned k=0;k<2000;k++){
  CHECK(!doomed_sfx_start(0,1,127));doomed_sfx_stop(0);CHECK(!doomed_sfx_start(0,2,127)&&doomed_sfx_playing(0));
  CHECK(doomed_sfx_pop(pcm,&n)==1&&pcm[0]==16384);
 }
 doomed_sfx_volume(0,0);CHECK(doomed_sfx_pop(pcm,&n)==1);for(unsigned i=0;i<n;i++)CHECK(!pcm[i]);
 for(unsigned c=0;c<4;c++)CHECK(!doomed_sfx_start(c,1,127));
 CHECK(doomed_sfx_pop(pcm,&n)==1);for(unsigned i=0;i<n;i++)CHECK(pcm[i]==32767);
 unsigned blocks=1;while(doomed_sfx_playing(0)&&blocks<30){CHECK(doomed_sfx_pop(pcm,&n)==1);blocks++;}
 CHECK(blocks==16&&!doomed_sfx_playing(0));CHECK(doomed_sfx_pop(pcm,&n)==1);for(unsigned i=0;i<n;i++)CHECK(!pcm[i]);
 doomed_sfx_end();CHECK(!doomed_sfx_pop(pcm,&n)&&!doomed_sfx_playing(0));return 0;
}
uint64_t rw4_host_clock_ticks(void){return ticks;}
int rw4_host_usleep(unsigned us){
 if(!us||us>5000){violation=1;return -5;}ticks+=(us+99)/100;
 if(scenario==5&&resume_at&&ticks>=resume_at){resume_at=0;doomed_sfx_pause(0);rw4_audio_sink_pause(0);}
 if(scenario==7)return -5;return 0;
}
int rw4_host_attr_init(struct rw4_device_attr *a){(void)a;return 0;}
int rw4_host_attr_stack(struct rw4_device_attr *a,unsigned n){(void)a;return n==16384?0:-22;}
int rw4_host_attr_destroy(struct rw4_device_attr *a){(void)a;return 0;}
int rw4_host_thread_create(int32_t *id,const struct rw4_device_attr *a,void *(*fn)(void *),void *arg){(void)a;(void)arg;*id=17;entry=fn;return 0;}
int rw4_host_thread_join(int32_t id,void **result){if(id!=17)return -22;*result=0;entry=0;return 0;}
int rw4_audio_device_open(void){ticks+=6000;return scenario==1?-4005:0;}
int rw4_audio_device_pause(unsigned p){pauses+=!!p;return 0;}
int rw4_audio_device_write(const int16_t *pcm,unsigned bytes){
 writes++;if(bytes!=1024)violation=2;
 if(writes>1&&ticks-last_write<(scenario==4?500u:232u))violation=3;
 last_write=ticks;
 if(writes<=16){for(unsigned i=0;i<512;i++)if(pcm[i])violation=4;if(rw4_audio_startup_ready())violation=5;}
 else{if(!rw4_audio_startup_ready())violation=6;for(unsigned i=0;i<512;i++)if(pcm[i]){nonzero++;break;}}
 if(scenario==2&&writes==2)return -7004;
 if(scenario==3&&writes==18)return -7004;
 if(scenario==4)ticks+=500;
 if(scenario==5&&writes==18){doomed_sfx_pause(1);rw4_audio_sink_pause(1);resume_at=ticks+1000;}
 if(writes==36)rw4_audio_sink_stop();return (int)bytes;
}
int rw4_audio_device_close(void){closes++;return scenario==6?-8005:0;}
int rw4_audio_render_test_init(void *unused){
 (void)unused;CHECK(!mailboxes());
 const unsigned cases[]={0,1,2,3,4,5,7,8,6};
 for(unsigned c=0;c<sizeof(cases)/sizeof(cases[0]);c++){
  scenario=cases[c];writes=closes=violation=nonzero=pauses=0;ticks=last_write=resume_at=0;
  CHECK(!setup()&&!doomed_sfx_start(0,1,127));CHECK(!rw4_audio_sink_begin()&&entry);
  if(scenario==8)rw4_audio_sink_stop();CHECK(!entry(0));if(violation||closes!=1)return -(1000+(int)scenario*100+(int)violation*10+(int)closes);
  if(scenario==0||scenario==4||scenario==5||scenario==6){CHECK(writes==36&&nonzero==16&&rw4_audio_sink_metric(3)==16);}
  if(scenario==1)CHECK(!writes&&rw4_audio_sink_metric(2)==4005);
  if(scenario==2||scenario==3)CHECK(rw4_audio_sink_metric(2)==7004&&writes==(scenario==2?2u:18u));
  if(scenario==5)CHECK(pauses==1&&!resume_at);
  if(scenario==7)CHECK(writes==1&&rw4_audio_sink_metric(2)==5);
  if(scenario==8)CHECK(!writes&&!rw4_audio_startup_ready());
  if(scenario==6)CHECK(!rw4_audio_sink_quiet()&&rw4_audio_sink_join()==-16&&rw4_audio_sink_metric(2)==8005);
  else CHECK(rw4_audio_sink_quiet()&&!rw4_audio_sink_join());
  doomed_sfx_end();CHECK(!rw4_audio_startup_ready());
 }return 0;
}
