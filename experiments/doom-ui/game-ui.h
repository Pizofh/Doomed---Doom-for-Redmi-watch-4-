/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_DOOM_GAME_UI_H
#define RW4_DOOM_GAME_UI_H
#include <stdint.h>
#define RW4_GAME_WAD "/tmp/rw4-doom1.wad"
void rw4_game_body(void *);
int rw4_game_key(int *,unsigned char *);
int rw4_game_paused(void);
int rw4_game_stopping(void);
void rw4_game_ready(void);
void rw4_game_pause_ack(void);
void rw4_game_metrics(const uint32_t *);
void rw4_game_frame(const uint32_t *,unsigned);
#endif
