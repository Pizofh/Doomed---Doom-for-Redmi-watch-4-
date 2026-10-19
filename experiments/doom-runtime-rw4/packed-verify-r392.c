/* SPDX-License-Identifier: GPL-2.0-only
 * Real reader/runtime, injected raw-I/O faults and cooperative cancellation.
 */
#include <stddef.h>
#include <stdint.h>
#include "runtime.h"
#include "reader-r378.h"
#include "packed-config.h"
extern void *rw4_host_fopen(const char *,const char *);
extern int rw4_host_fclose(void *),rw4_host_fseek(void *,long,int),rw4_host_ferror(void *);
extern size_t rw4_host_fread(void *,size_t,size_t,void *);
extern long rw4_host_ftell(void *);
extern int rw4_verify_packed_file(struct rw4_file *);
extern int rw4_packed_verify_physical(void *,void (*)(void));
#define CHECK(x) do{if(!(x))return -__LINE__;}while(0)
static unsigned mode,live,armed,reads,polls,body_ok;
void *load_test_open(const char *p,const char *m){void *f=rw4_host_fopen(p,m);if(f)live++;return f;}
int load_test_close(void *f){int rc=rw4_host_fclose(f);live--;return mode==8?-1:rc;}
size_t load_test_read(void *p,size_t size,size_t n,void *f){
 long at=rw4_host_ftell(f);
 if(armed){reads++;
  if(mode==2&&at>1000000)return 0;
  if(mode==7&&n>4096)n=4096;
  if(mode==9&&at>1000000)rw4_runtime_request_stop();
  if(mode==6&&at==RW4_PACK_BYTES){*(unsigned char *)p=1;return 1;}
 }
 size_t got=rw4_host_fread(p,size,n,f);
 if(armed&&got&&((mode==1&&at>3000000)||(mode==11&&at==0)))((unsigned char *)p)[0]^=0x80;
 return armed&&mode==10&&got?got+1:got;
}
int load_test_seek(void *f,long at,int origin){
 if(armed&&((mode==4)||(mode==5&&reads>90)))return -1;
 return rw4_host_fseek(f,at,origin);
}
long load_test_tell(void *f){return rw4_host_ftell(f);}
int load_test_error(void *f){return armed&&mode==3&&reads>3?1:rw4_host_ferror(f);}
static void poll(void){polls++;}
static void run_body(void *unused){
 (void)unused;struct rw4_file *f=rw4_fopen(RW4_GAME_WAD,"rb");if(!f)rw4_exit(84);
 armed=1;int rc=rw4_verify_packed_file(f);armed=0;int closed=rw4_fclose(f);
 if(rc||closed)rw4_exit(84);body_ok=1;
}
int rw4_load_verify_test_init(void *info){
 (void)info;CHECK(rw4_packed_verify_physical(NULL,poll)==-1);
 for(unsigned step=0;step<12;step++){
  unsigned i=step==11?8:step>=8?step+1:step;
  mode=i;armed=0;reads=polls=body_ok=0;
  int result=rw4_runtime_run(run_body,NULL,RW4_GAME_WAD,1024*1024);
  const struct rw4_runtime_stats *s=rw4_runtime_stats();
  CHECK(!live&&!s->streams&&!s->blocks&&!s->bytes&&s->opened==s->closed);
  CHECK(s->cleanup_error==(i==8?1u:0u));
  if(i==0||i==7)CHECK(result==0&&body_ok&&reads>=100);
  else if(i==9)CHECK(result==1&&!body_ok&&s->code==0);
  else CHECK(result==(i==8?-5:3)&&!body_ok&&s->code==84);
 }
 mode=armed=0;void *p=rw4_packed_fopen(RW4_GAME_WAD,"rb");CHECK(p);
 CHECK(rw4_packed_verify_physical(p,NULL)==-1);polls=0;CHECK(!rw4_packed_verify_physical(p,poll)&&polls>=100);
 unsigned char header[12];CHECK(rw4_packed_ftell(p)==0&&!rw4_packed_feof(p));
 CHECK(rw4_packed_fread(header,1,12,p)==12&&header[0]=='I'&&header[1]=='W'&&header[2]=='A'&&header[3]=='D');
 CHECK(!rw4_packed_fclose(p)&&!live);return 0;
}
