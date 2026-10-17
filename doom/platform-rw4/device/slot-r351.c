/* SPDX-License-Identifier: GPL-2.0-or-later
 * Bounded RAM stream. C never writes a filesystem save; Lua owns two banks.
 * Worker and UI access are mutually exclusive, with atomic publication. */
#include "platform.h"
#include "runtime.h"
#include "slot-r351.h"
static unsigned char bytes[RW4_SLOT_CAPACITY],handle;
static atomic_uint valid,length,checksum,ui_open;
static unsigned cursor,writing,engine_open,eof,error,ui_cursor,ui_mode,expected,expected_crc,rolling;
static uint32_t crc(uint32_t c,const unsigned char *p,unsigned n){for(unsigned i=0;i<n;i++){c^=p[i];for(unsigned j=0;j<8;j++)c=(c>>1)^((0u-(c&1u))&0xedb88320u);}return c;}
static unsigned get32(const char *p){const unsigned char *b=(const unsigned char *)p;return b[0]|((unsigned)b[1]<<8)|((unsigned)b[2]<<16)|((unsigned)b[3]<<24);}
static int header_ok(unsigned n){static const char v[16]="version 109";if(n<51||bytes[n-1]!=0x1d||bytes[40]>4||bytes[41]!=1||bytes[42]<1||bytes[42]>9||bytes[43]!=1||bytes[44]||bytes[45]||bytes[46])return 0;for(unsigned i=0;i<16;i++)if(bytes[24+i]!=(unsigned char)v[i])return 0;return 1;}
int rw4_slot_is(const void *p){return p==&handle;}
unsigned rw4_slot_length(void){return atomic_load(&length);}
unsigned rw4_slot_crc(void){return atomic_load(&checksum);}
unsigned rw4_slot_valid(void){return atomic_load(&valid);}
unsigned rw4_slot_opened(void){return atomic_load(&ui_open);}
void *rw4_slot_open(const char *mode){
 if(engine_open||atomic_load(&ui_open))return NULL;
 writing=mode[0]=='w'&&mode[1]=='b'&&mode[2]==0;
 if(!writing&&!(mode[0]=='r'&&mode[1]=='b'&&mode[2]==0&&atomic_load(&valid)))return NULL;
 if(writing){atomic_store(&valid,0);atomic_store(&length,0);}
 cursor=eof=error=0;engine_open=1;return &handle;
}
int rw4_slot_close(void){
 if(!engine_open)return -1;
 if(writing&&!error&&header_ok(cursor)){atomic_store(&length,cursor);atomic_store(&checksum,crc(0xffffffffu,bytes,cursor)^0xffffffffu);atomic_store(&valid,1);}
 engine_open=0;return error?-1:0;
}
int rw4_slot_abort(void){if(!engine_open)return 0;engine_open=0;if(writing)atomic_store(&valid,0);return 1;}
size_t rw4_slot_read(void *p,size_t size,size_t count){
 if(!size||!count)return 0;
 if(!engine_open||writing||(!p&&size&&count)|| (size&&count>SIZE_MAX/size))rw4_exit(82);
 unsigned n=(unsigned)(size*count);if(n>atomic_load(&length)-cursor){eof=error=1;rw4_exit(82);}
 for(unsigned i=0;i<n;i++)((unsigned char *)p)[i]=bytes[cursor+i];cursor+=n;return count;
}
size_t rw4_slot_write(const void *p,size_t size,size_t count){
 if(!size||!count)return 0;
 if(!engine_open||!writing||(!p&&size&&count)||(size&&count>SIZE_MAX/size))rw4_exit(83);
 unsigned n=(unsigned)(size*count);if(n>RW4_SLOT_CAPACITY-cursor){error=1;rw4_exit(83);}
 for(unsigned i=0;i<n;i++)bytes[cursor+i]=((const unsigned char *)p)[i];cursor+=n;return count;
}
int rw4_slot_seek(long offset,int origin){long end=(long)(writing?cursor:atomic_load(&length)),base=origin==0?0:origin==1?(long)cursor:origin==2?end:-1;if(base<0||offset< -base||offset>end-base)return -1;cursor=(unsigned)(base+offset);eof=0;return 0;}
long rw4_slot_tell(void){return(long)cursor;}
int rw4_slot_eof(void){return(int)eof;}
int rw4_slot_error(void){return(int)error;}
void rw4_slot_clear(void){eof=error=0;}
static int slot_open(struct rw4_device_file *f){(void)f;if(rw4_slot_ui_enter())return -16;unsigned zero=0;if(!atomic_compare_exchange_strong(&ui_open,&zero,1)){rw4_slot_ui_leave();return -16;}ui_cursor=ui_mode=expected=expected_crc=0;rolling=0xffffffffu;return 0;}
static int slot_close(struct rw4_device_file *f){
 (void)f;if(!atomic_exchange(&ui_open,0))return -22;
 /* A failed close callback can retain a VFS reference on this OS. Always
  * release the file successfully; valid=0 is the import rejection signal.
  * LOAD independently refuses an incomplete, malformed or bad-CRC buffer. */
 if(ui_mode==2&&ui_cursor==expected&&(rolling^0xffffffffu)==expected_crc&&header_ok(expected)){atomic_store(&length,expected);atomic_store(&checksum,expected_crc);atomic_store(&valid,1);}
 rw4_slot_ui_leave();return 0;
}
static int slot_read(struct rw4_device_file *f,char *p,unsigned n){
 (void)f;if(!atomic_load(&ui_open)||(!p&&n)||ui_mode==2||!atomic_load(&valid))return -22;ui_mode=1;
 unsigned left=atomic_load(&length)-ui_cursor;if(n>left)n=left;for(unsigned i=0;i<n;i++)p[i]=(char)bytes[ui_cursor+i];ui_cursor+=n;return(int)n;
}
static int slot_write(struct rw4_device_file *f,const char *p,unsigned n){
 (void)f;if(!atomic_load(&ui_open)||!p||ui_mode==1)return -22;
 if(!ui_mode){if(n!=16||get32(p)!=0x31535752u||get32(p+4)!=371943786u||get32(p+8)<51||get32(p+8)>RW4_SLOT_CAPACITY)return -22;expected=get32(p+8);expected_crc=get32(p+12);ui_mode=2;atomic_store(&valid,0);return 16;}
 if(n>8192||n>expected-ui_cursor)return -22;
 for(unsigned i=0;i<n;i++)bytes[ui_cursor+i]=(unsigned char)p[i];rolling=crc(rolling,(const unsigned char *)p,n);ui_cursor+=n;return(int)n;
}
const struct rw4_device_fops rw4_slot_ops={slot_open,slot_close,slot_read,slot_write,NULL,{0}};
