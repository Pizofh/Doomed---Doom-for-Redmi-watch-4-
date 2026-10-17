/* SPDX-License-Identifier: GPL-2.0-or-later
 * Persistent Image publication. No PNG, frame file, heap or firmware bindings.
 * Two slots, one producer; all host/LVGL operations belong to one UI task.
 */
#include "direct-view-r342.h"
#include <stddef.h>
static int fail(struct rw4_direct *b,int reason,int native)
{
    int expected=0;
    if(atomic_compare_exchange_strong(&b->error,&expected,reason))b->native_error=native;
    atomic_store(&b->stopping,1);atomic_store(&b->phase,DIRECT_FAILED);return -5;
}
static int valid_ui(struct rw4_direct *b)
{
    if(b->ops.owner(b->host)!=b->ui_owner)return -1;
    if(atomic_load(&b->error))return -5;
    if(b->ops.validate(b->host))return fail(b,DIRECT_E_HOST,0);
    return 0;
}
static int finish(struct rw4_direct *b)
{
    int rc=b->ops.finish(b->host);b->fences++;
    return rc?fail(b,DIRECT_E_FENCE,rc):0;
}
int rw4_direct_init(struct rw4_direct *b,const struct rw4_direct_ops *ops,void *host,
                    uint32_t *a,uint32_t *c,const void *da,const void *dc)
{
    if(!b||!ops||!a||!c||!da||!dc||a==c||da==dc||
       ((uintptr_t)a&3)||((uintptr_t)c&3)||
       !ops->owner||!ops->validate||!ops->create||!ops->add_hook||!ops->remove_hook||
       !ops->set_src||!ops->refresh||!ops->finish||!ops->delete_image||!ops->drop)return -22;
    /* Reject overlapping buffers as well as equal pointers. */
    uintptr_t pa=(uintptr_t)a,pc=(uintptr_t)c;
    if((pa<pc?pc-pa:pa-pc)<RW4_DIRECT_BYTES)return -22;
    b->ops=*ops;b->host=host;b->image=NULL;b->descriptors[0]=da;b->descriptors[1]=dc;
    b->pixels[0]=a;b->pixels[1]=c;b->ui_owner=0;b->front=-1;
    atomic_init(&b->phase,DIRECT_IDLE);atomic_init(&b->stopping,1);
    atomic_init(&b->producer_busy,0);atomic_init(&b->next_generation,0);atomic_init(&b->error,0);
    for(unsigned i=0;i<2;i++){atomic_init(&b->slots[i],DIRECT_FREE);atomic_init(&b->generations[i],0);}
    b->native_error=0;b->hooked=0;b->busy=0;b->draw_events=0;b->fences=0;
    b->presentations=0;b->retirements=0;return 0;
}
int rw4_direct_start(struct rw4_direct *b)
{
    unsigned phase=atomic_load(&b->phase);
    if((phase!=DIRECT_IDLE&&phase!=DIRECT_CLOSED)||b->image||b->hooked||b->busy||atomic_load(&b->producer_busy))return -16;
    uintptr_t owner=b->ops.owner(b->host);if(!owner)return -1;
    /* Once bound, another task cannot adopt a closed bridge. */
    if(b->ui_owner&&b->ui_owner!=owner)return -1;b->ui_owner=owner;
    int rc=valid_ui(b);if(rc)return rc;b->busy=1;
    if(finish(b)){b->busy=0;return -5;}
    b->image=b->ops.create(b->host);
    if(!b->image){b->busy=0;return -12;}
    if(b->ops.add_hook(b->host,b->image,rw4_direct_on_event,b)){
        b->ops.delete_image(b->host,b->image);b->image=NULL;b->busy=0;return -12;
    }
    b->hooked=1;b->front=-1;atomic_store(&b->phase,DIRECT_ACTIVE);
    atomic_store(&b->stopping,0);b->busy=0;return 0;
}
int rw4_direct_acquire(struct rw4_direct *b,struct rw4_direct_ticket *t,uint32_t **pixels)
{
    if(!t||!pixels)return -22;*pixels=NULL;
    if(atomic_load(&b->phase)!=DIRECT_ACTIVE||atomic_load(&b->stopping))return -16;
    unsigned expected=0;if(!atomic_compare_exchange_strong(&b->producer_busy,&expected,1))return -16;
    if(atomic_load(&b->stopping)){atomic_store(&b->producer_busy,0);return -16;}
    if(atomic_load(&b->next_generation)==UINT32_MAX){atomic_store(&b->producer_busy,0);return -75;}
    for(unsigned i=0;i<2;i++){
        expected=DIRECT_FREE;
        if(!atomic_compare_exchange_strong(&b->slots[i],&expected,DIRECT_WRITING))continue;
        unsigned generation=atomic_fetch_add(&b->next_generation,1)+1;
        if(!generation){atomic_store(&b->slots[i],DIRECT_FREE);atomic_store(&b->producer_busy,0);return -75;}
        atomic_store(&b->generations[i],generation);t->slot=i;t->generation=generation;*pixels=b->pixels[i];return 0;
    }
    atomic_store(&b->producer_busy,0);return -11;
}
static int release_writer(struct rw4_direct *b,struct rw4_direct_ticket t,int publish)
{
    if(t.slot>1||!t.generation||!atomic_load(&b->producer_busy)||
       atomic_load(&b->generations[t.slot])!=t.generation)return -22;
    unsigned expected=DIRECT_WRITING;
    int stopped=atomic_load(&b->stopping);
    if(!atomic_compare_exchange_strong(&b->slots[t.slot],&expected,publish&&!stopped?DIRECT_READY:DIRECT_FREE))return -22;
    atomic_store(&b->producer_busy,0);return publish&&stopped?-16:0;
}
int rw4_direct_publish(struct rw4_direct *b,struct rw4_direct_ticket t){return release_writer(b,t,1);}
int rw4_direct_abort(struct rw4_direct *b,struct rw4_direct_ticket t){return release_writer(b,t,0);}
void rw4_direct_on_event(struct rw4_direct *b,void *target,unsigned event)
{
    if(target!=b->image)return; /* no bubbled events from other objects */
    if(event==DIRECT_DELETED){b->image=NULL;b->hooked=0;fail(b,DIRECT_E_DELETED,0);return;}
    if(event!=DIRECT_DRAW_END||atomic_load(&b->error))return;
    if(b->ops.owner(b->host)!=b->ui_owner){fail(b,DIRECT_E_HOST,0);return;}
    if(b->ops.validate(b->host)){fail(b,DIRECT_E_HOST,0);return;}
    b->draw_events++;(void)finish(b); /* latch BEFORE the stock void wait */
}
int rw4_direct_present(struct rw4_direct *b)
{
    if(b->busy)return -16;int rc=valid_ui(b);if(rc)return rc;
    if(atomic_load(&b->phase)!=DIRECT_ACTIVE||atomic_load(&b->stopping)||!b->image)return -16;
    unsigned i;for(i=0;i<2;i++){unsigned expected=DIRECT_READY;if(atomic_compare_exchange_strong(&b->slots[i],&expected,DIRECT_HELD))break;}
    if(i==2)return -11;b->busy=1;
    int old=b->front;b->front=(int)i;unsigned events=b->draw_events;
    b->ops.set_src(b->host,b->image,b->descriptors[i]);b->ops.refresh(b->host);
    if(atomic_load(&b->error)){b->busy=0;return -5;}
    /* A clipped/hidden Image produces no completion event: do not guess. */
    if(events==b->draw_events){b->busy=0;return fail(b,DIRECT_E_EVENT,0);}
    if(finish(b)){b->busy=0;return -5;}
    atomic_store(&b->slots[i],DIRECT_VISIBLE);
    if(old>=0){b->ops.drop(b->host,b->descriptors[old]);atomic_store(&b->slots[old],DIRECT_FREE);b->retirements++;}
    b->presentations++;b->busy=0;return 0;
}
void rw4_direct_request_stop(struct rw4_direct *b){atomic_store(&b->stopping,1);}
int rw4_direct_close(struct rw4_direct *b,int joined)
{
    if(b->busy)return -16;int rc=valid_ui(b);if(rc)return rc;
    if(atomic_load(&b->phase)!=DIRECT_ACTIVE||!b->image)return -16;
    rw4_direct_request_stop(b);
    if(!joined||atomic_load(&b->producer_busy))return -16;
    b->busy=1;
    if(finish(b)){b->busy=0;return -5;}
    if(!b->ops.remove_hook(b->host,b->image)){b->busy=0;return fail(b,DIRECT_E_HOOK,0);}
    b->hooked=0;b->ops.delete_image(b->host,b->image);b->image=NULL;
    b->ops.refresh(b->host);
    if(finish(b)){b->busy=0;return -5;}
    for(unsigned i=0;i<2;i++){b->ops.drop(b->host,b->descriptors[i]);atomic_store(&b->slots[i],DIRECT_FREE);}
    b->front=-1;atomic_store(&b->phase,DIRECT_CLOSED);b->busy=0;return 0;
}
int rw4_direct_can_unload(const struct rw4_direct *b)
{
    unsigned phase=atomic_load(&b->phase);
    return (phase==DIRECT_IDLE||phase==DIRECT_CLOSED)&&!atomic_load(&b->error)&&
        !atomic_load(&b->producer_busy)&&!b->image&&!b->hooked&&!b->busy;
}
