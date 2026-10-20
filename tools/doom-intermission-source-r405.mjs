// SPDX-License-Identifier: GPL-2.0-only
import assert from 'node:assert/strict';

const once=(source,from,to)=>{assert.equal(source.split(from).length,2,from);return source.replace(from,()=>to);};

// The original UI treated every non-level screen as a menu.  Doom's
// intermission advances through the normal FIRE game key instead, so mapping it
// to Enter strands the player after a completed map.
export function intermissionAdapter(source){
 let s=once(source,
  'static unsigned char menu_mapped[9];',
  'static unsigned char menu_mapped[9];\nstatic unsigned menu_key_remap(void)\n{return menuactive||gamestate==GS_DEMOSCREEN||demoplayback;}');
 return once(s,
  'if(menu_navigation()){\n            if(key==KEY_FIRE)mapped=KEY_ENTER;\n            else if(key==KEY_USE)mapped=KEY_BACKSPACE;\n        }',
  'if(menu_key_remap()){\n            if(key==KEY_FIRE)mapped=KEY_ENTER;\n            else if(key==KEY_USE)mapped=KEY_BACKSPACE;\n        }');
}
