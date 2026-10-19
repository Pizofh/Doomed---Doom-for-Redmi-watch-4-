/* SPDX-License-Identifier: GPL-2.0-only */
/* Game publishes bounded voice commands; only the audio worker owns mixer
 * positions/ADPCM state. Cache is immutable between worker start and join. */
#include "doom-sfx.h"
#include "startup-r372.h"
#include "pcm-core.h"
#include "adpcm-r386.h"
#include <stdatomic.h>
#define SFX_COUNT 128u
#define CACHE_BYTES (320u*1024u)
static uint8_t cache[CACHE_BYTES];
static struct doomed_sample bank[SFX_COUNT];
static unsigned used,serial[DOOMED_AUDIO_CHANNELS],seen[DOOMED_AUDIO_CHANNELS];
static atomic_uint enabled,paused,request[DOOMED_AUDIO_CHANNELS],volume[DOOMED_AUDIO_CHANNELS],completed[DOOMED_AUDIO_CHANNELS];
static struct doomed_mixer mixer;
_Static_assert(ATOMIC_INT_LOCK_FREE==2,"voice mailboxes require lock-free words");
int doomed_sfx_begin(void){
 rw4_audio_startup_reset();atomic_store(&enabled,0);atomic_store(&paused,0);used=0;
 for(unsigned i=0;i<SFX_COUNT;i++){bank[i].data=0;bank[i].length=bank[i].rate=0;}
 for(unsigned c=0;c<DOOMED_AUDIO_CHANNELS;c++){
  serial[c]=seen[c]=0;atomic_store(&request[c],0);atomic_store(&volume[c],0);atomic_store(&completed[c],0);
 }
 if(doomed_mixer_init(&mixer,22050))return -1;
 atomic_store(&enabled,1);return 0;
}
int doomed_sfx_cache(unsigned id,const uint8_t *dmx,unsigned length){
 struct doomed_sample s;
 if(!atomic_load(&enabled)||id>=SFX_COUNT||bank[id].data||doomed_dmx_decode(dmx,length,&s))return -1;
 unsigned stride=s.rate>=8000?2:1,count=(s.length+stride-1)/stride;
 unsigned bytes=doomed_adpcm_bytes(count);if(!bytes||bytes>CACHE_BYTES-used)return -1;
 uint8_t *dst=cache+used;
 if(doomed_adpcm_store(dst,CACHE_BYTES-used,s.data,s.length,stride)!=(int)bytes)return -1;
 s.length=count;s.rate/=stride;s.encoded=1;s.data=dst;bank[id]=s;used+=bytes;return 0;
}
static void publish(unsigned c,unsigned id){
 /* 24-bit generation distinguishes retriggers of the same effect. A channel
  * cannot receive 2^24 starts in the existing 30 minute/35Hz game budget. */
 serial[c]=(serial[c]+256u)&0xffffff00u;
 atomic_store_explicit(&request[c],serial[c]|id,memory_order_release);
}
int doomed_sfx_start(unsigned channel,unsigned id,unsigned vol){
 if(!atomic_load(&enabled)||channel>=DOOMED_AUDIO_CHANNELS||id>=SFX_COUNT||!bank[id].data||vol>127)return -1;
 atomic_store(&volume[channel],vol);publish(channel,id+1);return 0;
}
int doomed_sfx_alias(unsigned id,unsigned source){
 if(!atomic_load(&enabled)||id>=SFX_COUNT||source>=SFX_COUNT||bank[id].data||!bank[source].data)return -1;
 bank[id]=bank[source];return 0;
}
void doomed_sfx_stop(unsigned c){if(c<DOOMED_AUDIO_CHANNELS)publish(c,0);}
void doomed_sfx_volume(unsigned c,unsigned vol){if(c<DOOMED_AUDIO_CHANNELS&&vol<=127)atomic_store(&volume[c],vol);}
int doomed_sfx_playing(unsigned c){
 if(!atomic_load(&enabled)||c>=DOOMED_AUDIO_CHANNELS)return 0;
 unsigned value=atomic_load_explicit(&request[c],memory_order_acquire);
 return (value&255u)&&atomic_load_explicit(&completed[c],memory_order_acquire)!=value;
}
void doomed_sfx_pause(unsigned value){atomic_store(&paused,!!value);}
void doomed_sfx_update(uint32_t now){(void)now;} /* No game-clock PCM batching. */
int doomed_sfx_pop(int16_t *pcm,unsigned *samples){
 if(!pcm||!samples)return -1;
 if(!atomic_load(&enabled)||atomic_load(&paused)||!rw4_audio_startup_ready())return 0;
 for(unsigned c=0;c<DOOMED_AUDIO_CHANNELS;c++){
  unsigned value=atomic_load_explicit(&request[c],memory_order_acquire),vol=atomic_load(&volume[c]);
  if(value!=seen[c]){
   seen[c]=value;unsigned id=value&255u;
   if(id)(void)doomed_mixer_start(&mixer,c,&bank[id-1],vol);
   else (void)doomed_mixer_stop(&mixer,c);
  }
  mixer.voices[c].volume=vol;
 }
 if(doomed_mixer_render(&mixer,pcm,512))return -1;*samples=512;
 for(unsigned c=0;c<DOOMED_AUDIO_CHANNELS;c++)if(!mixer.voices[c].sample.data)
  atomic_store_explicit(&completed[c],seen[c],memory_order_release);
 return 1;
}
void doomed_sfx_end(void){rw4_audio_startup_reset();atomic_store(&enabled,0);}
unsigned doomed_sfx_cache_bytes(void){return used;}
unsigned doomed_sfx_dropped(void){return 0;} /* No PCM queue to overflow. */
