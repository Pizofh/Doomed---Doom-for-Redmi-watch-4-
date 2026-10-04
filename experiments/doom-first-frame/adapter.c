/* SPDX-License-Identifier: GPL-2.0-or-later
 * Finite engine capture, no UI/drivers/input injection. Exact PC guest only. */
#include "first-frame.h"
#include "runtime.h"
#include "doomgeneric.h"
#include "doomstat.h"
#include "doomdef.h"
struct guest_timespec { int64_t sec; int32_t nsec,padding; };
_Static_assert(sizeof(struct guest_timespec)==16&&sizeof(pixel_t)==4,"guest/frame ABI");
extern int clock_gettime(int,struct guest_timespec *);
extern int clock_nanosleep(int,int,const struct guest_timespec *,struct guest_timespec *);
static uint32_t pixels[RW4_FIRST_PIXELS],started;
static struct first_frame_info info;
static unsigned initializing;
const uint32_t *rw4_first_pixels(void){return pixels;}
const struct first_frame_info *rw4_first_info(void){return &info;}
static uint32_t raw_ticks(void){
    struct guest_timespec t;
    if(clock_gettime(1,&t)||t.sec<0||t.nsec<0||t.nsec>=1000000000)rw4_exit(74);
    return (uint32_t)t.sec*1000u+(uint32_t)t.nsec/1000000u;
}
uint32_t DG_GetTicksMs(void){
    rw4_runtime_poll();uint32_t now=raw_ticks();
    if(now-started>15000u)rw4_exit(75); /* Cooperative bound, not hard watchdog. */
    return now;
}
void DG_SleepMs(uint32_t ms){
    (void)DG_GetTicksMs();
    if(ms>1000u)rw4_exit(76);
    struct guest_timespec t={(int64_t)(ms/1000u),(int32_t)((ms%1000u)*1000000u),0};
    if(clock_nanosleep(1,0,&t,NULL))rw4_exit(77);
    (void)DG_GetTicksMs();
}
void DG_Init(void){(void)DG_GetTicksMs();}
void DG_SetWindowTitle(const char *title){rw4_printf("title=%s\n",title);}
int DG_GetKey(int *pressed,unsigned char *key){(void)pressed;(void)key;rw4_runtime_poll();return 0;}
void DG_DrawFrame(void){
    (void)DG_GetTicksMs();info.frames++;
    /* Let Create's initial Tick finish its wipe. Capture the next complete view. */
    if(initializing)return;
    if(gamestate!=GS_LEVEL||gameepisode!=1||gamemap!=1||!gametic||!DG_ScreenBuffer)rw4_exit(78);
    uint32_t fnv=2166136261u;
    for(unsigned i=0;i<RW4_FIRST_PIXELS;i++){
        uint32_t p=DG_ScreenBuffer[i];pixels[i]=p;
        for(unsigned j=0;j<4;j++){fnv^=(p>>(j*8))&255u;fnv*=16777619u;}
    }
    info.captured=1;info.ticks=(unsigned)gametic;info.episode=(unsigned)gameepisode;info.map=(unsigned)gamemap;
    info.elapsed_ms=raw_ticks()-started;info.fnv=fnv;
    rw4_exit(0); /* Same-worker jump, then owned heap/streams cleanup. */
}
void rw4_first_body(void *unused){
    (void)unused;started=raw_ticks();initializing=1;
    char *argv[]={"doom","-iwad",RW4_FIRST_WAD,"-warp","1","1","-skill","2",NULL};
    doomgeneric_Create(8,argv);
    initializing=0;
    for(unsigned i=0;i<8;i++)doomgeneric_Tick();
    rw4_exit(79);
}
