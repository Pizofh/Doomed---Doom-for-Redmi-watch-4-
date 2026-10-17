/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_PCM_CORE_H
#define DOOMED_PCM_CORE_H
#include <stdint.h>
#include <stddef.h>
#define DOOMED_AUDIO_CHANNELS 4u
#define DOOMED_AUDIO_BLOCK_MAX 512u
struct doomed_sample { const uint8_t *data; uint32_t length, rate; };
struct doomed_voice { struct doomed_sample sample; uint32_t position, fraction, volume; };
struct doomed_mixer { struct doomed_voice voices[DOOMED_AUDIO_CHANNELS]; uint32_t rate, paused; };
/* Sample storage belongs to caller and must remain valid until stop/completion.
 * Single owner only. No threads, allocation, driver calls or global state. */
int doomed_dmx_decode(const uint8_t *, size_t, struct doomed_sample *);
int doomed_mixer_init(struct doomed_mixer *, uint32_t);
int doomed_mixer_start(struct doomed_mixer *, unsigned, const struct doomed_sample *, unsigned);
int doomed_mixer_stop(struct doomed_mixer *, unsigned);
void doomed_mixer_stop_all(struct doomed_mixer *);
int doomed_mixer_pause(struct doomed_mixer *, unsigned);
int doomed_mixer_render(struct doomed_mixer *, int16_t *, unsigned);
#endif
