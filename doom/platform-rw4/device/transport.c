/* SPDX-License-Identifier: GPL-2.0-or-later
 * Candidate RW4 bridge. Single UI producer, single engine worker.
 * Image-cache retirement only on explicit UI-owner command. No filesystem
 * writes or forced task kill. Image seek/cookie use the R274 file fields.
 */
#include "platform.h"
#include "runtime.h"
#include "image-view.h"
enum { FREE=0,WRITING,READY,READING };
#define FRAME_BYTES (32u+RW4_FRAME_W*RW4_FRAME_H*2u)
#define CLOSING UINT32_C(0x80000000)
static const char control_path[]="/dev/rw4doomctl";
static const char frame_path[]="/dev/rw4doomframe";
static const char image_path[]="/dev/rw4doomimage.bin";
static atomic_uint gate,control_ref,frame_ref,image_ref,stop,paused,ready,accepting,finished;
static atomic_uint requested,applied,epoch,ack,head,tail,overflows;
static atomic_uint produced,dropped,metrics[12];
static unsigned owner,sequence,started,joined,registered_control,registered_frame,registered_image,error;
static int32_t thread;
static unsigned control_cursor,frame_cursor,frame_slot;
static unsigned image_cursor;
static unsigned image_slot=2; /* Presentation lease survives decoder reopen/prefetch. */
static uint32_t control_snapshot[32];
struct frame { atomic_uint state;unsigned generation;unsigned char bytes[FRAME_BYTES]; };
static struct frame frames[2];
struct input { unsigned mask,epoch; };
static struct input inputs[32];
struct edge { unsigned key,down; };
static struct edge edges[64];
static unsigned edge_head,edge_tail;
static uint32_t get32(const char *b){const unsigned char *p=(const unsigned char *)b;return p[0]|((uint32_t)p[1]<<8)|((uint32_t)p[2]<<16)|((uint32_t)p[3]<<24);}
static void put32(unsigned char *p,uint32_t v){for(unsigned i=0;i<4;i++)p[i]=(unsigned char)(v>>(8*i));}
static int enter(void)
{
    unsigned g=atomic_load(&gate);
    while(!(g&CLOSING))if(atomic_compare_exchange_weak(&gate,&g,g+1))return 0;
    return -16;
}
static void leave(void){atomic_fetch_sub(&gate,1);}
static void apply(unsigned mask)
{
    const unsigned keys[4]={0xad,0xac,0xae,0xa3};unsigned previous=atomic_load(&applied);
    for(unsigned down=0;down<2;down++)for(unsigned bit=0;bit<4;bit++){
        unsigned flag=1u<<bit;
        if(((previous^mask)&flag)&&!!(mask&flag)==down){
            if(edge_tail-edge_head>=64)rw4_exit(80);
            edges[edge_tail++%64]=(struct edge){keys[bit],down};
        }
    }
    atomic_store(&applied,mask);
}
static void service_input(void)
{
    unsigned e=atomic_load(&epoch);
    if(atomic_load(&ack)!=e||atomic_load(&stop)||atomic_load(&paused))apply(0);
    for(unsigned n=0;n<32;n++){
        unsigned h=atomic_load(&head);if(h==atomic_load(&tail))break;
        struct input in=inputs[h%32];atomic_store(&head,h+1);
        if(in.epoch!=atomic_load(&epoch)||atomic_load(&stop)||atomic_load(&paused))apply(0);
        else apply(in.mask);
    }
    atomic_store(&ack,atomic_load(&epoch));
}
int rw4_game_key(int *down,unsigned char *key)
{
    service_input();if(edge_head==edge_tail)return 0;
    struct edge e=edges[edge_head++%64];*down=(int)e.down;*key=(unsigned char)e.key;return 1;
}
int rw4_game_paused(void){return (int)atomic_load(&paused);}
int rw4_game_stopping(void){return (int)atomic_load(&stop);}
void rw4_game_ready(void){atomic_store(&accepting,1);atomic_store(&ready,1);}
void rw4_game_pause_ack(void){service_input();}
void rw4_game_metrics(const uint32_t *v){for(unsigned i=0;i<12;i++)atomic_store(&metrics[i],v[i]);}
void rw4_game_frame(const uint32_t *pixels,unsigned tic)
{
    for(unsigned slot=0;slot<2;slot++){
        unsigned expected=FREE;
        if(!atomic_compare_exchange_strong(&frames[slot].state,&expected,WRITING))continue;
        unsigned char *b=frames[slot].bytes;uint32_t fnv=2166136261u;
        for(unsigned i=0;i<RW4_FRAME_W*RW4_FRAME_H;i++){
            uint32_t p=pixels[i];uint16_t v=(uint16_t)(((p>>8)&0xf800u)|((p>>5)&0x07e0u)|((p>>3)&0x1fu));
            b[32+2*i]=(unsigned char)v;b[33+2*i]=(unsigned char)(v>>8);
            fnv=(fnv^b[32+2*i])*16777619u;fnv=(fnv^b[33+2*i])*16777619u;
        }
        unsigned generation=atomic_fetch_add(&produced,1)+1;frames[slot].generation=generation;
        const uint32_t header[8]={RW4_FRAME_MAGIC,1,RW4_FRAME_W,RW4_FRAME_H,2,generation,tic,fnv};
        for(unsigned i=0;i<8;i++)put32(b+4*i,header[i]);
        atomic_store(&frames[slot].state,READY);return;
    }
    atomic_fetch_add(&dropped,1);
}
static void *worker(void *unused)
{
    (void)unused;
    (void)rw4_runtime_run(rw4_game_body,NULL,RW4_GAME_WAD,8u*1024u*1024u);
    /* No private-newlib operation after cleanup: its retained buffers may have
     * been released. The module must be unloaded before another run. */
    atomic_store(&accepting,0);atomic_store(&applied,0);atomic_store(&requested,0);
    atomic_store(&head,atomic_load(&tail));edge_head=edge_tail=0;
    atomic_store(&metrics[10],0);
    atomic_store(&finished,1);return NULL;
}
static int control_open(struct rw4_device_file *f)
{
    (void)f;if(enter())return -16;unsigned expected=0;
    if(!atomic_compare_exchange_strong(&control_ref,&expected,1)){leave();return -16;}
    control_cursor=0;return 0;
}
static int control_close(struct rw4_device_file *f)
{ (void)f;if(!atomic_exchange(&control_ref,0))return -22;leave();return 0; }
static int start_game(void)
{
    if(started)return -16;
    started=1;owner=(unsigned)rw4_host_owner_token();
    struct rw4_device_attr attr;int rc=rw4_host_attr_init(&attr);if(rc){joined=1;return -5;}
    rc=rw4_host_attr_stack(&attr,32768);
    if(rc){joined=1;if(rw4_host_attr_destroy(&attr))error=1;return -5;}
    rc=rw4_host_thread_create(&thread,&attr,worker,NULL);
    if(rw4_host_attr_destroy(&attr))error=1;
    if(rc){joined=1;return -5;}
    if(error){atomic_store(&stop,1);return -5;}
    return 0;
}
static int control_write(struct rw4_device_file *f,const char *b,unsigned n)
{
    (void)f;
    if(!atomic_load(&control_ref)||n!=16||get32(b)!=RW4_CONTROL_MAGIC||sequence==UINT32_MAX||get32(b+4)!=sequence+1)return -22;
    unsigned op=get32(b+8),value=get32(b+12);
    if(op<1||op>7||(op!=2&&value))return -22;
    if(started&&owner!=(unsigned)rw4_host_owner_token())return -1;
    int rc=0;
    if(op==1)rc=start_game();
    else if(op==2){
        if(value>15||(value&6)==6)return -22;
        if(!atomic_load(&accepting)||atomic_load(&stop)||atomic_load(&paused)||atomic_load(&epoch)!=atomic_load(&ack))return -16;
        if(value!=atomic_load(&requested)){
            unsigned t=atomic_load(&tail);
            if(t-atomic_load(&head)>=32){atomic_fetch_add(&overflows,1);atomic_store(&paused,1);atomic_store(&requested,0);atomic_fetch_add(&epoch,1);return -75;}
            inputs[t%32]=(struct input){value,atomic_load(&epoch)};
            atomic_store(&requested,value);atomic_store(&tail,t+1);
        }
    }else if(op==3||op==4){
        if(!started||joined)return -16;
        if(op==3)atomic_store(&paused,1);else atomic_store(&stop,1);
        atomic_store(&requested,0);atomic_fetch_add(&epoch,1);
    }else if(op==5){
        if(!started||joined||!atomic_load(&finished)||atomic_load(&frame_ref)||atomic_load(&image_ref)||image_slot<2)return -16;
        void *value_out=NULL;rc=rw4_host_thread_join(thread,&value_out);
        if(rc||value_out){error=1;return -5;}joined=1;
        atomic_store(&head,atomic_load(&tail));atomic_store(&requested,0);atomic_store(&applied,0);
    }else if(op==6){
        if(!started||joined||atomic_load(&stop)||atomic_load(&applied)||atomic_load(&requested)||atomic_load(&head)!=atomic_load(&tail)||atomic_load(&epoch)!=atomic_load(&ack))return -16;
        atomic_store(&paused,0);
    }else{
        /* Caller must delete/detach its Image before this synchronous write.
         * Only the START owner may call LVGL; never worker/GC/uninit/CLI. */
        if(!started||joined)return -16;
        rw4_host_image_drop(image_path);
        if(rw4_game_image_release())return -16;
    }
    if(rc)return rc;
    sequence++;control_cursor=0;return 16;
}
static int control_read(struct rw4_device_file *f,char *b,unsigned n)
{
    (void)f;if(!atomic_load(&control_ref))return -22;
    if(control_cursor>=sizeof(control_snapshot))return 0;
    if(!control_cursor){
        for(unsigned i=0;i<32;i++)control_snapshot[i]=0;
        const struct rw4_runtime_stats *s=rw4_runtime_stats();
        uint32_t initial[20]={RW4_CONTROL_MAGIC,1,sequence,started,atomic_load(&ready),atomic_load(&finished),joined,error,(unsigned)thread,
            atomic_load(&produced),atomic_load(&dropped),atomic_load(&requested),atomic_load(&applied),atomic_load(&overflows),0,0,0,0,0,0};
        /* Runtime stats are non-atomic: read only after a successful join. */
        if(joined){initial[14]=s->reason;initial[15]=s->code;initial[16]=s->peak_bytes;initial[17]=s->allocated;initial[18]=s->freed;initial[19]=s->cleanup_error;}
        for(unsigned i=0;i<20;i++)control_snapshot[i]=initial[i];
        for(unsigned i=0;i<12;i++)control_snapshot[20+i]=atomic_load(&metrics[i]);
    }
    unsigned left=sizeof(control_snapshot)-control_cursor;if(n>left)n=left;
    const unsigned char *p=(const unsigned char *)control_snapshot;
    for(unsigned i=0;i<n;i++)b[i]=(char)p[control_cursor+i];
    control_cursor+=n;return (int)n;
}
static int frame_open(struct rw4_device_file *f)
{
    (void)f;if(enter())return -16;unsigned expected=0;
    if(!atomic_compare_exchange_strong(&frame_ref,&expected,1)){leave();return -16;}
    for(unsigned slot=0;slot<2;slot++){
        expected=READY;if(!atomic_compare_exchange_strong(&frames[slot].state,&expected,READING))continue;
        frame_slot=slot;frame_cursor=0;return 0;
    }
    atomic_store(&frame_ref,0);leave();return -11;
}
static int frame_close(struct rw4_device_file *f)
{
    (void)f;if(!atomic_load(&frame_ref))return -22;
    atomic_store(&frames[frame_slot].state,FREE);atomic_store(&frame_ref,0);leave();return 0;
}
static int frame_read(struct rw4_device_file *f,char *b,unsigned n)
{
    (void)f;if(!atomic_load(&frame_ref)||frame_cursor>FRAME_BYTES)return -22;
    unsigned left=FRAME_BYTES-frame_cursor;if(n>left)n=left;
    for(unsigned i=0;i<n;i++)b[i]=(char)frames[frame_slot].bytes[frame_cursor+i];
    frame_cursor+=n;return (int)n;
}
/* Candidate file_lseek reads the 64-bit f_pos at +8 AFTER the callback.
 * Returning the new offset alone is insufficient. No other FILE/file/TCB
 * member is read or written except driver-owned f_priv +20 below. */
