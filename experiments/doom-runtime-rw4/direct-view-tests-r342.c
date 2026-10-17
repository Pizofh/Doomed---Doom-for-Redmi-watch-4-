/* PC S3 C execution: graphics/producer scheduler modeled, no real LVGL calls. */
#include "direct-view-r342.h"
#include <stddef.h>
extern int test_printf(const char *,...);
struct module_info {int(*uninit)(void *);void *arg;const void *exports;unsigned nexports;};
static struct rw4_direct bridge;
static uint32_t pixels[2][RW4_DIRECT_PIXELS],visible[RW4_DIRECT_PIXELS];
struct dsc {uint32_t *data;};static struct dsc d[2]={{pixels[0]},{pixels[1]}};
static struct model {
    uintptr_t owner;
    unsigned validate_fail,create_fail,hook_fail,remove_fail,no_events,wrong_callback;
    unsigned fail_finish,finish_calls,swallowed,live,hooked,deleted,dropped,refreshes;
    unsigned expected_frame,consumed,inject_producer,blocked_producer;
    int pending,post_fail;
    struct dsc *source;
    rw4_direct_hook hook;struct rw4_direct *bridge;
} m;
static unsigned checks,scenarios;
#define CHECK(x) do{checks++;if(!(x)){test_printf("DIRECT_R342 FAIL line=%u checks=%u scenarios=%u\n",__LINE__,checks,scenarios);return -1;}}while(0)
void *memset(void *p,int c,size_t n){unsigned char *s=p;for(size_t i=0;i<n;i++)s[i]=(unsigned char)c;return p;}
static uintptr_t owner(void *p){(void)p;return m.owner;}
static int validate(void *p){(void)p;return m.validate_fail?-1:0;}
static void *create(void *p){(void)p;if(m.create_fail)return NULL;m.live=1;return &m;}
static int add(void *p,void *image,rw4_direct_hook fn,struct rw4_direct *b)
{(void)p;(void)image;if(m.hook_fail)return -1;m.hooked=1;m.hook=fn;m.bridge=b;return 0;}
static int remove_hook(void *p,void *image)
{(void)p;(void)image;if(m.remove_fail)return 0;m.hooked=0;m.hook=NULL;return 1;}
static void source(void *p,void *image,const void *src){(void)p;(void)image;m.source=(struct dsc *)src;}
static int finish(void *p)
{
    (void)p;m.finish_calls++;
    if(m.finish_calls==m.fail_finish)return 4;
    if(m.pending){for(unsigned i=0;i<RW4_DIRECT_PIXELS;i++)visible[i]=m.source->data[i];m.pending=0;m.consumed++;}
    return 0;
}
static void refresh(void *p)
{
    (void)p;m.refreshes++;if(!m.live||!m.source)return;
    for(unsigned post=0;post<2;post++){
        m.pending=1;
        if(m.inject_producer){struct rw4_direct_ticket t;uint32_t *data;
            int rc=rw4_direct_acquire(m.bridge,&t,&data);if(rc==-11)m.blocked_producer++;
            else if(!rc)(void)rw4_direct_abort(m.bridge,t);}
        if(m.hook&&!m.no_events){uintptr_t old=m.owner;if(m.wrong_callback)m.owner=99;
            m.hook(m.bridge,&m,DIRECT_DRAW_END);m.owner=old;}
        /* Real stock wait is void and can hide an earlier failure. */
        int rc=finish(NULL);if(rc)m.swallowed++;
        if(post&&m.post_fail)m.hook(m.bridge,&m,DIRECT_DELETED);
    }
}
static void delete_image(void *p,void *image){(void)p;(void)image;m.live=0;m.deleted++;m.source=NULL;}
static void drop(void *p,const void *src){(void)p;(void)src;m.dropped++;}
static const struct rw4_direct_ops ops={owner,validate,create,add,remove_hook,source,refresh,finish,delete_image,drop};
static void fixture(void)
{
    /* Independent model worlds: no actual GPU, callback or module is retained. */
    memset(&m,0,sizeof(m));m.owner=17;scenarios++;
    (void)rw4_direct_init(&bridge,&ops,&m,pixels[0],pixels[1],&d[0],&d[1]);
}
static uint32_t pattern(unsigned frame,unsigned i){return 0xff000000u|((frame*41u+i*17u+(i/320u)*97u)&0xffffffu);}
static int produce(unsigned frame)
{
    struct rw4_direct_ticket t;uint32_t *data;int rc=rw4_direct_acquire(&bridge,&t,&data);if(rc)return rc;
    for(unsigned i=0;i<RW4_DIRECT_PIXELS;i++)data[i]=pattern(frame,i);
    m.expected_frame=frame;return rw4_direct_publish(&bridge,t);
}
static int run(void)
{
    fixture();CHECK(rw4_direct_can_unload(&bridge));CHECK(!m.finish_calls&&!m.refreshes);
    CHECK(rw4_direct_init(&bridge,&ops,&m,pixels[0],pixels[0]+1,&d[0],&d[1])==-22);
    for(unsigned cycle=0;cycle<2;cycle++){
        CHECK(rw4_direct_start(&bridge)==0);CHECK(!rw4_direct_can_unload(&bridge));
        CHECK(rw4_direct_present(&bridge)==-11);
        for(unsigned f=1;f<=24;f++){
            CHECK(produce(f)==0);CHECK(rw4_direct_present(&bridge)==0);
            for(unsigned i=0;i<RW4_DIRECT_PIXELS;i++)CHECK(visible[i]==pattern(f,i));
            CHECK(atomic_load(&bridge.slots[bridge.front])==DIRECT_VISIBLE);
            if(f>1){CHECK(m.blocked_producer==2*(f-1));}
            m.inject_producer=1;
        }
        CHECK(rw4_direct_close(&bridge,0)==-16);CHECK(!rw4_direct_can_unload(&bridge));
        CHECK(rw4_direct_close(&bridge,1)==0);CHECK(rw4_direct_can_unload(&bridge));
        CHECK(!m.live&&!m.hooked&&!m.pending);m.blocked_producer=0;
    }
    CHECK(m.deleted==2&&bridge.presentations==48&&bridge.retirements==46);
    fixture();CHECK(rw4_direct_start(&bridge)==0);struct rw4_direct_ticket t,stale;uint32_t *data;
    CHECK(!rw4_direct_acquire(&bridge,&t,&data));stale=t;
    CHECK(rw4_direct_acquire(&bridge,&t,&data)==-16);CHECK(rw4_direct_close(&bridge,1)==-16);
    CHECK(rw4_direct_publish(&bridge,stale)==-16);CHECK(!atomic_load(&bridge.producer_busy));
    CHECK(rw4_direct_close(&bridge,1)==0);CHECK(rw4_direct_start(&bridge)==0);
    CHECK(!rw4_direct_acquire(&bridge,&t,&data));CHECK(t.generation!=stale.generation);
    CHECK(rw4_direct_publish(&bridge,stale)==-22);CHECK(!rw4_direct_abort(&bridge,t));CHECK(!rw4_direct_close(&bridge,1));
    fixture();m.owner=0;CHECK(rw4_direct_start(&bridge)==-1);CHECK(rw4_direct_can_unload(&bridge));
    fixture();m.create_fail=1;CHECK(rw4_direct_start(&bridge)==-12);CHECK(rw4_direct_can_unload(&bridge));
    fixture();m.hook_fail=1;CHECK(rw4_direct_start(&bridge)==-12);CHECK(m.deleted==1);CHECK(rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));CHECK(!produce(1));CHECK(!rw4_direct_present(&bridge));
    m.owner=99;CHECK(rw4_direct_present(&bridge)==-1);CHECK(rw4_direct_close(&bridge,1)==-1);
    m.owner=17;CHECK(!rw4_direct_close(&bridge,1));m.owner=99;CHECK(rw4_direct_start(&bridge)==-1);
    /* Every checked-finish failure in startup, main/post drawing, final present
     * and both close drains must be sticky even when a later stock wait is OK. */
    for(unsigned where=0;where<6;where++){
        fixture();if(!where)m.fail_finish=1;
        int rc=rw4_direct_start(&bridge);
        if(where){CHECK(!rc);CHECK(!produce(1));
            if(where<4)m.fail_finish=m.finish_calls+(where==1?1:where==2?3:5);
            rc=rw4_direct_present(&bridge);
            if(where>=4){CHECK(!rc);m.fail_finish=m.finish_calls+(where==4?1:2);rc=rw4_direct_close(&bridge,1);}
        }
        CHECK(rc==-5);CHECK(atomic_load(&bridge.error)==DIRECT_E_FENCE);CHECK(bridge.native_error==4);
        CHECK(!rw4_direct_can_unload(&bridge));CHECK(rw4_direct_close(&bridge,1)==-5);
        CHECK(rw4_direct_start(&bridge)==-16);CHECK(produce(2)==-16);
    }
    fixture();CHECK(!rw4_direct_start(&bridge));CHECK(!produce(1));m.no_events=1;
    CHECK(rw4_direct_present(&bridge)==-5);CHECK(atomic_load(&bridge.error)==DIRECT_E_EVENT);CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));CHECK(!produce(1));m.wrong_callback=1;
    CHECK(rw4_direct_present(&bridge)==-5);CHECK(atomic_load(&bridge.error)==DIRECT_E_HOST);CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));m.validate_fail=1;
    CHECK(rw4_direct_close(&bridge,1)==-5);CHECK(!m.deleted);CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));m.remove_fail=1;
    CHECK(rw4_direct_close(&bridge,1)==-5);CHECK(!m.deleted&&m.hooked);CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));m.hook(&bridge,&m,DIRECT_DELETED);
    CHECK(!bridge.image&&!bridge.hooked);CHECK(atomic_load(&bridge.error)==DIRECT_E_DELETED);CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));unsigned fences=bridge.fences;
    rw4_direct_on_event(&bridge,pixels,DIRECT_DRAW_END);CHECK(bridge.fences==fences);CHECK(!rw4_direct_close(&bridge,1));
    fixture();CHECK(!rw4_direct_start(&bridge));CHECK(!produce(1));CHECK(!produce(2));
    CHECK(rw4_direct_acquire(&bridge,&t,&data)==-11);CHECK(!data);
    CHECK(!rw4_direct_present(&bridge));CHECK(!rw4_direct_present(&bridge));CHECK(!rw4_direct_close(&bridge,1));
    fixture();CHECK(!rw4_direct_start(&bridge));atomic_store(&bridge.next_generation,UINT32_MAX);
    CHECK(rw4_direct_acquire(&bridge,&t,&data)==-75);CHECK(rw4_direct_acquire(&bridge,&t,&data)==-75);
    CHECK(!data&&!atomic_load(&bridge.producer_busy));CHECK(!rw4_direct_close(&bridge,1));
    return 0;
}
static int uninit(void *p){(void)p;return 0;}
int direct_tests_init(struct module_info *info)
{
    if(!info||run())return -22;
    info->uninit=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    test_printf("DIRECT_R342 PASS checks=%u scenarios=%u compared_pixels=%u physical=0 graphics=modeled\n",checks,scenarios,48u*RW4_DIRECT_PIXELS);return 0;
}
