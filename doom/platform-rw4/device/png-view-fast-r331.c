/* SPDX-License-Identifier: GPL-2.0-or-later
 * Same 192278-byte RGB24 PNG as png-view.c. Sequential scan cursor replaces
 * per-byte division; Adler and IDAT CRC share one RGB565 scan. No frame copy.
 */
#include "png-view.h"
#define SCAN_BYTES 192200u
#define DEFLATE_BYTES (SCAN_BYTES+15u)
#define ZLIB_BYTES (DEFLATE_BYTES+6u)
static const unsigned char *prepared;
static uint32_t table32[256],adler,idat_crc;
static unsigned initialized;
static unsigned be(uint32_t n,unsigned at){return(n>>(24u-at*8u))&255u;}
static uint32_t crc_byte(uint32_t c,unsigned b){return(c>>8)^table32[(c^b)&255u];}
struct scan_cursor { const unsigned char *p;unsigned x,channel,value; };
static struct scan_cursor scan_at(const unsigned char *p,unsigned at)
{
    unsigned row=at/961u,col=at%961u;
    struct scan_cursor c={p+row*640u,0,3,0};
    if(col){c.x=(col-1u)/3u;c.channel=(col-1u)%3u;c.p+=2u*c.x;
        if(c.channel)c.value=c.p[0]|((unsigned)c.p[1]<<8);}
    return c;
}
static inline __attribute__((always_inline)) unsigned scan_next(struct scan_cursor *c)
{
    unsigned v;
    if(c->channel==3){c->channel=0;return 0;}
    if(c->channel==0){
        c->value=c->p[0]|((unsigned)c->p[1]<<8);c->channel=1;
        v=c->value>>11;return(v<<3)|(v>>2);
    }
    if(c->channel==1){c->channel=2;v=(c->value>>5)&63u;return(v<<2)|(v>>4);}
    v=c->value&31u;c->p+=2;c->channel=0;
    if(++c->x==320u){c->x=0;c->channel=3;}
    return(v<<3)|(v>>2);
}
static unsigned block_header(unsigned block,unsigned at)
{
    unsigned n=block==2u?61130u:65535u;
    if(!at)return block==2u?1u:0u;
    return at<3u?(n>>((at-1u)*8u))&255u:((65535u-n)>>((at-3u)*8u))&255u;
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
    struct scan_cursor cursor=scan_at(p,0);
    for(unsigned block=0;block<3;block++){
        for(unsigned i=0;i<5;i++)c=crc_byte(c,block_header(block,i));
        unsigned n=block==2u?61130u:65535u;
        for(unsigned i=0;i<n;i++){
            unsigned value=scan_next(&cursor);
            a+=value;if(a>=65521u)a-=65521u;
            b+=a;if(b>=65521u)b-=65521u;
            c=crc_byte(c,value);
        }
    }
    adler=(b<<16)|a;
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
    unsigned i=0;
    while(i<count){
        unsigned at=position+i,value;
        if(at>=43u&&at<43u+DEFLATE_BYTES){
            unsigned offset=at-43u,block=offset/65540u,inside=offset%65540u;
            if(inside>=5u){
                unsigned left=(block==2u?61130u:65535u)-(inside-5u),n=count-i;
                if(n>left)n=left;
                struct scan_cursor cursor=scan_at(p,block*65535u+inside-5u);
                for(unsigned j=0;j<n;j++)dst[i+j]=(char)scan_next(&cursor);
                i+=n;continue;
            }
            value=block_header(block,inside);
        }else if(at<33u)value=header[at];
        else if(at<37u)value=be(ZLIB_BYTES,at-33u);
        else if(at<41u)value=type[at-37u];
        else if(at<43u)value=at==41u?0x78u:1u;
        else if(at<41u+ZLIB_BYTES)value=be(adler,at-43u-DEFLATE_BYTES);
        else if(at<45u+ZLIB_BYTES)value=be(idat_crc,at-41u-ZLIB_BYTES);
        else value=end[at-45u-ZLIB_BYTES];
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
