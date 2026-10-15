/* SPDX-License-Identifier: GPL-2.0-or-later
 * Execute the actual candidate image callbacks through S3's real VFS/stdio.
 * Only the five common fops fields are forwarded into an S3 40-byte table.
 * Worker APIs are unused stubs. No LVGL, Doom worker or RW4 binary executes.
 */
#include "platform.h"
#include "runtime.h"
#include "image-view.h"
extern int host_printf(const char *,...);
extern int host_register(const char *,const void *,unsigned,void *);
extern int host_unregister(const char *);
extern void *host_fopen(const char *,const char *);
extern int host_fclose(void *);
extern size_t host_fread(void *,size_t,size_t,void *);
extern int host_fseek(void *,long,int);
extern long host_ftell(void *);
extern int host_setvbuf(void *,char *,int,size_t);
extern int host_feof(void *);
extern void host_clearerr(void *);
static uintptr_t tables[3][10]; /* Exact pinned S3 fops size, not RW4 ABI. */
static unsigned registered,checks;
static struct rw4_runtime_stats stats;
static uint32_t pixels[320*200];
static unsigned char bytes[8];
void *memcpy(void *restrict dst,const void *restrict src,size_t n)
{unsigned char *d=dst;const unsigned char *s=src;for(size_t i=0;i<n;i++)d[i]=s[i];return dst;}
void *memset(void *dst,int value,size_t n)
{unsigned char *d=dst;for(size_t i=0;i<n;i++)d[i]=(unsigned char)value;return dst;}
int rw4_host_register(const char *path,const struct rw4_device_fops *ops,unsigned mode,void *arg)
{
    if(registered>=3)return -12;
    uintptr_t *table=tables[registered++];
    table[0]=(uintptr_t)ops->open;table[1]=(uintptr_t)ops->close;
    table[2]=(uintptr_t)ops->read;table[3]=(uintptr_t)ops->write;table[4]=(uintptr_t)ops->seek;
    return host_register(path,table,mode,arg);
}
int rw4_host_unregister(const char *path){return host_unregister(path);}
int rw4_host_validate(void){return 0;}
void rw4_host_image_drop(const char *path){(void)path;}
int rw4_host_owner_token(void){return 17;}
int rw4_host_attr_init(struct rw4_device_attr *p){(void)p;return 22;}
int rw4_host_attr_stack(struct rw4_device_attr *p,unsigned size){(void)p;(void)size;return 22;}
int rw4_host_attr_destroy(struct rw4_device_attr *p){(void)p;return 22;}
int rw4_host_thread_create(int32_t *id,const struct rw4_device_attr *a,void *(*fn)(void *),void *arg)
{(void)id;(void)a;(void)fn;(void)arg;return 22;}
int rw4_host_thread_join(int32_t id,void **result){(void)id;(void)result;return 22;}
const struct rw4_runtime_stats *rw4_runtime_stats(void){return &stats;}
int rw4_runtime_run(void (*body)(void *),void *arg,const char *wad,unsigned budget)
{(void)body;(void)arg;(void)wad;(void)budget;return -1;}
void rw4_game_body(void *arg){(void)arg;}
_Noreturn void rw4_exit(int code){(void)code;__builtin_trap();}
#define CHECK(c) do{checks++;if(!(c)){host_printf("RW4_IMAGE_VFS_R274: failed=%u retained=1\n",checks);return 0;}}while(0)
extern int rw4_doom_device_init(struct rw4_module_info *);
int rw4_image_vfs_probe_init(struct rw4_module_info *info)
{
    /* A fixture failure returns success to retain code/resources for inspection. */
    CHECK(rw4_doom_device_init(info)==0&&registered==3&&info->uninit);
    for(unsigned i=0;i<320u*200u;i++)pixels[i]=0x00ff0000;
    rw4_game_frame(pixels,1);
    void *file=host_fopen("/dev/rw4doomimage.bin","rb");CHECK(file!=NULL);
    CHECK(host_setvbuf(file,NULL,2,0)==0); /* Pinned S3 _IONBF=2. */
    CHECK(host_fread(bytes,1,4,file)==4&&bytes[0]==4&&bytes[1]==0&&bytes[2]==5&&bytes[3]==25);
    CHECK(host_ftell(file)==4);CHECK(host_fclose(file)==0);
    file=host_fopen("/dev/rw4doomimage.bin","rb");CHECK(file!=NULL);
    CHECK(host_fread(bytes,1,8,file)==8&&bytes[4]==0&&bytes[5]==0&&bytes[6]==255&&bytes[7]==255);
    CHECK(host_ftell(file)==8);CHECK(info->uninit(NULL)==-16);
    for(unsigned i=0;i<320u*200u;i++)pixels[i]=0x000000ff;
    rw4_game_frame(pixels,2);
    CHECK(host_fseek(file,4,0)==0&&host_ftell(file)==4);
    CHECK(host_fread(bytes,1,4,file)==4&&bytes[0]==0&&bytes[1]==0&&bytes[2]==255&&bytes[3]==255);
    CHECK(host_fseek(file,-4,2)==0&&host_ftell(file)==(long)RW4_IMAGE_BYTES-4);
    CHECK(host_fread(bytes,1,8,file)==4&&bytes[0]==0&&bytes[1]==0&&bytes[2]==255&&bytes[3]==255);
    CHECK(host_feof(file)!=0);CHECK(host_fread(bytes,1,1,file)==0);
    host_clearerr(file); /* Match rw4_fseek: clear sticky NuttX stream flags. */
    CHECK(host_fseek(file,4,0)==0&&host_feof(file)==0);
    CHECK(host_fread(bytes,1,1,file)==1&&bytes[0]==0);
    CHECK(host_ftell(file)==5);CHECK(host_fseek(file,-1,1)==0&&host_ftell(file)==4);
    CHECK(host_fread(bytes,1,4,file)==4&&bytes[2]==255);
    CHECK(host_fclose(file)==0);
    CHECK(rw4_game_image_release()==0); /* No LVGL in this VFS-only fixture. */
    file=host_fopen("/dev/rw4doomimage.bin","rb");CHECK(file!=NULL);
    CHECK(host_fread(bytes,1,8,file)==8&&bytes[4]==255&&bytes[5]==0&&bytes[6]==0&&bytes[7]==255);
    CHECK(host_fclose(file)==0);
    CHECK(rw4_game_image_release()==0);
    host_printf("RW4_IMAGE_VFS_R274: passed=1 checks=%u realVfs=1\n",checks);return 0;
}
