/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_SFX_H
#define DOOMED_SFX_H
#include <stdint.h>
/* Game owner only, except sink_pop (one worker). Cache is module-owned static.
 * Sink must be stopped/joined before begin/reset or module unload. */
int doomed_sfx_begin(void);
int doomed_sfx_cache(unsigned id,const uint8_t *dmx,unsigned length);
int doomed_sfx_alias(unsigned id,unsigned source);
int doomed_sfx_start(unsigned channel,unsigned id,unsigned volume);
void doomed_sfx_stop(unsigned channel);
void doomed_sfx_volume(unsigned channel,unsigned volume);
int doomed_sfx_playing(unsigned channel);
void doomed_sfx_pause(unsigned paused);
void doomed_sfx_update(uint32_t now);
void doomed_sfx_end(void);
int doomed_sfx_pop(int16_t *pcm,unsigned *samples);
unsigned doomed_sfx_cache_bytes(void);
unsigned doomed_sfx_dropped(void);
#endif
