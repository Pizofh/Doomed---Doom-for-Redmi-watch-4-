// SPDX-License-Identifier: GPL-2.0-only
// Generate fixed candidate bindings locally; never execute them or authorize deployment.
import fs from 'node:fs';import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
export function audioBindings(root){
 const bytes=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
 const functions=[['focus_request',0x4e19bc,'int (*)(int *,const char *,void (*)(int,void *),void *)'],
  ['focus_abandon',0x4e1f94,'int (*)(int)'],['open',0x4e00a0,'void *(*)(const char *)'],
  ['prepare',0x4e0194,'int (*)(void *,const char *,const char *)'],['start',0x4e0440,'int (*)(void *)'],
  ['pause',0x4e04dc,'int (*)(void *)'],['stop',0x4e0480,'int (*)(void *)'],
  ['write',0x4e0378,'int (*)(void *,const void *,unsigned)'],['close',0x4e00b0,'int (*)(void *,int)']];
 const records=functions.map(([name,offset,type])=>{const b=bytes.subarray(offset,offset+64);let fnv=2166136261;
  for(const byte of b)fnv=Math.imul(fnv^byte,16777619)>>>0;
  return {name,offset,type,address:offset+0x1bff187c,fnv,sha256:createHash('sha256').update(b).digest('hex')};});
 const source=`/* Candidate AP only. New physical execution requires review. */
#include "media-sink.h"
#include <stdint.h>
static int validate(void){
 const struct{uintptr_t address;uint32_t fnv;} pins[]={${records.map(r=>'{'+r.address+'u,'+r.fnv+'u}')}};
 for(unsigned i=0;i<sizeof(pins)/sizeof(pins[0]);i++){
  const volatile unsigned char *p=(const volatile unsigned char *)pins[i].address;
  uint32_t h=2166136261u;for(unsigned j=0;j<64;j++)h=(h^p[j])*16777619u;
  if(h!=pins[i].fnv)return -1;
 }return 0;
}
static const struct doomed_media_api api={validate,${records.map(r=>'('+r.type+')'+(r.address+1)+'u').join(',')}};
const struct doomed_media_api *rw4_media_api(void){return &api;}
`;
 return {source,records:records.map(({type,...record})=>record)};
}
