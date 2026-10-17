/* RW4 integration binding. Only PC-built now; no physical approval. */
#include "direct-rw4-r342.h"
#include "direct-position-r343.h"
static struct rw4_direct_native native;
static void *(*base_create)(void *);
static void *create_positioned(void *host)
{
    for(unsigned i=0;i<2;i++){
        const volatile unsigned char *p=(const volatile unsigned char *)direct_position_pins[i].address;
        uint32_t h=2166136261u;for(unsigned j=0;j<64;j++)h=(h^p[j])*16777619u;
        if(h!=direct_position_pins[i].fnv)return 0;
    }
    void *image=base_create(host);if(!image)return 0;
    ((void(*)(void *,int32_t))DIRECT_POSITION_X)(image,35);
    ((void(*)(void *,int32_t))DIRECT_POSITION_Y)(image,35);
    return image;
}
int rw4_direct_backend_init(struct rw4_direct *b,uint32_t *a,uint32_t *c)
{
    int rc=rw4_direct_native_init(b,&native,a,c);if(rc)return rc;
    base_create=b->ops.create;b->ops.create=create_positioned;return 0;
}
void rw4_direct_backend_stats(uint32_t *out){(void)out;}
