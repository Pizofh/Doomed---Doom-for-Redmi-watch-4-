/* SPDX-License-Identifier: GPL-2.0-or-later
 * Read-only image serialization from an already latched RGB565 frame.
 * No allocation, filesystem write, LVGL call or shared firmware object access.
 */
#include "image-view.h"
int rw4_image_read(const unsigned char *rgb565,unsigned position,char *dst,unsigned count)
{
    if(position>RW4_IMAGE_BYTES||(!dst&&count))return -22;
    if(count>RW4_IMAGE_BYTES-position)count=RW4_IMAGE_BYTES-position;
    if(!count)return 0;
    if(position+count>RW4_IMAGE_HEADER_BYTES&&!rgb565)return -11;
#ifdef RW4_IMAGE_S3_TEST
    static const unsigned char header[12]={25,18,0,0,64,1,200,0,128,2,0,0};
    for(unsigned n=0;n<count;n++){
        unsigned at=position+n;
        dst[n]=(char)(at<sizeof(header)?header[at]:rgb565[at-sizeof(header)]);
    }
#else
    const uint32_t header=4u|(RW4_IMAGE_WIDTH<<10)|(RW4_IMAGE_HEIGHT<<21);
    for(unsigned n=0;n<count;n++){
        unsigned at=position+n,value;
        if(at<4u)value=(header>>(at*8))&255u;
        else {
            unsigned pixel=(at-4u)/4u,component=(at-4u)%4u;
            unsigned v=rgb565[pixel*2u]|((unsigned)rgb565[pixel*2u+1u]<<8);
            /* B,G,R,opaque alpha. Bit replication preserves 565 endpoints. */
            if(component==0){v&=31u;value=(v<<3)|(v>>2);}
            else if(component==1){v=(v>>5)&63u;value=(v<<2)|(v>>4);}
            else if(component==2){v=(v>>11)&31u;value=(v<<3)|(v>>2);}
            else value=255u;
        }
        dst[n]=(char)value;
    }
#endif
    return (int)count;
}
int64_t rw4_image_seek(unsigned *position,int64_t offset,int origin)
{
    if(!position||*position>RW4_IMAGE_BYTES||origin<0||origin>2)return -22;
    int64_t base=origin==0?0:origin==1?*position:RW4_IMAGE_BYTES;
    /* Check before addition, including INT64_MIN/MAX. */
    if(offset< -base||offset>(int64_t)RW4_IMAGE_BYTES-base)return -22;
    *position=(unsigned)(base+offset);return *position;
}
