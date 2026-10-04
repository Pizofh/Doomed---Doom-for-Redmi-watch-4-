/* SPDX-License-Identifier: GPL-2.0-or-later
 * Join before copying the own frame to a fixed tmpfs file. No system writes. */
#include "first-frame.h"
#include "runtime.h"
#include <stddef.h>
#include <stdatomic.h>
struct mod_info { int (*uninitializer)(void *); void *arg; const void *exports; int nexports; };
struct guest_attr { uint32_t opaque[3]; }; /* Inspected init/destroy copy12, stacksize offset8. */
_Static_assert(sizeof(struct mod_info)==16&&sizeof(struct guest_attr)==12,"guest ABI");
extern int pthread_attr_init(struct guest_attr *),pthread_attr_destroy(struct guest_attr *);
extern int pthread_attr_setstacksize(struct guest_attr *,size_t);
extern int pthread_create(int32_t *,const struct guest_attr *,void *(*)(void *),void *);
extern int pthread_join(int32_t,void **);
extern void *fopen(const char *,const char *);
extern size_t fwrite(const void *,size_t,size_t,void *);
extern int fclose(void *);
extern int printf(const char *,...);
static atomic_uint pending_join,io_error;
static unsigned done;static int result;
static int uninit(void *unused){
    (void)unused;
    if(atomic_load_explicit(&pending_join,memory_order_acquire)||atomic_load(&io_error))return -16;
    return rw4_runtime_stats()->cleanup_error?-16:0;
}
static void *worker(void *unused){
    (void)unused;result=rw4_runtime_run(rw4_first_body,NULL,RW4_FIRST_WAD,8u*1024u*1024u);
    done=1;return (void *)(uintptr_t)0x34660001;
}
int rw4_doom_first_init(struct mod_info *info){
    if(!info)return -22;
    info->uninitializer=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    struct guest_attr attr;int rc=pthread_attr_init(&attr);
    if(rc)return -5;
    rc=pthread_attr_setstacksize(&attr,32768);
    if(rc){pthread_attr_destroy(&attr);return -5;}
    atomic_store(&pending_join,1);
    int32_t tid=0;rc=pthread_create(&tid,&attr,worker,NULL);
    int destroyed=pthread_attr_destroy(&attr);
    printf("RW4_DOOM: created tid=%d rc=%d stack=32768 attr_destroy=%d\n",(int)tid,rc,destroyed);
    if(rc){atomic_store(&pending_join,0);return -5;}
    void *value=NULL;rc=pthread_join(tid,&value);
    printf("RW4_DOOM: joined tid=%d rc=%d value=%08x done=%u result=%d\n",(int)tid,rc,(unsigned)(uintptr_t)value,done,result);
    if(rc){printf("RW4_DOOM: join_failed_retained\n");return 0;}
    atomic_store_explicit(&pending_join,0,memory_order_release);
    const struct rw4_runtime_stats *s=rw4_runtime_stats();
    const struct first_frame_info *f=rw4_first_info();
    printf("RW4_DOOM: resources blocks=%u bytes=%u streams=%u alloc=%u free=%u open=%u close=%u denied=%u peak=%u peak_blocks=%u cleanup=%u reason=%u code=%u\n",
        s->blocks,s->bytes,s->streams,s->allocated,s->freed,s->opened,s->closed,s->denied,s->peak_bytes,s->peak_blocks,s->cleanup_error,s->reason,s->code);
    if(s->cleanup_error){printf("RW4_DOOM: cleanup_failed_retained\n");return 0;}
    size_t written=0;int closed=0;
    if(done&&result==2&&f->captured&&value==(void *)(uintptr_t)0x34660001){
        void *file=fopen(RW4_FIRST_CAPTURE,"wb");
        if(file){written=fwrite(rw4_first_pixels(),1,RW4_FIRST_PIXELS*4,file);closed=fclose(file);}
        else closed=-1;
        if(closed)atomic_store(&io_error,1);
    }
    printf("RW4_DOOM: frame captured=%u frames=%u ticks=%u episode=%u map=%u elapsed_ms=%u fnv=%08x write=%u close=%d\n",
        f->captured,f->frames,f->ticks,f->episode,f->map,f->elapsed_ms,f->fnv,(unsigned)written,closed);
    printf("RW4_DOOM: done joined=1 cleanup=%u io_error=%u\n",s->cleanup_error,atomic_load(&io_error));
    return 0; /* Safe inspection/unload also on a joined, cleaned engine failure. */
}
