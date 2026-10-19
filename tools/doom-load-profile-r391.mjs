// SPDX-License-Identifier: GPL-2.0-only
import assert from 'node:assert/strict';
export function profileStartup(s,fast=false){
 const old='verify_wad();doomgeneric_Create(5,argv);';assert.equal(s.split(old).length,2);
 return s.replace(old,`uint32_t load_begin=raw_ticks();verify_wad();uint32_t load_checked=raw_ticks();
 doomgeneric_Create(5,argv);uint32_t load_created=raw_ticks();
 /* Profile-only title coordinates, replaced by real spawn on NEW GAME. */
 menu_spawn[0]=load_checked-load_begin;menu_spawn[1]=load_created-load_checked;menu_spawn[2]=load_created-load_begin;`);
}
export function packedStartup(s){
 const start=s.indexOf('static void verify_wad(void)'),end=s.indexOf('static void slot_action(void)',start);assert(start>0&&end>start);
 return s.slice(0,start)+`extern int rw4_verify_packed_file(struct rw4_file *);
static void verify_wad(void)
{
 struct rw4_file *f=rw4_fopen(RW4_GAME_WAD,"rb");if(!f)rw4_exit(84);
 int failed=rw4_verify_packed_file(f),closed=rw4_fclose(f);
 if(failed||closed)rw4_exit(84);
}
`+s.slice(end);
}
export function packedRuntime(s){
 const at=s.indexOf('size_t rw4_fread(');assert(at>0);
 return s.slice(0,at)+`/* Tracked stream: cancellation still closes the cursor in runtime cleanup. */
extern int rw4_packed_verify_physical(void *,void (*)(void));
int rw4_verify_packed_file(struct rw4_file *s){
 rw4_runtime_poll();int i=file_index(s);if(i<0){error_number(9);return -1;}
 return rw4_packed_verify_physical(files[i].raw,rw4_runtime_poll);
}
`+s.slice(at);
}
