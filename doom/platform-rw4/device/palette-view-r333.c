/* SPDX-License-Identifier: GPL-2.0-or-later
 * Indexed PNG over an immutable RGB565 lease, no indexed/encoded frame copy.
 * Open-addressed 512-entry map + 256 RGB palette entries, bounded probing.
 */
#include "palette-view-r333.h"
static const unsigned char *prepared;
static uint32_t table32[256],colors[512],adler,idat_crc,palette_crc;
static unsigned char palette[768];
static unsigned initialized,color_count;
static unsigned be(uint32_t n,unsigned at){return(n>>(24u-at*8u))&255u;}
static uint32_t crc_byte(uint32_t c,unsigned b){return(c>>8)^table32[(c^b)&255u];}
static unsigned rgb565(const unsigned char *p){return p[0]|((unsigned)p[1]<<8);}
static int color_index(unsigned color,unsigned create)
{
    unsigned at=(color*UINT32_C(2654435761))>>23;
    for(unsigned i=0;i<512;i++,at=(at+1u)&511u){
        uint32_t entry=colors[at];
        if(entry&UINT32_C(0x01000000)){
            if((entry&65535u)==color)return(int)((entry>>16)&255u);
        }else{
            if(!create)return -22;
            if(color_count==256u)return -75;
            unsigned index=color_count++,r=color>>11,g=(color>>5)&63u,b=color&31u;
            palette[3u*index]=(unsigned char)((r<<3)|(r>>2));
            palette[3u*index+1]=(unsigned char)((g<<2)|(g>>4));
            palette[3u*index+2]=(unsigned char)((b<<3)|(b>>2));
            colors[at]=UINT32_C(0x01000000)|(index<<16)|color;return(int)index;
        }
    }
    return -75;
}
static void checksum(unsigned value,uint32_t *a,uint32_t *b,uint32_t *c)
{
    *a+=value;if(*a>=65521u)*a-=65521u;
    *b+=*a;if(*b>=65521u)*b-=65521u;
    *c=crc_byte(*c,value);
}
int rw4_image_prepare(const unsigned char *p)
{
    prepared=0;if(!p)return -22;
    if(!initialized){
        for(unsigned i=0;i<256;i++){
            uint32_t c=i;for(unsigned j=0;j<8;j++)c=(c>>1)^((c&1u)?UINT32_C(0xedb88320):0u);
            table32[i]=c;
        }
        initialized=1;
    }
    for(unsigned i=0;i<512;i++)colors[i]=0;
    for(unsigned i=0;i<768;i++)palette[i]=0;
    color_count=0;
    uint32_t a=1,b=0,c=UINT32_C(0xffffffff);
    const unsigned char type[4]={'I','D','A','T'},block[5]={1,200,250,55,5};
    for(unsigned i=0;i<4;i++)c=crc_byte(c,type[i]);
    c=crc_byte(crc_byte(c,0x78),1);
    for(unsigned i=0;i<5;i++)c=crc_byte(c,block[i]);
    for(unsigned y=0;y<200;y++){
        checksum(0,&a,&b,&c);
        for(unsigned x=0;x<320;x++,p+=2){
            int index=color_index(rgb565(p),1);if(index<0)return index;
            checksum((unsigned)index,&a,&b,&c);
        }
    }
    adler=(b<<16)|a;
    for(unsigned i=0;i<4;i++)c=crc_byte(c,be(adler,i));
    idat_crc=c^UINT32_C(0xffffffff);
    c=UINT32_C(0xffffffff);const unsigned char plte[4]={'P','L','T','E'};
    for(unsigned i=0;i<4;i++)c=crc_byte(c,plte[i]);
    for(unsigned i=0;i<768;i++)c=crc_byte(c,palette[i]);
    palette_crc=c^UINT32_C(0xffffffff);prepared=p-128000u;return 0;
}
int rw4_image_read(const unsigned char *p,unsigned position,char *dst,unsigned count)
{
    static const unsigned char header[33]={137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,
        0,0,1,64,0,0,0,200,8,3,0,0,0,174,218,200,153};
    static const unsigned char plte[4]={'P','L','T','E'},idat[4]={'I','D','A','T'};
    static const unsigned char block[5]={1,200,250,55,5};
    static const unsigned char end[12]={0,0,0,0,73,69,78,68,174,66,96,130};
    if(position>RW4_IMAGE_BYTES||(!dst&&count))return -22;
    if(count>RW4_IMAGE_BYTES-position)count=RW4_IMAGE_BYTES-position;
    if(count&&position+count>33u&&(!p||p!=prepared))return -11;
    unsigned i=0;
    while(i<count){
        unsigned at=position+i,value;
        if(at>=828u&&at<65028u){
            unsigned scan=at-828u,row=scan/321u,col=scan%321u,n=count-i;
            if(n>65028u-at)n=65028u-at;
            const unsigned char *pixel=p+row*640u+(col?2u*(col-1u):0u);
            for(unsigned j=0;j<n;j++){
                int index=0;if(col){index=color_index(rgb565(pixel),0);if(index<0)return index;pixel+=2;}
                dst[i+j]=(char)index;if(++col==321u)col=0;
            }
            i+=n;continue;
        }
        if(at<33u)value=header[at];
        else if(at<37u)value=be(768,at-33u);
        else if(at<41u)value=plte[at-37u];
        else if(at<809u)value=palette[at-41u];
        else if(at<813u)value=be(palette_crc,at-809u);
        else if(at<817u)value=be(64211,at-813u);
        else if(at<821u)value=idat[at-817u];
        else if(at<823u)value=at==821u?0x78u:1u;
        else if(at<828u)value=block[at-823u];
        else if(at<65032u)value=be(adler,at-65028u);
        else if(at<65036u)value=be(idat_crc,at-65032u);
        else value=end[at-65036u];
        dst[i++]=(char)value;
    }
    return(int)count;
}
int64_t rw4_image_seek(unsigned *position,int64_t offset,int origin)
{
    if(!position||*position>RW4_IMAGE_BYTES||origin<0||origin>2)return -22;
    int64_t base=origin==0?0:origin==1?*position:RW4_IMAGE_BYTES;
    if(offset< -base||offset>(int64_t)RW4_IMAGE_BYTES-base)return -22;
    *position=(unsigned)(base+offset);return *position;
}
