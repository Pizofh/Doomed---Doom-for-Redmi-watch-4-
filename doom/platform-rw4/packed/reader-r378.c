/* SPDX-License-Identifier: GPL-2.0-only
 * Game-worker-owned read-only virtual WAD. No native writes, heap or new ABI.
 * Physical storage stays compressed. Eight cursors share two bounded pages.
 */
#include "reader-r378.h"
#include "tinf.h"
#include "packed-config.h"
#include <stdint.h>
extern void *rw4_host_fopen(const char *,const char *);
extern int rw4_host_fclose(void *);
extern size_t rw4_host_fread(void *,size_t,size_t,void *);
extern int rw4_host_fseek(void *,long,int);
extern long rw4_host_ftell(void *);
struct cursor {void *raw;uint32_t pos;unsigned eof,error;};
static struct cursor cursors[8];
static unsigned char input[65536],page[2][65536],index_bytes[RW4_PACK_PAGES*16];
static uint32_t cached_page[2]={UINT32_MAX,UINT32_MAX},used[2],clock_value,crc_table[256];
static unsigned crc_ready;
static uint32_t u32(const unsigned char *p){return (uint32_t)p[0]|(uint32_t)p[1]<<8|(uint32_t)p[2]<<16|(uint32_t)p[3]<<24;}
static uint32_t crc(const unsigned char *p,unsigned n){
 if(!crc_ready){for(unsigned i=0;i<256;i++){uint32_t c=i;for(unsigned j=0;j<8;j++)c=(c>>1)^((0u-(c&1))&0xedb88320u);crc_table[i]=c;}crc_ready=1;}
 uint32_t c=UINT32_MAX;while(n--)c=(c>>8)^crc_table[(c^*p++)&255u];return c^UINT32_MAX;}
static int same(const char *a,const char *b){while(*a&&*a==*b){a++;b++;}return *a==*b;}
static struct cursor *find(void *p){for(unsigned i=0;i<8;i++)if(p==&cursors[i]&&cursors[i].raw)return &cursors[i];return NULL;}
void *rw4_packed_fopen(const char *path,const char *mode){
 if(!same(path,RW4_GAME_WAD)||(!same(mode,"rb")&&!same(mode,"r")))return NULL;
 unsigned slot;for(slot=0;slot<8;slot++)if(!cursors[slot].raw)break;if(slot==8)return NULL;
 void *f=rw4_host_fopen(path,"rb");if(!f)return NULL;unsigned char h[40];
 if(rw4_host_fread(h,1,40,f)!=40||u32(h)!=0x31435752u||u32(h+4)!=1||u32(h+8)!=RW4_PACK_ORIGINAL_BYTES||
    u32(h+12)!=RW4_PACK_ORIGINAL_CRC||u32(h+16)!=65536||u32(h+20)!=RW4_PACK_PAGES||
    u32(h+24)!=RW4_PACK_INDEX_CRC||u32(h+28)!=RW4_PACK_BYTES||u32(h+32)||
    u32(h+36)!=RW4_PACK_HEADER_CRC||crc(h,36)!=u32(h+36))goto fail;
 if(rw4_host_fseek(f,0,2)||rw4_host_ftell(f)!=(long)RW4_PACK_BYTES||rw4_host_fseek(f,40,0)||
    rw4_host_fread(index_bytes,1,sizeof(index_bytes),f)!=sizeof(index_bytes)||crc(index_bytes,sizeof(index_bytes))!=RW4_PACK_INDEX_CRC)goto fail;
 uint32_t offset=40+sizeof(index_bytes);
 for(unsigned i=0;i<RW4_PACK_PAGES;i++){
  const unsigned char *e=index_bytes+i*16;uint32_t n=u32(e+4)&0x7fffffffu;
  uint32_t raw=RW4_PACK_ORIGINAL_BYTES-i*65536u;if(raw>65536)raw=65536;
  if(u32(e)!=offset||!n||n>65536||n>RW4_PACK_BYTES-offset||u32(e+8)!=raw||((u32(e+4)>>31)&&n!=raw))goto fail;
  offset+=n;
 }
 if(offset!=RW4_PACK_BYTES)goto fail;
 cursors[slot]=(struct cursor){f,0,0,0};cached_page[0]=cached_page[1]=UINT32_MAX;return &cursors[slot];
fail:rw4_host_fclose(f);return NULL;
}
int rw4_packed_fclose(void *p){struct cursor *c=find(p);if(!c)return -1;int rc=rw4_host_fclose(c->raw);*c=(struct cursor){0};cached_page[0]=cached_page[1]=UINT32_MAX;return rc;}
static int load_page(struct cursor *c,unsigned which){
 for(unsigned i=0;i<2;i++)if(cached_page[i]==which){used[i]=++clock_value;return (int)i;}
 if(which>=RW4_PACK_PAGES)return -1;unsigned slot=cached_page[0]==UINT32_MAX?0:cached_page[1]==UINT32_MAX?1:used[0]<=used[1]?0:1;
 const unsigned char *e=index_bytes+which*16;uint32_t n=u32(e+4)&0x7fffffffu,raw=u32(e+8);
 cached_page[slot]=UINT32_MAX;
 if(rw4_host_fseek(c->raw,(long)u32(e),0)||rw4_host_fread(input,1,n,c->raw)!=n)return -1;
 if(u32(e+4)>>31){for(unsigned i=0;i<raw;i++)page[slot][i]=input[i];}
 else {unsigned length=raw;if(tinf_uncompress(page[slot],&length,input,n)!=TINF_OK||length!=raw)return -1;}
 if(crc(page[slot],raw)!=u32(e+12))return -1;cached_page[slot]=which;used[slot]=++clock_value;return (int)slot;
}
size_t rw4_packed_fread(void *dst,size_t size,size_t count,void *p){
 struct cursor *c=find(p);if(!c||(!dst&&size&&count)||!size||!count)return 0;
 if(count>SIZE_MAX/size){c->error=1;return 0;}size_t wanted=size*count,done=0;
 unsigned char *out=dst;
 while(done<wanted&&c->pos<RW4_PACK_ORIGINAL_BYTES){
  unsigned which=c->pos/65536,within=c->pos%65536,n=65536-within;
  int slot=load_page(c,which);if(slot<0){c->error=1;break;}
  if(n>RW4_PACK_ORIGINAL_BYTES-c->pos)n=RW4_PACK_ORIGINAL_BYTES-c->pos;if(n>wanted-done)n=(unsigned)(wanted-done);
  for(unsigned i=0;i<n;i++)out[done+i]=page[slot][within+i];c->pos+=n;done+=n;
 }
 if(done<wanted&&c->pos==RW4_PACK_ORIGINAL_BYTES)c->eof=1;return done/size;
}
int rw4_packed_fseek(void *p,long offset,int origin){struct cursor *c=find(p);if(!c||origin<0||origin>2)return -1;
 int64_t base=origin==0?0:origin==1?c->pos:RW4_PACK_ORIGINAL_BYTES,next=base+(int64_t)offset;
 if(next<0||next>RW4_PACK_ORIGINAL_BYTES)return -1;c->pos=(uint32_t)next;c->eof=0;return 0;}
long rw4_packed_ftell(void *p){struct cursor *c=find(p);return c?(long)c->pos:-1;}
int rw4_packed_feof(void *p){struct cursor *c=find(p);return c?c->eof:0;}
int rw4_packed_ferror(void *p){struct cursor *c=find(p);return c?c->error:1;}
void rw4_packed_clearerr(void *p){struct cursor *c=find(p);if(c)c->eof=c->error=0;}
