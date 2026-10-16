/* Exercise S3's actual LVGL info call while another real VFS reader is open. */
 golden_pixels();rw4_game_frame(pixels,5);
 void *held=host_fopen("/dev/rw4doomimage.png","rb");CHECK(held!=NULL);
 uint32_t header[8]={0};
 extern int host_lv_image_decoder_get_info(const void *,void *);
 int info_result=host_lv_image_decoder_get_info("/dev/rw4doomimage.png",header);
 CHECK(info_result==__EXPECT_INFO__);
 CHECK(host_fclose(held)==0);CHECK(rw4_game_image_release()==0);
