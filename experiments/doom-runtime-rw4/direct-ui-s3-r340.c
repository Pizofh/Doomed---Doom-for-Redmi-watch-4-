/* PC S3 ONLY: one native Image, two immutable 320x200 XRGB8888 sources.
 * All widget/refresh/cache operations occur in the Lua UI caller, never init,
 * worker, GC or uninit. Private display/layer offsets are pinned S3 DWARF.
 */
#include <stdint.h>
#include <stddef.h>
#include <stdatomic.h>
extern int host_register(const char *,const void *,unsigned,void *);
extern int host_unregister(const char *);
extern int host_owner(void);
extern void *host_default(void);
extern void *host_screen(void *);
extern void *host_image_create(void *);
extern void host_image_src(void *,const void *);
extern void host_position(void *,int32_t,int32_t);
extern void host_delete(void *);
extern void host_refresh(void *);
extern void host_drop(const void *);
extern void host_header_drop(const void *);
extern int host_clock(int,void *);
struct timespec_s3 {int64_t seconds;int32_t ns,pad;};
struct image_s3 {uint32_t header[3],size;const void *data;};
struct module_info {int(*uninit)(void *);void *arg;const void *exports;unsigned nexports;};
_Static_assert(sizeof(struct image_s3)==20&&sizeof(void *)==4,"fixed S3 ABI");
static uint32_t pixels[2][64000];
static struct image_s3 images[2]={{{0x1119,320u|(200u<<16),1280},256000,pixels[0]},{{0x1119,320u|(200u<<16),1280},256000,pixels[1]}};
static const char node[]="/dev/rw4direct340";
static void *image;
static atomic_uint refs,gate,phase,sequence,frames,shown,elapsed,total_us,max_us,created,deleted,drains,clean,rejected;
static int owner;static uint64_t began;static unsigned cursor;static uint32_t snapshot[32];
void *memset(void *dst,int value,size_t n)
{unsigned char *p=dst;for(size_t i=0;i<n;i++)p[i]=(unsigned char)value;return dst;}
static uint32_t get32(const char *p){const unsigned char *b=(const unsigned char *)p;return b[0]|((uint32_t)b[1]<<8)|((uint32_t)b[2]<<16)|((uint32_t)b[3]<<24);}
static uintptr_t field(void *p,unsigned offset){const volatile unsigned char *b=(const volatile unsigned char *)p+offset;return b[0]|((uint32_t)b[1]<<8)|((uint32_t)b[2]<<16)|((uint32_t)b[3]<<24);}
static uint64_t now(void){struct timespec_s3 t={0};if(host_clock(1,&t)||t.seconds<0||t.ns<0||t.ns>=1000000000)return 0;return(uint64_t)t.seconds*1000000u+(unsigned)t.ns/1000u;}
/* Exact guest DWARF: display.layer_head+672, layer.task_head+56/next+64.
 * Read-only bounded traversal on UI caller after a synchronous refresh.
 * This is NOT a RW4 layout or a generic GPU fence. */
