// SPDX-License-Identifier: GPL-2.0-only
import assert from 'node:assert/strict';
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,a);return s.replace(a,()=>b);};
export function weaponAdapter(s){
 s=once(s,'static unsigned char menu_mapped[7];','static unsigned char menu_mapped[9];');
 s=once(s,'*key==KEY_ESCAPE?64u:0','*key==KEY_ESCAPE?64u:*key==\'[\'?128u:*key==\']\'?256u:0');
 s=once(s,'while(index<6&&bit!=(1u<<index))','while(index<8&&bit!=(1u<<index))');
 return once(s,'key_menu_confirm=KEY_ENTER;key_menu_abort=KEY_BACKSPACE;','key_menu_confirm=KEY_ENTER;key_menu_abort=KEY_BACKSPACE;key_prevweapon=\'[\';key_nextweapon=\']\';');
}
export function weaponTransport(s){
 s=once(s,'keys[7]={0xad,0xac,0xae,0xa3,0xaf,0xa2,27}','keys[9]={0xad,0xac,0xae,0xa3,0xaf,0xa2,27,91,93}');
 s=once(s,'bit<7','bit<9');return once(s,'value>127||(value&6)==6||(value&17)==17','value>511||(value&6)==6||(value&17)==17||(value&384)==384');
}
export function quietRuntime(s){return once(s,'if(n>=0)printf("RW4_DOOM_LOG: %s",b);','if(n>=0&&s==&err)printf("RW4_DOOM_ERROR: %s",b);');}
