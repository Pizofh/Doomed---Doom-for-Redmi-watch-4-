/* Exact reviewed PC guest only. Finite NSH initializer; no retained code.
 * Read-only owned tmpfs fixture. No drivers, UI calls or storage writes. */
#include <stdint.h>
#include <stddef.h>
typedef int64_t guest_off_t;
typedef int32_t guest_ssize_t;
_Static_assert(sizeof(size_t)==4 && sizeof(guest_off_t)==8, "guest file ABI");
extern int open(const char *, int, ...);
extern int close(int);
extern guest_ssize_t read(int, void *, size_t);
extern guest_off_t lseek(int, guest_off_t, int);
extern int *__errno(void);
extern int printf(const char *, ...);
#define READ_ONLY 1
#define SET 0
#define CUR 1
#define END 2
#define FIXTURE_SIZE (1048576u+37u)
static const char fixture[]="/tmp/rw4-fs-fixture.bin";
static uint8_t expected(unsigned pos) {
    return (uint8_t)((pos*37u)^(pos>>8)^(pos>>16)^0xa5u);
}
static uint32_t update(uint32_t hash, const uint8_t *bytes, unsigned count) {
    for(unsigned i=0;i<count;i++) hash=(hash^bytes[i])*16777619u;
    return hash;
}
static int window(int fd,unsigned pos,unsigned *windows) {
    uint8_t bytes[73];
    unsigned count=FIXTURE_SIZE-pos;
    if(count>sizeof(bytes)) count=sizeof(bytes);
    if(lseek(fd,(guest_off_t)pos,SET)!=(guest_off_t)pos) return -5;
    if(read(fd,bytes,count)!=(guest_ssize_t)count) return -5;
    for(unsigned i=0;i<count;i++) if(bytes[i]!=expected(pos+i)) return -5;
    if(lseek(fd,0,CUR)!=(guest_off_t)(pos+count)) return -5;
    printf("RW4_FS: window offset=%u bytes=%u fnv=%08x\n",pos,count,
        (unsigned)update(2166136261u,bytes,count));
    (*windows)++;
    return 0;
}
static int check(int fd,unsigned *windows) {
    uint8_t bytes[512];
    uint32_t hash=2166136261u;
    unsigned total=0,chunks=0;
    if(lseek(fd,0,END)!=(guest_off_t)FIXTURE_SIZE || lseek(fd,0,SET)!=0) return -5;
    for(unsigned i=0;i<2049u;i++) {
        unsigned want=FIXTURE_SIZE-total;
        if(want>sizeof(bytes)) want=sizeof(bytes);
        guest_ssize_t got=read(fd,bytes,sizeof(bytes));
        if(got!=(guest_ssize_t)want || !want) return -5;
        for(unsigned j=0;j<want;j++) if(bytes[j]!=expected(total+j)) return -5;
        hash=update(hash,bytes,want);total+=want;chunks++;
    }
    if(total!=FIXTURE_SIZE || read(fd,bytes,sizeof(bytes))!=0 ||
       lseek(fd,0,CUR)!=(guest_off_t)FIXTURE_SIZE) return -5;
    printf("RW4_FS: sequential bytes=%u chunks=%u last_bytes=37 fnv=%08x eof=0\n",
        total,chunks,(unsigned)hash);
    const unsigned fixed[]={0,1,511,512,65535,65536,1048575,FIXTURE_SIZE-1,FIXTURE_SIZE};
    for(unsigned i=0;i<9u;i++) if(window(fd,fixed[i],windows)) return -5;
    uint32_t seed=0x4d2315u;
    for(unsigned i=0;i<32u;i++) {
        seed=seed*1664525u+1013904223u;
        if(window(fd,seed%FIXTURE_SIZE,windows)) return -5;
    }
    if(lseek(fd,100,SET)!=100 || lseek(fd,23,CUR)!=123 ||
       lseek(fd,-23,CUR)!=100 || lseek(fd,-37,END)!=1048576) return -5;
    printf("RW4_FS: origins set=100 cur_forward=123 cur_back=100 end_back=1048576\n");
    /* Validate high return/argument word without allocation or read beyond EOF. */
    const guest_off_t high=INT64_C(4294967303);
    if(lseek(fd,high,SET)!=high || lseek(fd,0,CUR)!=high || lseek(fd,0,SET)!=0) return -5;
    printf("RW4_FS: high_offset hi=1 lo=7 restored=0 no_read=1\n");
    int rc=open("/tmp/rw4-fs-missing.bin",READ_ONLY),err=*__errno();
    if(rc>=0) { close(rc);return -5; }
    if(rc!=-1 || err!=2) return -5;
    printf("RW4_FS: error op=missing rc=%d errno=%d\n",rc,err);
    rc=read(-1,bytes,sizeof(bytes));err=*__errno();
    if(rc!=-1 || err!=9) return -5;
    printf("RW4_FS: error op=bad_read rc=%d errno=%d\n",rc,err);
    guest_off_t offset=lseek(-1,0,SET);err=*__errno();
    if(offset!=-1 || err!=9) return -5;
    printf("RW4_FS: error op=bad_seek rc=-1 errno=%d\n",err);
    offset=lseek(fd,0,99);err=*__errno();
    if(offset!=-1 || err!=22 || lseek(fd,0,CUR)!=0) return -5;
    printf("RW4_FS: error op=bad_whence rc=-1 errno=%d unchanged=1\n",err);
    int other=open(fixture,READ_ONLY);
    if(other<0) return -5;
    int ok=lseek(other,0,CUR)==0 && lseek(fd,777,SET)==777 &&
        lseek(other,0,CUR)==0 && lseek(other,333,SET)==333 && lseek(fd,0,CUR)==777;
    int closed=close(other);
    if(!ok || closed!=0) return -5;
    printf("RW4_FS: independent first=777 second=333 second_close=0\n");
    return 0;
}
int rw4_fs_init(void *module_info) {
    (void)module_info;
    unsigned windows=0;
    int fd=open(fixture,READ_ONLY);
    if(fd<0) { printf("RW4_FS: open_failed errno=%d\n",*__errno());return -5; }
    int rc=check(fd,&windows),closed=close(fd);
    if(rc || closed) { printf("RW4_FS: failed rc=%d close=%d windows=%u\n",rc,closed,windows);return -5; }
    /* Opening again starts at0; close always, including a failed check. */
    fd=open(fixture,READ_ONLY);
    if(fd<0) return -5;
    uint8_t byte;
    int ok=lseek(fd,0,CUR)==0 && read(fd,&byte,1)==1 && byte==expected(0);
    closed=close(fd);
    if(!ok || closed) return -5;
    printf("RW4_FS: reopen position=0 first=%u close=0\n",(unsigned)byte);
    printf("RW4_FS: done windows=%u errors=4 close=0\n",windows);
    return 0;
}
