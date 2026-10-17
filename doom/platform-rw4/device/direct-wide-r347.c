/* Same producer/slots/fences. Configure the stock Image transform once in UI. */
#define rw4_direct_backend_init rw4_direct_unscaled_init
#include "direct-backend-r343.c"
#undef rw4_direct_backend_init
#include "direct-scale-r347.h"
static void *(*original_create)(void *);
static void (*original_source)(void *,void *,const void *);
static unsigned scaled;
static void *wide_create(void *host)
{
    const volatile unsigned char *p=(const volatile unsigned char *)DIRECT_SCALE_ADDRESS;
    uint32_t hash=2166136261u;for(unsigned i=0;i<64;i++)hash=(hash^p[i])*16777619u;
    if(hash!=DIRECT_SCALE_FNV)return 0;
    p=(const volatile unsigned char *)DIRECT_ALIAS_ADDRESS;hash=2166136261u;
    for(unsigned i=0;i<64;i++)hash=(hash^p[i])*16777619u;
    if(hash!=DIRECT_ALIAS_FNV)return 0;
    scaled=0;return original_create(host);
}
static void wide_source(void *host,void *image,const void *d)
{
    original_source(host,image,d);
    if(!scaled){
        /* set_src establishes the 160,100 center pivot; 306/256 uniform scale. */
        ((void(*)(void *,int32_t))DIRECT_POSITION_Y)(image,30);
        ((void(*)(void *,uint32_t))DIRECT_ALIAS_FUNCTION)(image,0);
        ((void(*)(void *,uint32_t))DIRECT_SCALE_FUNCTION)(image,306);
        scaled=1;
    }
}
int rw4_direct_backend_init(struct rw4_direct *b,uint32_t *a,uint32_t *c)
{
    int rc=rw4_direct_unscaled_init(b,a,c);if(rc)return rc;
    original_create=b->ops.create;original_source=b->ops.set_src;
    b->ops.create=wide_create;b->ops.set_src=wide_source;return 0;
}
