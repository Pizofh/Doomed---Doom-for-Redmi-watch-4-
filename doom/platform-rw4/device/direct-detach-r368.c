/* SPDX-License-Identifier: GPL-2.0-only */
#include "direct-detach-r368.h"
#include <stddef.h>
/* Keep the original publication implementation and its sticky error contract.
 * Error cleanup is allowed to remove our Image, never to erase its error. */
static int latch(struct rw4_direct *b,int reason,int native)
{
    int expected=0;
    if(atomic_compare_exchange_strong(&b->error,&expected,reason))b->native_error=native;
    atomic_store(&b->phase,DIRECT_FAILED);return -5;
}
static int drain(struct rw4_direct *b)
{
    int rc=b->ops.finish(b->host);b->fences++;
    return rc?latch(b,DIRECT_E_FENCE,rc):0;
}
int rw4_direct_detach(struct rw4_direct *b)
{
    if(b->busy)return -16;
    if(!b->ui_owner||b->ops.owner(b->host)!=b->ui_owner)return -1;
    rw4_direct_request_stop(b);
    if(b->ops.validate(b->host))return latch(b,DIRECT_E_HOST,0);
    if(!b->image)return b->hooked?-16:0;
    b->busy=1;
    if(drain(b)){b->busy=0;return -5;}
    if(b->hooked&&!b->ops.remove_hook(b->host,b->image)){
        b->busy=0;return latch(b,DIRECT_E_HOOK,0);
    }
    b->hooked=0;b->ops.delete_image(b->host,b->image);b->image=NULL;
    b->ops.refresh(b->host);
    int rc=drain(b);b->busy=0;return rc;
}
int rw4_direct_retire(struct rw4_direct *b,int producer_joined)
{
    int rc=rw4_direct_detach(b);if(rc)return rc;
    if(!producer_joined||atomic_load(&b->producer_busy))return -16;
    if(atomic_load(&b->phase)==DIRECT_CLOSED)return atomic_load(&b->error)?-5:0;
    b->busy=1;
    if(drain(b)){b->busy=0;return -5;}
    for(unsigned i=0;i<2;i++){
        b->ops.drop(b->host,b->descriptors[i]);atomic_store(&b->slots[i],DIRECT_FREE);
    }
    b->front=-1;atomic_store(&b->phase,DIRECT_CLOSED);b->busy=0;
    return atomic_load(&b->error)?-5:0;
}
