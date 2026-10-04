/* Exact reviewed PC guest only, FLAT. No LVGL, hardware or filesystem I/O.
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
#define MAGIC 0x34574c52u
static const char node[]="/dev/rw4worker";
static atomic_uint refs,pending,stop,ready,tid,steps,reason,owner,detached,error,paused;
static unsigned sequence,cycle,init_owner;
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
        if(atomic_load(&detached)==1 && !atomic_load(&paused)) atomic_fetch_add(&steps,1);
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
    if(f->f_priv!=&refs || n!=64) return -22;
    const uint32_t s[16]={MAGIC,sequence,atomic_load(&pending),atomic_load(&stop),
        atomic_load(&ready),atomic_load(&tid),atomic_load(&steps),atomic_load(&reason),
        atomic_load(&owner),atomic_load(&detached),atomic_load(&error),(unsigned)live(),
        cycle,atomic_load(&paused),init_owner,0};
    for(unsigned i=0;i<64;i++) b[i]=(char)((const unsigned char *)s)[i];
    return 64; /* Snapshot without EOF: never cat/read-all this node. */
}
static int write_node(struct file *f,const char *b,unsigned n) {
    if(f->f_priv!=&refs || n!=12 || word(b)!=MAGIC || word(b+4)<=sequence) return -22;
    unsigned op=word(b+8);
    if(op<1 || op>4) return -22;
    if(op==1) {
        if(atomic_load(&pending) && !retired()) return -16;
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
        printf("RW4_WORKER: start owner=%u tid=%d cycle=%u detach=0\n",atomic_load(&owner),thread,cycle);
    } else if(op==2) atomic_store_explicit(&stop,1,memory_order_release);
    else atomic_store(&paused,op==3);
    sequence=word(b+4);return 12;
}
static int uninit(void *unused) {
    (void)unused;
    if(atomic_load(&refs) || (atomic_load(&pending) && !retired())) return -16;
    int rc=unregister_driver(node);
    printf("RW4_WORKER: uninit rc=%d tid=%u reason=%u live=%d refs=%u\n",rc,
        atomic_load(&tid),atomic_load(&reason),live(),atomic_load(&refs));
    return rc;
}
static const struct fops operations={open_node,close_node,read_node,write_node,{0}};
int rw4_launcher_init(struct mod_info *info) {
    if(!info) return -22;
    info->uninitializer=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    init_owner=(unsigned)nxsched_gettid();
    int rc=register_driver(node,&operations,0666,NULL);
    printf("RW4_WORKER: init owner=%u register=%d no_worker=1\n",init_owner,rc);
    return rc; /* Worker is created later by a write in the Lua/UI task. */
}
