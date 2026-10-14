/* PC-only candidate for the pinned 2.2.86 image. No hardware permission. */
#include "core-r229.h"
#include "step-bindings-r234.h"
struct file;
struct file_operations {
    int (*open)(struct file *);int (*close)(struct file *);
    int (*read)(struct file *,char *,unsigned);int (*write)(struct file *,const char *,unsigned);
    uint32_t unused[4];
};
struct mod_info { int (*uninitializer)(void *);void *arg;const void *exports;unsigned nexports; };
_Static_assert(sizeof(uintptr_t)==4&&sizeof(struct file_operations)==32&&sizeof(struct mod_info)==16,"ARM32 candidate ABI");
_Static_assert(offsetof(struct file_operations,write)==12,"inspected callback prefix");
typedef int (*register_fn)(const char *,const struct file_operations *,unsigned,void *);
typedef int (*unregister_fn)(const char *);
typedef void *(*open_fn)(const char *,const char *);
typedef size_t (*read_fn)(void *,size_t,size_t,void *);
typedef int (*close_fn)(void *);
static const char node[]="/dev/rw4step234";
static struct rw4_step_state state;
static unsigned refs,cursor,closing;
static int last_error;
static inline uint32_t fingerprint(uintptr_t address)
{
    const volatile unsigned char *p=(const volatile unsigned char *)(address&~(uintptr_t)1);
    uint32_t h=UINT32_C(2166136261);for(size_t i=0;i<64;i++){h^=p[i];h*=UINT32_C(16777619);}return h;
}
static int step_open(struct file *f)
{ (void)f;if(closing||refs)return -16;refs=1;cursor=0;return 0; }
static int step_close(struct file *f)
{ (void)f;if(refs!=1)return -22;refs=0;cursor=0;return 0; }
static int step_write(struct file *f,const char *buffer,unsigned n)
{
    (void)f;if(closing||refs!=1)return -16;
    int result=rw4_step_apply(&state,(const unsigned char *)buffer,n);last_error=result;
    if(result<0){state.held=0;if(state.phase==RW4_RUNNING)state.phase=RW4_PAUSED;return result;}
    return (int)n;
}
static int step_read(struct file *f,char *buffer,unsigned n)
{
    (void)f;if(closing||refs!=1||!buffer)return -22;
    unsigned char reply[32];rw4_step_snapshot(&state,reply);rw4_put32(reply+28,(uint32_t)last_error);
    if(cursor>=32)return 0;
    unsigned remaining=32-cursor;if(n>remaining)n=remaining;
    for(unsigned i=0;i<n;i++)buffer[i]=(char)reply[cursor+i];
    cursor+=n;return (int)n;
}
static const struct file_operations ops={step_open,step_close,step_read,step_write,{0,0,0,0}};
static int step_uninit(void *arg)
{
    (void)arg;
    if(refs||state.held||(state.phase!=RW4_IDLE&&!rw4_step_is_stopped(&state)))return -16;
    closing=1;int result=((unregister_fn)RW4_UNREGISTER)(node);if(result<0)closing=0;return result;
}
__attribute__((aligned(8),section(".text.entry")))
int rw4_step_candidate_init(struct mod_info *info)
{
    if(!info||state.seq||state.phase||state.held||state.steps||state.edges||refs||cursor||closing||last_error)return -8;
    static const uintptr_t addresses[]={RW4_REGISTER,RW4_UNREGISTER,RW4_OPEN,RW4_READ,RW4_CLOSE};
    static const uint32_t hashes[]={RW4_REGISTER_FNV,RW4_UNREGISTER_FNV,RW4_OPEN_FNV,RW4_READ_FNV,RW4_CLOSE_FNV};
    for(size_t i=0;i<5;i++)if(fingerprint(addresses[i])!=hashes[i])return -8;
    static const char owner[]="RW4-STEP-R234\n";
    void *marker=((open_fn)RW4_OPEN)("/data/app/watchface/market/365219977/lua/step-attempt-r234.txt","rb");
    if(!marker)return -22;
    unsigned char bytes[sizeof(owner)];size_t got=((read_fn)RW4_READ)(bytes,1,sizeof(bytes),marker);
    int closed=((close_fn)RW4_CLOSE)(marker);if(got!=sizeof(owner)-1||closed!=0)return -22;
    for(size_t i=0;i<sizeof(owner)-1;i++)if(bytes[i]!=(unsigned char)owner[i])return -22;
    int result=((register_fn)RW4_REGISTER)(node,&ops,0600u,NULL);if(result<0)return result;
    info->uninitializer=step_uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;return 0;
}
