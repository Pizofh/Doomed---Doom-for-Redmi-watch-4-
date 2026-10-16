/* Own reconstruction of the observed file-I/O sequence, not firmware code.
 * Inject one EIO to model its missing-close branch. Only the S3 fixture's
 * saved handle is closed for cleanup; no physical FD or module is touched. */
static unsigned char full_png[RW4_IMAGE_BYTES];
unsigned rw4_test_fail_fullread;
static uint32_t full_hash(const unsigned char *b,unsigned n)
{uint32_t h=2166136261u;for(unsigned i=0;i<n;i++)h=(h^b[i])*16777619u;return h;}
static void golden_pixels(void)
{for(unsigned i=0;i<64000;i++){unsigned v=((i*97u)^0xa55au)&65535u,r=v>>11,g=(v>>5)&63,b=v&31;pixels[i]=(((r<<3)|(r>>2))<<16)|(((g<<2)|(g>>4))<<8)|((b<<3)|(b>>2));}}
static uint32_t diag[32];
static int snapshot(void)
{
 void *ctl=host_fopen("/dev/rw4doomctl","rb");CHECK(ctl!=NULL);
 CHECK(host_setvbuf(ctl,NULL,2,0)==0);
 CHECK(host_fread(diag,1,128,ctl)==128);
 unsigned char tail;CHECK(host_fread(&tail,1,1,ctl)==0);
 CHECK(host_fclose(ctl)==0);CHECK(diag[0]==RW4_CONTROL_MAGIC&&diag[1]==2);
 return 1;
}
#define D(n) diag[20+(n)]
int rw4_image_vfs_probe_init(struct rw4_module_info *info)
{
 CHECK(rw4_doom_device_init(info)==0&&registered==3&&info->uninit); CHECK(snapshot());for(unsigned i=0;i<12;i++)CHECK(D(i)==0);
 golden_pixels();rw4_game_frame(pixels,1);
 void *f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fseek(f,0,2)==0);long size=host_ftell(f);CHECK(size==RW4_IMAGE_BYTES);CHECK(host_fclose(f)==0);
 f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fread(full_png,1,(unsigned)size,f)==(unsigned)size);
 CHECK(full_hash(full_png,(unsigned)size)==__EXPECTED_FNV__u);
 CHECK(host_ftell(f)==size);CHECK(host_fclose(f)==0);CHECK(rw4_game_image_release()==0); CHECK(snapshot());CHECK(D(0)==0&&D(1)==2&&D(2)==2&&D(3)==0);CHECK(D(4)>0&&D(5)==0&&D(6)==0&&D(7)==0&&D(8)==0);CHECK(D(9)>0&&D(10)==0&&D(11)==RW4_IMAGE_BYTES);
  golden_pixels();rw4_game_frame(pixels,4);
 void *a=host_fopen("/dev/rw4doomimage.png","rb");CHECK(a!=NULL);
 void *b=host_fopen("/dev/rw4doomimage.png","rb");CHECK(b!=NULL);
 CHECK(host_fread(full_png,1,43,a)==43);CHECK(host_ftell(a)==43);
 CHECK(host_fread(full_png,1,8,b)==8&&full_png[0]==137);CHECK(host_ftell(b)==8&&host_ftell(a)==43);
 CHECK(host_fseek(a,-4,2)==0&&host_ftell(a)==RW4_IMAGE_BYTES-4);
 CHECK(host_fseek(b,3,1)==0&&host_ftell(b)==11&&host_ftell(a)==RW4_IMAGE_BYTES-4);
 CHECK(host_fseek(b,0,0)==0&&host_fread(full_png,1,RW4_IMAGE_BYTES,b)==RW4_IMAGE_BYTES);
 CHECK(full_hash(full_png,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);
 CHECK(host_fclose(a)==0);CHECK(rw4_game_image_release()==-16);CHECK(snapshot());CHECK(D(0)==1&&D(1)-D(2)==1);CHECK(D(7)==1296&&D(8)==1296&&D(10)==1);
 CHECK(host_fclose(b)==0);CHECK(rw4_game_image_release()==0);
 void *readers[8];for(unsigned i=0;i<8;i++){readers[i]=host_fopen("/dev/rw4doomimage.png","rb");CHECK(readers[i]!=NULL);}
 CHECK(host_fopen("/dev/rw4doomimage.png","rb")==NULL);CHECK(info->uninit(NULL)==-16);
 for(unsigned i=0;i<8;i++)CHECK(host_fclose(readers[i])==0);
 CHECK(rw4_game_image_release()==0);
golden_pixels();rw4_game_frame(pixels,2);
 f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 rw4_test_fail_fullread=1;
 CHECK(host_fread(full_png,1,RW4_IMAGE_BYTES,f)!=RW4_IMAGE_BYTES);CHECK(snapshot());CHECK(D(0)==1&&D(5)>0&&D(8)==773);CHECK(D(7)==1296);
 /* Model the candidate PNG loader error return that omits its file close. */
 CHECK(rw4_game_image_release()==-16);CHECK(info->uninit(NULL)==-16);
 CHECK(host_fclose(f)==0);rw4_test_fail_fullread=0;
 CHECK(rw4_game_image_release()==0);
 golden_pixels();rw4_game_frame(pixels,3);
 f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 unsigned at=0;while(at<RW4_IMAGE_BYTES){unsigned n=RW4_IMAGE_BYTES-at;if(n>4096)n=4096;CHECK(host_fread(full_png+at,1,n,f)==n);at+=n;}
 CHECK(full_hash(full_png,RW4_IMAGE_BYTES)==__EXPECTED_FNV__u);
 CHECK(host_fclose(f)==0);CHECK(rw4_game_image_release()==0);
/* Exercise S3's actual LVGL info call while another real VFS reader is open. */
 golden_pixels();rw4_game_frame(pixels,5);
 void *held=host_fopen("/dev/rw4doomimage.png","rb");CHECK(held!=NULL);
 uint32_t header[8]={0};
 extern int host_lv_image_decoder_get_info(const void *,void *);
 int info_result=host_lv_image_decoder_get_info("/dev/rw4doomimage.png",header);
 CHECK(info_result==1);
 CHECK(host_fclose(held)==0);CHECK(rw4_game_image_release()==0);

 /* START owner enforcement without starting a real thread: attr_init stub
  * rejects START after recording owner, then leaves the fake thread joined. */
 int (*control_open_fn)(struct rw4_device_file *)=(void *)tables[0][0];
 int (*control_close_fn)(struct rw4_device_file *)=(void *)tables[0][1];
 int (*control_write_fn)(struct rw4_device_file *,const char *,unsigned)=(void *)tables[0][3];
 uint32_t start_cmd[4]={RW4_CONTROL_MAGIC,1,1,0};
 CHECK(control_open_fn(NULL)==0);CHECK(control_write_fn(NULL,(const char *)start_cmd,16)==-5);CHECK(control_close_fn(NULL)==0);
 test_owner=18;CHECK(host_fopen("/dev/rw4doomimage.png","rb")==NULL);CHECK(snapshot());CHECK(D(8)==257);
 test_owner=17;f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 test_owner=18;CHECK(host_fread(full_png,1,8,f)==0);CHECK(snapshot());CHECK(D(8)==769);CHECK(host_fseek(f,0,0)!=0);CHECK(snapshot());CHECK(D(6)>0&&D(8)==1025);
 test_owner=17;CHECK(host_fclose(f)==0);CHECK(rw4_game_image_release()==0);
 unsigned char fake_file[24]={0};int (*bad_close)(struct rw4_device_file *)=(void *)tables[2][1];CHECK(bad_close((void *)fake_file)==-22);CHECK(snapshot());CHECK(D(3)==1&&D(8)==534&&D(0)==0&&D(1)==D(2)&&D(7)==1296);
 host_printf("RW4_IMAGE_VFS_R274: passed=1 checks=%u realVfs=1\n",checks);return 0;
}

