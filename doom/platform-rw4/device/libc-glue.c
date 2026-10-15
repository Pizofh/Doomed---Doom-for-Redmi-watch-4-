/* SPDX-License-Identifier: GPL-2.0-or-later
 * Private newlib instance. Its FILE/reent/stat NEVER cross into firmware.
 * Only the live runtime worker may use this libc; unload after cleanup.
 */
#include "runtime.h"
#include <reent.h>
#include <sys/stat.h>
#include <errno.h>
#include <stdint.h>
#include <stddef.h>
static unsigned log_bytes;
static unsigned char log_tail[256];
/* Keep Thumb code on both targets. The S3 multilib's optimized memcpy uses
 * ARM state, which this NuttX module relocator cannot call from Thumb BL. */
void *memcpy(void *restrict destination,const void *restrict source,size_t n)
{
    unsigned char *d=destination;const unsigned char *s=source;
    for(size_t i=0;i<n;i++)d[i]=s[i];
    return destination;
}
void *_malloc_r(struct _reent *r,size_t n)
{ (void)r;return rw4_malloc(n); }
void *_calloc_r(struct _reent *r,size_t n,size_t size)
{ (void)r;return rw4_calloc(n,size); }
void *_realloc_r(struct _reent *r,void *p,size_t n)
{ (void)r;return rw4_realloc(p,n); }
void _free_r(struct _reent *r,void *p)
{ (void)r;rw4_free(p); }
int _write(int fd,const void *data,size_t n)
{
    if(fd!=1&&fd!=2){errno=EBADF;return -1;}
    if(n>INT32_MAX){errno=EOVERFLOW;return -1;}
    const unsigned char *p=data;
    for(size_t i=0;i<n;i++)log_tail[log_bytes++%sizeof(log_tail)]=p[i];
    return (int)n;
}
int _read(int fd,void *data,size_t n)
{ (void)fd;(void)data;(void)n;errno=EBADF;return -1; }
int _close(int fd)
{ if(fd==1||fd==2)return 0;errno=EBADF;return -1; }
int _isatty(int fd)
{ if(fd==1||fd==2)return 1;errno=EBADF;return 0; }
int _fstat(int fd,struct stat *s)
{
    if((fd!=1&&fd!=2)||!s){errno=EBADF;return -1;}
    unsigned char *p=(unsigned char *)s;
    for(size_t i=0;i<sizeof(*s);i++)p[i]=0;
    s->st_mode=S_IFCHR;return 0;
}
long _lseek(int fd,long offset,int origin)
{ (void)fd;(void)offset;(void)origin;errno=ESPIPE;return -1; }
void *_sbrk(ptrdiff_t increment)
{ (void)increment;errno=ENOMEM;return (void *)(intptr_t)-1; }
int _getpid(void){return 1;} /* Private libc identity; never a firmware PID. */
int _kill(int pid,int signal)
{ (void)pid;(void)signal;errno=ENOSYS;return -1; }
_Noreturn void _exit(int code){rw4_exit(code);}
/* Worker-only until it has joined; this buffer owns no firmware console. */
unsigned rw4_port_log_size(void){return log_bytes;}
unsigned rw4_port_log_copy(unsigned char *dst,unsigned capacity)
{
    unsigned n=log_bytes<sizeof(log_tail)?log_bytes:(unsigned)sizeof(log_tail);
    if(n>capacity)n=capacity;
    unsigned first=log_bytes-n;
    for(unsigned i=0;i<n;i++)dst[i]=log_tail[(first+i)%sizeof(log_tail)];
    return n;
}
