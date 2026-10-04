/* Read-only bounded WAD inspection, exact PC emulator only. No Doom engine.
 * FILE opaque; libc imports already reviewed in R58. */
#include <stdint.h>
#include <stddef.h>
typedef struct guest_file FILE;
_Static_assert(sizeof(long)==4 && sizeof(size_t)==4,"exact guest stdio ABI");
extern FILE *fopen(const char *,const char *);
extern int fclose(FILE *);
extern size_t fread(void *,size_t,size_t,FILE *);
extern int fseek(FILE *,long,int);
extern long ftell(FILE *);
extern int feof(FILE *);
extern int ferror(FILE *);
extern void clearerr(FILE *);
extern int printf(const char *,...);
static const char *const map_names[]={"THINGS","LINEDEFS","SIDEDEFS","VERTEXES","SEGS","SSECTORS","NODES","SECTORS","REJECT","BLOCKMAP"};
static const char *const resources[]={"PLAYPAL","COLORMAP","PNAMES","TEXTURE1","TITLEPIC"};
static const unsigned units[]={10,14,30,4,12,4,28,26,0,2};
static uint32_t le32(const uint8_t *p){return (uint32_t)p[0]|((uint32_t)p[1]<<8)|((uint32_t)p[2]<<16)|((uint32_t)p[3]<<24);}
static uint32_t hash_update(uint32_t h,const uint8_t *p,unsigned n){for(unsigned i=0;i<n;i++)h=(h^p[i])*16777619u;return h;}
static int named(const uint8_t *raw,const char *name){
    unsigned n=0;while(n<8u && name[n]){if(raw[n]!=(uint8_t)name[n])return 0;n++;}
    if(n==8u)return name[n]==0;
    while(n<8u)if(raw[n++]!=0)return 0;
    return 1;
}
static int read_at(FILE *s,unsigned at,uint8_t *b,unsigned n){
    clearerr(s);
    return fseek(s,(long)at,0)==0 && fread(b,1,n,s)==n && !ferror(s) && ftell(s)==(long)(at+n)?0:-5;
}
static int lump(FILE *s,unsigned index,unsigned offset,unsigned size,const uint8_t *raw){
    uint8_t b[512];unsigned left=size;uint32_t h=2166136261u;char name[9];
    for(unsigned i=0;i<8u;i++)name[i]=(char)raw[i];
    name[8]=0;
    clearerr(s);if(fseek(s,(long)offset,0)!=0)return -5;
    while(left){unsigned n=left>sizeof(b)?sizeof(b):left;
        if(fread(b,1,n,s)!=n||ferror(s))return -5;
        h=hash_update(h,b,n);left-=n;
    }
    if(ftell(s)!=(long)(offset+size))return -5;
    printf("RW4_WAD: lump index=%u name=%s offset=%u size=%u fnv=%08x\n",index,name,offset,size,(unsigned)h);
    return 0;
}
static int check(FILE *s){
    uint8_t b[512];
    if(fseek(s,0,2)!=0)return -5;
    long end=ftell(s);if(end<12||end>8*1024*1024)return -22;
    unsigned length=(unsigned)end;
    if(read_at(s,0,b,12))return -5;
    if(b[0]!='I'||b[1]!='W'||b[2]!='A'||b[3]!='D')return -22;
    unsigned count=le32(b+4),directory=le32(b+8);
    if(count==0||count>4096u||directory<12u||directory>length||count>(length-directory)/16u)return -22;
    printf("RW4_WAD: header bytes=%u count=%u directory=%u\n",length,count,directory);
    unsigned maps=0,map_at=4096u,remaining=0,found=0,selected=0;uint32_t dir_hash=2166136261u;
    for(unsigned i=0;i<count;i++){
        if(read_at(s,directory+i*16u,b,16))return -5;
        dir_hash=hash_update(dir_hash,b,16);
        unsigned offset=le32(b),size=le32(b+4),n=0;const uint8_t *name=b+8;
        if(offset>length||size>length-offset)return -22;
        while(n<8u&&name[n]){if(name[n]<32u||name[n]>126u)return -22;n++;}
        if(n==0)return -22;
        while(n<8u)if(name[n++]!=0)return -22;
        int selected_here=0;
        if(name[0]=='E'&&name[1]>='0'&&name[1]<='9'&&name[2]=='M'&&name[3]>='0'&&name[3]<='9'&&name[4]==0){
            if(maps>=9u||name[1]!='1'||name[3]!='1'+maps||name[5]||name[6]||name[7])return -22;
            maps++;
            if(maps==1u){if(size!=0)return -22;map_at=i;remaining=10;selected_here=1;}
        }else if(remaining){
            unsigned m=10u-remaining;
            if(!named(name,map_names[m])||(units[m]&&(size==0||size%units[m]))||(m==9u&&size<8u))return -22;
            remaining--;selected_here=1;
        }
        for(unsigned r=0;r<5u;r++)if(named(name,resources[r])){
            if(size==0||(found&(1u<<r)))return -22;
            found|=1u<<r;selected_here=1;
        }
        if(selected_here){if(lump(s,i,offset,size,name))return -5;selected++;}
    }
    if(maps!=9u||remaining||map_at==4096u||map_at+10u>=count||found!=31u||selected!=16u)return -22;
    printf("RW4_WAD: directory entries=%u fnv=%08x maps=%u selected=%u\n",count,(unsigned)dir_hash,maps,selected);
    clearerr(s);if(fseek(s,0,0)!=0)return -5;
    unsigned total=0,chunks=0;uint32_t h=2166136261u;
    while(total<length){unsigned want=length-total>sizeof(b)?sizeof(b):length-total;
        if(fread(b,1,want,s)!=want||ferror(s))return -5;
        h=hash_update(h,b,want);total+=want;chunks++;
    }
    if(fread(b,1,1,s)!=0||!feof(s)||ferror(s)||ftell(s)!=(long)length)return -5;
    printf("RW4_WAD: sequential bytes=%u chunks=%u fnv=%08x eof=1 error=0\n",total,chunks,(unsigned)h);
    return 0;
}
int rw4_wad_init(void *info){
    (void)info;FILE *s=fopen("/tmp/rw4-wad-probe.wad","rb");
    if(!s){printf("RW4_WAD: open_failed\n");return -5;}
    int rc=check(s),closed=fclose(s);
    printf("RW4_WAD: done rc=%d close=%d\n",rc,closed);
    return rc?rc:(closed?-5:0); /* No callbacks/tasks/references survive return. */
}
