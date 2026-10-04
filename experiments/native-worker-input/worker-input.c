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
static const char node[]="/dev/rw4winput";
static atomic_uint refs,pending,stop,ready,tid,steps,reason,owner,detached,error,paused;
/* UI updates sequence/cycle while an NSH snapshot can read them. */
static atomic_uint sequence,cycle;
static unsigned init_owner,stream_registered;
enum { FREE=0,WRITING=1,READY=2,READING=3 };
#define FRAME_BYTES (12u+320u*140u*2u)
struct frame_slot { atomic_uint state,generation; unsigned char bytes[FRAME_BYTES]; };
static struct frame_slot frames[2];
static atomic_uint produced,frame_refs,blocked;
/* SPSC mask transitions: UI alone publishes tail, worker alone advances head.
 * Cancellation invalidates an epoch; it never overwrites a queued record. */
#define INPUT_CAPACITY 32u
struct input_event { unsigned mask,epoch; };
static struct input_event input_queue[INPUT_CAPACITY];
static atomic_uint head,tail,requested,applied,changes,overflows,cancels;
static atomic_uint input_epoch,input_ack,consumed,key_events,accepting,producer_busy;
static unsigned queue_size(void) {
    unsigned h=atomic_load(&head);return atomic_load(&tail)-h;
} /* Snapshot only: a concurrent reader does not get a transaction. */
static void cancel_input(void) {
    atomic_store(&requested,0);
    atomic_fetch_add(&cancels,1);
    atomic_fetch_add_explicit(&input_epoch,1,memory_order_release);
}
static void apply_input(unsigned mask) {
    unsigned previous=atomic_load(&applied);
    const unsigned keys[4]={0xad,0xac,0xae,0xa3};
    /* Releases before presses; only this worker produces key diagnostics. */
    for(unsigned down=0;down<2;down++) for(unsigned bit=0;bit<4;bit++) {
        unsigned flag=1u<<bit;
        if(((previous^mask)&flag) && !!(mask&flag)==down) {
            atomic_fetch_add(&key_events,1);
            printf("RW4_WINPUT_KEY: key=%u down=%u tid=%u\n",keys[bit],down,(unsigned)nxsched_gettid());
        }
    }
    atomic_store(&applied,mask);
}
static void service_input(void) {
    unsigned epoch=atomic_load_explicit(&input_epoch,memory_order_acquire);
    unsigned discard=atomic_load(&paused) || atomic_load(&stop) || !atomic_load(&accepting);
    if(atomic_load(&input_ack)!=epoch || discard) apply_input(0);
    /* Bound each service pass even if UI keeps publishing. */
    for(unsigned n=0;n<INPUT_CAPACITY;n++) {
        unsigned h=atomic_load(&head);
        if(h==atomic_load_explicit(&tail,memory_order_acquire)) break;
        struct input_event event=input_queue[h%INPUT_CAPACITY];
        atomic_store_explicit(&head,h+1,memory_order_release);
        epoch=atomic_load_explicit(&input_epoch,memory_order_acquire);
        if(atomic_load(&paused) || atomic_load(&stop) || !atomic_load(&accepting) || event.epoch!=epoch) {
            apply_input(0);continue;
        }
        apply_input(event.mask);atomic_fetch_add(&consumed,1);
    }
    epoch=atomic_load_explicit(&input_epoch,memory_order_acquire);
    if(atomic_load(&input_ack)!=epoch || atomic_load(&paused) || atomic_load(&stop) || !atomic_load(&accepting)) apply_input(0);
    atomic_store_explicit(&input_ack,epoch,memory_order_release);
}
static int publish_input(unsigned mask) {
    if(mask>15 || (mask&6)==6) return -22;
    atomic_store_explicit(&producer_busy,1,memory_order_release);
    int rc=0;
    if(!atomic_load(&accepting) || atomic_load(&paused) || atomic_load(&stop) ||
       atomic_load(&input_ack)!=atomic_load(&input_epoch)) rc=-16;
    else if(mask!=atomic_load(&requested)) {
        unsigned t=atomic_load(&tail),h=atomic_load_explicit(&head,memory_order_acquire);
        if(t-h>=INPUT_CAPACITY) {
            atomic_fetch_add(&overflows,1);atomic_store(&paused,1);cancel_input();rc=-75;
        } else {
            input_queue[t%INPUT_CAPACITY]=(struct input_event){mask,atomic_load(&input_epoch)};
            atomic_store(&requested,mask);atomic_fetch_add(&changes,1);
            atomic_store_explicit(&tail,t+1,memory_order_release);
        }
    }
    atomic_store_explicit(&producer_busy,0,memory_order_release);return rc;
}
static const char stream[]="/dev/rw4wistream";
static const char paths[2][32]={"/tmp/rw4-worker-input-0.bin","/tmp/rw4-worker-input-1.bin"};
static const uint16_t colors[8]={0xf800,0x07e0,0x001f,0xffff,0xffe0,0x07ff,0xf81f,0};
static void produce(unsigned mask) {
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
                y<16 ? (((mask>>(x/80))&1u) ? 0x07e0:0) :
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
    atomic_store(&accepting,1);
    atomic_store_explicit(&ready,1,memory_order_release);
    unsigned why=2;
    for(unsigned i=0;i<3600;i++) { /* Finite test budget, not a hard watchdog. */
        service_input();
        if(atomic_load_explicit(&stop,memory_order_acquire)) { why=1;break; }
        if(delay()) { why=3;break; }
        service_input();
        if(atomic_load(&detached)==1 && !atomic_load(&paused) && !atomic_load(&stop)) {
            atomic_fetch_add(&steps,1);produce(atomic_load(&applied));
        }
    }
    atomic_store(&accepting,0);
    /* Wait outside UI for an already-started producer publication to retire.
     * Fail closed on a broken producer instead of declaring an unloadable module. */
    for(unsigned i=0;atomic_load_explicit(&producer_busy,memory_order_acquire) && i<20;i++) (void)delay();
    if(atomic_load(&producer_busy)) { atomic_store(&error,16);why=4; }
    else service_input();
    apply_input(0);
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
    if(f->f_priv!=&refs || (n!=64 && n!=80 && n!=128)) return -22;
    const uint32_t s[32]={MAGIC,sequence,atomic_load(&pending),atomic_load(&stop),
        atomic_load(&ready),atomic_load(&tid),atomic_load(&steps),atomic_load(&reason),
        atomic_load(&owner),atomic_load(&detached),atomic_load(&error),(unsigned)live(),
        cycle,atomic_load(&paused),init_owner,0,atomic_load(&produced),atomic_load(&frame_refs),atomic_load(&blocked),0,
        atomic_load(&requested),atomic_load(&applied),queue_size(),atomic_load(&changes),atomic_load(&overflows),atomic_load(&cancels),
        atomic_load(&input_epoch),atomic_load(&input_ack),atomic_load(&consumed),atomic_load(&key_events),atomic_load(&accepting),atomic_load(&producer_busy)};
    for(unsigned i=0;i<n;i++) b[i]=(char)((const unsigned char *)s)[i];
    return (int)n; /* Snapshot without EOF: never cat/read-all this node. */
}
static int write_node(struct file *f,const char *b,unsigned n) {
    if(f->f_priv!=&refs || (n!=12 && n!=16) || word(b)!=MAGIC || word(b+4)<=sequence) return -22;
    unsigned op=word(b+8);
    if(op<1 || op>8 || n!=(op==8?16u:12u)) return -22;
    if(op==8) {
        if((unsigned)nxsched_gettid()!=atomic_load(&owner)) return -1;
        int rc=publish_input(word(b+12));sequence=word(b+4);return rc?rc:16;
    }
    if(op>=5) {
        if((unsigned)nxsched_gettid()!=atomic_load(&owner)) return -1;
        /* UI caller only. Never from worker, NSH, or uninitializer. */
        if(op==7) for(unsigned i=0;i<2;i++) {
            lv_image_cache_drop(paths[i]);lv_image_header_cache_drop(paths[i]);
        } else {lv_image_cache_drop(paths[op-5]);lv_image_header_cache_drop(paths[op-5]);}
        sequence=word(b+4);return 12;
    }
    if(op==1) {
        if(atomic_load(&frame_refs) || atomic_load(&producer_busy) || (atomic_load(&pending) && !retired())) return -16;
        atomic_store(&head,0);atomic_store(&tail,0);atomic_store(&requested,0);atomic_store(&applied,0);
        atomic_store(&changes,0);atomic_store(&overflows,0);atomic_store(&cancels,0);
        atomic_store(&input_epoch,0);atomic_store(&input_ack,0);atomic_store(&consumed,0);atomic_store(&key_events,0);atomic_store(&accepting,0);
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
        printf("RW4_WINPUT: start owner=%u tid=%d cycle=%u detach=0\n",atomic_load(&owner),thread,cycle);
    } else if(op==2) { atomic_store_explicit(&stop,1,memory_order_release);cancel_input(); }
    else if(op==3) { atomic_store(&paused,1);cancel_input(); }
    else {
        if(atomic_load(&input_ack)!=atomic_load(&input_epoch) || atomic_load(&applied) || atomic_load(&requested) || queue_size()) return -16;
        atomic_store(&paused,0);
    }
    sequence=word(b+4);return 12;
}
static int uninit(void *unused) {
    (void)unused;
    if(atomic_load(&refs) || atomic_load(&frame_refs) || atomic_load(&producer_busy) || atomic_load(&requested) || atomic_load(&applied) || queue_size() ||
       (atomic_load(&pending) && !retired())) return -16;
    int rc=0;
    if(stream_registered) { rc=unregister_driver(stream);if(rc) return rc;stream_registered=0; }
    rc=unregister_driver(node);
    printf("RW4_WINPUT: uninit rc=%d tid=%u reason=%u live=%d refs=%u requested=%u applied=%u queued=%u keys=%u\n",rc,
        atomic_load(&tid),atomic_load(&reason),live(),atomic_load(&refs),
        atomic_load(&requested),atomic_load(&applied),queue_size(),atomic_load(&key_events));
    return rc;
}
static const struct fops operations={open_node,close_node,read_node,write_node,{0}};
static const struct fops frame_operations={open_frame,close_frame,read_frame,NULL,{0}};
int rw4_worker_input_init(struct mod_info *info) {
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
    printf("RW4_WINPUT: init owner=%u register=%d no_worker=1\n",init_owner,rc);
    return rc; /* Worker is created later by a write in the Lua/UI task. */
}
