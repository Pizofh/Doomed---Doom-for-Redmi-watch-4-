/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_DIRECT_VIEW_R342_H
#define RW4_DIRECT_VIEW_R342_H
#include <stdint.h>
#include <stdatomic.h>
#define RW4_DIRECT_PIXELS 64000u
#define RW4_DIRECT_BYTES (RW4_DIRECT_PIXELS * 4u)
enum rw4_direct_phase {DIRECT_IDLE,DIRECT_ACTIVE,DIRECT_CLOSED,DIRECT_FAILED};
enum rw4_direct_slot {DIRECT_FREE,DIRECT_WRITING,DIRECT_READY,DIRECT_VISIBLE,DIRECT_HELD};
enum rw4_direct_event {DIRECT_DRAW_END=1,DIRECT_DELETED=2};
enum rw4_direct_error {DIRECT_E_HOST=1,DIRECT_E_FENCE,DIRECT_E_EVENT,DIRECT_E_DELETED,DIRECT_E_HOOK};
struct rw4_direct;
typedef void (*rw4_direct_hook)(struct rw4_direct *,void *,unsigned);
/* UI operations are synchronous. finish returns zero only after GPU completion.
 * add/remove affect only our Image's listener, never a stock draw callback.
 * validate must reject changed firmware/context before any UI operation. */
struct rw4_direct_ops {
    uintptr_t (*owner)(void *);
    int (*validate)(void *);
    void *(*create)(void *);
    int (*add_hook)(void *,void *,rw4_direct_hook,struct rw4_direct *);
    int (*remove_hook)(void *,void *);
    void (*set_src)(void *,void *,const void *);
    void (*refresh)(void *);
    int (*finish)(void *);
    void (*delete_image)(void *,void *);
    void (*drop)(void *,const void *);
};
struct rw4_direct_ticket {unsigned slot,generation;};
struct rw4_direct {
    struct rw4_direct_ops ops;
    void *host,*image;
    const void *descriptors[2];
    uint32_t *pixels[2];
    uintptr_t ui_owner;
    atomic_uint phase,stopping,producer_busy,next_generation;
    atomic_uint slots[2],generations[2];
    atomic_int error;
    int native_error,front;
    unsigned hooked,busy,draw_events,fences,presentations,retirements;
};
/* Storage, descriptors and ops must outlive this object; init is called once
 * before any producer. It allocates nothing and calls no host/LVGL function. */
int rw4_direct_init(struct rw4_direct *,const struct rw4_direct_ops *,void *,uint32_t *,uint32_t *,const void *,const void *);
int rw4_direct_start(struct rw4_direct *); /* UI caller */
int rw4_direct_acquire(struct rw4_direct *,struct rw4_direct_ticket *,uint32_t **); /* one producer */
int rw4_direct_publish(struct rw4_direct *,struct rw4_direct_ticket);
int rw4_direct_abort(struct rw4_direct *,struct rw4_direct_ticket);
int rw4_direct_present(struct rw4_direct *); /* UI caller */
void rw4_direct_on_event(struct rw4_direct *,void *,unsigned); /* UI callback */
void rw4_direct_request_stop(struct rw4_direct *);
/* joined is an integration assertion: producer has really exited AND been
 * joined. A stopped flag or elapsed timeout is not equivalent. */
int rw4_direct_close(struct rw4_direct *,int joined); /* UI, after join */
int rw4_direct_can_unload(const struct rw4_direct *);
#endif
