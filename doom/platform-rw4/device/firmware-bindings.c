/* SPDX-License-Identifier: GPL-2.0-or-later
 * Candidate AP contracts, not a portable/public Xiaomi ABI. Generated header
 * contains reviewed addresses and fingerprints, never redistributed ROM bytes.
 * Only the PC builder supplies that header. No physical deployment approval.
 */
#include "platform.h"
#include "firmware-addresses.h"
_Static_assert(sizeof(void *)==4&&sizeof(long)==4&&sizeof(size_t)==4,"32-bit base PCS");
/* Fingerprints narrow version mistakes; they neither authenticate the whole
 * firmware nor contain faults from reading an incompatible address map. */
int rw4_host_validate(void)
{
    for(unsigned i=0;i<sizeof(rw4_fingerprints)/sizeof(rw4_fingerprints[0]);i++){
        const volatile unsigned char *p=(const volatile unsigned char *)rw4_fingerprints[i].address;
        uint32_t hash=UINT32_C(2166136261);
        for(unsigned j=0;j<64;j++)hash=(hash^p[j])*UINT32_C(16777619);
        if(hash!=rw4_fingerprints[i].fnv)return -1;
    }
    return 0;
}
int rw4_host_owner_token(void)
{
    void *p=((void *(*)(void))RW4_ADDR_OWNER_TOKEN)();
    if(!p)__builtin_trap(); /* No task owner: do not accept an ISR context. */
    return (int)(uintptr_t)p; /* Identity only. Never a PID or pthread_t. */
}
void *rw4_host_malloc(size_t n){return ((void *(*)(size_t))RW4_ADDR_MALLOC)(n);}
void rw4_host_free(void *p){((void (*)(void *))RW4_ADDR_FREE)(p);}
void *rw4_host_fopen(const char *path,const char *mode)
{return ((void *(*)(const char *,const char *))RW4_ADDR_FOPEN)(path,mode);}
int rw4_host_fclose(void *f){return ((int (*)(void *))RW4_ADDR_FCLOSE)(f);}
size_t rw4_host_fread(void *dst,size_t size,size_t count,void *f)
{return ((size_t (*)(void *,size_t,size_t,void *))RW4_ADDR_FREAD)(dst,size,count,f);}
int rw4_host_fseek(void *f,long offset,int origin)
{return ((int (*)(void *,long,int))RW4_ADDR_FSEEK)(f,offset,origin);}
long rw4_host_ftell(void *f){return ((long (*)(void *))RW4_ADDR_FTELL)(f);}
int rw4_host_feof(void *f){return ((int (*)(void *))RW4_ADDR_FEOF)(f);}
int rw4_host_ferror(void *f){return ((int (*)(void *))RW4_ADDR_FERROR)(f);}
void rw4_host_clearerr(void *f){((void (*)(void *))RW4_ADDR_CLEARERR)(f);}
uint64_t rw4_host_clock_ticks(void){return ((uint64_t (*)(void))RW4_ADDR_CLOCK_TICKS)();}
int rw4_host_usleep(unsigned usec){return ((int (*)(unsigned))RW4_ADDR_USLEEP)(usec);}
int rw4_host_attr_init(struct rw4_device_attr *p)
{return ((int (*)(struct rw4_device_attr *))RW4_ADDR_ATTR_INIT)(p);}
int rw4_host_attr_stack(struct rw4_device_attr *p,unsigned size)
{return ((int (*)(struct rw4_device_attr *,unsigned))RW4_ADDR_ATTR_STACK)(p,size);}
int rw4_host_attr_destroy(struct rw4_device_attr *p)
{return ((int (*)(struct rw4_device_attr *))RW4_ADDR_ATTR_DESTROY)(p);}
int rw4_host_thread_create(int32_t *id,const struct rw4_device_attr *attr,void *(*start)(void *),void *arg)
{return ((int (*)(int32_t *,const struct rw4_device_attr *,void *(*)(void *),void *))RW4_ADDR_THREAD_CREATE)(id,attr,start,arg);}
int rw4_host_thread_join(int32_t id,void **result)
{return ((int (*)(int32_t,void **))RW4_ADDR_THREAD_JOIN)(id,result);}
int rw4_host_register(const char *path,const struct rw4_device_fops *ops,unsigned mode,void *arg)
{return ((int (*)(const char *,const struct rw4_device_fops *,unsigned,void *))RW4_ADDR_REGISTER)(path,ops,mode,arg);}
int rw4_host_unregister(const char *path)
{return ((int (*)(const char *))RW4_ADDR_UNREGISTER)(path);}
void rw4_host_image_drop(const char *path)
{((void (*)(const char *))RW4_ADDR_IMAGE_DROP)(path);}
