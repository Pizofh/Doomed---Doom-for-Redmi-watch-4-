/* Exact reviewed PC guest only. NSH initializer, no UI calls or workers.
 * Fixed finite samples and waits; no retained callback, driver or file I/O. */
#include <stdint.h>
#include <stddef.h>
/* Guest DWARF: time_t=int64_t, long=32-bit; timespec size16, nsec offset8.
 * Do not use the host/newlib time.h layout as the guest ABI. */
struct guest_timespec { int64_t tv_sec; int32_t tv_nsec; int32_t padding; };
_Static_assert(sizeof(struct guest_timespec)==16 &&
    offsetof(struct guest_timespec,tv_nsec)==8, "guest timespec ABI");
extern int clock_gettime(int, struct guest_timespec *);
extern int clock_nanosleep(int, int, const struct guest_timespec *, struct guest_timespec *);
extern int nxsched_gettid(void);
extern int printf(const char *, ...);
#define MONOTONIC 1 /* Exact guest debug macro and compiled branch reviewed. */
static int now(struct guest_timespec *t) {
    int rc=clock_gettime(MONOTONIC,t);
    if(rc || t->tv_sec<0 || t->tv_nsec<0 || t->tv_nsec>=1000000000) return -5;
    return 0;
}
static int before(const struct guest_timespec *a, const struct guest_timespec *b) {
    return a->tv_sec<b->tv_sec || (a->tv_sec==b->tv_sec && a->tv_nsec<b->tv_nsec);
}
/* Doom-style uint32 ticks deliberately wrap at 2^32ms; use unsigned deltas.
 * 64-bit seconds are narrowed modulo2^32 before multiplying; no 64-bit divide. */
static uint32_t ticks(const struct guest_timespec *t) {
    return (uint32_t)t->tv_sec*1000u + (uint32_t)t->tv_nsec/1000000u;
}
static int measure(unsigned ms, unsigned trial) {
    if(ms>4000u) return -22;
    struct guest_timespec start,end,remaining;
    const struct guest_timespec request={(int64_t)(ms/1000u),(int32_t)((ms%1000u)*1000000u),0};
    if(now(&start)) return -5;
    int rc=clock_nanosleep(MONOTONIC,0,&request,&remaining);
    if(now(&end) || before(&end,&start)) return -5;
    int64_t sec=end.tv_sec-start.tv_sec;
    int32_t nsec=end.tv_nsec-start.tv_nsec;
    if(nsec<0){sec--;nsec+=1000000000;}
    /* Diagnostic bound after returning, not a watchdog or scheduling guarantee. */
    if(sec<0 || sec>15) return -5;
    unsigned elapsed_us=(unsigned)sec*1000000u+(unsigned)nsec/1000u;
    uint32_t delta=ticks(&end)-ticks(&start);
    printf("RW4_TIME: wait trial=%u request_ms=%u elapsed_us=%u delta_ms=%u rc=%d\n",
        trial,ms,elapsed_us,delta,rc);
    if(rc || (ms && elapsed_us+100u<ms*1000u) || elapsed_us>ms*1000u+2000000u) return -5;
    return 0; /* Interrupted waits fail visibly; no unbounded retry. */
}
int rw4_time_init(void *module_info) {
    (void)module_info;
    struct guest_timespec last,current;
    unsigned changes=0;
    if(now(&last)) return -5;
    printf("RW4_TIME: begin tid=%d sec_hi=%u sec_lo=%u nsec=%u ticks_ms=%u\n",
        nxsched_gettid(),(unsigned)((uint64_t)last.tv_sec>>32),(unsigned)last.tv_sec,
        (unsigned)last.tv_nsec,ticks(&last));
    for(unsigned i=0;i<256u;i++) {
        if(now(&current) || before(&current,&last)) return -5;
        if(before(&last,&current)) changes++;
        last=current;
    }
    printf("RW4_TIME: monotonic samples=257 changes=%u\n",changes);
    /* Pure arithmetic rollover test, independent of actual uptime. */
    const struct guest_timespec a={4294967,295000000,0},b={4294967,300000000,0};
    uint32_t rollover=ticks(&b)-ticks(&a);
    if(ticks(&a)!=0xffffffffu || ticks(&b)!=4u || rollover!=5u) return -5;
    printf("RW4_TIME: rollover delta_ms=%u\n",rollover);
    const unsigned waits[]={0,1,10,50,100,250};
    for(unsigned trial=0;trial<3u;trial++)for(unsigned i=0;i<6u;i++)
        if(measure(waits[i],trial)) return -5;
    printf("RW4_TIME: long wait begin request_ms=4000 tid=%d\n",nxsched_gettid());
    if(measure(4000,3)) return -5;
    printf("RW4_TIME: done waits=19 tid=%d\n",nxsched_gettid());
    return 0; /* No live code remains after init; rmmod is then allowed. */
}
