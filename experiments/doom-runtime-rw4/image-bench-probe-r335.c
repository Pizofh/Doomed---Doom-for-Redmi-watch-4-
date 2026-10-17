/* S3 real VFS/decoder; deterministic clock, scheduler and worker substitutes. */
#include "profile-r335.h"
static uint32_t diag[32];static unsigned sequence;
static unsigned char png_bytes[RW4_IMAGE_BYTES];
static int command(unsigned op)
{
 int (*open_fn)(struct rw4_device_file *)=(void *)tables[0][0];
 int (*close_fn)(struct rw4_device_file *)=(void *)tables[0][1];
 int (*write_fn)(struct rw4_device_file *,const char *,unsigned)=(void *)tables[0][3];
 uint32_t cmd[4]={RW4_CONTROL_MAGIC,sequence+1,op,0};
 if(open_fn(NULL))return -1000;int rc=write_fn(NULL,(const char *)cmd,16);
 if(close_fn(NULL))return -1001;if(rc==16)sequence++;return rc;
}
static int snapshot(void)
{
 void *f=host_fopen("/dev/rw4doomctl","rb");CHECK(f!=NULL);
 CHECK(host_setvbuf(f,NULL,2,0)==0);CHECK(host_fread(diag,1,128,f)==128);
 CHECK(host_fclose(f)==0);CHECK(diag[0]==RW4_CONTROL_MAGIC&&diag[1]==3&&diag[2]==sequence);return 1;
}
static uint32_t full_hash(const unsigned char *b,unsigned n)
{uint32_t h=2166136261u;for(unsigned i=0;i<n;i++)h=(h^b[i])*16777619u;return h;}
int rw4_image_vfs_probe_init(struct rw4_module_info *info)
{
 CHECK(rw4_doom_device_init(info)==0&&registered==3&&info->uninit);
 CHECK(snapshot());CHECK(diag[20]==0&&diag[31]==0);
 test_sleep_fail=1;CHECK(rw4_game_calibrate()==-5);CHECK(snapshot());CHECK(diag[31]==0);
 test_sleep_fail=0;test_sleep_calls=0;test_sleep_us=0;
 CHECK(rw4_game_calibrate()==0);CHECK(test_sleep_calls==3&&test_sleep_us==600000);
 CHECK(snapshot());CHECK(diag[31]==2001);CHECK(rw4_game_calibrate()==-16);
 CHECK(command(8)==-16);CHECK(command(1)==16&&test_worker!=NULL);
 CHECK(snapshot());CHECK(diag[20]==0&&diag[5]==0);
 rw4_game_ready();rw4_game_tick_cost(50);rw4_game_sleep_cost(20);
 uint32_t metric[12]={123,7};rw4_game_metrics(metric);
 CHECK(snapshot());CHECK(diag[20]>0&&diag[25]==50&&diag[26]==20&&diag[27]==1&&diag[29]==123&&diag[30]==7);
 for(unsigned i=0;i<64000;i++){unsigned v=(((i%256u)*97u)^0xa55au)&65535u,r=v>>11,g=(v>>5)&63,b=v&31;pixels[i]=(((r<<3)|(r>>2))<<16)|(((g<<2)|(g>>4))<<8)|((b<<3)|(b>>2));}
 CHECK(command(9)==-11);CHECK(command(8)==-11);CHECK(snapshot());CHECK(diag[21]==0&&diag[23]==0);
 rw4_game_frame(pixels,1);CHECK(command(9)==16);CHECK(command(8)==16);
 CHECK(snapshot());CHECK(diag[21]>0&&diag[24]>0);
 CHECK(command(8)==-16);CHECK(command(9)==-11);
 for(unsigned i=0;i<3;i++){
 void *a=host_fopen("/dev/rw4doomimage.png","rb"),*b=host_fopen("/dev/rw4doomimage.png","rb");CHECK(a!=NULL&&b!=NULL);
 CHECK(host_fread(png_bytes,1,RW4_IMAGE_BYTES,a)==RW4_IMAGE_BYTES);CHECK(full_hash(png_bytes,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);
 CHECK(host_fseek(b,0,2)==0&&host_ftell(b)==RW4_IMAGE_BYTES);CHECK(host_fseek(b,0,0)==0);
 CHECK(host_fread(png_bytes,1,RW4_IMAGE_BYTES,b)==RW4_IMAGE_BYTES);CHECK(full_hash(png_bytes,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);
 CHECK(rw4_game_image_release()==-16);CHECK(host_fclose(a)==0&&host_fclose(b)==0);
 }
 extern int host_lv_image_decoder_get_info(const void *,void *);
 extern int host_lv_image_decoder_open(void *,const void *,const void *);extern void host_lv_image_decoder_close(void *);
 uint32_t header[8]={0};CHECK(host_lv_image_decoder_get_info("/dev/rw4doomimage.png",header)==1);CHECK((header[1]&65535u)==320&&(header[1]>>16)==200);
 uint32_t dsc[64] __attribute__((aligned(8)))={0};unsigned char args[16]={0,0,1,0};
 CHECK(host_lv_image_decoder_open(dsc,"/dev/rw4doomimage.png",args)==1);host_lv_image_decoder_close(dsc);
 CHECK(snapshot());CHECK(diag[22]>0&&diag[23]>=6u*RW4_IMAGE_BYTES&&diag[28]>0);
 CHECK(info->uninit(NULL)==-16);CHECK(rw4_game_image_release()==0);
 CHECK(snapshot());unsigned reads=diag[23],prepare=diag[21];
 for(unsigned i=0;i<3;i++){CHECK(command(9)==-11&&command(8)==-11);CHECK(snapshot());CHECK(diag[23]==reads&&diag[21]==prepare);}
 test_owner=18;CHECK(command(8)==-1);test_owner=17;
 CHECK(command(4)==16);CHECK(command(5)==-16);CHECK(test_worker(NULL)==NULL);
 CHECK(snapshot());unsigned frozen=diag[20];test_clock+=9999;CHECK(snapshot());CHECK(diag[20]==frozen&&diag[5]==1);
 CHECK(command(8)==-16);CHECK(command(5)==16);
 host_printf("RW4_IMAGE_VFS_R274: passed=1 checks=%u realVfs=1\n",checks);return 0;
}
