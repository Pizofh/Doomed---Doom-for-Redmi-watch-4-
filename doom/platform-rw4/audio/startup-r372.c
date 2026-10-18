/* SPDX-License-Identifier: GPL-2.0-only */
#include "startup-r372.h"
#include <stdatomic.h>
static atomic_uint ready;
_Static_assert(ATOMIC_INT_LOCK_FREE==2,"Startup flag requires lock-free words");
void rw4_audio_startup_reset(void){atomic_store(&ready,0);}
void rw4_audio_startup_publish(void){atomic_store(&ready,1);}
unsigned rw4_audio_startup_ready(void){return atomic_load(&ready);}
