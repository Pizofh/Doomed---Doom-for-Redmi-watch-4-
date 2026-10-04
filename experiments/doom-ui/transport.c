/* Exact reviewed PC guest only, FLAT. No hardware or filesystem I/O; LVGL cache calls only in UI writes.
 * UI creates/detaches a finite worker; stop is cooperative. Never join in UI.
 * A completion flag alone never authorizes unload: the PID must be absent.
 * No worker TLS destructor, exit callback or other module callback is installed.
 * Lifecycle writers are serialized by our Lua/UI caller; this is not a
 * general concurrent driver-open/unload contract. */
#include "game-ui.h"
#include "runtime.h"
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
struct guest_attr { uint32_t opaque[3]; };
extern int pthread_attr_init(struct guest_attr *),pthread_attr_destroy(struct guest_attr *);
extern int pthread_attr_setstacksize(struct guest_attr *,unsigned);
extern int pthread_create(guest_pthread_t *,const struct guest_attr *,void *(*)(void *),void *);
extern int pthread_detach(guest_pthread_t);
extern void *nxsched_get_tcb(int32_t);
extern int nxsched_gettid(void);
extern int clock_nanosleep(int,int,const struct timespec_guest *,struct timespec_guest *);
extern int printf(const char *,...);
extern void lv_image_cache_drop(const void *);
extern void lv_image_header_cache_drop(const void *);
#define MAGIC 0x34574c52u
static const char node[]="/dev/rw4doom";
static atomic_uint refs,pending,stop,ready,tid,steps,reason,owner,detached,error,paused;
/* UI updates sequence/cycle while an NSH snapshot can read them. */
static atomic_uint sequence,cycle;
static unsigned init_owner,stream_registered;
enum { FREE=0,WRITING=1,READY=2,READING=3 };
#define FRAME_BYTES (16u+12u+320u*200u*2u)
static atomic_uint metrics[16];
struct key_edge { unsigned key,down; };
static struct key_edge key_queue[64];
static unsigned key_head,key_tail;
static int run_result;
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
            if(key_tail-key_head>=64)rw4_exit(80);
            key_queue[key_tail++%64]=(struct key_edge){keys[bit],down};
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
    if(!atomic_load(&paused))atomic_store_explicit(&input_ack,epoch,memory_order_release);
}
int rw4_game_key(int *down,unsigned char *key){
    service_input();if(key_head==key_tail)return 0;
    struct key_edge e=key_queue[key_head++%64];*down=(int)e.down;*key=(unsigned char)e.key;return 1;
}
int rw4_game_paused(void){return (int)atomic_load(&paused);}
int rw4_game_stopping(void){return (int)atomic_load(&stop);}
void rw4_game_ready(void){atomic_store(&accepting,1);atomic_store_explicit(&ready,1,memory_order_release);}
void rw4_game_pause_ack(void){service_input();atomic_store_explicit(&input_ack,atomic_load(&input_epoch),memory_order_release);}
void rw4_game_metrics(const uint32_t *v){for(unsigned i=0;i<12;i++)atomic_store(&metrics[i],v[i]);}
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
static const char stream[]="/dev/rw4doomstream";
static const char paths[2][32]={"/tmp/rw4-doom-frame-0.bin","/tmp/rw4-doom-frame-1.bin"};
void rw4_game_frame(const uint32_t *pixels,unsigned tic) {
    atomic_fetch_add(&steps,1);
    for(unsigned slot=0;slot<2;slot++) {
        unsigned expected=FREE;
        if(!atomic_compare_exchange_strong_explicit(&frames[slot].state,&expected,WRITING,memory_order_acquire,memory_order_relaxed))continue;
        unsigned generation=atomic_fetch_add(&produced,1)+1;
        unsigned char *b=frames[slot].bytes;
        const unsigned char header[12]={0x19,0x12,0,0,0x40,1,0xc8,0,0x80,2,0,0};
        for(unsigned i=0;i<12;i++)b[16+i]=header[i];
        uint32_t fnv=2166136261u;
        for(unsigned i=0;i<320u*200u;i++) {
            uint32_t p=pixels[i];uint16_t v=(uint16_t)(((p>>8)&0xf800u)|((p>>5)&0x07e0u)|((p>>3)&0x001fu));
            b[28+2*i]=(unsigned char)v;b[29+2*i]=(unsigned char)(v>>8);
            fnv=(fnv^b[28+2*i])*16777619u;fnv=(fnv^b[29+2*i])*16777619u;
        }
        const uint32_t meta[4]={MAGIC,generation,tic,fnv};
        for(unsigned i=0;i<16;i++)b[i]=((const unsigned char *)meta)[i];
        atomic_store_explicit(&frames[slot].generation,generation,memory_order_relaxed);
        atomic_store_explicit(&frames[slot].state,READY,memory_order_release);return;
    }
    atomic_fetch_add(&blocked,1);
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
    run_result=rw4_runtime_run(rw4_game_body,NULL,RW4_GAME_WAD,8u*1024u*1024u);
    unsigned why=(unsigned)(run_result>0?run_result:3);
    const struct rw4_runtime_stats *stats=rw4_runtime_stats();
    atomic_store(&metrics[12],stats->peak_bytes);atomic_store(&metrics[13],stats->allocated);
    atomic_store(&metrics[14],stats->freed);atomic_store(&metrics[15],stats->cleanup_error);
    if(stats->cleanup_error)atomic_store(&error,5);
    atomic_store(&accepting,0);
    /* Wait outside UI for an already-started producer publication to retire.
     * Fail closed on a broken producer instead of declaring an unloadable module. */
    for(unsigned i=0;atomic_load_explicit(&producer_busy,memory_order_acquire) && i<20;i++) (void)delay();
    if(atomic_load(&producer_busy)) { atomic_store(&error,16);why=4; }
    /* The run has ended; never enqueue/longjmp outside its live owner scope.
     * After publication retires the worker may discard the ring directly. */
    else atomic_store(&head,atomic_load_explicit(&tail,memory_order_acquire));
    key_head=key_tail=0;
    apply_input(0);key_head=key_tail=0;atomic_store(&metrics[10],0);
    atomic_store_explicit(&input_ack,atomic_load(&input_epoch),memory_order_release);
    printf("RW4_DOOM_UI: finished tid=%u result=%d peak=%u alloc=%u free=%u streams=%u cleanup=%u\n",
        atomic_load(&tid),run_result,stats->peak_bytes,stats->allocated,stats->freed,stats->streams,stats->cleanup_error);
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
    if(f->f_priv!=&refs || (n!=192)) return -22;
    uint32_t s[48]={MAGIC,sequence,atomic_load(&pending),atomic_load(&stop),
        atomic_load(&ready),atomic_load(&tid),atomic_load(&steps),atomic_load(&reason),
        atomic_load(&owner),atomic_load(&detached),atomic_load(&error),(unsigned)live(),
        cycle,atomic_load(&paused),init_owner,0,atomic_load(&produced),atomic_load(&frame_refs),atomic_load(&blocked),0,
        atomic_load(&requested),atomic_load(&applied),queue_size(),atomic_load(&changes),atomic_load(&overflows),atomic_load(&cancels),
        atomic_load(&input_epoch),atomic_load(&input_ack),atomic_load(&consumed),atomic_load(&key_events),atomic_load(&accepting),atomic_load(&producer_busy)};
    for(unsigned i=0;i<16;i++)s[32+i]=atomic_load(&metrics[i]);
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
        if(atomic_load(&frame_refs) || atomic_load(&producer_busy) || atomic_load(&pending)) return -16;
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
        struct guest_attr attr;int rc=pthread_attr_init(&attr);
        if(!rc){rc=pthread_attr_setstacksize(&attr,32768);if(rc)(void)pthread_attr_destroy(&attr);}
        if(rc){atomic_store(&error,(unsigned)rc);atomic_store(&pending,0);return -5;}
        rc=pthread_create(&thread,&attr,worker,NULL);int destroyed=pthread_attr_destroy(&attr);
        if(destroyed)printf("RW4_DOOM_UI: attr_destroy=%d\n",destroyed);
        if(rc) { atomic_store(&error,(unsigned)rc);atomic_store(&pending,0);return -5; }
        atomic_store_explicit(&tid,(unsigned)thread,memory_order_release);
        rc=pthread_detach(thread); /* Same calling group as create. No join. */
        if(rc) { atomic_store(&error,(unsigned)rc);atomic_store(&stop,1);return -5; }
        atomic_store(&detached,1);
        printf("RW4_DOOM_UI: start owner=%u tid=%d cycle=%u detach=0\n",atomic_load(&owner),thread,cycle);
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
       atomic_load(&error) || (atomic_load(&pending) && !retired())) return -16;
    int rc=0;
    if(stream_registered) { rc=unregister_driver(stream);if(rc) return rc;stream_registered=0; }
    rc=unregister_driver(node);
    printf("RW4_DOOM_UI: uninit rc=%d tid=%u reason=%u live=%d refs=%u requested=%u applied=%u queued=%u keys=%u\n",rc,
        atomic_load(&tid),atomic_load(&reason),live(),atomic_load(&refs),
        atomic_load(&requested),atomic_load(&applied),queue_size(),atomic_load(&key_events));
    return rc;
}
static const struct fops operations={open_node,close_node,read_node,write_node,{0}};
static const struct fops frame_operations={open_frame,close_frame,read_frame,NULL,{0}};
int rw4_doom_ui_init(struct mod_info *info) {
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
    printf("RW4_DOOM_UI: init owner=%u register=%d no_worker=1\n",init_owner,rc);
    return rc; /* Worker is created later by a write in the Lua/UI task. */
}