static void image_position(struct rw4_device_file *f,unsigned position)
{
    unsigned char *bytes=(unsigned char *)f;
    for(unsigned i=0;i<8;i++)bytes[8+i]=i<4?(unsigned char)(position>>(i*8)):0;
}
#define IMAGE_COOKIE UINT32_C(0x27494d47)
static void image_cookie_set(struct rw4_device_file *f,uint32_t value)
{put32((unsigned char *)f+20,value);}
static int image_owned(struct rw4_device_file *f)
{return f&&atomic_load(&image_ref)&&get32((const char *)f+20)==IMAGE_COOKIE;}
static int image_open(struct rw4_device_file *f)
{
    if(!f)return -22;
    /* file_open may operate on a temporary subsequently copied into the FD
     * table. A pointer comparison is invalid; f_priv is copied with the file.
     * A refused duplicate must not carry the successful descriptor's cookie. */
    image_cookie_set(f,0);
    if(enter())return -16;
    unsigned expected=0;
    if(!atomic_compare_exchange_strong(&image_ref,&expected,1)){leave();return -16;}
    image_cookie_set(f,IMAGE_COOKIE);image_cursor=0;image_position(f,0);return 0;
}
static int image_close(struct rw4_device_file *f)
{
    if(!image_owned(f))return -22;
    image_cookie_set(f,0);atomic_store(&image_ref,0);leave();return 0;
}
/* Internal post-cache retirement. File close alone does not end a presentation:
 * info/prefetch/draw can reopen the source and must see the same generation. */
