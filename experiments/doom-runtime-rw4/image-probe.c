/* SPDX-License-Identifier: GPL-2.0-or-later
 * S3 CPU test of the pure candidate RW4 codec. Does NOT call S3's decoder:
 * S3 uses a different header and passing RW4 bytes to it would be invalid.
 */
#include "image-view.h"
#include <stddef.h>
extern int host_printf(const char *,...);
static unsigned char pixels[RW4_IMAGE_WIDTH*RW4_IMAGE_HEIGHT*2u];
static char bytes[257];
static unsigned checks;
#define CHECK(c) do{checks++;if(!(c)){host_printf("RW4_IMAGE_R274: failed=%u\n",checks);return -1;}}while(0)
int rw4_image_probe_init(void *unused)
{
    (void)unused;unsigned position=0;
    CHECK(rw4_image_read(NULL,0,bytes,4)==4);
    CHECK((unsigned char)bytes[0]==4&&(unsigned char)bytes[1]==0&&(unsigned char)bytes[2]==5&&(unsigned char)bytes[3]==25);
    CHECK(rw4_image_read(NULL,3,bytes,2)==-11);
    CHECK(rw4_image_read(NULL,4,bytes,1)==-11);
    CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES,NULL,0)==0);
    CHECK(rw4_image_read(NULL,RW4_IMAGE_BYTES,bytes,1)==0);
    CHECK(rw4_image_read(pixels,RW4_IMAGE_BYTES+1,bytes,1)==-22);
    CHECK(rw4_image_read(pixels,0,NULL,1)==-22);
    CHECK(rw4_image_seek(&position,4,0)==4&&position==4);
    CHECK(rw4_image_seek(&position,-1,1)==3&&position==3);
    CHECK(rw4_image_seek(&position,-1,2)==RW4_IMAGE_BYTES-1&&position==RW4_IMAGE_BYTES-1);
    CHECK(rw4_image_seek(&position,INT64_MAX,1)==-22&&position==RW4_IMAGE_BYTES-1);
    CHECK(rw4_image_seek(&position,INT64_MIN,1)==-22&&position==RW4_IMAGE_BYTES-1);
    CHECK(rw4_image_seek(&position,1,2)==-22);
    CHECK(rw4_image_seek(&position,0,3)==-22);
    CHECK(rw4_image_seek(NULL,0,0)==-22);
    const unsigned colors[]={0,0xffff,0xf800,0x07e0,0x001f};
    const unsigned char expected[][4]={{0,0,0,255},{255,255,255,255},{0,0,255,255},{0,255,0,255},{255,0,0,255}};
    for(unsigned c=0;c<5;c++){
        pixels[0]=(unsigned char)colors[c];pixels[1]=(unsigned char)(colors[c]>>8);
        CHECK(rw4_image_read(pixels,4,bytes,4)==4);
        for(unsigned j=0;j<4;j++)CHECK((unsigned char)bytes[j]==expected[c][j]);
        CHECK(rw4_image_read(pixels,5,bytes,3)==3);
        for(unsigned j=0;j<3;j++)CHECK((unsigned char)bytes[j]==expected[c][j+1]);
    }
    for(unsigned i=0;i<RW4_IMAGE_WIDTH*RW4_IMAGE_HEIGHT;i++){
        unsigned v=((i*97u)^0xa55au)&65535u;pixels[2*i]=(unsigned char)v;pixels[2*i+1]=(unsigned char)(v>>8);
    }
    uint32_t hash=UINT32_C(2166136261);position=0;
    while(position<RW4_IMAGE_BYTES){
        int n=rw4_image_read(pixels,position,bytes,sizeof(bytes));CHECK(n>0&&n<=(int)sizeof(bytes));
        for(int j=0;j<n;j++)hash=(hash^(unsigned char)bytes[j])*UINT32_C(16777619);
        position+=(unsigned)n;
    }
    CHECK(position==RW4_IMAGE_BYTES&&hash==EXPECTED_FNV);
    CHECK(rw4_image_read(pixels,position,bytes,sizeof(bytes))==0);
    host_printf("RW4_IMAGE_R274: passed=1 checks=%u bytes=%u fnv=%08lx\n",checks,position,(unsigned long)hash);return 0;
}
