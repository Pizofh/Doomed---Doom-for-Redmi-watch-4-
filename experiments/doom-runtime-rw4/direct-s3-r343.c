/* S3 UI ONLY. Exact guest DWARF LVGL9, never RW4 offsets or GPU bindings. */
#include "direct-view-r342.h"
#include "platform.h"
#include <stddef.h>
struct image_s3 {uint32_t header[3],size;const void *data;};
_Static_assert(sizeof(struct image_s3)==20,"S3 descriptor");
extern void *s3_default(void);extern void *s3_screen(void *);extern void *s3_image_create(void *);
extern void s3_image_src(void *,const void *);extern void s3_position(void *,int32_t,int32_t);
extern void s3_delete(void *);extern void s3_refresh(void *);
extern void *s3_add(void *,void(*)(void *),unsigned,void *);extern int s3_remove(void *,void(*)(void *));
extern unsigned s3_event_code(void *);extern void *s3_event_current(void *);extern void *s3_event_user(void *);
extern void s3_drop(const void *);extern void s3_header_drop(const void *);extern void s3_dispatch(void);
static struct {struct image_s3 desc[2];void *display,*parent,*image;const struct image_s3 *source;rw4_direct_hook hook;struct rw4_direct *bridge;unsigned drains;} host;
static uintptr_t field(void *p,unsigned off){return *(const volatile uint32_t *)((uintptr_t)p+off);}
static uintptr_t owner(void *p){(void)p;return(unsigned)rw4_host_owner_token();}
static int validate(void *p)
{
    (void)p;void *d=s3_default();if(!d||field(d,0)!=390||field(d,4)!=450)return -1;
    void *parent=s3_screen(d);if(!parent)return -1;
    if(host.display&&(host.display!=d||host.parent!=parent))return -1;host.display=d;host.parent=parent;return 0;
}
static int empty(void)
{
    void *layer=(void *)field(host.display,672);
    for(unsigned n=0;layer&&n<8;n++){if(field(layer,56))return 0;layer=(void *)field(layer,64);}return !layer;
}
static int finish(void *p)
{
    (void)p;if(validate(NULL))return -5;
    for(unsigned n=0;n<128;n++){if(empty()){host.drains++;return 0;}s3_dispatch();}
    return -16;
}
static void *create(void *p){(void)p;host.image=s3_image_create(host.parent);if(host.image)s3_position(host.image,35,35);return host.image;}
static void listener(void *event)
{
    if(s3_event_user(event)!=&host||!host.hook)return;void *target=s3_event_current(event);if(target!=host.image)return;
    unsigned code=s3_event_code(event); /* DWARF: MAIN_END24, POST_END27, DELETE35 */
    if(code==24||code==27)host.hook(host.bridge,target,DIRECT_DRAW_END);
    else if(code==35){host.hook(host.bridge,target,DIRECT_DELETED);host.hook=NULL;host.image=NULL;host.source=NULL;}
}
static int add(void *p,void *image,rw4_direct_hook hook,struct rw4_direct *b)
{(void)p;host.hook=hook;host.bridge=b;if(!s3_add(image,listener,0,&host)){host.hook=NULL;return -12;}return 0;}
static int remove_hook(void *p,void *image){(void)p;int ok=s3_remove(image,listener);if(ok)host.hook=NULL;return ok;}
static void source(void *p,void *image,const void *d){(void)p;host.source=d;s3_image_src(image,d);}
static void refresh(void *p){(void)p;s3_refresh(NULL);}
static void delete_image(void *p,void *image){(void)p;s3_delete(image);host.image=NULL;host.source=NULL;}
static void drop(void *p,const void *d){(void)p;s3_drop(d);s3_header_drop(d);}
int rw4_direct_backend_init(struct rw4_direct *b,uint32_t *a,uint32_t *c)
{
    for(unsigned i=0;i<2;i++){host.desc[i]=(struct image_s3){{0x1119,320u|(200u<<16),1280},256000,i?c:a};}
    const struct rw4_direct_ops ops={owner,validate,create,add,remove_hook,source,refresh,finish,delete_image,drop};
    return rw4_direct_init(b,&ops,NULL,a,c,&host.desc[0],&host.desc[1]);
}
void rw4_direct_backend_stats(uint32_t *out)
{
    out[2]=host.drains;if(!host.source)return;
    const uint32_t *pixels=host.source->data;uint32_t hash=2166136261u;
    for(unsigned i=0;i<RW4_DIRECT_PIXELS;i++){
        uint32_t p=pixels[i],rgb565=((p>>8)&0xf800)|((p>>5)&0x7e0)|((p>>3)&31);
        hash=(hash^(rgb565&255))*16777619u;hash=(hash^(rgb565>>8))*16777619u;
    }
    out[0]=hash;
}
