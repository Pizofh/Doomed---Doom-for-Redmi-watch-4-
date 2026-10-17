/* SPDX-License-Identifier: GPL-2.0-or-later
 * Candidate RW4-only ABI, from the pinned AP. Never execute on the S3 guest.
 * Registers one listener on our Image, not a replacement of stock callbacks.
 */
#include "direct-rw4-r342.h"
#include <stddef.h>
#include "direct-addresses-r342.h"
_Static_assert(sizeof(void *)==4&&sizeof(struct rw4_direct_dsc)==12,"RW4 descriptor ABI");
static uintptr_t field(void *p,unsigned off)
{
    const volatile uint32_t *v=(const volatile uint32_t *)((uintptr_t)p+off);return *v;
}
static int fingerprints(void)
{
    for(unsigned i=0;i<sizeof(direct_pins)/sizeof(direct_pins[0]);i++){
        const volatile unsigned char *p=(const volatile unsigned char *)direct_pins[i].address;
        uint32_t hash=2166136261u;for(unsigned j=0;j<64;j++)hash=(hash^p[j])*16777619u;
        if(hash!=direct_pins[i].fnv)return -1;
    }
    return 0;
}
static uintptr_t owner(void *host)
{
    (void)host;if(fingerprints())return 0;
    return(uintptr_t)((void *(*)(void))DIRECT_ADDR_OWNER)();
}
static int validate(void *host)
{
    struct rw4_direct_native *n=host;if(fingerprints())return -1;
    void *display=((void *(*)(void))DIRECT_ADDR_DEFAULT)();if(!display)return -1;
    void *parent=((void *(*)(void *))DIRECT_ADDR_SCREEN)(display);if(!parent)return -1;
    void *driver=(void *)field(display,0);if(!driver||((uintptr_t)driver&3))return -1;
    void *ctx=(void *)field(driver,96);if(!ctx||((uintptr_t)ctx&3))return -1;
    if(field(ctx,52)!=DIRECT_ADDR_GPU_WAIT)return -1;
    if(n->display&&(n->display!=display||n->parent!=parent||n->draw_ctx!=ctx))return -1;
    n->display=display;n->parent=parent;n->draw_ctx=ctx;return 0;
}
static void *create(void *host)
{
    struct rw4_direct_native *n=host;return((void *(*)(void *))DIRECT_ADDR_CREATE)(n->parent);
}
static void listener(void *event)
{
    struct rw4_direct_native *n=((void *(*)(void *))DIRECT_ADDR_EVENT_USER)(event);
    if(!n||!n->hook)return;
    void *target=((void *(*)(void *))DIRECT_ADDR_EVENT_CURRENT)(event);
    if(target!=n->hook_image)return;
    unsigned code=((unsigned(*)(void *))DIRECT_ADDR_EVENT_CODE)(event);
    /* AP Image draws on MAIN21 and POST24. End events22/25 both need fences. */
    if(code==22||code==25)n->hook(n->bridge,target,DIRECT_DRAW_END);
    else if(code==33){n->hook(n->bridge,target,DIRECT_DELETED);n->hook=NULL;n->hook_image=NULL;}
}
static int add(void *host,void *image,rw4_direct_hook hook,struct rw4_direct *b)
{
    struct rw4_direct_native *n=host;n->hook=hook;n->bridge=b;n->hook_image=image;
    void *d=((void *(*)(void *,void(*)(void *),unsigned,void *))DIRECT_ADDR_EVENT_ADD)(image,listener,0,n);
    if(!d){n->hook=NULL;n->hook_image=NULL;return -12;}return 0;
}
static int remove_hook(void *host,void *image)
{
    struct rw4_direct_native *n=host;if(image!=n->hook_image)return 0;
    int ok=((int(*)(void *,void(*)(void *)))DIRECT_ADDR_EVENT_REMOVE)(image,listener);
    if(ok){n->hook=NULL;n->hook_image=NULL;}return ok;
}
static void source(void *host,void *image,const void *d)
{(void)host;((void(*)(void *,const void *))DIRECT_ADDR_SOURCE)(image,d);}
static void refresh(void *host){(void)host;((void(*)(void *))DIRECT_ADDR_REFRESH)(NULL);}
static int finish(void *host){(void)host;return((int(*)(void))DIRECT_ADDR_FINISH)();}
static void delete_image(void *host,void *image){(void)host;((void(*)(void *))DIRECT_ADDR_DELETE)(image);}
static void drop(void *host,const void *d){(void)host;((void(*)(const void *))DIRECT_ADDR_DROP)(d);}
int rw4_direct_native_init(struct rw4_direct *b,struct rw4_direct_native *n,uint32_t *a,uint32_t *c)
{
    if(!n)return -22;n->display=NULL;n->parent=NULL;n->draw_ctx=NULL;n->hook=NULL;n->hook_image=NULL;n->bridge=b;
    for(unsigned i=0;i<2;i++){n->descriptors[i].header=0x19050004u;n->descriptors[i].size=RW4_DIRECT_BYTES;n->descriptors[i].data=i?c:a;}
    const struct rw4_direct_ops ops={owner,validate,create,add,remove_hook,source,refresh,finish,delete_image,drop};
    return rw4_direct_init(b,&ops,n,a,c,&n->descriptors[0],&n->descriptors[1]);
}
