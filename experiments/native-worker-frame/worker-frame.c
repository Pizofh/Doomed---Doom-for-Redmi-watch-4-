/* Exact reviewed PC guest only, FLAT. No hardware or filesystem I/O; LVGL cache calls only in UI writes.
 * UI creates/detaches a finite worker; stop is cooperative. Never join in UI.
 * A completion flag alone never authorizes unload: the PID must be absent.
 * No worker TLS destructor, exit callback or other module callback is installed.
 * Lifecycle writers are serialized by our Lua/UI caller; this is not a
 * general concurrent driver-open/unload contract. */
#include <stdint.h>
#include <stddef.h>
#include <stdatomic.h>
typedef int32_t guest_pthread_t;
struct file { unsigned char opaque[20]; void *f_priv; unsigned char tail[8]; };
struct fops {
    int (*open)(struct file *); int (*close)(struct file *);
    int (*read)(struct file *,char *,unsigned);
    int (*write)(struct file *,const char *,unsigned); uint32_t unused[6];
};
struct mod_info { int (*uninitializer)(void *); void *arg; const void *exports; int nexports; };
struct timespec_guest { int64_t sec; int32_t ns,padding; };
_Static_assert(sizeof(struct file)==32 && offsetof(struct file,f_priv)==20 &&
    sizeof(struct fops)==40 && sizeof(struct mod_info)==16 && sizeof(struct timespec_guest)==16,"guest ABI");
