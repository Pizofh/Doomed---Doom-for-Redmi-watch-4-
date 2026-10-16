/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_PNG_VIEW_H
#define RW4_PNG_VIEW_H
#include <stdint.h>
#define RW4_IMAGE_WIDTH 320u
#define RW4_IMAGE_HEIGHT 200u
#define RW4_IMAGE_HEADER_BYTES 41u
#define RW4_IMAGE_BYTES 192278u
/* Virtual PNG over one immutable RGB565 lease. No allocation or flash writes.
 * Prepare once after acquiring the frame, before reads beyond the fixed header.
 * One UI owner; metadata must not be replaced while that lease is retained. */
void rw4_image_prepare(const unsigned char *rgb565);
int rw4_image_read(const unsigned char *rgb565,unsigned position,char *dst,unsigned count);
int64_t rw4_image_seek(unsigned *position,int64_t offset,int origin);
#endif
