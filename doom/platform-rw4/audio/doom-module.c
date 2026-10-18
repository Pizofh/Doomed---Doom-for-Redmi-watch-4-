/* SPDX-License-Identifier: GPL-2.0-only */
#include "i_sound.h"
#include "w_wad.h"
#include "z_zone.h"
#include "doomgeneric.h"
#include "doom-sfx.h"
#include "pcm-core.h"
#include <string.h>
extern int snd_channels;
/* Implemented by the selected transport. Never run on the UI thread. */
extern int rw4_audio_sink_begin(void);
extern void rw4_audio_sink_stop(void);
static sfxinfo_t *sound_bank;
static int sound_count;
static boolean prefix;
static boolean init(boolean use_prefix){
 prefix=use_prefix;sound_bank=0;sound_count=0;snd_channels=DOOMED_AUDIO_CHANNELS;
 return doomed_sfx_begin()==0;
}
static int lump(sfxinfo_t *s){
 char name[12];if(!s)return -1;if(s->link)s=s->link;
 unsigned at=0;if(prefix){name[at++]='D';name[at++]='S';}
 for(unsigned i=0;i<8&&s->name[i]&&at<sizeof(name)-1;i++)name[at++]=s->name[i];
 name[at]=0;return W_CheckNumForName(name);
}
static void cache_sounds(sfxinfo_t *sounds,int count){
 if(!sounds||count<1||count>128)return;
 sound_bank=sounds;sound_count=count;
 for(int i=1;i<count;i++){
  if(sounds[i].link)continue;
  int index=lump(&sounds[i]);if(index<0)continue;
  int length=W_LumpLength((unsigned)index);if(length<8||length>262152)continue;
  void *data=W_CacheLumpNum(index,PU_STATIC);
  (void)doomed_sfx_cache((unsigned)i,data,(unsigned)length);W_ReleaseLumpNum(index);
 }
 for(int i=1;i<count;i++)if(sounds[i].link)
  for(int j=1;j<count;j++)if(sounds[i].link==&sounds[j]){(void)doomed_sfx_alias((unsigned)i,(unsigned)j);break;}
 /* Failure leaves a valid silent game. No effect is allowed to block Doom. */
 (void)rw4_audio_sink_begin();
}
static int start(sfxinfo_t *s,int channel,int vol,int sep){
 (void)sep;if(!sound_bank||!s||channel<0||vol<0||vol>127)return -1;
 for(int i=1;i<sound_count;i++)if(s==&sound_bank[i])return doomed_sfx_start((unsigned)channel,(unsigned)i,(unsigned)vol)?-1:channel;
 return -1;
}
static void stop(int channel){if(channel>=0)doomed_sfx_stop((unsigned)channel);}
static void volume(int channel,int vol,int sep){(void)sep;if(channel>=0&&vol>=0)doomed_sfx_volume((unsigned)channel,(unsigned)vol);}
static boolean playing(int channel){return channel>=0&&doomed_sfx_playing((unsigned)channel);}
static void update(void){doomed_sfx_update(DG_GetTicksMs());}
static void shutdown(void){doomed_sfx_end();rw4_audio_sink_stop();}
static snddevice_t devices[]={SNDDEVICE_SB};
sound_module_t DG_sound_module={devices,1,init,shutdown,lump,update,volume,start,stop,playing,cache_sounds};
/* Music intentionally disabled. Effects do not depend on SDL or MIDI. */
static boolean no_music(void){return false;}
static void nothing(void){}
static void music_volume(int volume){(void)volume;}
static void *register_song(void *data,int length){(void)data;(void)length;return 0;}
static void unregister_song(void *song){(void)song;}
static void play_song(void *song,boolean loop){(void)song;(void)loop;}
music_module_t DG_music_module={devices,1,no_music,nothing,music_volume,nothing,nothing,
 register_song,unregister_song,play_song,nothing,no_music,0};