_Static_assert(ATOMIC_INT_LOCK_FREE==2 && sizeof(atomic_uint)==4,"lock-free words");
extern int register_driver(const char *,const struct fops *,unsigned,void *);
extern int unregister_driver(const char *);
extern int pthread_create(guest_pthread_t *,const void *,void *(*)(void *),void *);
extern int pthread_detach(guest_pthread_t);
extern void *nxsched_get_tcb(int32_t);
extern int nxsched_gettid(void);
extern int clock_nanosleep(int,int,const struct timespec_guest *,struct timespec_guest *);
extern int printf(const char *,...);
extern void lv_image_cache_drop(const void *);
extern void lv_image_header_cache_drop(const void *);
#define MAGIC 0x34574c52u
static const char node[]="/dev/rw4wframe";
static atomic_uint refs,pending,stop,ready,tid,steps,reason,owner,detached,error,paused;
/* UI updates sequence/cycle while an NSH snapshot can read them. */
static atomic_uint sequence,cycle;
static unsigned init_owner,stream_registered;
enum { FREE=0,WRITING=1,READY=2,READING=3 };
#define FRAME_BYTES (12u+320u*140u*2u)
struct frame_slot { atomic_uint state,generation; unsigned char bytes[FRAME_BYTES]; };
static struct frame_slot frames[2];
static atomic_uint produced,frame_refs,blocked;
static const char stream[]="/dev/rw4wstream";
static const char paths[2][32]={"/tmp/rw4-worker-frame-0.bin","/tmp/rw4-worker-frame-1.bin"};
static const uint16_t colors[8]={0xf800,0x07e0,0x001f,0xffff,0xffe0,0x07ff,0xf81f,0};
static void produce(void) {
    for(unsigned slot=0;slot<2;slot++) {
        unsigned expected=FREE;
        if(!atomic_compare_exchange_strong_explicit(&frames[slot].state,&expected,WRITING,
            memory_order_acquire,memory_order_relaxed)) continue;
        unsigned generation=atomic_fetch_add(&produced,1)+1;
        unsigned char *b=frames[slot].bytes;
        const unsigned char header[12]={0x19,0x12,0,0,0x40,1,0x8c,0,0x80,2,0,0};
        for(unsigned i=0;i<12;i++) b[i]=header[i];
        for(unsigned y=0;y<140;y++) for(unsigned x=0;x<320;x++) {
            uint16_t pixel=y<8 ? ((generation>>(x/10))&1u ? 0xffff:0) :
                y<70 ? colors[((x/40)+generation)&7] :
                ((x/16)^(y/16)^generation)&1u ? 0xffff:0;
            unsigned offset=12+2*(y*320+x);b[offset]=(unsigned char)pixel;b[offset+1]=(unsigned char)(pixel>>8);
        }
        atomic_store_explicit(&frames[slot].generation,generation,memory_order_relaxed);
        atomic_store_explicit(&frames[slot].state,READY,memory_order_release);
        return;
    }
    atomic_fetch_add(&blocked,1); /* Backpressure; never overwrite READY/READING. */
}
static unsigned frame_cookie(const struct file *f) { return (unsigned)(uintptr_t)f->f_priv; }
static int open_frame(struct file *f) {
    if(!atomic_load(&pending) || atomic_load(&stop)) return -16;
    unsigned first=0;
    /* Generation is atomic: ranking remains safe with competing readers.
     * The CAS, not the ranking, grants ownership of the immutable bytes. */
    if(atomic_load_explicit(&frames[1].state,memory_order_acquire)==READY &&
       (atomic_load_explicit(&frames[0].state,memory_order_acquire)!=READY ||
        atomic_load(&frames[1].generation)<atomic_load(&frames[0].generation))) first=1;
    for(unsigned i=0;i<2;i++) {
        unsigned slot=first^i,expected=READY;
        if(!atomic_compare_exchange_strong_explicit(&frames[slot].state,&expected,READING,
            memory_order_acquire,memory_order_relaxed)) continue;
        atomic_fetch_add(&frame_refs,1);f->f_priv=(void *)(uintptr_t)(slot+1);return 0;
    }
    return -11; /* No waiting in UI. */
}
static int close_frame(struct file *f) {
    unsigned cookie=frame_cookie(f),tag=cookie&3u;
    if(tag<1 || tag>2 || atomic_load(&frames[tag-1].state)!=READING) return -22;
    f->f_priv=NULL;
    atomic_store_explicit(&frames[tag-1].state,FREE,memory_order_release);
    atomic_fetch_sub(&frame_refs,1);return 0;
}
static int read_frame(struct file *f,char *out,unsigned n) {
    unsigned cookie=frame_cookie(f),tag=cookie&3u,pos=cookie>>2;
    if(tag<1 || tag>2 || pos>FRAME_BYTES || atomic_load(&frames[tag-1].state)!=READING) return -22;
    if(n>FRAME_BYTES-pos) n=FRAME_BYTES-pos;
    for(unsigned i=0;i<n;i++) out[i]=(char)frames[tag-1].bytes[pos+i];
    f->f_priv=(void *)(uintptr_t)(((pos+n)<<2)|tag);return (int)n;
}
static int delay(void) {
    const struct timespec_guest t={0,50000000,0};
    return clock_nanosleep(1,0,&t,NULL);
}
static int live(void) {
    unsigned id=atomic_load_explicit(&tid,memory_order_acquire);
    /* Compare only; never dereference a returned TCB pointer. Reused PID
     * conservatively retains the module instead of permitting unload. */
    return id && nxsched_get_tcb((int32_t)id)!=NULL;
}
static int retired(void) {
    return atomic_load(&detached)==1 && atomic_load_explicit(&reason,memory_order_acquire)!=0 && !live();
}
static void *worker(void *unused) {
    (void)unused;
    atomic_store_explicit(&ready,1,memory_order_release);
    unsigned why=2;
    for(unsigned i=0;i<1200;i++) { /* Finite test budget, not a hard watchdog. */
        if(atomic_load_explicit(&stop,memory_order_acquire)) { why=1;break; }
        if(delay()) { why=3;break; }
        if(atomic_load(&detached)==1 && !atomic_load(&paused) && !atomic_load(&stop)) {
            atomic_fetch_add(&steps,1);produce();
        }
    }
    atomic_store_explicit(&reason,why,memory_order_release);
    return NULL; /* Guest trampoline/exit performs detached cleanup. */
}
static int open_node(struct file *f) { f->f_priv=&refs;atomic_fetch_add(&refs,1);return 0; }
static int close_node(struct file *f) {
    if(f->f_priv!=&refs || !atomic_load(&refs)) return -22;
    f->f_priv=NULL;atomic_fetch_sub(&refs,1);return 0;
}
static unsigned word(const char *b) {
    const unsigned char *p=(const unsigned char *)b;
    return p[0]|((unsigned)p[1]<<8)|((unsigned)p[2]<<16)|((unsigned)p[3]<<24);
}
static int read_node(struct file *f,char *b,unsigned n) {
    if(f->f_priv!=&refs || (n!=64 && n!=80)) return -22;
    const uint32_t s[20]={MAGIC,sequence,atomic_load(&pending),atomic_load(&stop),
        atomic_load(&ready),atomic_load(&tid),atomic_load(&steps),atomic_load(&reason),
        atomic_load(&owner),atomic_load(&detached),atomic_load(&error),(unsigned)live(),
        cycle,atomic_load(&paused),init_owner,0,atomic_load(&produced),atomic_load(&frame_refs),atomic_load(&blocked),0};
    for(unsigned i=0;i<n;i++) b[i]=(char)((const unsigned char *)s)[i];
    return (int)n; /* Snapshot without EOF: never cat/read-all this node. */
}
static int write_node(struct file *f,const char *b,unsigned n) {
    if(f->f_priv!=&refs || n!=12 || word(b)!=MAGIC || word(b+4)<=sequence) return -22;
    unsigned op=word(b+8);
    if(op<1 || op>7) return -22;
    if(op>=5) {
        if((unsigned)nxsched_gettid()!=atomic_load(&owner)) return -1;
        /* UI caller only. Never from worker, NSH, or uninitializer. */
        if(op==7) for(unsigned i=0;i<2;i++) {
            lv_image_cache_drop(paths[i]);lv_image_header_cache_drop(paths[i]);
        } else {lv_image_cache_drop(paths[op-5]);lv_image_header_cache_drop(paths[op-5]);}
        sequence=word(b+4);return 12;
    }
    if(op==1) {
        if(atomic_load(&frame_refs) || (atomic_load(&pending) && !retired())) return -16;
        for(unsigned i=0;i<2;i++) atomic_store(&frames[i].state,FREE);
        atomic_store(&produced,0);atomic_store(&blocked,0);
        atomic_store(&pending,1);atomic_store(&stop,0);atomic_store(&ready,0);
        atomic_store(&tid,0);atomic_store(&steps,0);atomic_store(&reason,0);
        atomic_store(&detached,0);atomic_store(&error,0);atomic_store(&paused,0);
        atomic_store(&owner,(unsigned)nxsched_gettid());cycle++;
        guest_pthread_t thread=0;
        int rc=pthread_create(&thread,NULL,worker,NULL);
        if(rc) { atomic_store(&error,(unsigned)rc);atomic_store(&pending,0);return -5; }
        atomic_store_explicit(&tid,(unsigned)thread,memory_order_release);
        rc=pthread_detach(thread); /* Same calling group as create. No join. */
        if(rc) { atomic_store(&error,(unsigned)rc);atomic_store(&stop,1);return -5; }
        atomic_store(&detached,1);
        printf("RW4_WFRAME: start owner=%u tid=%d cycle=%u detach=0\n",atomic_load(&owner),thread,cycle);
    } else if(op==2) atomic_store_explicit(&stop,1,memory_order_release);
    else atomic_store(&paused,op==3);
    sequence=word(b+4);return 12;
}
static int uninit(void *unused) {
    (void)unused;
    if(atomic_load(&refs) || atomic_load(&frame_refs) || (atomic_load(&pending) && !retired())) return -16;
    int rc=0;
    if(stream_registered) { rc=unregister_driver(stream);if(rc) return rc;stream_registered=0; }
    rc=unregister_driver(node);
    printf("RW4_WFRAME: uninit rc=%d tid=%u reason=%u live=%d refs=%u\n",rc,
        atomic_load(&tid),atomic_load(&reason),live(),atomic_load(&refs));
    return rc;
}
static const struct fops operations={open_node,close_node,read_node,write_node,{0}};
static const struct fops frame_operations={open_frame,close_frame,read_frame,NULL,{0}};
int rw4_worker_frame_init(struct mod_info *info) {
    if(!info) return -22;
    info->uninitializer=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    init_owner=(unsigned)nxsched_gettid();
    int rc=register_driver(node,&operations,0666,NULL);
    if(!rc) {
        rc=register_driver(stream,&frame_operations,0444,NULL);
        if(!rc) stream_registered=1;
        else if(unregister_driver(node)) {
            atomic_store(&error,5);return 0; /* Retain code if rollback could not remove its node. */
        }
    }
    printf("RW4_WFRAME: init owner=%u register=%d no_worker=1\n",init_owner,rc);
    return rc; /* Worker is created later by a write in the Lua/UI task. */
}
