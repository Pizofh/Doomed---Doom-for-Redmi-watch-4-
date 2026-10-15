/* SPDX-License-Identifier: GPL-2.0-or-later
 * Real doomgeneric adapter. UI has no synchronous engine Tick callback.
 */
#include "platform.h"
#include "runtime.h"
#include "doomgeneric.h"
#include "doomstat.h"
#include "doomdef.h"
#include "doomkeys.h"
#include "d_event.h"
#include "d_main.h"
#include "g_game.h"
_Static_assert(sizeof(pixel_t)==4,"upstream pixel ABI");
static uint32_t started,paused_ms,paused_at;
static unsigned initializing,waiting,drawn,delivered_keys;
static uint32_t raw_ticks(void){return (uint32_t)(rw4_host_clock_ticks()/10u);}
uint32_t DG_GetTicksMs(void)
{
    if(rw4_game_stopping())rw4_runtime_request_stop();
    rw4_runtime_poll();uint32_t now=raw_ticks();
    if(now-started>120000u)rw4_exit(0);
    return (waiting?paused_at:now)-paused_ms;
}
void DG_SleepMs(uint32_t ms)
{
    (void)DG_GetTicksMs();if(ms>1000u)rw4_exit(76);
    if(rw4_host_usleep(ms*1000u))rw4_exit(77);
    (void)DG_GetTicksMs();
}
void DG_Init(void){(void)DG_GetTicksMs();}
void DG_SetWindowTitle(const char *title){rw4_printf("title=%s\n",title);}
int DG_GetKey(int *down,unsigned char *key)
{
    rw4_runtime_poll();if(!rw4_game_key(down,key))return 0;
    unsigned bit=*key==KEY_UPARROW?1u:*key==KEY_LEFTARROW?2u:*key==KEY_RIGHTARROW?4u:*key==KEY_FIRE?8u:0;
    if(*down)delivered_keys|=bit;else delivered_keys&=~bit;
    return 1;
}
static void snapshot(void)
{
    player_t *p=&players[consoleplayer];mobj_t *m=p->mo;
    uint32_t v[12]={(unsigned)gametic,drawn,(unsigned)gamestate,(unsigned)gameepisode,(unsigned)gamemap,
        m?(uint32_t)m->x:0,m?(uint32_t)m->y:0,m?m->angle:0,(unsigned)p->ammo[0],(unsigned)p->health,delivered_keys,raw_ticks()-started};
    rw4_game_metrics(v);
}
void DG_DrawFrame(void)
{
    (void)DG_GetTicksMs();if(initializing)return;
    if(gamestate!=GS_LEVEL||gameepisode!=1||gamemap!=1||!DG_ScreenBuffer)rw4_exit(78);
    drawn++;snapshot();rw4_game_frame(DG_ScreenBuffer,(unsigned)gametic);
}
static void flush_keys(void)
{
    int down;unsigned char key;
    for(unsigned i=0;i<64&&DG_GetKey(&down,&key);i++){
        event_t ev={0};ev.type=down?ev_keydown:ev_keyup;ev.data1=key;D_PostEvent(&ev);
    }
    D_ProcessEvents();
}
void rw4_game_body(void *unused)
{
    (void)unused;started=raw_ticks();initializing=1;
    char *argv[]={"doom","-iwad",RW4_GAME_WAD,"-warp","1","1","-skill","2",NULL};
    doomgeneric_Create(8,argv);initializing=0;rw4_game_ready();
    for(unsigned iteration=0;iteration<10000;iteration++){
        (void)DG_GetTicksMs();
        if(rw4_game_paused()){
            waiting=1;paused_at=raw_ticks();
            while(rw4_game_paused()){
                flush_keys();snapshot();rw4_game_pause_ack();DG_SleepMs(20);
            }
            paused_ms+=raw_ticks()-paused_at;waiting=0;
        }
        doomgeneric_Tick();
    }
    rw4_exit(0);
}
