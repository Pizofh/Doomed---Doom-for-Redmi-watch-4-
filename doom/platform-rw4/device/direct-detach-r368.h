/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef RW4_DIRECT_DETACH_R368_H
#define RW4_DIRECT_DETACH_R368_H
#include "direct-view-r342.h"
/* UI only. Stops publication and removes the Image/listener, but retains every
 * descriptor and pixel buffer. Safe while the producer/audio worker is alive;
 * neither this operation nor a timeout authorizes unloading the module. */
int rw4_direct_detach(struct rw4_direct *);
/* UI only, after the game producer has actually been joined. Audio must be
 * independently joined before the integration permits module unloading. */
int rw4_direct_retire(struct rw4_direct *,int producer_joined);
#endif
