/* SPDX-License-Identifier: GPL-2.0-or-later
 * PNG RGB24, one IDAT/zlib stream, three stored DEFLATE blocks.
 * Serializes directly from an immutable RGB565 frame. Only checksums/table
 * live in RAM; no second encoded frame, new firmware APIs or flash traffic.
 */
#include "png-view.h"
#define SCAN_BYTES 192200u
#define DEFLATE_BYTES (SCAN_BYTES+15u)
#define ZLIB_BYTES (DEFLATE_BYTES+6u)
static const unsigned char *prepared;
static uint32_t table32[256],adler,idat_crc;
static unsigned initialized;
static unsigned be(uint32_t n,unsigned at){return (n>>(24u-at*8u))&255u;}
static uint32_t crc_byte(uint32_t c,unsigned b){return(c>>8)^table32[(c^b)&255u];}
static unsigned scan_byte(const unsigned char *p,unsigned at)
{
    unsigned x=at%961u;if(!x)return 0; /* PNG filter: none. */
    unsigned pixel=(at/961u)*320u+(x-1u)/3u,channel=(x-1u)%3u;
    unsigned v=p[pixel*2u]|((unsigned)p[pixel*2u+1u]<<8);
    if(!channel){v=(v>>11)&31u;return(v<<3)|(v>>2);}
    if(channel==1u){v=(v>>5)&63u;return(v<<2)|(v>>4);}
    v&=31u;return(v<<3)|(v>>2);
}
static unsigned deflate_byte(const unsigned char *p,unsigned at)
{
    unsigned block=at/65540u,inside=at%65540u;
    unsigned length=block==2u?61130u:65535u;
    if(inside==0)return block==2u?1u:0u;
    if(inside<3u)return(length>>((inside-1u)*8u))&255u;
    if(inside<5u)return((65535u-length)>>((inside-3u)*8u))&255u;
    return scan_byte(p,block*65535u+inside-5u);
}
void rw4_image_prepare(const unsigned char *p)
{
    prepared=0;if(!p)return;
    if(!initialized){
        for(unsigned i=0;i<256;i++){
            uint32_t c=i;for(unsigned j=0;j<8;j++)c=(c>>1)^((c&1u)?UINT32_C(0xedb88320):0u);
            table32[i]=c;
        }
        initialized=1;
    }
    uint32_t a=1,b=0,c=UINT32_C(0xffffffff);
    const unsigned char type[4]={'I','D','A','T'};
    for(unsigned i=0;i<4;i++)c=crc_byte(c,type[i]);
    c=crc_byte(crc_byte(c,0x78),1);
    for(unsigned i=0;i<SCAN_BYTES;i++){
        a+=scan_byte(p,i);if(a>=65521u)a-=65521u;
        b+=a;if(b>=65521u)b-=65521u;
    }
    adler=(b<<16)|a;
    for(unsigned i=0;i<DEFLATE_BYTES;i++)c=crc_byte(c,deflate_byte(p,i));
    for(unsigned i=0;i<4;i++)c=crc_byte(c,be(adler,i));
    idat_crc=c^UINT32_C(0xffffffff);prepared=p;
}
int rw4_image_read(const unsigned char *p,unsigned position,char *dst,unsigned count)
{
    static const unsigned char header[33]={137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,
        0,0,1,64,0,0,0,200,8,2,0,0,0,22,102,175,252};
    static const unsigned char type[4]={'I','D','A','T'};
    static const unsigned char end[12]={0,0,0,0,73,69,78,68,174,66,96,130};
    if(position>RW4_IMAGE_BYTES||(!dst&&count))return -22;
    if(count>RW4_IMAGE_BYTES-position)count=RW4_IMAGE_BYTES-position;
    if(count&&position+count>RW4_IMAGE_HEADER_BYTES&&(!p||p!=prepared))return -11;
    for(unsigned i=0;i<count;i++){
        unsigned at=position+i,value;
        if(at<33u)value=header[at];
        else if(at<37u)value=be(ZLIB_BYTES,at-33u);
        else if(at<41u)value=type[at-37u];
        else if(at<43u)value=at==41u?0x78u:1u;
        else if(at<43u+DEFLATE_BYTES)value=deflate_byte(p,at-43u);
        else if(at<41u+ZLIB_BYTES)value=be(adler,at-43u-DEFLATE_BYTES);
        else if(at<45u+ZLIB_BYTES)value=be(idat_crc,at-41u-ZLIB_BYTES);
        else value=end[at-45u-ZLIB_BYTES];
        dst[i]=(char)value;
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
