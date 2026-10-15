/* SPDX-License-Identifier: GPL-2.0-or-later
 * S3-only UI fixture: actual bridge/VFS/cache, synchronous fake worker.
 * Two owned patterns, no Doom or physical firmware bindings.
 */
#include "platform.h"
#include "runtime.h"
extern int host_register(const char *,const void *,unsigned,void *);
extern int host_unregister(const char *);
extern int host_owner(void);
extern void host_image_drop(const char *);
extern void host_header_drop(const char *);
static uintptr_t tables[3][10];
static unsigned registered;
static struct rw4_runtime_stats stats;
static uint32_t pixels[320*200];
void *memcpy(void *restrict dst,const void *restrict src,size_t n)
{unsigned char *d=dst;const unsigned char *s=src;for(size_t i=0;i<n;i++)d[i]=s[i];return dst;}
void *memset(void *dst,int value,size_t n)
{unsigned char *d=dst;for(size_t i=0;i<n;i++)d[i]=(unsigned char)value;return dst;}
int rw4_host_register(const char *path,const struct rw4_device_fops *ops,unsigned mode,void *arg)
{
    if(registered>=3)return -12;
    uintptr_t *p=tables[registered++];p[0]=(uintptr_t)ops->open;p[1]=(uintptr_t)ops->close;
    p[2]=(uintptr_t)ops->read;p[3]=(uintptr_t)ops->write;p[4]=(uintptr_t)ops->seek;
    return host_register(path,p,mode,arg);
}
int rw4_host_unregister(const char *path){return host_unregister(path);}
int rw4_host_validate(void){return 0;}
int rw4_host_owner_token(void){return host_owner();}
void rw4_host_image_drop(const char *path){host_image_drop(path);host_header_drop(path);}
int rw4_host_attr_init(struct rw4_device_attr *p){(void)p;return 0;}
int rw4_host_attr_stack(struct rw4_device_attr *p,unsigned size){(void)p;return size==32768?0:22;}
int rw4_host_attr_destroy(struct rw4_device_attr *p){(void)p;return 0;}
int rw4_host_thread_create(int32_t *id,const struct rw4_device_attr *a,void *(*fn)(void *),void *arg)
{(void)a;*id=17300;fn(arg);return 0;}
int rw4_host_thread_join(int32_t id,void **result){if(id!=17300)return 22;*result=NULL;return 0;}
const struct rw4_runtime_stats *rw4_runtime_stats(void){return &stats;}
int rw4_runtime_run(void (*body)(void *),void *arg,const char *wad,unsigned budget)
{
    (void)body;(void)arg;(void)wad;(void)budget;
    static const uint32_t colors[4]={0xff0000,0x00ff00,0x0000ff,0xff8000};
    for(unsigned phase=0;phase<2;phase++){
        for(unsigned y=0;y<200;y++)for(unsigned x=0;x<320;x++){
            unsigned quadrant=(x>=160?1u:0u)+(y>=100?2u:0u);
            pixels[y*320+x]=(x>=16+phase*32&&x<20+phase*32)?0xffffff:colors[(quadrant+phase)%4];
        }
        rw4_game_frame(pixels,phase+1);
    }
    return 0;
}
void rw4_game_body(void *arg){(void)arg;}
_Noreturn void rw4_exit(int code){(void)code;__builtin_trap();}
extern int rw4_doom_device_init(struct rw4_module_info *);
int rw4_image_ui_probe_init(struct rw4_module_info *info){return rw4_doom_device_init(info);}
