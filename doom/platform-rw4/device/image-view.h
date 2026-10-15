/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_IMAGE_VIEW_H
#define RW4_IMAGE_VIEW_H
#include <stdint.h>
#define RW4_IMAGE_WIDTH 320u
#define RW4_IMAGE_HEIGHT 200u
#ifdef RW4_IMAGE_S3_TEST
/* Explicit PC-only format adapter: S3 LVGL9 is not RW4 LVGL8. */
#define RW4_IMAGE_HEADER_BYTES 12u
#define RW4_IMAGE_PIXEL_BYTES 2u
#else
#define RW4_IMAGE_HEADER_BYTES 4u
#define RW4_IMAGE_PIXEL_BYTES 4u
#endif
#define RW4_IMAGE_BYTES (RW4_IMAGE_HEADER_BYTES+RW4_IMAGE_WIDTH*RW4_IMAGE_HEIGHT*RW4_IMAGE_PIXEL_BYTES)
/* Candidate RW4 built-in binary image, cf=4 (native 32-bit), header=4 bytes.
 * No pointer descriptor is exported. rgb565 must remain immutable/alive for
 * every read of one image. The owner must hold the frame lease until close.
 * These are pure view operations, NOT firmware file_operations callbacks. */
int rw4_image_read(const unsigned char *rgb565,unsigned position,char *dst,unsigned count);
int64_t rw4_image_seek(unsigned *position,int64_t offset,int origin);
#endif
