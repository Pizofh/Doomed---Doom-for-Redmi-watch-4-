/* Exact S3 guest only. Own RAM node, serial Lua client, no thread or flash I/O. */
#include "core-r229.h"
struct file;
struct file_operations {
    int (*open)(struct file *);int (*close)(struct file *);
    int (*read)(struct file *,char *,unsigned);int (*write)(struct file *,const char *,unsigned);
    uint32_t unused[6];
};
struct mod_info { int (*uninitializer)(void *);void *arg;const void *exports;int nexports; };
_Static_assert(sizeof(struct file_operations)==40&&offsetof(struct file_operations,write)==12,"S3 fops ABI");
_Static_assert(sizeof(struct mod_info)==16,"S3 module ABI");
extern int register_driver(const char *,const struct file_operations *,unsigned,void *);
extern int unregister_driver(const char *);
extern int printf(const char *,...);
static const char node[]="/dev/rw4step230";
static struct rw4_step_state state;
static unsigned refs,cursor,closing;
static int last_error;
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
    unsigned remaining=32-cursor;
    if(n>remaining)n=remaining;
    for(unsigned i=0;i<n;i++)buffer[i]=(char)reply[cursor+i];
    cursor+=n;return (int)n;
}
static const struct file_operations ops={step_open,step_close,step_read,step_write,{0,0,0,0,0,0}};
static int step_uninit(void *arg)
{
    (void)arg;
    if(refs||state.held||(state.phase!=RW4_IDLE&&!rw4_step_is_stopped(&state)))return -16;
    closing=1;int result=unregister_driver(node);if(result<0)closing=0;
    printf("RW4_STEP_BRIDGE: Unregister %d refs=%u held=%lu\n",result,refs,(unsigned long)state.held);return result;
}
int rw4_step_bridge_init(struct mod_info *info)
{
    if(!info)return -22;
    int result=register_driver(node,&ops,0600u,NULL);
    printf("RW4_STEP_BRIDGE: Register %d\n",result);if(result<0)return result;
    info->uninitializer=step_uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;return 0;
}
