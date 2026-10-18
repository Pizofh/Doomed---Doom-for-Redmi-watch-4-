/* SPDX-License-Identifier: GPL-2.0-only */
/* Emulator-only service double. No audio endpoint or firmware API is opened. */
#include "platform.h"
#include "media-sink.h"
static unsigned owned,prepared,playing,focus,paused,writes;
static void (*callback)(int,void *);
static void *callback_cookie;
#ifdef RW4_AUDIO_HOLD_TEST
/* Test-only blocking service. Holds prepare and subsequently close;
 * only an explicit test command releases it. No wall-clock auto-release. */
static atomic_uint release_hold;
void rw4_audio_model_release(void){atomic_fetch_add(&release_hold,1);}
static void hold(unsigned stage){
 unsigned required=stage==MEDIA_PREPARE?1:stage==MEDIA_CLOSE?2:0;
 while(atomic_load(&release_hold)<required)(void)rw4_host_usleep(5000);
}
#else
static void hold(unsigned stage){(void)stage;}
#endif
static int equal(const char *a,const char *b){if(!a||!b)return 0;while(*a&&*a==*b){a++;b++;}return *a==*b;}
static int validate(void){return 0;}
static int request(int *initial,const char *scenario,void (*cb)(int,void *),void *cookie){
 if(focus||!initial||!equal(scenario,"Music")||!cb)return 0;
 focus=1;*initial=0;callback=cb;callback_cookie=cookie;return 65551;
}
static int abandon(int token){if(token!=65551||!focus||owned)return -22;focus=0;callback=0;return 0;}
static void *open_player(const char *stream){if(!focus||owned||!equal(stream,"Music"))return 0;
 owned=1;prepared=playing=paused=writes=0;
#ifdef RW4_AUDIO_HOLD_TEST
 atomic_store(&release_hold,0);
#endif
 return &owned;}
static int prepare(void *h,const char *url,const char *options){
 if(h!=&owned||!owned||url||!equal(options,"format=s16le:sample_rate=22050:channels=1"))return -22;
 hold(MEDIA_PREPARE);prepared=1;return 0;
}
static int start(void *h){if(h!=&owned||!owned||!prepared)return -22;playing=1;paused=0;return 0;}
static int pause_player(void *h){if(h!=&owned||!playing)return -22;paused=1;return 0;}
static int stop_player(void *h){if(h!=&owned||!owned)return -22;playing=0;return 0;}
static int write_pcm(void *h,const void *pcm,unsigned bytes){
 if(h!=&owned||!owned||!playing||paused||!pcm||!bytes||bytes>1024||(bytes&1))return -22;
 if(rw4_host_usleep((bytes/2)*1000000u/22050u))return -5;
 writes++;if(writes==12)callback(4,callback_cookie);if(writes==24)callback(0,callback_cookie);
 return (int)bytes;
}
static int close_player(void *h,int pending){if(h!=&owned||!owned||playing||pending)return -22;
 hold(MEDIA_CLOSE);
 owned=prepared=playing=paused=0;return 0;}
static const struct doomed_media_api api={validate,request,abandon,open_player,prepare,start,pause_player,stop_player,write_pcm,close_player};
const struct doomed_media_api *rw4_media_api(void){return &api;}
