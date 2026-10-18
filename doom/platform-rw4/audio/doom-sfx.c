/* SPDX-License-Identifier: GPL-2.0-only */
#include "doom-sfx.h"
#include "pcm-core.h"
#include <stdatomic.h>
#define SFX_COUNT 128u
#define CACHE_BYTES (544u*1024u)
#define QUEUE_BLOCKS 4u
static uint8_t cache[CACHE_BYTES];
static struct doomed_sample bank[SFX_COUNT];
static unsigned used,dropped,enabled,paused,clock_set;
static uint32_t previous,fraction;
static struct doomed_mixer mixer;
static struct {int16_t pcm[512];unsigned count;} queue[QUEUE_BLOCKS];
static atomic_uint head,tail;
_Static_assert(ATOMIC_INT_LOCK_FREE==2,"SPSC requires lock-free words");
int doomed_sfx_begin(void){
 enabled=0;used=dropped=paused=clock_set=0;fraction=previous=0;
 for(unsigned i=0;i<SFX_COUNT;i++){bank[i].data=0;bank[i].length=bank[i].rate=0;}
 atomic_store(&head,0);atomic_store(&tail,0);
 if(doomed_mixer_init(&mixer,22050))return -1;
 enabled=1;return 0;
}
int doomed_sfx_cache(unsigned id,const uint8_t *dmx,unsigned length){
 struct doomed_sample s;
 if(!enabled||id>=SFX_COUNT||bank[id].data||doomed_dmx_decode(dmx,length,&s)||s.length>CACHE_BYTES-used)return -1;
 uint8_t *dst=cache+used;for(unsigned i=0;i<s.length;i++)dst[i]=s.data[i];
 s.data=dst;bank[id]=s;used+=s.length;return 0;
}
int doomed_sfx_start(unsigned channel,unsigned id,unsigned volume){
 if(!enabled||id>=SFX_COUNT)return -1;
 return doomed_mixer_start(&mixer,channel,&bank[id],volume);
}
int doomed_sfx_alias(unsigned id,unsigned source){
 if(!enabled||id>=SFX_COUNT||source>=SFX_COUNT||bank[id].data||!bank[source].data)return -1;
 bank[id]=bank[source];return 0;
}
void doomed_sfx_stop(unsigned channel){(void)doomed_mixer_stop(&mixer,channel);}
void doomed_sfx_volume(unsigned channel,unsigned volume){
 if(channel<DOOMED_AUDIO_CHANNELS&&volume<=127)mixer.voices[channel].volume=volume;
}
int doomed_sfx_playing(unsigned channel){return enabled&&channel<DOOMED_AUDIO_CHANNELS&&mixer.voices[channel].sample.data!=0;}
void doomed_sfx_pause(unsigned value){paused=!!value;clock_set=0;}
void doomed_sfx_update(uint32_t now){
 if(!enabled||paused){clock_set=0;return;}
 if(!clock_set){previous=now;clock_set=1;return;}
 uint32_t elapsed=now-previous;previous=now;
 /* Long suspensions never generate an unbounded backlog or overflow arithmetic. */
 if(elapsed>100){elapsed=100;dropped++;}
 uint32_t scaled=elapsed*22050u+fraction,count=scaled/1000;fraction=scaled%1000;
 while(count){unsigned n=count>512?512:count;count-=n;
  unsigned h=atomic_load_explicit(&head,memory_order_relaxed),t=atomic_load_explicit(&tail,memory_order_acquire);
  if(h-t>=QUEUE_BLOCKS){int16_t discarded[512];(void)doomed_mixer_render(&mixer,discarded,n);dropped++;continue;}
  unsigned slot=h%QUEUE_BLOCKS;
  (void)doomed_mixer_render(&mixer,queue[slot].pcm,n);queue[slot].count=n;
  atomic_store_explicit(&head,h+1,memory_order_release);
 }
}
int doomed_sfx_pop(int16_t *pcm,unsigned *samples){
 if(!pcm||!samples)return -1;
 unsigned t=atomic_load_explicit(&tail,memory_order_relaxed),h=atomic_load_explicit(&head,memory_order_acquire);
 if(t==h)return 0;
 unsigned slot=t%QUEUE_BLOCKS,n=queue[slot].count;
 for(unsigned i=0;i<n;i++)pcm[i]=queue[slot].pcm[i];
 *samples=n;atomic_store_explicit(&tail,t+1,memory_order_release);return 1;
}
void doomed_sfx_end(void){enabled=0;doomed_mixer_stop_all(&mixer);clock_set=0;}
unsigned doomed_sfx_cache_bytes(void){return used;}
unsigned doomed_sfx_dropped(void){return dropped;}
