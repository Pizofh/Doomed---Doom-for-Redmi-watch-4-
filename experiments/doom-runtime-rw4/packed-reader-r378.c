/* SPDX-License-Identifier: GPL-2.0-only */
/* Test-only raw-I/O faults. Same production reader and inflate implementation. */
#include <stddef.h>
#include <stdint.h>
#include "reader-r378.h"
#include "packed-config.h"
extern void *rw4_host_fopen(const char *,const char *);
extern int rw4_host_fclose(void *),rw4_host_fseek(void *,long,int);
extern size_t rw4_host_fread(void *,size_t,size_t,void *);
extern long rw4_host_ftell(void *);
#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)
static unsigned fault,live;
static unsigned char a[8192],b[8192],entry[16];
void *packed_test_open(const char *p,const char *m){if(fault==1)return NULL;void *f=rw4_host_fopen(p,m);if(f)live++;return f;}
int packed_test_close(void *f){int rc=rw4_host_fclose(f);live--;return fault==6?-1:rc;}
size_t packed_test_read(void *dst,size_t size,size_t count,void *f){
 long at=rw4_host_ftell(f);size_t n=rw4_host_fread(dst,size,count,f);
 if(n&&((fault==2&&at==0)||(fault==3&&at==40)||(fault==4&&at>=3080)))((unsigned char *)dst)[0]^=0x80;
 if(fault==5&&at>=3080&&n)return n-1;return n;
}
int packed_test_seek(void *f,long offset,int origin){return fault==7?-1:rw4_host_fseek(f,offset,origin);}
long packed_test_tell(void *f){return fault==8?-1:rw4_host_ftell(f);}
static int same(unsigned n){for(unsigned i=0;i<n;i++)if(a[i]!=b[i])return 0;return 1;}
static uint32_t u32(unsigned char *p){return (uint32_t)p[0]|(uint32_t)p[1]<<8|(uint32_t)p[2]<<16|(uint32_t)p[3]<<24;}
static int compare(void *packed,void *raw,unsigned offset,unsigned length){
 CHECK(!rw4_packed_fseek(packed,(long)offset,0));CHECK(!rw4_host_fseek(raw,(long)offset,0));
 while(length){unsigned n=length>sizeof(a)?sizeof(a):length;CHECK(rw4_packed_fread(a,1,n,packed)==n);CHECK(rw4_host_fread(b,1,n,raw)==n);CHECK(same(n));length-=n;}return 0;
}
int rw4_packed_reader_test_init(void *info){
 (void)info;void *raw=rw4_host_fopen("/data/app/watchface/market/365799913/lua/doom-ultimate-r374.wad","rb");CHECK(raw);
 CHECK(!rw4_packed_fopen(RW4_GAME_WAD,"wb"));CHECK(!rw4_packed_fopen("/not-owned.wad","rb"));CHECK(!live);
 void *p=rw4_packed_fopen(RW4_GAME_WAD,"rb");CHECK(p&&live==1);CHECK(!compare(p,raw,0,RW4_PACK_ORIGINAL_BYTES));
 CHECK(!rw4_packed_fread(a,1,1,p)&&rw4_packed_feof(p));CHECK(!rw4_packed_fseek(p,0,0)&&!rw4_packed_feof(p));
 CHECK(rw4_packed_ftell(p)==0);CHECK(rw4_packed_fseek(p,-1,0)<0&&rw4_packed_ftell(p)==0);
 CHECK(rw4_packed_fseek(p,1,2)<0&&rw4_packed_ftell(p)==0);CHECK(rw4_packed_fseek(p,0,3)<0);
 CHECK(!rw4_packed_fread(a,SIZE_MAX,2,p)&&rw4_packed_ferror(p));rw4_packed_clearerr(p);CHECK(!rw4_packed_ferror(p));
 CHECK(!rw4_packed_fseek(p,-4,2));CHECK(rw4_packed_fread(a,2,4,p)==2&&rw4_packed_feof(p));
 CHECK(!rw4_packed_fclose(p)&&!live);
 p=rw4_packed_fopen(RW4_GAME_WAD,"rb");CHECK(p);void *other=rw4_packed_fopen(RW4_GAME_WAD,"rb");CHECK(other&&live==2);
 uint32_t random=0x378;for(unsigned i=0;i<600;i++){
  random^=random<<13;random^=random>>17;random^=random<<5;
  unsigned n=1+random%4096,offset=random%(RW4_PACK_ORIGINAL_BYTES-n);
  CHECK(!compare(i&1?p:other,raw,offset,n));
 }
 // Preserve every directory entry, including duplicate names and all map ranges.
 CHECK(!rw4_host_fseek(raw,0,0)&&rw4_host_fread(b,1,12,raw)==12);
 unsigned lumps=u32(b+4),directory=u32(b+8);CHECK(lumps==2306);
 for(unsigned i=0;i<lumps;i++){
  CHECK(!compare(p,raw,directory+i*16,16));CHECK(!rw4_packed_fseek(p,(long)(directory+i*16),0));
  CHECK(rw4_packed_fread(entry,1,16,p)==16);unsigned offset=u32(entry),length=u32(entry+4);
  CHECK(!compare(other,raw,offset,length));
 }
 CHECK(!rw4_packed_fclose(p)&&!rw4_packed_fclose(other)&&!live);
 void *handles[8];for(unsigned i=0;i<8;i++){handles[i]=rw4_packed_fopen(RW4_GAME_WAD,"rb");CHECK(handles[i]);}
 CHECK(!rw4_packed_fopen(RW4_GAME_WAD,"rb"));for(unsigned i=0;i<8;i++)CHECK(!rw4_packed_fclose(handles[i]));CHECK(!live);
 for(unsigned mode=1;mode<=8;mode++){
  fault=mode;p=rw4_packed_fopen(RW4_GAME_WAD,"rb");
  if(mode==1||mode==2||mode==3||mode==7||mode==8)CHECK(!p&&!live);
  else{CHECK(p);if(mode==4||mode==5){CHECK(!rw4_packed_fread(a,1,12,p)&&rw4_packed_ferror(p));fault=0;rw4_packed_clearerr(p);CHECK(!compare(p,raw,0,12));fault=mode;}
   CHECK(rw4_packed_fclose(p)==(mode==6?-1:0));CHECK(!live);}
 }
 fault=0;CHECK(!rw4_host_fclose(raw));return 0;
}
