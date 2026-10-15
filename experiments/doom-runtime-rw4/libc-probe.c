/* SPDX-License-Identifier: GPL-2.0-or-later
 * Private libc + resource owner, PC emulator only. One run per module instance.
 */
#include "runtime.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <math.h>
#include <errno.h>
extern int host_printf(const char *,...);
static unsigned checks;
static void require(int ok){if(!ok)rw4_exit(71);checks++;}
static void body(void *unused)
{
    (void)unused;
    require(atoi(" -23")==-23);
    require(fabs(atof("1.25")-1.25)<0.00001);
    require(strcasecmp("E1M1","e1m1")==0&&strncasecmp("DOOMx","doomY",4)==0);
    char s[32];memset(s,0,sizeof(s));memcpy(s,"DOOM",5);
    require(strlen(s)==4&&strcmp(s,"DOOM")==0&&strstr(s,"OO")==s+1&&strrchr(s,'M')==s+3);
    int v=0;unsigned u=0;
    require(sscanf(" -23"," %d",&v)==1&&v==-23);
    require(sscanf("0x1a"," 0x%x",&u)==1&&u==26);
    require(sscanf("075"," 0%o",&u)==1&&u==61);
    require(sscanf("0x2b","%i",&v)==1&&v==43);
    require(rw4_snprintf(s,sizeof(s),"%s %u %x %.1f","ok",23u,0xabu,1.5)==12&&strcmp(s,"ok 23 ab 1.5")==0);
    rw4_printf("private-libc %s\n",s);puts("private puts");putchar('!');putchar('\n');
    unsigned char *p=rw4_calloc(8,1);require(p[0]==0&&p[7]==0);
    p[0]=42;p=rw4_realloc(p,32);require(p[0]==42);rw4_free(p);
    struct rw4_file *f=rw4_fopen("/tmp/rw4-libc-r272.bin","rb");require(f!=NULL);
    unsigned char b[8];require(rw4_fread(b,1,7,f)==7&&b[0]==3&&b[6]==9);
    require(rw4_ftell(f)==7&&rw4_fread(b,1,1,f)==0&&rw4_feof(f));
    require(rw4_fseek(f,2,SEEK_SET)==0&&rw4_ftell(f)==2&&rw4_fread(b,1,1,f)==1&&b[0]==5);
    require(rw4_fopen("/tmp/rw4-libc-r272.bin","wb")==NULL&&errno==30);
    require(rw4_fwrite(b,1,1,f)==0&&errno==30);
    require(rw4_fclose(f)==0);
    if(PROBE_OOM)(void)rw4_malloc(65537);
    rw4_exit(0);
}
int rw4_libc_probe_init(void *unused)
{
    (void)unused;
    int rc=rw4_runtime_run(body,NULL,"/tmp/rw4-libc-r272.bin",65536);
    const struct rw4_runtime_stats *s=rw4_runtime_stats();
    int ok=checks==18&&rc==(PROBE_OOM?4:2)&&s->blocks==0&&s->bytes==0&&s->streams==0&&s->allocated==s->freed&&s->opened==1&&s->closed==1&&!s->cleanup_error;
    host_printf("RW4_LIBC_R272: case=%u checks=%u rc=%d blocks=%u streams=%u alloc=%u free=%u peak=%u ok=%u\n",(unsigned)PROBE_OOM,checks,rc,s->blocks,s->streams,s->allocated,s->freed,s->peak_bytes,(unsigned)ok);
    return 0; /* All raw resources retired; no retained callbacks or workers. */
}
