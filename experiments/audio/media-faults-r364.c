/* SPDX-License-Identifier: GPL-2.0-only */
/* Pure service double. Never opens a device, socket, thread or firmware API. */
#include "media-sink.h"
#include "sink-worker.h"
#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)
static unsigned fail,owned,focus,closes,abandons,writes,pauses,starts;
static void (*event)(int,void *);
static int validate(void){return fail==1?-22:0;}
static int request(int *initial,const char *s,void (*cb)(int,void *),void *cookie){
 (void)s;(void)cookie;if(fail==2)return 0;focus=1;event=cb;*initial=fail==3?1:0;return 65551;
}
static int abandon(int token){if(token!=65551||!focus||owned)return -22;abandons++;focus=0;return 0;}
static void *open_player(const char *s){(void)s;if(fail==4)return 0;owned=1;return &owned;}
static int prepare(void *p,const char *u,const char *o){(void)p;(void)u;(void)o;return fail==5?-5:0;}
static int start(void *p){(void)p;starts++;return fail==6?-5:0;}
static int pause_player(void *p){(void)p;pauses++;return 0;}
static int stop_player(void *p){(void)p;return 0;}
static int write_pcm(void *p,const void *data,unsigned n){(void)p;writes++;
 const short *pcm=data;if(fail==8)return -4;if(fail==9)return (int)n-2;
 if(fail==10&&pcm[0]!=1000)return -22;return (int)n;
}
static int close_player(void *p,int pending){(void)p;(void)pending;closes++;if(fail==11)return -5;owned=0;return 0;}
static const struct doomed_media_api api={validate,request,abandon,open_player,prepare,start,pause_player,stop_player,write_pcm,close_player};
const struct doomed_media_api *rw4_media_api(void){return &api;}
int rw4_audio_media_test_init(void *info){
 (void)info;short pcm[2]={4000,-4000};
 for(fail=1;fail<=6;fail++){
  CHECK(rw4_audio_device_open()<0);CHECK(!rw4_audio_device_close());CHECK(!owned&&!focus);
 }
 fail=0;CHECK(!rw4_audio_device_open());
 CHECK(rw4_audio_device_write(pcm,4)==4);
 CHECK(!rw4_audio_device_pause(1));unsigned before=writes;
 CHECK(rw4_audio_device_write(pcm,4)==4&&writes==before);CHECK(pauses==1);
 CHECK(!rw4_audio_device_pause(0));CHECK(starts>=2);
 event(1,0);CHECK(rw4_audio_device_write(pcm,4)==4&&writes==before);
 event(0,0);CHECK(rw4_audio_device_write(pcm,4)==4);
 fail=10;event(4,0);CHECK(rw4_audio_device_write(pcm,4)==4);event(0,0);
 fail=8;CHECK(rw4_audio_device_write(pcm,4)==-4);
 fail=9;CHECK(rw4_audio_device_write(pcm,4)==2);
 CHECK(rw4_audio_device_write(pcm,3)<0);fail=0;
 CHECK(!rw4_audio_device_close());CHECK(!owned&&!focus);
 /* Final ambiguous-close scenario: retain handle and focus, never repeat. */
 CHECK(!rw4_audio_device_open());fail=11;before=closes;
 CHECK(rw4_audio_device_close()<0&&closes==before+1&&owned&&focus);
 CHECK(rw4_audio_device_close()<0&&closes==before+1);
 CHECK(rw4_audio_device_open()<0);
 /* Test double owns no OS resources; drop its synthetic references before
  * unloading the fixture. This is NOT a production recovery/reset method. */
 owned=focus=0;event=0;
 return 0;
}
