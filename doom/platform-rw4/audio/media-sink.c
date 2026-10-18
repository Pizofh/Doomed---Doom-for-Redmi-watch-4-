/* SPDX-License-Identifier: GPL-2.0-only */
/* Managed media only. Blocking service calls stay on the audio worker.
 * This file has no forced cancellation, direct DMA or filesystem writes. */
#include "media-sink.h"
#include "sink-worker.h"
#include <stdatomic.h>
static const struct doomed_media_api *api;
static void *player;
static int focus_token;
static unsigned started,service_paused,game_paused,close_attempted,initialized;
static atomic_uint suggestion;
static int failure(unsigned stage,int rc){unsigned value=rc<0?0u-(unsigned)rc:(unsigned)rc;
 if(value>999)value=999;return -(int)(stage*1000u+value);}
static void focus_changed(int value,void *cookie){
 (void)cookie;
 /* Called under the firmware focus lock. Never call back into media here. */
 if(value>=0&&value<=4)atomic_store(&suggestion,(unsigned)value);
 else if(value!=5)atomic_store(&suggestion,1);
}
int rw4_audio_device_open(void){
 if(player||focus_token)return failure(1,-16);
 api=rw4_media_api();if(!api||!api->validate)return failure(1,-22);
 int validated=api->validate();if(validated)return failure(1,validated);
 initialized=1;started=service_paused=game_paused=close_attempted=0;atomic_store(&suggestion,1);
 int initial=1;focus_token=api->focus_request(&initial,"Music",focus_changed,0);
 if(!focus_token)return failure(2,-16);
 focus_changed(initial,0);
 if(initial!=0&&initial!=4)return failure(2,-16);
 player=api->open("Music");if(!player)return failure(3,-5);
 int rc=api->prepare(player,0,"format=s16le,sample_rate=22050,channels=1");
 if(rc)return failure(4,rc);
 rc=api->start(player);if(!rc)started=1;return rc?failure(5,rc):0;
}
static int synchronize_pause(void){
 unsigned s=atomic_load(&suggestion),p=game_paused||s==1||s==2||s==3;
 if(!player||!started)return failure(6,-5);
 if(p==service_paused)return 0;
 int rc=p?api->pause(player):api->start(player);
 if(!rc)service_paused=p;return rc?failure(6,rc):0;
}
int rw4_audio_device_pause(unsigned p){game_paused=!!p;return synchronize_pause();}
int rw4_audio_device_write(const int16_t *pcm,unsigned bytes){
 if(!pcm||!bytes||bytes>1024||(bytes&1))return failure(7,-22);
 int rc=synchronize_pause();if(rc)return rc;
 if(service_paused)return (int)bytes; /* Discard stale effects during focus loss. */
 if(atomic_load(&suggestion)==4){int16_t quiet[512];for(unsigned i=0;i<bytes/2;i++)quiet[i]=pcm[i]/4;
  rc=api->write(player,quiet,bytes);}
 else rc=api->write(player,pcm,bytes);
 return rc==(int)bytes?rc:failure(7,rc<0?rc:-104);
}
int rw4_audio_device_close(void){
 if(!initialized)return 0;
 if(close_attempted)return failure(8,-16);close_attempted=1;
 if(player){
  /* Stop failure does not justify a second STOP or a speculative free. Close
   * gets one chance; only its successful acknowledgement releases the handle. */
  if(started)(void)api->stop(player);
  int rc=api->close(player,0);if(rc)return failure(8,rc);
  player=0;started=0;
 }
 if(focus_token){int rc=api->focus_abandon(focus_token);if(rc)return failure(9,rc);focus_token=0;}
 initialized=0;return 0;
}
