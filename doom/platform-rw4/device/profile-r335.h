/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_PROFILE_R335_H
#define RW4_PROFILE_R335_H
#include <stdint.h>
int rw4_game_calibrate(void);
void rw4_game_tick_cost(uint32_t);
void rw4_game_sleep_cost(uint32_t);
#endif
