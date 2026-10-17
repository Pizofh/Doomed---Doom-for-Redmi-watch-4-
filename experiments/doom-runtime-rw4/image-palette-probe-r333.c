/* Real S3 VFS/stdio; producer and thread lifecycle are deterministic stubs.
 * No firmware decoder, real worker thread or physical device is executed. */
static unsigned char full_png[RW4_IMAGE_BYTES];
static uint32_t diag[32];
static unsigned sequence;
static uint32_t full_hash(const unsigned char *b,unsigned n)
{uint32_t h=2166136261u;for(unsigned i=0;i<n;i++)h=(h^b[i])*16777619u;return h;}
static void golden_pixels(void)
{for(unsigned i=0;i<64000;i++){unsigned v=(((i%256u)*97u)^0xa55au)&65535u,r=v>>11,g=(v>>5)&63,b=v&31;pixels[i]=(((r<<3)|(r>>2))<<16)|(((g<<2)|(g>>4))<<8)|((b<<3)|(b>>2));}}
static int command(unsigned op)
{
 int (*open_fn)(struct rw4_device_file *)=(void *)tables[0][0];
 int (*close_fn)(struct rw4_device_file *)=(void *)tables[0][1];
 int (*write_fn)(struct rw4_device_file *,const char *,unsigned)=(void *)tables[0][3];
 uint32_t cmd[4]={RW4_CONTROL_MAGIC,sequence+1,op,0};
 if(open_fn(NULL))return -1000;
 int rc=write_fn(NULL,(const char *)cmd,16);
 if(close_fn(NULL))return -1001;
 if(rc==16)sequence++;
 return rc;
}
static int snapshot(void)
{
 void *f=host_fopen("/dev/rw4doomctl","rb");CHECK(f!=NULL);
 CHECK(host_setvbuf(f,NULL,2,0)==0);CHECK(host_fread(diag,1,128,f)==128);
 CHECK(host_fclose(f)==0);CHECK(diag[0]==RW4_CONTROL_MAGIC&&diag[1]==2&&diag[2]==sequence);
 return 1;
}
#define D(n) diag[20+(n)]
int rw4_image_vfs_probe_init(struct rw4_module_info *info)
{
 CHECK(rw4_doom_device_init(info)==0&&registered==3&&info->uninit);

 CHECK(command(8)==-16);CHECK(command(9)==-16);CHECK(command(1)==16);
 CHECK(command(9)==-11&&sequence==1);CHECK(command(8)==-11&&sequence==1);CHECK(snapshot());CHECK(D(0)==0&&D(4)==0&&D(5)==0);
 golden_pixels();rw4_game_frame(pixels,1);CHECK(command(9)==16);CHECK(command(8)==16);
 CHECK(command(8)==-16);CHECK(command(9)==-11); /* Never overwrite an existing presentation. */
 void *f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fseek(f,0,2)==0&&host_ftell(f)==RW4_IMAGE_BYTES);
 CHECK(host_fseek(f,0,0)==0);
 CHECK(host_fread(full_png,1,RW4_IMAGE_BYTES,f)==RW4_IMAGE_BYTES);
 CHECK(full_hash(full_png,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);
 extern int host_lv_image_decoder_get_info(const void *,void *);
 extern int host_lv_image_decoder_open(void *,const void *,const void *);
 extern void host_lv_image_decoder_close(void *);
 uint32_t header[8]={0};CHECK(host_lv_image_decoder_get_info("/dev/rw4doomimage.png",header)==1);
 CHECK((header[1]&65535u)==320&&(header[1]>>16)==200);
 uint32_t dsc[64] __attribute__((aligned(8)))={0};unsigned char args[16]={0,0,1,0};
 int decoded=host_lv_image_decoder_open(dsc,"/dev/rw4doomimage.png",args);
 if(decoded==1)host_lv_image_decoder_close(dsc);CHECK(decoded==1);
 CHECK(rw4_game_image_release()==-16);CHECK(host_fclose(f)==0);
 /* Reopened readers see identical leased pixels despite newer production. */
 for(unsigned cycle=0;cycle<4;cycle++){
   void *a=host_fopen("/dev/rw4doomimage.png","rb");CHECK(a!=NULL);
   void *b=host_fopen("/dev/rw4doomimage.png","rb");CHECK(b!=NULL);
   CHECK(host_fread(full_png,1,4,a)==4);CHECK(host_fseek(b,0,2)==0);
   CHECK(host_fseek(a,0,0)==0&&host_fread(full_png,1,RW4_IMAGE_BYTES,a)==RW4_IMAGE_BYTES);
   CHECK(full_hash(full_png,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);
   CHECK(host_fclose(a)==0);CHECK(command(8)==-16);CHECK(host_fclose(b)==0);
 }
 CHECK(rw4_game_image_release()==0);CHECK(snapshot());CHECK(diag[9]==1);
 /* This is the observed failure window: historical produced>0, no READY.
  * Candidate waits at control8; it does not create/read an Image or add refs. */
 unsigned reads=D(4),opens=D(1);
 for(unsigned i=0;i<5;i++){CHECK(command(9)==-11);CHECK(command(8)==-11);CHECK(snapshot());CHECK(D(4)==reads&&D(1)==opens&&D(0)==0);}
 rw4_game_frame(pixels,2);rw4_game_frame(pixels,3);CHECK(command(9)==16);
 CHECK(command(8)==16);f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fread(full_png,1,RW4_IMAGE_BYTES,f)==RW4_IMAGE_BYTES);
 CHECK(full_hash(full_png,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);CHECK(host_fclose(f)==0);
 CHECK(command(9)==16);CHECK(rw4_game_image_release()==0);CHECK(command(9)==16);CHECK(command(8)==16);
 f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fread(full_png,1,RW4_IMAGE_BYTES,f)==RW4_IMAGE_BYTES);
 CHECK(full_hash(full_png,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);CHECK(host_fclose(f)==0);
 CHECK(rw4_game_image_release()==0);CHECK(command(8)==-11);
 test_owner=18;CHECK(command(9)==-1);CHECK(command(8)==-1);test_owner=17;
 CHECK(snapshot());CHECK(D(0)==0&&D(1)==D(2)&&D(5)==0&&D(6)==0);
 CHECK(command(4)==16);CHECK(command(9)==-16);CHECK(command(8)==-16);CHECK(command(5)==16);

 host_printf("RW4_IMAGE_VFS_R274: passed=1 checks=%u realVfs=1\n",checks);return 0;
}
