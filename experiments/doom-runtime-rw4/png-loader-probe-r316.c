/* Own reconstruction of the observed file-I/O sequence, not firmware code.
 * Inject one EIO to model its missing-close branch. Only the S3 fixture's
 * saved handle is closed for cleanup; no physical FD or module is touched. */
static unsigned char full_png[RW4_IMAGE_BYTES];
unsigned rw4_test_fail_fullread;
static uint32_t full_hash(const unsigned char *b,unsigned n)
{uint32_t h=2166136261u;for(unsigned i=0;i<n;i++)h=(h^b[i])*16777619u;return h;}
static void golden_pixels(void)
{for(unsigned i=0;i<64000;i++){unsigned v=((i*97u)^0xa55au)&65535u,r=v>>11,g=(v>>5)&63,b=v&31;pixels[i]=(((r<<3)|(r>>2))<<16)|(((g<<2)|(g>>4))<<8)|((b<<3)|(b>>2));}}
int rw4_image_vfs_probe_init(struct rw4_module_info *info)
{
 CHECK(rw4_doom_device_init(info)==0&&registered==3&&info->uninit);
 golden_pixels();rw4_game_frame(pixels,1);
 void *f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fseek(f,0,2)==0);long size=host_ftell(f);CHECK(size==RW4_IMAGE_BYTES);CHECK(host_fclose(f)==0);
 f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 CHECK(host_fread(full_png,1,(unsigned)size,f)==(unsigned)size);
 CHECK(full_hash(full_png,(unsigned)size)==__EXPECTED_FNV__u);
 CHECK(host_ftell(f)==size);CHECK(host_fclose(f)==0);CHECK(rw4_game_image_release()==0);
 golden_pixels();rw4_game_frame(pixels,2);
 f=host_fopen("/dev/rw4doomimage.png","rb");CHECK(f!=NULL);
 rw4_test_fail_fullread=1;
 CHECK(host_fread(full_png,1,RW4_IMAGE_BYTES,f)!=RW4_IMAGE_BYTES);
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
 CHECK(info_result==0);
 CHECK(host_fclose(held)==0);CHECK(rw4_game_image_release()==0);

 host_printf("RW4_IMAGE_VFS_R274: passed=1 checks=%u realVfs=1\n",checks);return 0;
}
