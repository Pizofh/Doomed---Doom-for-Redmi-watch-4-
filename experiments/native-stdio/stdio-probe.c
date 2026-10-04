/* Exact reviewed PC guest only. Finite read-only NSH initializer.
 * FILE is opaque: never import a newlib FILE layout or dereference it. */
#include <stdint.h>
#include <stddef.h>
typedef struct guest_file FILE;
_Static_assert(sizeof(long)==4 && sizeof(size_t)==4, "guest stdio ABI");
extern FILE *fopen(const char *, const char *);
extern int fclose(FILE *);
extern size_t fread(void *, size_t, size_t, FILE *);
extern int fseek(FILE *, long, int);
extern long ftell(FILE *);
extern int feof(FILE *);
extern int ferror(FILE *);
extern void clearerr(FILE *);
extern int *__errno(void);
extern int printf(const char *, ...);
#define SET 0
#define CUR 1
#define END 2
#define FIXTURE_SIZE (1048576u+37u)
static const char fixture[]="/tmp/rw4-stdio-fixture.bin";
static uint8_t expected(unsigned pos) {
    return (uint8_t)((pos*37u)^(pos>>8)^(pos>>16)^0xa5u);
}
static uint32_t update(uint32_t hash,const uint8_t *bytes,unsigned count) {
    for(unsigned i=0;i<count;i++) hash=(hash^bytes[i])*16777619u;
    return hash;
}
static int valid(const uint8_t *bytes,unsigned pos,unsigned count) {
    for(unsigned i=0;i<count;i++) if(bytes[i]!=expected(pos+i)) return 0;
    return 1;
}
static int window(FILE *stream,unsigned pos,unsigned *windows) {
    uint8_t bytes[73];
    unsigned count=FIXTURE_SIZE-pos;
    if(count>sizeof(bytes)) count=sizeof(bytes);
    if(fseek(stream,(long)pos,SET)!=0 ||
       fread(bytes,1,count,stream)!=count || !valid(bytes,pos,count) ||
       ftell(stream)!=(long)(pos+count) || ferror(stream)) return -5;
    printf("RW4_STDIO: window offset=%u bytes=%u fnv=%08x\n",pos,count,
        (unsigned)update(2166136261u,bytes,count));
    (*windows)++;
    return 0;
}
static int check(FILE *stream,unsigned *windows) {
    uint8_t bytes[512];
    unsigned total=0;
    uint32_t hash=2166136261u;
    if(ftell(stream)!=0 || feof(stream) || ferror(stream)) return -5;
    for(unsigned i=0;i<2049u;i++) {
        unsigned want=FIXTURE_SIZE-total;
        if(want>sizeof(bytes)) want=sizeof(bytes);
        size_t got=fread(bytes,1,sizeof(bytes),stream);
        if(got!=want || !want || !valid(bytes,total,want) || ferror(stream)) return -5;
        hash=update(hash,bytes,want);total+=want;
    }
    if(total!=FIXTURE_SIZE || fread(bytes,1,1,stream)!=0 ||
       !feof(stream) || ferror(stream) || ftell(stream)!=(long)FIXTURE_SIZE) return -5;
    printf("RW4_STDIO: sequential bytes=%u chunks=2049 last_bytes=37 fnv=%08x eof=1 error=0\n",
        total,(unsigned)hash);
    if(fseek(stream,0,SET)!=0) return -5;
    int eof_after_seek=!!feof(stream);
    if(fread(bytes,1,13,stream)!=13 || !valid(bytes,0,13) || ftell(stream)!=13 || ferror(stream)) return -5;
    printf("RW4_STDIO: seek_after_eof eof_after_seek=%d reread=13 position=13\n",eof_after_seek);
    clearerr(stream);
    if(feof(stream) || ferror(stream) || ftell(stream)!=13) return -5;
    printf("RW4_STDIO: clearerr eof=0 error=0 position=13\n");
    /* Same save/end/tell/restore sequence as doomgeneric M_FileLength;
     * independent checking code, no engine source linked or compiled. */
    long saved=ftell(stream);
    if(fseek(stream,0,END)!=0) return -5;
    long length=ftell(stream);
    if(length!=(long)FIXTURE_SIZE || fseek(stream,saved,SET)!=0 || ftell(stream)!=saved ||
       fread(bytes,1,19,stream)!=19 || !valid(bytes,13,19) || ftell(stream)!=32) return -5;
    printf("RW4_STDIO: length bytes=%ld saved=13 restored=13 next=19 position=32\n",length);
    const unsigned fixed[]={0,1,511,512,65535,65536,1048575,FIXTURE_SIZE-1,FIXTURE_SIZE};
    for(unsigned i=0;i<9u;i++) if(window(stream,fixed[i],windows)) return -5;
    uint32_t seed=0x4d2315u;
    for(unsigned i=0;i<32u;i++) {
        seed=seed*1664525u+1013904223u;
        if(window(stream,seed%FIXTURE_SIZE,windows)) return -5;
    }
    if(fseek(stream,100,SET)!=0 || ftell(stream)!=100 ||
       fread(bytes,1,13,stream)!=13 || !valid(bytes,100,13) || ftell(stream)!=113 ||
       fseek(stream,23,CUR)!=0 || ftell(stream)!=136 ||
       fread(bytes,1,7,stream)!=7 || !valid(bytes,136,7) ||
       fseek(stream,-43,CUR)!=0 || ftell(stream)!=100 ||
       fseek(stream,-37,END)!=0 || ftell(stream)!=1048576) return -5;
    printf("RW4_STDIO: buffered_origins set=100 after_read=113 cur_forward=136 cur_back=100 end_back=1048576\n");
    clearerr(stream);
    /* 37 bytes left: fread reports complete 4-byte elements, not byte count. */
    if(fread(bytes,4,10,stream)!=9 || !valid(bytes,1048576,36) ||
       ftell(stream)!=(long)FIXTURE_SIZE || !feof(stream) || ferror(stream)) return -5;
    printf("RW4_STDIO: elements size=4 requested=10 returned=9 position=%u eof=1 error=0\n",FIXTURE_SIZE);
    clearerr(stream);
    if(fseek(stream,123,SET)!=0 || fread(bytes,3,13,stream)!=13 || !valid(bytes,123,39) ||
       ftell(stream)!=162 || fread(bytes,1,0,stream)!=0 || ftell(stream)!=162) return -5;
    printf("RW4_STDIO: elements size=3 requested=13 returned=13 position=162 zero_count=0\n");
    FILE *missing=fopen("/tmp/rw4-stdio-missing.bin","rb");
    int err=*__errno();
    if(missing) { fclose(missing);return -5; }
    if(err!=2) return -5;
    printf("RW4_STDIO: error op=missing null=1 errno=%d\n",err);
    /* Empty read buffer before invalid origin so failed seek cannot discard
     * unread bytes and obscure the logical-position observation. */
    if(fseek(stream,123,SET)!=0) return -5;
    int rc=fseek(stream,0,99);err=*__errno();
    if(rc!=-1 || err!=22 || ftell(stream)!=123) return -5;
    printf("RW4_STDIO: error op=bad_whence rc=%d errno=%d unchanged=1\n",rc,err);
    FILE *other=fopen(fixture,"rb");
    if(!other) return -5;
    int ok=ftell(other)==0 && fseek(stream,777,SET)==0 &&
        fread(bytes,1,13,stream)==13 && valid(bytes,777,13) &&
        fread(bytes,1,5,other)==5 && valid(bytes,0,5) && ftell(other)==5 && ftell(stream)==790;
    int closed=fclose(other);
    if(!ok || closed) return -5;
    printf("RW4_STDIO: independent first=790 second=5 second_close=0\n");
    return 0;
}
int rw4_stdio_init(void *module_info) {
    (void)module_info;
    unsigned windows=0;
    FILE *stream=fopen(fixture,"rb");
    if(!stream) { printf("RW4_STDIO: open_failed errno=%d\n",*__errno());return -5; }
    int rc=check(stream,&windows),closed=fclose(stream);
    if(rc || closed) { printf("RW4_STDIO: failed rc=%d close=%d windows=%u\n",rc,closed,windows);return -5; }
    for(unsigned i=0;i<3u;i++) {
        stream=fopen(fixture,"rb");
        if(!stream) return -5;
        uint8_t byte;
        int ok=ftell(stream)==0 && !feof(stream) && !ferror(stream) &&
            fread(&byte,1,1,stream)==1 && byte==expected(0);
        closed=fclose(stream);
        if(!ok || closed) return -5;
        printf("RW4_STDIO: reopen cycle=%u position=0 first=%u close=0\n",i,(unsigned)byte);
    }
    printf("RW4_STDIO: done windows=%u errors=2 reopens=3 close=0\n",windows);
    return 0; /* No live references/tasks/callbacks; unload only after return. */
}
