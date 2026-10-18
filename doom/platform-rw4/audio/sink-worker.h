/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_SINK_WORKER_H
#define DOOMED_SINK_WORKER_H
#include <stdint.h>
int rw4_audio_sink_begin(void);
void rw4_audio_sink_stop(void);
void rw4_audio_sink_pause(unsigned);
int rw4_audio_sink_quiet(void);
int rw4_audio_sink_join(void);
unsigned rw4_audio_sink_metric(unsigned);
/* Device functions are called only by the audio worker, never the UI/game. */
int rw4_audio_device_open(void);
int rw4_audio_device_write(const int16_t *,unsigned);
int rw4_audio_device_pause(unsigned);
int rw4_audio_device_close(void);
#endif
