/* SPDX-License-Identifier: GPL-2.0-or-later
 * Compatibility for one pinned S3 emulator ELF, never a RW4 binding.
 * Integer/pointer calls use base PCS on either side. No guest libc structures.
 */
#include "platform.h"
extern int host_register(const char *,const void *,unsigned,void *);
extern int host_unregister(const char *);
extern void host_image_drop(const char *);
extern void host_header_drop(const char *);
struct s3_timespec { int64_t seconds; int32_t ns,pad; };
_Static_assert(sizeof(struct s3_timespec)==16,"reviewed S3 timespec");
extern int host_clock_gettime(int,struct s3_timespec *);
static uintptr_t tables[3][10];
static unsigned registered;
int rw4_host_register(const char *path,const struct rw4_device_fops *ops,unsigned mode,void *arg)
{
    if(registered>=3)return -12;
    uintptr_t *p=tables[registered++];p[0]=(uintptr_t)ops->open;p[1]=(uintptr_t)ops->close;
    p[2]=(uintptr_t)ops->read;p[3]=(uintptr_t)ops->write;p[4]=(uintptr_t)ops->seek;
    return host_register(path,p,mode,arg);
}
int rw4_host_unregister(const char *path){return host_unregister(path);}
int rw4_host_validate(void){return 0;} /* Host builder pins the entire guest. */
void rw4_host_image_drop(const char *path){host_image_drop(path);host_header_drop(path);}
uint64_t rw4_host_clock_ticks(void)
{
    struct s3_timespec t={0};
    if(host_clock_gettime(1,&t)||t.seconds<0||t.ns<0||t.ns>=1000000000)return 0;
    return (uint64_t)t.seconds*10000u+(unsigned)t.ns/100000u;
}
