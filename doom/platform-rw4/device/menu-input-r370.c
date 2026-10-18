/* SPDX-License-Identifier: GPL-2.0-only */
/* Included in the game adapter; all engine globals belong to this worker. */
#include "m_menu.h"
#include "m_controls.h"
extern boolean menuactive;
extern int pagetic,demosequence;
extern void M_ClearMenus(void);
extern void rw4_game_menu_metrics(const uint32_t *);
static unsigned char menu_mapped[7];
static unsigned menu_was_level;
static uint32_t menu_spawn[4];
static unsigned menu_navigation(void)
{return menuactive||gamestate!=GS_LEVEL||demoplayback;}
static unsigned char menu_key(unsigned index,unsigned char key,int down)
{
    if(down){
        unsigned char mapped=key;
        if(menu_navigation()){
            if(key==KEY_FIRE)mapped=KEY_ENTER;
            else if(key==KEY_USE)mapped=KEY_BACKSPACE;
        }
        menu_mapped[index]=mapped;return mapped;
    }
    /* A menu selection can start the map before RELEASE. Release the key
     * actually pressed, never FIRE/USE from the new gameplay context. */
    unsigned char mapped=menu_mapped[index];menu_mapped[index]=0;
    return mapped?mapped:key;
}
static void menu_snapshot(void)
{
    unsigned level=gamestate==GS_LEVEL&&!demoplayback;
    mobj_t *m=players[consoleplayer].mo;
    if(level&&!menu_was_level&&m){
        menu_spawn[0]=(uint32_t)m->x;menu_spawn[1]=(uint32_t)m->y;
        menu_spawn[2]=m->angle;menu_spawn[3]=(unsigned)gameepisode*100u+(unsigned)gamemap;
    }
    menu_was_level=level;
    uint32_t v[8]={menu_navigation(),!!menuactive,!!demoplayback,(unsigned)leveltime,
        menu_spawn[0],menu_spawn[1],menu_spawn[2],menu_spawn[3]};
    rw4_game_menu_metrics(v);
}
static void menu_hold_title(void)
{
    /* Keep TITLEPIC instead of entering an unattended attract-mode battle.
     * The original menu and its NEW GAME/episode/skill flow are unchanged. */
    if(gamestate==GS_DEMOSCREEN&&demosequence==0)pagetic=0x3fffffff;
}
