/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_DOOM_FIRST_FRAME_H
#define RW4_DOOM_FIRST_FRAME_H
#include <stdint.h>
#define RW4_FIRST_WAD "/tmp/rw4-doom1.wad"
#define RW4_FIRST_CAPTURE "/tmp/rw4-doom-first.bgrx"
#define RW4_FIRST_PIXELS (320u*200u)
struct first_frame_info { unsigned captured,frames,ticks,elapsed_ms,episode,map; uint32_t fnv; };
void rw4_first_body(void *);
const uint32_t *rw4_first_pixels(void);
const struct first_frame_info *rw4_first_info(void);
#endif
