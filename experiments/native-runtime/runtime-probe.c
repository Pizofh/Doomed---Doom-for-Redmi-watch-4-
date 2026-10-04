/* SPDX-License-Identifier: GPL-2.0-or-later
 * Finite shim contract test in one joined worker. No Doom or UI calls. */
#include "runtime.h"
#include <stddef.h>
#include <stdint.h>
#include <stdatomic.h>
struct mod_info { int (*uninitializer)(void *); void *arg; const void *exports; int nexports; };
_Static_assert(sizeof(struct mod_info)==16,"inspected guest module ABI");
extern int pthread_create(int32_t *,const void *,void *(*)(void *),void *);
extern int pthread_join(int32_t,void **);
extern int printf(const char *,...);
extern int *__errno(void);
static unsigned cycle,failed,done;
static atomic_uint pending_join;
static int uninit(void *unused){
    (void)unused;
    if(atomic_load_explicit(&pending_join,memory_order_acquire))return -16;
    return rw4_runtime_stats()->cleanup_error?-16:0;
}
static const char path[]="/tmp/rw4-runtime-fixture.bin";
static void require(int value){if(!value){failed=1;rw4_exit(71);}}
static void deep_exit(void){rw4_exit(cycle==2?7:0);}
static void body(void *unused){
    (void)unused;
    uint8_t *p=rw4_calloc(37,1);for(unsigned i=0;i<37;i++)require(p[i]==0);
    for(unsigned i=0;i<37;i++)p[i]=(uint8_t)(i+10);
    p=rw4_realloc(p,100);for(unsigned i=0;i<37;i++)require(p[i]==i+10);
    char *s=rw4_strdup("owned");require(s[0]=='o'&&s[5]==0);rw4_free(s);
    /* Keep allocation and stream open at the point of return/jump. */
    struct rw4_file *f=rw4_fopen(path,"rb");require(f!=NULL);
    uint8_t b[7];require(rw4_fread(b,1,7,f)==7&&b[0]==3&&b[6]==9);
    require(rw4_fopen(path,"wb")==NULL&&*__errno()==30);
    require(rw4_fopen("/data/not-owned","rb")==NULL&&*__errno()==2);
    require(rw4_fwrite(b,1,7,f)==0&&*__errno()==30);
    require(rw4_mkdir("/data/not-owned",0755)==-1&&rw4_remove(path)==-1&&rw4_rename(path,"/tmp/not-owned")==-1);
    require(rw4_system("must never be executed")==-1&&*__errno()==38);
    char log[64];int n=rw4_snprintf(log,sizeof(log),"%s %u %x %.1f","ok",23u,0xabu,1.5);
    require(n==12&&log[0]=='o'&&log[11]=='5');
    require(rw4_abs(-123)==123);
    rw4_printf("cycle=%u varargs=%s\n",cycle,log);
    if(cycle==0)return;
    if(cycle==1||cycle==2)deep_exit();
    if(cycle==3){rw4_runtime_request_stop();rw4_runtime_poll();}
    if(cycle==4)(void)rw4_calloc(SIZE_MAX,2);
    if(cycle==5){int not_owned=0;rw4_free(&not_owned);}
    if(cycle==6)(void)rw4_malloc(4097);
    if(cycle==7){
        require(rw4_fclose(f)==0);
        require(rw4_fclose(f)==-1&&*__errno()==9);
        require(rw4_fread(b,1,7,f)==0&&*__errno()==9);
        rw4_free(p);return;
    }
    failed=1;
}
static void *worker(void *unused){
    (void)unused;const unsigned reasons[]={0,2,3,1,4,5,4,0};
    for(cycle=0;cycle<8;cycle++){
        int rc=rw4_runtime_run(body,NULL,path,4096);
        const struct rw4_runtime_stats *s=rw4_runtime_stats();
        int ok=rc==(int)reasons[cycle]&&s->reason==reasons[cycle]&&s->blocks==0&&s->bytes==0&&s->streams==0&&
            s->allocated==s->freed&&s->opened==s->closed&&s->opened==1&&s->denied==7&&s->cleanup_error==0&&s->peak_bytes==137;
        if(!ok)failed=1;
        printf("RW4_RUNTIME: cycle=%u rc=%d owner=%u reason=%u code=%u blocks=%u bytes=%u streams=%u alloc=%u free=%u open=%u close=%u denied=%u peak=%u error=%u ok=%u\n",
            cycle,rc,s->owner,s->reason,s->code,s->blocks,s->bytes,s->streams,s->allocated,s->freed,s->opened,s->closed,s->denied,s->peak_bytes,s->cleanup_error,(unsigned)ok);
    }
    done=1;return (void *)(uintptr_t)0x34650008;
}
int rw4_runtime_init(struct mod_info *info){
    if(!info)return -22;
    info->uninitializer=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    atomic_store(&pending_join,1);
    int32_t t=0;int rc=pthread_create(&t,NULL,worker,NULL);
    if(rc){atomic_store(&pending_join,0);printf("RW4_RUNTIME: create_failed rc=%d\n",rc);return -5;}
    void *value=NULL;rc=pthread_join(t,&value);
    printf("RW4_RUNTIME: joined tid=%d rc=%d value=%08x done=%u failed=%u\n",(int)t,rc,(unsigned)(uintptr_t)value,done,failed);
    /* Successful registration keeps the busy uninitializer installed on error.
     * Never let the loader free code whose worker lifetime is uncertain. */
    if(rc){printf("RW4_RUNTIME: join_failed_retained pending_join=1\n");return 0;}
    atomic_store_explicit(&pending_join,0,memory_order_release);
    if(rw4_runtime_stats()->cleanup_error)return 0;
    return done&&!failed&&value==(void *)(uintptr_t)0x34650008?0:-5;
}
