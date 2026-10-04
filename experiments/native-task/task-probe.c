/* Exact PC guest only. Finite worker lifecycle, never UI or hardware I/O.
 * Cooperatively stop and join before unloading. No pthread_cancel/kill. */
#include <stdint.h>
#include <stddef.h>
#include <stdatomic.h>
typedef int32_t guest_pthread_t; /* Exact DWARF: pthread_t -> pid_t -> int32. */
struct guest_timespec { int64_t tv_sec; int32_t tv_nsec,padding; };
struct mod_info {
    int (*uninitializer)(void *);
    void *arg;
    const void *exports;
    int nexports;
};
_Static_assert(sizeof(struct guest_timespec)==16 && sizeof(struct mod_info)==16,
    "guest ABI");
_Static_assert(ATOMIC_INT_LOCK_FREE==2 && sizeof(atomic_uint)==4,
    "reviewed lock-free 32-bit atomics only");
extern int pthread_create(guest_pthread_t *,const void *,void *(*)(void *),void *);
extern int pthread_join(guest_pthread_t,void **);
extern int nxsched_gettid(void);
extern int clock_gettime(int,struct guest_timespec *);
extern int clock_nanosleep(int,int,const struct guest_timespec *,struct guest_timespec *);
extern int printf(const char *,...);
static atomic_uint stop_requested,ready,worker_tid,steps,reason,pending_join;
struct worker_args { unsigned cycle,limit,wait_ms; };
static struct worker_args args; /* Set before create, immutable until successful join. */
#define RETAINED (-1000)
static int wait_ms(unsigned ms) {
    if(ms>4000u) return -22;
    struct guest_timespec request={(int64_t)(ms/1000u),(int32_t)((ms%1000u)*1000000u),0};
    return clock_nanosleep(1,0,&request,NULL);
}
static int ticks(uint32_t *value) {
    struct guest_timespec t;
    if(clock_gettime(1,&t) || t.tv_sec<0 || t.tv_nsec<0 || t.tv_nsec>=1000000000) return -5;
    *value=(uint32_t)t.tv_sec*1000u+(uint32_t)t.tv_nsec/1000000u;
    return 0;
}
static void *worker(void *opaque) {
    const struct worker_args *a=opaque;
    unsigned count=0,why=2; /* 1=stop,2=finite completion,3=sleep error. */
    atomic_store_explicit(&worker_tid,(unsigned)nxsched_gettid(),memory_order_relaxed);
    atomic_store_explicit(&ready,1,memory_order_release);
    for(unsigned i=0;i<a->limit;i++) {
        if(atomic_load_explicit(&stop_requested,memory_order_acquire)) { why=1;break; }
        if(wait_ms(a->wait_ms)) { why=3;break; }
        count++;
        atomic_store_explicit(&steps,count,memory_order_relaxed);
    }
    atomic_store_explicit(&reason,why,memory_order_release);
    /* Small numeric cookie, never a pointer to freed worker stack. */
    return (void *)(uintptr_t)(0x34570000u+a->cycle*16u+why);
}
static int uninit(void *unused) {
    (void)unused;
    if(atomic_load_explicit(&pending_join,memory_order_acquire)) return -16;
    printf("RW4_TASK: uninit pending_join=0\n");
    return 0;
}
static int cycle(unsigned id,unsigned main_wait_ms,unsigned limit,unsigned delay) {
    atomic_store(&stop_requested,0);atomic_store(&ready,0);
    atomic_store(&worker_tid,0);atomic_store(&steps,0);atomic_store(&reason,0);
    args=(struct worker_args){id,limit,delay};
    guest_pthread_t thread=0;
    atomic_store(&pending_join,1);
    int rc=pthread_create(&thread,NULL,worker,&args);
    if(rc) {
        atomic_store(&pending_join,0);
        printf("RW4_TASK: create_failed cycle=%u rc=%d\n",id,rc);
        return -5;
    }
    unsigned observed=0;
    for(unsigned i=0;i<20u;i++) {
        if(atomic_load_explicit(&ready,memory_order_acquire)) { observed=1;break; }
        if(wait_ms(50)) break;
    }
    unsigned tid=atomic_load(&worker_tid);
    int error=!observed || thread<=0 || tid!=(unsigned)thread || tid==(unsigned)nxsched_gettid();
    printf("RW4_TASK: created cycle=%u owner_tid=%d worker_tid=%u handle=%d ready=%u\n",
        id,nxsched_gettid(),tid,(int)thread,observed);
    /* Directly inspect the busy gate in the same task; no rmmod races. */
    int busy=uninit(NULL);
    if(busy!=-16) error=1;
    printf("RW4_TASK: busy cycle=%u pending_join=1 uninit_rc=%d\n",id,busy);
    if(main_wait_ms) {
        printf("RW4_TASK: window cycle=%u owner_tid=%d worker_tid=%u wait_ms=%u\n",
            id,nxsched_gettid(),tid,main_wait_ms);
        if(wait_ms(main_wait_ms)) error=1;
    }
    uint32_t start=0,end=0;
    if(ticks(&start)) error=1;
    if(id!=1u) atomic_store_explicit(&stop_requested,1,memory_order_release);
    void *value=NULL;
    rc=pthread_join(thread,&value);
    if(rc) {
        atomic_store(&stop_requested,1);
        printf("RW4_TASK: join_failed_retained cycle=%u rc=%d pending_join=1\n",id,rc);
        return RETAINED; /* Never let loader free code whose lifecycle is uncertain. */
    }
    atomic_store_explicit(&pending_join,0,memory_order_release);
    if(ticks(&end)) error=1;
    unsigned count=atomic_load(&steps),why=atomic_load_explicit(&reason,memory_order_acquire);
    unsigned expected_reason=id==1u?2u:1u;
    if(why!=expected_reason || count>limit || !count ||
       (id==1u && count!=limit) || (uintptr_t)value!=0x34570000u+id*16u+why) error=1;
    printf("RW4_TASK: joined cycle=%u worker_tid=%u steps=%u reason=%u value=%08x join_ms=%u rc=%d error=%d\n",
        id,tid,count,why,(unsigned)(uintptr_t)value,(unsigned)(end-start),rc,error);
    return error?-5:0;
}
int rw4_task_init(struct mod_info *info) {
    if(!info) return -22;
    info->uninitializer=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    /* Cycle0 leaves 4s for host UI observation, with at most80 x100ms waits.
     * Cycle1 completes naturally; cycle2 proves restart and another stop. */
    const unsigned windows[]={4000,0,250},limits[]={80,3,40},delays[]={100,50,50};
    for(unsigned i=0;i<3u;i++) {
        int rc=cycle(i,windows[i],limits[i],delays[i]);
        if(rc==RETAINED) return 0; /* Busy uninit stays installed; no done marker. */
        if(rc) return rc; /* No worker remains: join succeeded or create failed. */
    }
    printf("RW4_TASK: done cycles=3 pending_join=0\n");
    return 0;
}
