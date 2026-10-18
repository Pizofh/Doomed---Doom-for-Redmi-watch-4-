/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_AUDIO_STARTUP_R372_H
#define DOOMED_AUDIO_STARTUP_R372_H
/* One game producer and one audio worker. Reset only before worker creation
 * or on game shutdown; unload still requires the existing real joins. */
void rw4_audio_startup_reset(void);
void rw4_audio_startup_publish(void);
unsigned rw4_audio_startup_ready(void);
#endif
