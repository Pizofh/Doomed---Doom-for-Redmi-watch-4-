/* SPDX-License-Identifier: GPL-2.0-or-later
 * Doom worker -> direct Image. Only control writes from the UI touch LVGL.
 * No frame node, PNG codec, framebuffer write, GC cleanup or forced unload.
 */
#include "platform.h"
#include "runtime.h"
#include "direct-view-r342.h"
#include "profile-r335.h"
extern int rw4_direct_backend_init(struct rw4_direct *,uint32_t *,uint32_t *);
extern void rw4_direct_backend_stats(uint32_t *);
#define DIRECT_MAGIC UINT32_C(0x34445752)
#define CLOSING UINT32_C(0x80000000)
static const char control_path[]="/dev/rw4doomdirect";
static struct rw4_direct display;
static uint32_t frame_pixels[2][RW4_DIRECT_PIXELS];
static atomic_uint gate,control_ref,stop,paused,ready,accepting,finished,error;
static atomic_uint requested,applied,epoch,ack,head,tail,overflows,produced,dropped,metrics[12];
static atomic_uint tick_cost,sleep_cost,tick_calls,calibration,began,ended;
static unsigned owner,sequence,started,joined,worker_joined,registered,cursor;
static int32_t thread;
static uint32_t snapshot[64];
struct input {unsigned mask,epoch;};static struct input inputs[32];
struct edge {unsigned key,down;};static struct edge edges[64];
static unsigned edge_head,edge_tail;
static uint32_t get32(const char *b){const unsigned char *p=(const unsigned char *)b;return p[0]|((uint32_t)p[1]<<8)|((uint32_t)p[2]<<16)|((uint32_t)p[3]<<24);}
static int enter(void){unsigned g=atomic_load(&gate);while(!(g&CLOSING))if(atomic_compare_exchange_weak(&gate,&g,g+1))return 0;return -16;}
static void leave(void){atomic_fetch_sub(&gate,1);}
static void apply(unsigned mask)
{
    const unsigned keys[4]={0xad,0xac,0xae,0xa3};unsigned previous=atomic_load(&applied);
    for(unsigned down=0;down<2;down++)for(unsigned bit=0;bit<4;bit++){
        unsigned flag=1u<<bit;if(((previous^mask)&flag)&&!!(mask&flag)==down){
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
        if(in.epoch!=atomic_load(&epoch)||atomic_load(&stop)||atomic_load(&paused))apply(0);else apply(in.mask);
    }
    atomic_store(&ack,atomic_load(&epoch));
}
int rw4_game_key(int *down,unsigned char *key)
{
    service_input();if(edge_head==edge_tail)return 0;struct edge e=edges[edge_head++%64];
    *down=(int)e.down;*key=(unsigned char)e.key;return 1;
}
int rw4_game_paused(void){return(int)atomic_load(&paused);}
int rw4_game_stopping(void){return(int)atomic_load(&stop);}
void rw4_game_pause_ack(void){service_input();}
void rw4_game_ready(void){atomic_store(&began,(unsigned)rw4_host_clock_ticks());atomic_store(&accepting,1);atomic_store(&ready,1);}
void rw4_game_metrics(const uint32_t *v){for(unsigned i=0;i<12;i++)atomic_store(&metrics[i],v[i]);}
int rw4_game_calibrate(void)
{
    unsigned minimum=UINT32_MAX;
    for(unsigned i=0;i<3;i++){unsigned before=(unsigned)rw4_host_clock_ticks();if(rw4_host_usleep(200000u))return -5;
        unsigned elapsed=(unsigned)rw4_host_clock_ticks()-before;if(!elapsed||elapsed>UINT32_MAX/25u)return -5;if(elapsed<minimum)minimum=elapsed;}
    atomic_store(&calibration,minimum);return 0;
}
void rw4_game_tick_cost(uint32_t ticks){atomic_fetch_add(&tick_cost,ticks);atomic_fetch_add(&tick_calls,1);}
void rw4_game_sleep_cost(uint32_t ticks){atomic_fetch_add(&sleep_cost,ticks);}
int rw4_game_frame_wanted(void)
{
    if(!atomic_load(&ready)||!atomic_load(&accepting)||atomic_load(&stop)||atomic_load(&paused)||atomic_load(&display.stopping))return 0;
    for(unsigned i=0;i<2;i++)if(atomic_load(&display.slots[i])==DIRECT_FREE)return 1;return 0;
}
void rw4_game_frame(const uint32_t *pixels,unsigned tic)
{
    (void)tic;if(!pixels||!rw4_game_frame_wanted())return;
    struct rw4_direct_ticket ticket;uint32_t *dst;
    int rc=rw4_direct_acquire(&display,&ticket,&dst);
    if(rc==-11||rc==-16){atomic_fetch_add(&dropped,1);return;}
    if(rc){atomic_store(&error,1);atomic_store(&stop,1);return;}
    for(unsigned i=0;i<RW4_DIRECT_PIXELS;i++)dst[i]=pixels[i];
    rc=rw4_direct_publish(&display,ticket);
    if(!rc)atomic_fetch_add(&produced,1);
    else if(rc!=-16){atomic_store(&error,1);atomic_store(&stop,1);}
}
static void *worker(void *unused)
{
    (void)unused;(void)rw4_runtime_run(rw4_game_body,NULL,RW4_GAME_WAD,8u*1024u*1024u);
    atomic_store(&accepting,0);atomic_store(&applied,0);atomic_store(&requested,0);
    atomic_store(&head,atomic_load(&tail));edge_head=edge_tail=0;atomic_store(&metrics[10],0);
    atomic_store(&ended,(unsigned)rw4_host_clock_ticks());atomic_store(&finished,1);return NULL;
}
static int control_open(struct rw4_device_file *f)
{(void)f;if(enter())return -16;unsigned expected=0;if(!atomic_compare_exchange_strong(&control_ref,&expected,1)){leave();return -16;}cursor=0;return 0;}
static int control_close(struct rw4_device_file *f)
{(void)f;if(!atomic_exchange(&control_ref,0))return -22;leave();return 0;}
static int failed_start(void)
{
    worker_joined=1;if(rw4_direct_close(&display,1)){atomic_store(&error,1);return -5;}joined=1;return -5;
}
static int start_game(void)
{
    if(started)return -16;owner=(unsigned)rw4_host_owner_token();if(!owner)return -1;
    int rc=rw4_direct_start(&display);if(rc)return rc;started=1;
    struct rw4_device_attr attr;rc=rw4_host_attr_init(&attr);if(rc)return failed_start();
    rc=rw4_host_attr_stack(&attr,32768);
    if(rc){if(rw4_host_attr_destroy(&attr))atomic_store(&error,1);return failed_start();}
    rc=rw4_host_thread_create(&thread,&attr,worker,NULL);
    if(rw4_host_attr_destroy(&attr))atomic_store(&error,1);
    if(rc)return failed_start();
    if(atomic_load(&error)){atomic_store(&stop,1);return -5;}return 0;
}
static int control_write(struct rw4_device_file *f,const char *b,unsigned n)
{
    (void)f;if(!atomic_load(&control_ref)||!b||n!=16||get32(b)!=DIRECT_MAGIC||sequence==UINT32_MAX||get32(b+4)!=sequence+1)return -22;
    unsigned op=get32(b+8),value=get32(b+12);if(op<1||op>7||(op!=2&&value))return -22;
    if(started&&owner!=(unsigned)rw4_host_owner_token())return -1;int rc=0;
    if(op==1)rc=start_game();
    else if(op==2){
        if(value>15||(value&6)==6)return -22;
        if(!atomic_load(&accepting)||atomic_load(&stop)||atomic_load(&paused)||atomic_load(&epoch)!=atomic_load(&ack))return -16;
        if(value!=atomic_load(&requested)){
            unsigned t=atomic_load(&tail);
            if(t-atomic_load(&head)>=32){atomic_fetch_add(&overflows,1);atomic_store(&paused,1);atomic_store(&requested,0);atomic_fetch_add(&epoch,1);return -75;}
            inputs[t%32]=(struct input){value,atomic_load(&epoch)};atomic_store(&requested,value);atomic_store(&tail,t+1);
        }
    }else if(op==3||op==4){
        if(!started||joined)return -16;if(op==3)atomic_store(&paused,1);
        else{atomic_store(&stop,1);rw4_direct_request_stop(&display);}
        atomic_store(&requested,0);atomic_fetch_add(&epoch,1);
    }else if(op==5){
        if(!started||joined||!atomic_load(&finished))return -16;
        if(!worker_joined){void *result=NULL;rc=rw4_host_thread_join(thread,&result);if(rc||result){atomic_store(&error,1);return -5;}worker_joined=1;}
        rc=rw4_direct_close(&display,1);if(rc){atomic_store(&error,1);return rc;}
        joined=1;atomic_store(&head,atomic_load(&tail));atomic_store(&requested,0);atomic_store(&applied,0);
    }else if(op==6){
        if(!started||joined||atomic_load(&stop)||atomic_load(&applied)||atomic_load(&requested)||atomic_load(&head)!=atomic_load(&tail)||atomic_load(&epoch)!=atomic_load(&ack))return -16;
        atomic_store(&paused,0);
    }else{
        if(!started||joined||!atomic_load(&ready)||atomic_load(&stop)||atomic_load(&paused))return -16;
        rc=rw4_direct_present(&display);if(rc==-11)rc=0; /* no frame is a normal timer tick */
        if(rc){atomic_store(&error,1);atomic_store(&stop,1);rw4_direct_request_stop(&display);}
    }
    if(rc)return rc;sequence++;cursor=0;return 16;
}
static int control_read(struct rw4_device_file *f,char *b,unsigned n)
{
    (void)f;if(!atomic_load(&control_ref)||(!b&&n))return -22;
    if(started&&owner!=(unsigned)rw4_host_owner_token())return -1;
    if(cursor>=sizeof(snapshot))return 0;
    if(!cursor){
        for(unsigned i=0;i<64;i++)snapshot[i]=0;
        uint32_t initial[14]={DIRECT_MAGIC,4,sequence,started,atomic_load(&ready),atomic_load(&finished),joined,atomic_load(&error),(unsigned)thread,
            atomic_load(&produced),atomic_load(&dropped),atomic_load(&requested),atomic_load(&applied),atomic_load(&overflows)};
        for(unsigned i=0;i<14;i++)snapshot[i]=initial[i];
        /* Private runtime stats are non-atomic: read ONLY after real join. */
        if(worker_joined){const struct rw4_runtime_stats *s=rw4_runtime_stats();snapshot[14]=s->reason;snapshot[15]=s->code;snapshot[16]=s->peak_bytes;snapshot[17]=s->allocated;snapshot[18]=s->freed;snapshot[19]=s->cleanup_error;}
        snapshot[20]=(unsigned)atomic_load(&display.error);snapshot[21]=(unsigned)display.native_error;snapshot[22]=display.presentations;
        snapshot[23]=display.draw_events;snapshot[24]=display.fences;snapshot[25]=display.retirements;snapshot[26]=atomic_load(&display.phase);
        for(unsigned i=0;i<2;i++)if(atomic_load(&display.slots[i])==DIRECT_FREE)snapshot[27]++;
        snapshot[28]=(unsigned)display.front;snapshot[29]=worker_joined;
        snapshot[30]=atomic_load(&ready)?(atomic_load(&finished)?atomic_load(&ended):(unsigned)rw4_host_clock_ticks())-atomic_load(&began):0;
        snapshot[31]=atomic_load(&calibration);for(unsigned i=0;i<12;i++)snapshot[32+i]=atomic_load(&metrics[i]);
        snapshot[44]=atomic_load(&tick_cost);snapshot[45]=atomic_load(&sleep_cost);snapshot[46]=atomic_load(&tick_calls);
        rw4_direct_backend_stats(snapshot+48);
    }
    unsigned left=sizeof(snapshot)-cursor;if(n>left)n=left;
    const char *p=(const char *)snapshot;for(unsigned i=0;i<n;i++)b[i]=p[cursor+i];cursor+=n;return(int)n;
}
static int uninit(void *unused)
{
    (void)unused;unsigned expected=0;if(!atomic_compare_exchange_strong(&gate,&expected,CLOSING))return -16;
    if(atomic_load(&error)||(started&&!joined)||!rw4_direct_can_unload(&display)){atomic_store(&gate,0);return -16;}
    if(worker_joined){const struct rw4_runtime_stats *s=rw4_runtime_stats();if(s->blocks||s->streams||s->cleanup_error){atomic_store(&gate,0);return -16;}}
    if(registered){if(rw4_host_unregister(control_path)){atomic_store(&error,1);return -16;}registered=0;}return 0;
}
static const struct rw4_device_fops control_ops={control_open,control_close,control_read,control_write,NULL,{0}};
__attribute__((aligned(8),section(".text.entry")))
int rw4_doom_device_init(struct rw4_module_info *info)
{
    if(!info)return -22;if(rw4_host_validate())return -8;
    int rc=rw4_direct_backend_init(&display,frame_pixels[0],frame_pixels[1]);if(rc)return rc;
    rc=rw4_host_register(control_path,&control_ops,0600,NULL);if(rc)return rc;registered=1;
    info->uninit=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;return 0;
}