static int queue_empty(void)
{
    void *display=host_default();if(!display||field(display,0)!=390||field(display,4)!=450)return 0;
    void *layer=(void *)field(display,672);
    for(unsigned n=0;layer&&n<8;n++){
        if(field(layer,56))return 0;layer=(void *)field(layer,64);
    }
    return layer==NULL;
}
static int drain(void)
{
    atomic_store(&clean,0);host_refresh(NULL);atomic_fetch_add(&drains,1);
    if(!queue_empty())return -16;atomic_store(&clean,1);return 0;
}
static int present(unsigned p)
{
    uint64_t begin=now();if(!begin)return -5;
    host_image_src(image,&images[p]);int rc=drain();if(rc)return rc;
    unsigned cost=(unsigned)(now()-begin);atomic_fetch_add(&total_us,cost);
    unsigned maximum=atomic_load(&max_us);if(cost>maximum)atomic_store(&max_us,cost);
    atomic_store(&shown,p);atomic_fetch_add(&frames,1);atomic_store(&elapsed,(unsigned)(now()-began)/1000u);return 0;
}
static int open_ctl(void *f)
{
    (void)f;if(atomic_load(&gate))return -16;unsigned expected=0;
    if(!atomic_compare_exchange_strong(&refs,&expected,1))return -16;cursor=0;return 0;
}
static int close_ctl(void *f){(void)f;return atomic_exchange(&refs,0)?0:-22;}
static int read_ctl(void *f,char *b,unsigned n)
{
    (void)f;if(!atomic_load(&refs)||(!b&&n))return -22;if(cursor>=128)return 0;
    if(!cursor){for(unsigned i=0;i<32;i++)snapshot[i]=0;
        uint32_t values[14]={0x34495244,1,atomic_load(&sequence),atomic_load(&phase),atomic_load(&frames),atomic_load(&shown),atomic_load(&elapsed),atomic_load(&total_us),atomic_load(&max_us),atomic_load(&created),atomic_load(&deleted),atomic_load(&drains),atomic_load(&clean),atomic_load(&rejected)};
        for(unsigned i=0;i<14;i++)snapshot[i]=values[i];}
    if(n>128-cursor)n=128-cursor;const char *p=(const char *)snapshot;for(unsigned i=0;i<n;i++)b[i]=p[cursor+i];cursor+=n;return(int)n;
}
static int write_ctl(void *f,const char *b,unsigned n)
{
    (void)f;if(!atomic_load(&refs)||!b||n!=16||get32(b)!=0x34495244||get32(b+4)!=atomic_load(&sequence)+1||get32(b+12))return -22;
    unsigned op=get32(b+8),state=atomic_load(&phase);int rc;
    if(op<1||op>3)return -22;
    if(state==1&&owner!=host_owner()){atomic_fetch_add(&rejected,1);return -1;}
    if(op==1){
        if(image||state==1)return -16;
        owner=host_owner();void *display=host_default();if(!display)return -5;
        image=host_image_create(host_screen(display));if(!image)return -12;
        atomic_store(&frames,0);atomic_store(&elapsed,0);atomic_store(&total_us,0);atomic_store(&max_us,0);
        atomic_fetch_add(&created,1);host_position(image,35,60);began=now();atomic_store(&phase,1);
        rc=present(0);if(rc)return rc;
    }else if(op==2){
        if(!image||state!=1)return -16;rc=present(atomic_load(&shown)^1u);if(rc)return rc;
    }else{
        if(!image||state!=1)return -16;
        /* Previous refresh completed with no queued draw task. Delete on UI,
         * refresh the invalidated area, then retire both descriptor caches. */
        if(!queue_empty())return -16;host_delete(image);image=NULL;atomic_fetch_add(&deleted,1);
        rc=drain();if(rc)return rc;
        for(unsigned i=0;i<2;i++){host_drop(&images[i]);host_header_drop(&images[i]);}
        if(!queue_empty())return -16;atomic_store(&phase,2);
    }
    atomic_fetch_add(&sequence,1);return 16;
}
static int uninit(void *arg)
{
    (void)arg;unsigned expected=0;if(!atomic_compare_exchange_strong(&gate,&expected,1))return -16;
    if(atomic_load(&refs)||image||atomic_load(&phase)==1){atomic_store(&gate,0);return -16;}
    int rc=host_unregister(node);if(rc)atomic_store(&gate,0);return rc;
}
static const uintptr_t fops[10]={(uintptr_t)open_ctl,(uintptr_t)close_ctl,(uintptr_t)read_ctl,(uintptr_t)write_ctl,0,0,0,0,0,0};
int direct_ui_init(struct module_info *info)
{
    if(!info)return -22;const uint32_t palette[4]={0xff0000,0x00ff00,0x0000ff,0xff8200};
    for(unsigned p=0;p<2;p++)for(unsigned y=0;y<200;y++)for(unsigned x=0;x<320;x++){
        unsigned q=(x>=160?1u:0u)+(y>=100?2u:0u),bar=16u+p*160u;
        pixels[p][y*320+x]=x>=bar&&x<bar+4?0xffffff:palette[(q+p)%4];
    }
    int rc=host_register(node,fops,0600,NULL);if(rc)return rc;
    info->uninit=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;return 0;
}
