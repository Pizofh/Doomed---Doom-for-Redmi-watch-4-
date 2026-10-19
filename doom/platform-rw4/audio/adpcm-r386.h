/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_ADPCM_R386_H
#define DOOMED_ADPCM_R386_H
#include <stdint.h>
#include <stddef.h>
/* Private cache format: initial signed PCM16 LE, index0, reserved0,
 * then IMA/DVI nibbles, high first. Length is stored by the sample bank. */
unsigned doomed_adpcm_bytes(unsigned samples);
int doomed_adpcm_store(uint8_t *,unsigned,const uint8_t *,unsigned,unsigned);
int doomed_adpcm_step(unsigned,int *,unsigned *);
#endif
