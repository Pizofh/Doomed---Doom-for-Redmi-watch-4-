/* SPDX-License-Identifier: GPL-2.0-or-later
 * Read-only engine resources. Not a sandbox. No concurrency inside the shim. */
#include "runtime.h"
#include <stdatomic.h>
extern void *malloc(size_t);
extern void free(void *);
extern void *fopen(const char *,const char *);
extern int fclose(void *);
extern size_t fread(void *,size_t,size_t,void *);
extern int fseek(void *,long,int);
extern long ftell(void *);
extern int feof(void *),ferror(void *);
extern void clearerr(void *);
extern int vsnprintf(char *,size_t,const char *,va_list);
extern int printf(const char *,...);
extern int *__errno(void);
extern int nxsched_gettid(void);
/* Inspected guest saves10 core words,16 FP words,FPSCR:108bytes.
 * 8-byte alignment rounds the opaque storage up to112, no guessed libc layout. */
struct jump_storage { uint32_t words[27]; } __attribute__((aligned(8)));
extern int setjmp(struct jump_storage *) __attribute__((returns_twice));
extern _Noreturn void longjmp(struct jump_storage *,int);
_Static_assert(sizeof(struct jump_storage)==112,"exact inspected jump buffer");
_Static_assert(sizeof(size_t)==4&&sizeof(long)==4&&ATOMIC_INT_LOCK_FREE==2,"guest ABI");
struct block { void *ptr;unsigned size; };
struct rw4_file { void *raw; };
static struct block blocks[128];
static struct rw4_file files[8],out,err;
struct rw4_file *const rw4_stdout=&out;
struct rw4_file *const rw4_stderr=&err;
static struct jump_storage jump;
static struct rw4_runtime_stats stats;
static atomic_uint stopping;
static unsigned active,budget;
static const char *allowed;
static int equal(const char *a,const char *b){while(*a&&*a==*b){a++;b++;}return *a==*b;}
static int owner(void){return active&&(unsigned)nxsched_gettid()==stats.owner;}
static void error_number(int n){*__errno()=n;}
static _Noreturn void abort_run(unsigned why,unsigned code){
    /* Never jump across tasks or after the run frame returned. */
    if(!owner())__builtin_trap();
    stats.reason=why;stats.code=code;longjmp(&jump,1);
}
void rw4_runtime_request_stop(void){atomic_store_explicit(&stopping,1,memory_order_release);}
void rw4_runtime_poll(void){
    if(!owner())__builtin_trap();
    if(atomic_load_explicit(&stopping,memory_order_acquire))abort_run(1,0);
}
const struct rw4_runtime_stats *rw4_runtime_stats(void){return &stats;}
static int block_index(void *p){for(unsigned i=0;i<128;i++)if(blocks[i].ptr==p)return (int)i;return -1;}
void *rw4_malloc(size_t size){
    rw4_runtime_poll();if(!size)size=1;
    if(size>budget-stats.bytes)abort_run(4,12);
    unsigned i;for(i=0;i<128;i++)if(!blocks[i].ptr)break;
    if(i==128)abort_run(4,12);
    void *p=malloc(size);if(!p)abort_run(4,12);
    blocks[i]=(struct block){p,(unsigned)size};stats.blocks++;stats.bytes+=(unsigned)size;stats.allocated++;
    if(stats.bytes>stats.peak_bytes)stats.peak_bytes=stats.bytes;
    if(stats.blocks>stats.peak_blocks)stats.peak_blocks=stats.blocks;
    return p;
}
void rw4_free(void *p){
    rw4_runtime_poll();if(!p)return;
    int i=block_index(p);if(i<0)abort_run(5,22);
    free(p);stats.bytes-=blocks[i].size;stats.blocks--;stats.freed++;blocks[i]=(struct block){0,0};
}
void *rw4_calloc(size_t n,size_t size){
    rw4_runtime_poll();if(size&&n>SIZE_MAX/size)abort_run(4,12);
    size_t total=n*size;uint8_t *p=rw4_malloc(total);
    for(size_t i=0;i<total;i++)p[i]=0;
    return p;
}
void *rw4_realloc(void *p,size_t size){
    rw4_runtime_poll();if(!p)return rw4_malloc(size);
    int index=block_index(p);if(index<0)abort_run(5,22);
    if(!size){rw4_free(p);return NULL;}
    uint8_t *next=rw4_malloc(size);size_t n=blocks[index].size;if(n>size)n=size;
    for(size_t i=0;i<n;i++)next[i]=((uint8_t *)p)[i];
    rw4_free(p);return next;
}
char *rw4_strdup(const char *s){
    rw4_runtime_poll();size_t n=0;while(s[n]){if(n==budget)abort_run(4,12);n++;}
    char *p=rw4_malloc(n+1);for(size_t i=0;i<=n;i++)p[i]=s[i];return p;
}
static int file_index(struct rw4_file *s){for(unsigned i=0;i<8;i++)if(s==&files[i]&&files[i].raw)return (int)i;return -1;}
static int deny(void){stats.denied++;error_number(30);return -1;}
struct rw4_file *rw4_fopen(const char *path,const char *mode){
    rw4_runtime_poll();if(!equal(mode,"rb")&&!equal(mode,"r")){deny();return NULL;}
    if(!equal(path,allowed)){stats.denied++;error_number(2);return NULL;}
    unsigned i;for(i=0;i<8;i++)if(!files[i].raw)break;
    if(i==8){error_number(24);return NULL;}
    void *raw=fopen(path,"rb");if(!raw)return NULL;
    files[i].raw=raw;stats.streams++;stats.opened++;return &files[i];
}
int rw4_fclose(struct rw4_file *s){
    rw4_runtime_poll();int i=file_index(s);if(i<0){error_number(9);return -1;}
    int rc=fclose(files[i].raw);files[i].raw=NULL;stats.streams--;stats.closed++;
    if(rc)stats.cleanup_error=1;
    return rc;
}
size_t rw4_fread(void *p,size_t size,size_t count,struct rw4_file *s){
    rw4_runtime_poll();int i=file_index(s);if(i<0){error_number(9);return 0;}
    if(size&&count>SIZE_MAX/size){error_number(75);return 0;}
    return fread(p,size,count,files[i].raw);
}
size_t rw4_fwrite(const void *p,size_t size,size_t count,struct rw4_file *s){
    (void)p;(void)size;(void)count;(void)s;rw4_runtime_poll();deny();return 0;
}
int rw4_fseek(struct rw4_file *s,long offset,int origin){
    rw4_runtime_poll();int i=file_index(s);if(i<0){error_number(9);return -1;}
    if(origin<0||origin>2){error_number(22);return -1;}
    clearerr(files[i].raw);return fseek(files[i].raw,offset,origin);
}
long rw4_ftell(struct rw4_file *s){rw4_runtime_poll();int i=file_index(s);if(i<0){error_number(9);return -1;}return ftell(files[i].raw);}
int rw4_feof(struct rw4_file *s){rw4_runtime_poll();int i=file_index(s);return i<0?0:feof(files[i].raw);}
int rw4_ferror(struct rw4_file *s){rw4_runtime_poll();int i=file_index(s);return i<0?1:ferror(files[i].raw);}
void rw4_clearerr(struct rw4_file *s){rw4_runtime_poll();int i=file_index(s);if(i>=0)clearerr(files[i].raw);}
int rw4_fflush(struct rw4_file *s){rw4_runtime_poll();if(!s||s==&out||s==&err||file_index(s)>=0)return 0;error_number(9);return -1;}
int rw4_vsnprintf(char *p,size_t n,const char *format,va_list args){rw4_runtime_poll();return vsnprintf(p,n,format,args);}
int rw4_snprintf(char *p,size_t n,const char *format,...){va_list a;va_start(a,format);int rc=rw4_vsnprintf(p,n,format,a);va_end(a);return rc;}
int rw4_vfprintf(struct rw4_file *s,const char *format,va_list a){
    rw4_runtime_poll();if(s!=&out&&s!=&err){deny();return -1;}
    char b[512];int n=vsnprintf(b,sizeof(b),format,a);b[511]=0;if(n>=0)printf("RW4_DOOM_LOG: %s",b);return n;
}
int rw4_fprintf(struct rw4_file *s,const char *format,...){va_list a;va_start(a,format);int n=rw4_vfprintf(s,format,a);va_end(a);return n;}
int rw4_printf(const char *format,...){va_list a;va_start(a,format);int n=rw4_vfprintf(&out,format,a);va_end(a);return n;}
int rw4_mkdir(const char *p,unsigned mode){(void)p;(void)mode;rw4_runtime_poll();return deny();}
int rw4_remove(const char *p){(void)p;rw4_runtime_poll();return deny();}
int rw4_rename(const char *a,const char *b){(void)a;(void)b;rw4_runtime_poll();return deny();}
int rw4_system(const char *p){(void)p;rw4_runtime_poll();stats.denied++;error_number(38);return -1;}
int rw4_abs(int n){rw4_runtime_poll();if(n==(-2147483647-1))abort_run(5,22);return n<0?-n:n;}
_Noreturn void rw4_exit(int code){abort_run(code?3:2,(unsigned)code);}
_Noreturn void rw4_error(const char *format,va_list a){rw4_vfprintf(&err,format,a);abort_run(3,1);}
int rw4_runtime_run(void (*body)(void *),void *arg,const char *read_path,unsigned limit){
    if(active||stats.blocks||stats.streams||!read_path||limit==0||limit>8u*1024u*1024u)return -16;
    stats=(struct rw4_runtime_stats){0};stats.owner=(unsigned)nxsched_gettid();
    budget=limit;allowed=read_path;active=1;atomic_store(&stopping,0);
    if(setjmp(&jump)==0)body(arg);
    /* Foreign calls have returned before jumps. Cleanup uses raw APIs, never
     * polls or runs upstream exit callbacks. All shim allocations are tracked. */
    for(unsigned i=0;i<8;i++)if(files[i].raw){
        if(fclose(files[i].raw))stats.cleanup_error=1;
        files[i].raw=NULL;stats.streams--;stats.closed++;
    }
    for(unsigned i=0;i<128;i++)if(blocks[i].ptr){
        free(blocks[i].ptr);stats.bytes-=blocks[i].size;stats.blocks--;stats.freed++;blocks[i]=(struct block){0,0};
    }
    allowed=NULL;if(!stats.cleanup_error)active=0;
    return stats.cleanup_error?-5:(int)stats.reason;
}
