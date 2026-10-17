// Six real Doom keys; retain the physically validated Wide rendering path.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,demandAdapter} from './doom-demand-source-r337.mjs';
export {root,sha256};
export function once(s,a,b){if(s.split(a).length!==2)throw Error('PadsTemplateChanged:'+a);return s.replace(a,()=>b);}
export function padsTransport(){
 let s=fs.readFileSync(path.join(root,'doom/platform-rw4/device/direct-transport-r343.c'),'utf8');
 s=s.replaceAll('0x34445752','0x35445752').replaceAll('/dev/rw4doomdirect','/dev/rw4doompads');
 s=once(s,'keys[4]={0xad,0xac,0xae,0xa3}','keys[6]={0xad,0xac,0xae,0xa3,0xaf,0xa2}');
 s=once(s,'bit<4','bit<6');s=once(s,'value>15||(value&6)==6','value>63||(value&6)==6||(value&17)==17');
 s=once(s,'DIRECT_MAGIC,4,sequence','DIRECT_MAGIC,5,sequence');
 s=once(s,'static uint32_t snapshot[64];','static uint32_t snapshot[64];\nstatic atomic_uint command_buttons,use_edges;\nstatic unsigned previous_use;\nvoid rw4_game_actions(unsigned buttons,unsigned usedown){atomic_store(&command_buttons,buttons);if(usedown&&!previous_use)atomic_fetch_add(&use_edges,1);previous_use=usedown;}');
 s=once(s,'snapshot[44]=atomic_load(&tick_cost);','snapshot[52]=atomic_load(&command_buttons);snapshot[53]=atomic_load(&use_edges);\n        snapshot[44]=atomic_load(&tick_cost);');
 return s;
}
export function padsAdapter(){
 let s=demandAdapter();
 s='extern void rw4_game_actions(unsigned,unsigned);\n'+s;
 s=once(s,'*key==KEY_FIRE?8u:0','*key==KEY_FIRE?8u:*key==KEY_DOWNARROW?16u:*key==KEY_USE?32u:0');
 s=once(s,'rw4_game_metrics(v);','rw4_game_metrics(v);rw4_game_actions(p->cmd.buttons,(unsigned)p->usedown);');
 return s;
}
