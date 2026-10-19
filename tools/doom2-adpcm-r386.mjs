// SPDX-License-Identifier: GPL-2.0-only
// Isolated cache representation. WAD, game zone, saves, graphics stay unchanged.
import fs from 'node:fs';import path from 'node:path';
import {root,once} from './doom-ready-source-r351.mjs';
export function adpcmHeader(){let s=fs.readFileSync(path.join(root,'doom/platform-rw4/audio/pcm-core.h'),'utf8');
 s=once(s,'uint32_t length, rate;','uint32_t length, rate, encoded;');
 return once(s,'uint32_t position, fraction, volume;','uint32_t position, fraction, volume; int prediction; unsigned step_index, decoded;');}
export function adpcmCore(){let s=fs.readFileSync(path.join(root,'doom/platform-rw4/audio/pcm-core.c'),'utf8');
 s=once(s,'#include "pcm-core.h"','#include "pcm-core.h"\n#include "adpcm-r386.h"');
 s=once(s,'out->rate = rate; return 0;','out->rate = rate; out->encoded=0; return 0;');
 s=once(s,'volume > 127) return -1;','volume > 127 || s->encoded>1 || (s->encoded&&(s->data[2]>88||s->data[3]))) return -1;');
 s=once(s,'v->sample = *s; v->position = 0; v->fraction = 0; v->volume = volume;',
 `v->sample = *s; v->position = 0; v->fraction = 0; v->volume = volume;
    v->decoded=0;v->step_index=s->encoded?s->data[2]:0;
    v->prediction=s->encoded?(int16_t)((unsigned)s->data[0]|((unsigned)s->data[1]<<8)):0;`);
 return once(s,'mixed += ((int32_t)v->sample.data[v->position] - 128) * 256 * (int32_t)v->volume / 127;',
 `int value;
            if(v->sample.encoded){
                while(v->decoded<v->position){unsigned at=v->decoded++,byte=v->sample.data[4+at/2];
                    (void)doomed_adpcm_step((at&1)?byte&15:byte>>4,&v->prediction,&v->step_index);}
                value=v->prediction;
            }else value=((int)v->sample.data[v->position]-128)*256;
            mixed += value*(int32_t)v->volume/127;`);
}
export function adpcmSfx(s){
 s=once(s,'#include "pcm-core.h"','#include "pcm-core.h"\n#include "adpcm-r386.h"');
 s=once(s,'#define CACHE_BYTES (640u*1024u)','#define CACHE_BYTES (320u*1024u)');
 return once(s,`unsigned count=s.rate>=8000?(s.length+1)/2:s.length;
 if(count>CACHE_BYTES-used)return -1;
 uint8_t *dst=cache+used;
 if(s.rate>=8000){for(unsigned i=0;i<count;i++){unsigned j=i*2,k=j+1<s.length?j+1:j;dst[i]=(uint8_t)(((unsigned)s.data[j]+s.data[k]+1)/2);}s.rate/=2;s.length=count;}
 else for(unsigned i=0;i<s.length;i++)dst[i]=s.data[i];
 s.data=dst;bank[id]=s;used+=s.length;return 0;`,
 `unsigned stride=s.rate>=8000?2:1,count=(s.length+stride-1)/stride;
 unsigned bytes=doomed_adpcm_bytes(count);if(!bytes||bytes>CACHE_BYTES-used)return -1;
 uint8_t *dst=cache+used;
 if(doomed_adpcm_store(dst,CACHE_BYTES-used,s.data,s.length,stride)!=(int)bytes)return -1;
 s.length=count;s.rate/=stride;s.encoded=1;s.data=dst;bank[id]=s;used+=bytes;return 0;`);
}
