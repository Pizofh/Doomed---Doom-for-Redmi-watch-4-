// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,once} from './doom-ready-source-r351.mjs';
export {root,sha256};
export function menuAdapter(source){
 let s=once(source,'static void snapshot(void)',fs.readFileSync(path.join(root,'doom/platform-rw4/device/menu-input-r370.c'),'utf8')+'\nstatic void snapshot(void)');
 // DG_GetKey precedes the helper definitions.
 s=once(s,'int DG_GetKey(int *down,unsigned char *key)',
 'static unsigned char menu_key(unsigned,unsigned char,int);\nint DG_GetKey(int *down,unsigned char *key)');
 s=once(s,'*key==KEY_USE?32u:0','*key==KEY_USE?32u:*key==KEY_ESCAPE?64u:0');
 s=once(s,'    return 1;\n}\n/* SPDX-License-Identifier:',
 '    unsigned index=0;while(index<6&&bit!=(1u<<index))index++;\n    *key=menu_key(index,*key,*down);return 1;\n}\n/* SPDX-License-Identifier:');
 s=once(s,'rw4_game_metrics(v);rw4_game_actions(p->cmd.buttons,(unsigned)p->usedown);',
 'rw4_game_metrics(v);rw4_game_actions(p->cmd.buttons,(unsigned)p->usedown);menu_snapshot();');
 s=once(s,'char *argv[]={"doom","-iwad",RW4_GAME_WAD,"-warp","1","1","-skill","2","-mb","3",NULL};',
 'char *argv[]={"doom","-iwad",RW4_GAME_WAD,"-mb","3",NULL};');
 s=once(s,'verify_wad();doomgeneric_Create(10,argv);',
 'verify_wad();doomgeneric_Create(5,argv);key_menu_confirm=KEY_ENTER;key_menu_abort=KEY_BACKSPACE;');
 s=once(s,'if(gamestate!=GS_LEVEL||gameepisode!=1||gamemap<1||gamemap>9)',
 'if(action==8&&(gamestate!=GS_LEVEL||gameepisode!=1||gamemap<1||gamemap>9))');
 s=once(s,'rw4_slot_action_done(action,savegame_error?5:0);',
 'if(!savegame_error)M_ClearMenus();rw4_slot_action_done(action,savegame_error?5:0);');
 s=once(s,'nodrawers=!rw4_game_frame_wanted();','menu_hold_title();nodrawers=!rw4_game_frame_wanted();');
 return s;
}
export function menuTransport(source){
 let s=once(source,'static uint32_t snapshot[64];',`static uint32_t snapshot[72];
static atomic_uint menu_metrics[8];
void rw4_game_menu_metrics(const uint32_t *v){for(unsigned i=0;i<8;i++)atomic_store(&menu_metrics[i],v[i]);}`);
 s=once(s,'keys[6]={0xad,0xac,0xae,0xa3,0xaf,0xa2}','keys[7]={0xad,0xac,0xae,0xa3,0xaf,0xa2,27}');
 s=once(s,'bit<6','bit<7');s=once(s,'value>63','value>127');
 s=once(s,'DIRECT_MAGIC,7,sequence','DIRECT_MAGIC,8,sequence');
 s=once(s,'for(unsigned i=0;i<64;i++)snapshot[i]=0;','for(unsigned i=0;i<72;i++)snapshot[i]=0;');
 s=once(s,'rw4_direct_backend_stats(snapshot+48);',
 'rw4_direct_backend_stats(snapshot+48);for(unsigned i=0;i<8;i++)snapshot[64+i]=atomic_load(&menu_metrics[i]);');
 return s;
}
export function menuEngineSource(original){
 let s=original;
 // The portable save banks are handled by the watch PAUSE panel, not DOS
 // numbered files. Keep those menu choices informative instead of attempting
 // unsupported paths or loading unrelated saves.
 for(const name of ['Load','Save']){
  const signature='void M_'+name+'Game (int choice)';const at=s.indexOf(signature+'\n{');
  if(at<0)throw Error('Menu definition changed');const begin=s.indexOf('{',at);let depth=1,end=begin+1;
  while(depth&&end<s.length){if(s[end]==='{')depth++;else if(s[end]==='}')depth--;end++;}
  if(depth)throw Error('Menu body unbalanced');
  s=s.slice(0,begin)+'{\n    (void)choice;M_StartMessage("USE WATCH PAUSA\\nGUARDAR / CARGAR",NULL,false);\n}'+s.slice(end);
 }
 return s;
}
