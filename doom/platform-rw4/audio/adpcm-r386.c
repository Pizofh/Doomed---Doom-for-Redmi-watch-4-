/* SPDX-License-Identifier: GPL-2.0-only */
/* IMA/DVI arithmetic; independent bounded state for each playing voice.
 * No heap, media calls, files, thread sharing, or whole-effect decode buffer. */
#include "adpcm-r386.h"
static const unsigned steps[89]={7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767};
static const int changes[8]={-1,-1,-1,-1,2,4,6,8};
int doomed_adpcm_step(unsigned code,int *value,unsigned *index){
 if(!value||!index||*index>88||code>15)return -1;
 unsigned step=steps[*index],magnitude=code&7,delta=step/8;
 if(magnitude&4)delta+=step;if(magnitude&2)delta+=step/2;if(magnitude&1)delta+=step/4;
 int next=*value+((code&8)?-(int)delta:(int)delta);
 *value=next>32767?32767:next< -32768?-32768:next;
 int at=(int)*index+changes[magnitude];*index=at<0?0:at>88?88:(unsigned)at;return 0;
}
unsigned doomed_adpcm_bytes(unsigned n){return n&&n<=262112?4+n/2:0;}
static int sample(const uint8_t *p,unsigned n,unsigned stride,unsigned i){
 unsigned j=i*stride,k=j+1<n?j+1:j;
 unsigned v=stride==2?((unsigned)p[j]+p[k]+1)/2:p[j];return((int)v-128)*256;
}
static unsigned nibble(int target,int *value,unsigned *index){
 int difference=target-*value;unsigned code=0;
 if(difference<0){code=8;difference=-difference;}
 unsigned step=steps[*index];
 if((unsigned)difference>=step){code|=4;difference-=(int)step;}
 if((unsigned)difference>=step/2){code|=2;difference-=(int)(step/2);}
 if((unsigned)difference>=step/4)code|=1;
 (void)doomed_adpcm_step(code,value,index);return code;
}
int doomed_adpcm_store(uint8_t *dst,unsigned capacity,const uint8_t *src,unsigned n,unsigned stride){
 if(!dst||!src||!n||n>262112||(stride!=1&&stride!=2))return -1;
 unsigned count=(n+stride-1)/stride,bytes=doomed_adpcm_bytes(count);if(!bytes||bytes>capacity)return -1;
 int value=sample(src,n,stride,0);unsigned index=0,best=UINT32_MAX;
 /* A short bounded search avoids losing a transient while the step adapts
  * from silence. At most 12*63 samples/effect; no heap or whole-effect pass. */
 for(unsigned initial=0;initial<=88;initial+=8){int prediction=value;unsigned candidate=initial,score=0;
  for(unsigned i=1;i<count&&i<64;i++){int target=sample(src,n,stride,i);(void)nibble(target,&prediction,&candidate);
   int difference=target-prediction;unsigned error=(unsigned)(difference<0?-difference:difference)>>8;score+=error*error;}
  if(score<best){best=score;index=initial;}
 }
 dst[0]=(uint8_t)value;dst[1]=(uint8_t)((unsigned)value>>8);dst[2]=(uint8_t)index;dst[3]=0;
 for(unsigned i=1;i<count;i++){
  unsigned code=nibble(sample(src,n,stride,i),&value,&index);
  unsigned at=4+(i-1)/2;if(i&1)dst[at]=(uint8_t)(code<<4);else dst[at]|=(uint8_t)code;
 }
 return (int)bytes;
}