int rw4_game_image_release(void)
{
    if(atomic_load(&image_ref))return -16;
    if(image_slot<2)atomic_store(&frames[image_slot].state,FREE);
    image_slot=2;return 0;
}
static int image_read(struct rw4_device_file *f,char *b,unsigned n)
{
    if(!image_owned(f)||(!b&&n)||image_cursor>RW4_IMAGE_BYTES)return -22;
    unsigned left=RW4_IMAGE_BYTES-image_cursor;if(n>left)n=left;
    /* Reading only the fixed header must not consume a produced frame. */
    if(n&&image_cursor+n>RW4_IMAGE_HEADER_BYTES&&image_slot==2){
        for(unsigned slot=0;slot<2;slot++){
            unsigned expected=READY;
            if(atomic_compare_exchange_strong(&frames[slot].state,&expected,READING)){image_slot=slot;break;}
        }
        if(image_slot==2)return -11;
    }
    const unsigned char *pixels=image_slot<2?frames[image_slot].bytes+32:NULL;
    int count=rw4_image_read(pixels,image_cursor,b,n);
    if(count>=0){image_cursor+=(unsigned)count;image_position(f,image_cursor);}
    return count;
}
static int64_t image_seek(struct rw4_device_file *f,int64_t offset,int origin)
{
    if(!image_owned(f))return -22;
    int64_t result=rw4_image_seek(&image_cursor,offset,origin);
    if(result>=0)image_position(f,image_cursor);
    return result;
}
static int uninit(void *unused)
{
    (void)unused;unsigned expected=0;
    if(!atomic_compare_exchange_strong(&gate,&expected,CLOSING))return -16;
    const struct rw4_runtime_stats *s=rw4_runtime_stats();
    if(error||image_slot<2||(started&&!joined)||(joined&&(s->blocks||s->streams||s->cleanup_error))){atomic_store(&gate,0);return -16;}
    if(registered_image){if(rw4_host_unregister(image_path)){error=1;return -16;}registered_image=0;}
    if(registered_frame){if(rw4_host_unregister(frame_path)){error=1;return -16;}registered_frame=0;}
    if(registered_control){if(rw4_host_unregister(control_path)){error=1;return -16;}registered_control=0;}
    return 0;
}
static const struct rw4_device_fops control_ops={control_open,control_close,control_read,control_write,NULL,{0}};
static const struct rw4_device_fops frame_ops={frame_open,frame_close,frame_read,NULL,NULL,{0}};
static const struct rw4_device_fops image_ops={image_open,image_close,image_read,NULL,image_seek,{0}};
__attribute__((aligned(8),section(".text.entry")))
int rw4_doom_device_init(struct rw4_module_info *info)
{
    if(!info)return -22;
    if(rw4_host_validate())return -8;
    int rc=rw4_host_register(control_path,&control_ops,0600,NULL);if(rc)return rc;registered_control=1;
    rc=rw4_host_register(frame_path,&frame_ops,0400,NULL);
    if(rc){if(!rw4_host_unregister(control_path)){registered_control=0;return rc;}error=1;}
    else {
        registered_frame=1;
        rc=rw4_host_register(image_path,&image_ops,0400,NULL);
        if(rc){
            if(!rw4_host_unregister(frame_path))registered_frame=0;else error=1;
            if(!rw4_host_unregister(control_path))registered_control=0;else error=1;
            if(!error)return rc;
        }else registered_image=1;
    }
    info->uninit=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    return 0; /* No engine/worker until a later START from the UI owner. */
}
