import fs from 'node:fs';import path from 'node:path';import {root,sha256,once,padsAdapter,padsTransport} from './doom-pads-source-r349.mjs';
export {root,sha256,once};
export function readyRuntime(){
 let s=fs.readFileSync(path.join(root,'build/doom-rw4-engine/runtime-device.c'),'utf8');
 if(sha256(s)!==JSON.parse(fs.readFileSync(path.join(root,'build/doom-rw4-engine/runtime-review.json'))).runtimeSourceSha256)throw Error('RuntimeChanged');
 s=once(s,'#include <stdatomic.h>','#include <stdatomic.h>\n#include "slot-r351.h"');
 s=once(s,'rw4_runtime_poll();if(!equal(mode,"rb")','rw4_runtime_poll();if(equal(path,RW4_SLOT_PATH)){void *p=rw4_slot_open(mode);if(p){stats.streams++;stats.opened++;}return p;}if(!equal(mode,"rb")');
 s=once(s,'rw4_runtime_poll();int i=file_index(s);if(i<0){error_number(9);return -1;}\n    int rc=fclose','rw4_runtime_poll();if(rw4_slot_is(s)){int rc=rw4_slot_close();stats.streams--;stats.closed++;return rc;}int i=file_index(s);if(i<0){error_number(9);return -1;}\n    int rc=fclose');
 s=once(s,'size_t rw4_fread(void *p,size_t size,size_t count,struct rw4_file *s){','size_t rw4_fread(void *p,size_t size,size_t count,struct rw4_file *s){\n    rw4_runtime_poll();if(rw4_slot_is(s))return rw4_slot_read(p,size,count);');
 s=once(s,'(void)p;(void)size;(void)count;(void)s;rw4_runtime_poll();deny();return 0;','rw4_runtime_poll();if(rw4_slot_is(s))return rw4_slot_write(p,size,count);deny();return 0;');
 s=once(s,'int rw4_fseek(struct rw4_file *s,long offset,int origin){','int rw4_fseek(struct rw4_file *s,long offset,int origin){\n    rw4_runtime_poll();if(rw4_slot_is(s))return rw4_slot_seek(offset,origin);');
 for(const[n,extra]of [['ftell','return rw4_slot_tell();'],['feof','return rw4_slot_eof();'],['ferror','return rw4_slot_error();'],['clearerr','{rw4_slot_clear();return;}']])s=once(s,`rw4_${n}(struct rw4_file *s){rw4_runtime_poll();`,`rw4_${n}(struct rw4_file *s){rw4_runtime_poll();if(rw4_slot_is(s))${extra}`);
 s=once(s,'if(!s||s==&out||s==&err||file_index(s)>=0)','if(!s||s==&out||s==&err||rw4_slot_is(s)||file_index(s)>=0)');
 s=once(s,'allowed=NULL;if(!stats.cleanup_error)active=0;','if(rw4_slot_abort()){stats.streams--;stats.closed++;}\n    allowed=NULL;if(!stats.cleanup_error)active=0;');return s;
}
export function readyAdapter(){
 let s=padsAdapter();s=once(s,'#include "g_game.h"','#include "g_game.h"\n#include "p_saveg.h"\n#include "slot-r351.h"');
 s=once(s,'now-started>120000u','now-started>1800000u');s=once(s,'gamestate!=GS_LEVEL||gameepisode!=1||gamemap!=1||!DG_ScreenBuffer','!DG_ScreenBuffer');
 s=once(s,'for(unsigned iteration=0;iteration<10000;iteration++)','for(;;)');
 s=once(s,'doomgeneric_Create(10,argv);','verify_wad();doomgeneric_Create(10,argv);');
 const helpers=fs.readFileSync(path.join(root,'doom/platform-rw4/device/ready-actions-r351.c'),'utf8');
 s=once(s,'void rw4_game_body(void *unused)',helpers+'\nvoid rw4_game_body(void *unused)');
 s=once(s,'flush_keys();snapshot();rw4_game_pause_ack();DG_SleepMs(20);','flush_keys();rw4_game_pause_ack();slot_action();snapshot();DG_SleepMs(20);');return s;
}
export function readyTransport(){
 let s=padsTransport().replaceAll('0x35445752','0x36445752').replaceAll('/dev/rw4doompads','/dev/rw4doomready');s=once(s,'DIRECT_MAGIC,5,sequence','DIRECT_MAGIC,6,sequence');
 s=once(s,'#include "profile-r335.h"','#include "profile-r335.h"\n#include "slot-r351.h"');
 s=once(s,'static uint32_t snapshot[64];','static uint32_t snapshot[64];\nstatic atomic_uint slot_request,slot_busy,slot_done,slot_result;\nstatic unsigned slot_registered;\nstatic const char slot_path[]="/dev/rw4doomslot";');
 s=once(s,'op>7','op>9');s=once(s,'if(op==1)rc=start_game();',`if(op>=8){
        if(!started||joined||!atomic_load(&ready)||atomic_load(&finished)||atomic_load(&stop)||!atomic_load(&paused)||atomic_load(&applied)||atomic_load(&requested)||atomic_load(&epoch)!=atomic_load(&ack)||rw4_slot_opened()||atomic_load(&slot_busy)||atomic_load(&slot_request)||(op==9&&!rw4_slot_valid()))return -16;
        atomic_store(&slot_busy,1);atomic_store(&slot_result,0);atomic_store(&slot_request,op);
    }else if(op==1)rc=start_game();`);
 s=once(s,'if(!started||joined||atomic_load(&stop)||atomic_load(&applied)','if(rw4_slot_opened()||atomic_load(&slot_busy)||atomic_load(&slot_request)||!started||joined||atomic_load(&stop)||atomic_load(&applied)');
 s=once(s,'snapshot[44]=atomic_load(&tick_cost);','snapshot[54]=atomic_load(&slot_done);snapshot[55]=atomic_load(&slot_busy);snapshot[56]=atomic_load(&slot_result);snapshot[57]=rw4_slot_valid();snapshot[58]=rw4_slot_length();snapshot[59]=rw4_slot_crc();\n        snapshot[44]=atomic_load(&tick_cost);');
 s=once(s,'if(registered){if(rw4_host_unregister(control_path))','if(slot_registered){if(rw4_host_unregister(slot_path)){atomic_store(&error,1);return -16;}slot_registered=0;}\n    if(registered){if(rw4_host_unregister(control_path))');
 s=once(s,'registered=1;\n    info->uninit','registered=1;\n    rc=rw4_host_register(slot_path,&rw4_slot_ops,0600,NULL);if(rc){if(rw4_host_unregister(control_path))atomic_store(&error,1);else registered=0;return rc;}slot_registered=1;\n    info->uninit');
 return s+`\nint rw4_slot_ui_enter(void){if(enter())return -16;if((started&&owner!=(unsigned)rw4_host_owner_token())||!started||joined||atomic_load(&finished)||atomic_load(&stop)||!atomic_load(&paused)||atomic_load(&epoch)!=atomic_load(&ack)||atomic_load(&slot_busy)||atomic_load(&slot_request)){leave();return -16;}return 0;}
void rw4_slot_ui_leave(void){leave();}
unsigned rw4_slot_action_take(void){return atomic_exchange(&slot_request,0);}
void rw4_slot_action_done(unsigned action,unsigned result){atomic_store(&slot_result,result);atomic_store(&slot_done,action);atomic_store(&slot_busy,0);}
`;
}
