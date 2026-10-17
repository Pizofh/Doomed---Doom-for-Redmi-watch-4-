/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_DIRECT_NATIVE_R342_H
#define RW4_DIRECT_NATIVE_R342_H
#include "direct-view-r342.h"
struct rw4_direct_dsc {uint32_t header,size;const void *data;};
struct rw4_direct_native {
    struct rw4_direct_dsc descriptors[2];
    void *display,*parent,*draw_ctx,*hook_image;
    rw4_direct_hook hook;
    struct rw4_direct *bridge;
};
/* Unbound integration component, not a module init or installable payload.
 * Buffers must remain allocated through CLOSED + can_unload + host unload. */
int rw4_direct_native_init(struct rw4_direct *,struct rw4_direct_native *,uint32_t *,uint32_t *);
#endif
