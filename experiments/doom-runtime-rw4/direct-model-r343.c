/* S3 engine/thread integration only: no native graphics or RW4 addresses. */
#include "direct-view-r342.h"
#include "platform.h"
static struct {uint32_t *pixels;} desc[2];
static struct {struct rw4_direct *bridge;rw4_direct_hook hook;unsigned live,colors,hash,draws;void *source;} model;
static uintptr_t owner(void *p){(void)p;return(unsigned)rw4_host_owner_token();}
static int validate(void *p){(void)p;return 0;}
static void *create(void *p){(void)p;model.live=1;return &model;}
static int add(void *p,void *image,rw4_direct_hook hook,struct rw4_direct *b){(void)p;(void)image;model.bridge=b;model.hook=hook;return 0;}
static int remove_hook(void *p,void *image){(void)p;(void)image;model.hook=0;return 1;}
static void source(void *p,void *image,const void *d){(void)p;(void)image;model.source=(void *)d;}
static void refresh(void *p)
{
    (void)p;if(!model.live||!model.source)return;
    uint32_t *pixels=model.source==&desc[0]?desc[0].pixels:desc[1].pixels;
    unsigned char buckets[4096]={0};unsigned colors=0;uint32_t hash=2166136261u;
    for(unsigned i=0;i<RW4_DIRECT_PIXELS;i++){uint32_t v=pixels[i];hash=(hash^v)*16777619u;
        unsigned bucket=((v*2654435761u)>>20)&4095;if(!buckets[bucket]){buckets[bucket]=1;colors++;}}
    model.colors=colors;model.hash=hash;model.draws++;model.hook(model.bridge,&model,DIRECT_DRAW_END);
}
static int finish(void *p){(void)p;return 0;}
static void delete_image(void *p,void *image){(void)p;(void)image;model.live=0;model.source=0;}
static void drop(void *p,const void *d){(void)p;(void)d;}
int rw4_direct_backend_init(struct rw4_direct *b,uint32_t *a,uint32_t *c)
{
    desc[0].pixels=a;desc[1].pixels=c;const struct rw4_direct_ops ops={owner,validate,create,add,remove_hook,source,refresh,finish,delete_image,drop};
    return rw4_direct_init(b,&ops,0,a,c,&desc[0],&desc[1]);
}
void rw4_direct_backend_stats(uint32_t *out){out[0]=model.colors;out[1]=model.hash;out[2]=model.draws;}
