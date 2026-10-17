/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_PALETTE_VIEW_R333_H
#define RW4_PALETTE_VIEW_R333_H
#include <stdint.h>
#define RW4_IMAGE_WIDTH 320u
#define RW4_IMAGE_HEIGHT 200u
#define RW4_IMAGE_HEADER_BYTES 33u
#define RW4_IMAGE_BYTES 65048u
/* Lossless over the existing RGB565 lease. Reject >256 colors, never quantize. */
int rw4_image_prepare(const unsigned char *);
int rw4_image_read(const unsigned char *,unsigned,char *,unsigned);
int64_t rw4_image_seek(unsigned *,int64_t,int);
#endif
