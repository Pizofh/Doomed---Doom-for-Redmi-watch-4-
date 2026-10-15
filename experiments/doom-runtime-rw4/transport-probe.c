/* SPDX-License-Identifier: GPL-2.0-or-later
 * Run the candidate C callbacks with a simulated kernel/worker lifecycle.
 * S3 CPU execution does not validate RW4 pthread or fops ABI.
 */
#include "platform.h"
#include "runtime.h"
#include "image-view.h"
extern int host_printf(const char *,...);
static const struct rw4_device_fops *ctl,*frame,*image;
static void *(*saved_worker)(void *);
static unsigned registrations,removals,joins,stack_size,validation_failure=1,registration_failure;
static unsigned owner_token=17,cache_drops;
_Alignas(8) static unsigned char image_cookie[32],other_cookie[32];
static struct rw4_runtime_stats stats;
int rw4_host_owner_token(void){return (int)owner_token;}
int rw4_host_validate(void){return (int)validation_failure;}
void rw4_host_image_drop(const char *path){(void)path;cache_drops++;}
int rw4_host_attr_init(struct rw4_device_attr *p){p->words[0]=0;return 0;}
int rw4_host_attr_stack(struct rw4_device_attr *p,unsigned n){(void)p;stack_size=n;return 0;}
int rw4_host_attr_destroy(struct rw4_device_attr *p){(void)p;return 0;}
int rw4_host_thread_create(int32_t *id,const struct rw4_device_attr *a,void *(*body)(void *),void *arg)
{ (void)a;(void)arg;*id=23;saved_worker=body;return 0; }
int rw4_host_thread_join(int32_t id,void **value){if(id!=23)return 22;*value=NULL;joins++;return 0;}
int rw4_host_register(const char *path,const struct rw4_device_fops *ops,unsigned mode,void *arg)
{ (void)path;(void)mode;(void)arg;unsigned n=registrations++;if(registration_failure&&n==2)return -12;if(n==0)ctl=ops;else if(n==1)frame=ops;else image=ops;return 0; }
int rw4_host_unregister(const char *path){(void)path;removals++;return 0;}
int rw4_runtime_run(void (*body)(void *),void *arg,const char *path,unsigned budget)
{ (void)path;(void)budget;body(arg);return 0; }
const struct rw4_runtime_stats *rw4_runtime_stats(void){return &stats;}
_Noreturn void rw4_exit(int code){(void)code;__builtin_trap();}
void rw4_game_body(void *arg){(void)arg;}
void *memcpy(void *restrict dst,const void *restrict src,size_t n)
{ unsigned char *d=dst;const unsigned char *s=src;for(size_t i=0;i<n;i++)d[i]=s[i];return dst; }
void *memset(void *dst,int value,size_t n)
{ unsigned char *d=dst;for(size_t i=0;i<n;i++)d[i]=(unsigned char)value;return dst; }
static uint32_t pixels[RW4_FRAME_W*RW4_FRAME_H];
static unsigned char packet[16],buffer[128];
static unsigned checks;
#define CHECK(x) do{checks++;if(!(x)){host_printf("RW4_TRANSPORT_R272: failed=%u\n",checks);return -1;}}while(0)
static void word(unsigned char *p,uint32_t v){for(unsigned i=0;i<4;i++)p[i]=(unsigned char)(v>>(8*i));}
static int command(unsigned seq,unsigned op,unsigned value)
{ word(packet,RW4_CONTROL_MAGIC);word(packet+4,seq);word(packet+8,op);word(packet+12,value);return ctl->write(NULL,(const char *)packet,16); }
static uint32_t read_word(unsigned at){return buffer[at]|((uint32_t)buffer[at+1]<<8)|((uint32_t)buffer[at+2]<<16)|((uint32_t)buffer[at+3]<<24);}
extern int rw4_doom_device_init(struct rw4_module_info *);
int rw4_transport_probe_init(void *unused)
{
    (void)unused;struct rw4_module_info info={0};
    CHECK(rw4_doom_device_init(&info)==-8&&registrations==0&&ctl==NULL&&frame==NULL&&image==NULL);
    validation_failure=0;
    registration_failure=1;
    CHECK(rw4_doom_device_init(&info)==-12&&registrations==3&&removals==2&&image==NULL&&info.uninit==NULL);
    registrations=removals=registration_failure=0;ctl=frame=NULL;
    CHECK(rw4_doom_device_init(&info)==0&&registrations==3&&ctl&&frame&&image&&image->seek&&info.uninit);
    CHECK(ctl->open(NULL)==0);CHECK(ctl->open(NULL)==-16);
    CHECK(ctl->read(NULL,(char *)buffer,128)==128&&read_word(0)==RW4_CONTROL_MAGIC);
    CHECK(ctl->read(NULL,(char *)buffer,1)==0);CHECK(info.uninit(NULL)==-16&&removals==0);
    CHECK(command(1,7,0)==-16&&cache_drops==0); /* No UI owner before START. */
    CHECK(command(1,1,0)==16&&saved_worker&&stack_size==32768);
    CHECK(command(1,1,0)==-22);CHECK(command(2,1,0)==-16);
    rw4_game_ready();int down=0;unsigned char key=0;
    CHECK(command(2,2,1)==16);CHECK(rw4_game_key(&down,&key)==1&&down==1&&key==0xad);
    CHECK(rw4_game_key(&down,&key)==0);
    CHECK(command(3,2,2)==16);CHECK(rw4_game_key(&down,&key)==1&&down==0&&key==0xad);
    CHECK(rw4_game_key(&down,&key)==1&&down==1&&key==0xac);
    CHECK(command(4,3,0)==16&&rw4_game_paused());rw4_game_pause_ack();
    CHECK(rw4_game_key(&down,&key)==1&&down==0&&key==0xac);
    CHECK(command(5,6,0)==16&&!rw4_game_paused());CHECK(command(6,2,6)==-22);
    CHECK(command(6,2,8)==16);CHECK(rw4_game_key(&down,&key)==1&&down==1&&key==0xa3);
    for(unsigned i=0;i<RW4_FRAME_W*RW4_FRAME_H;i++)pixels[i]=0x00ff0000;
    rw4_game_frame(pixels,1);rw4_game_frame(pixels,2);rw4_game_frame(pixels,3);
    CHECK(frame->open(NULL)==0);CHECK(frame->open(NULL)==-16);
    CHECK(frame->read(NULL,(char *)buffer,34)==34&&read_word(0)==RW4_FRAME_MAGIC&&read_word(8)==320&&read_word(12)==200&&buffer[32]==0&&buffer[33]==0xf8);
    unsigned remaining=RW4_FRAME_W*RW4_FRAME_H*2u-2u;
    while(remaining){unsigned n=remaining>sizeof(buffer)?sizeof(buffer):remaining;CHECK(frame->read(NULL,(char *)buffer,n)==(int)n);remaining-=n;}
    CHECK(frame->read(NULL,(char *)buffer,1)==0);CHECK(info.uninit(NULL)==-16);
    CHECK(frame->close(NULL)==0);CHECK(frame->close(NULL)==-22);
    struct rw4_device_file *img=(struct rw4_device_file *)image_cookie,*other=(struct rw4_device_file *)other_cookie;
    for(unsigned i=0;i<sizeof(image_cookie);i++)image_cookie[i]=0xa5;
    CHECK(image->open(NULL)==-22);CHECK(image->open(img)==0);CHECK(image->open(other)==-16);
    CHECK(image->read(other,(char *)buffer,4)==-22&&image->close(other)==-22);
    for(unsigned i=0;i<sizeof(image_cookie);i++)if(i<20||i>=24)CHECK(image_cookie[i]==(i>=8&&i<16?0:0xa5));
    CHECK(image->read(img,(char *)buffer,4)==4&&read_word(0)==0x19050004u);
    CHECK(image_cookie[8]==4&&image_cookie[9]==0);
    CHECK(image->close(img)==0); /* Info-only open did not consume red frame. */
    CHECK(image->open(img)==0&&image->read(img,(char *)buffer,8)==8&&read_word(4)==0xffff0000u);
    for(unsigned i=0;i<RW4_FRAME_W*RW4_FRAME_H;i++)pixels[i]=0x000000ff;
    rw4_game_frame(pixels,4);
    CHECK(image->seek(img,4,0)==4&&image->read(img,(char *)buffer,4)==4&&read_word(0)==0xffff0000u);
    CHECK(image->seek(img,INT64_MAX,1)==-22&&image_cookie[8]==8);
    CHECK(image->seek(img,INT64_MIN,1)==-22&&image_cookie[8]==8);
    CHECK(image->seek(other,4,0)==-22);
    CHECK(rw4_game_image_release()==-16);
    CHECK(image->close(img)==0&&image->close(img)==-22);
    CHECK(image->open(img)==0&&image->read(img,(char *)buffer,8)==8&&read_word(4)==0xffff0000u);
    CHECK(image->close(img)==0);CHECK(rw4_game_image_release()==0);
    CHECK(image->open(img)==0&&image->read(img,(char *)buffer,8)==8&&read_word(4)==0xff0000ffu);
    CHECK(frame->open(NULL)==-11);CHECK(image->close(img)==0);CHECK(rw4_game_image_release()==0);
    CHECK(image->open(img)==0&&image->read(img,(char *)buffer,4)==4);
    CHECK(image->read(img,(char *)buffer,1)==-11); /* No ready pixels yet. */
    CHECK(image->seek(img,-1,2)==RW4_IMAGE_BYTES-1);
    for(unsigned i=0;i<RW4_FRAME_W*RW4_FRAME_H;i++)pixels[i]=0x0000ff00;
    rw4_game_frame(pixels,5);
    CHECK(image->read(img,(char *)buffer,2)==1&&buffer[0]==255);
    CHECK(image->read(img,(char *)buffer,1)==0);
    CHECK(image->seek(img,4,0)==4&&image->read(img,(char *)buffer,4)==4&&read_word(0)==0xff00ff00u);
    for(unsigned i=0;i<sizeof(image_cookie);i++)if(i<8||(i>=16&&i<20)||i>=24)CHECK(image_cookie[i]==0xa5);
    owner_token=18;CHECK(command(7,7,0)==-1&&cache_drops==0);owner_token=17;
    CHECK(command(7,7,0)==-16&&cache_drops==1); /* Still an open image reader. */
    CHECK(command(7,4,0)==16&&rw4_game_stopping());CHECK(command(8,5,0)==-16);
    CHECK(saved_worker(NULL)==NULL);CHECK(command(8,5,0)==-16&&joins==0);
    CHECK(image->close(img)==0);CHECK(command(8,5,0)==-16&&joins==0);
    CHECK(command(8,7,0)==16&&cache_drops==2);CHECK(command(9,5,0)==16&&joins==1);
    CHECK(ctl->read(NULL,(char *)buffer,128)==128&&read_word(20)==1&&read_word(24)==1&&read_word(36)==4&&read_word(40)==1&&read_word(44)==0&&read_word(48)==0);
    CHECK(ctl->close(NULL)==0);CHECK(ctl->close(NULL)==-22);
    CHECK(image->open(img)==0);CHECK(info.uninit(NULL)==-16&&removals==0);CHECK(image->close(img)==0);
    CHECK(info.uninit(NULL)==0&&removals==3);CHECK(ctl->open(NULL)==-16&&frame->open(NULL)==-16&&image->open(img)==-16);
    host_printf("RW4_TRANSPORT_R272: passed=1 checks=%u\n",checks);return 0;
}
