/* Portable bounded state machine. No OS calls, threads, drivers or filesystem. */
#ifndef RW4_STEP_CORE_R229_H
#define RW4_STEP_CORE_R229_H
#include <stdint.h>
#include <stddef.h>
enum rw4_step_op { RW4_START=1, RW4_INPUT, RW4_STEP, RW4_PAUSE, RW4_RESUME, RW4_STOP };
enum rw4_step_phase { RW4_IDLE=0, RW4_RUNNING, RW4_PAUSED, RW4_STOPPED };
struct rw4_step_state { uint32_t seq,phase,held,steps,edges; };
static inline uint32_t rw4_le32(const unsigned char *p)
{ return (uint32_t)p[0]|((uint32_t)p[1]<<8)|((uint32_t)p[2]<<16)|((uint32_t)p[3]<<24); }
static inline void rw4_put32(unsigned char *p,uint32_t n)
{ for(unsigned int i=0;i<4;i++)p[i]=(unsigned char)(n>>(i*8)); }
static inline int rw4_step_apply(struct rw4_step_state *s,const unsigned char *p,size_t n)
{
    if(!s||!p||n!=24||rw4_le32(p)!=UINT32_C(0x52573449)||rw4_le32(p+4)!=1||rw4_le32(p+20)!=0)return -22;
    uint32_t seq=rw4_le32(p+8),op=rw4_le32(p+12),held=rw4_le32(p+16);
    if(s->seq==UINT32_MAX||seq!=s->seq+1||held>15||op<RW4_START||op>RW4_STOP)return -22;
    if(op!=RW4_INPUT&&held!=0)return -22;
    uint32_t phase=s->phase,mask=s->held,steps=s->steps;
    switch(op){
    case RW4_START: if(phase!=RW4_IDLE)return -16;phase=RW4_RUNNING;mask=0;break;
    case RW4_INPUT: if(phase!=RW4_RUNNING)return -16;mask=held;break;
    case RW4_STEP: if(phase!=RW4_RUNNING)return -16;if(steps==UINT32_MAX)return -75;steps++;break;
    case RW4_PAUSE: if(phase!=RW4_RUNNING)return -16;phase=RW4_PAUSED;mask=0;break;
    case RW4_RESUME: if(phase!=RW4_PAUSED)return -16;phase=RW4_RUNNING;mask=0;break;
    case RW4_STOP: if(phase!=RW4_RUNNING&&phase!=RW4_PAUSED)return -16;phase=RW4_STOPPED;mask=0;break;
    default:return -22;
    }
    if(mask!=s->held&&s->edges==UINT32_MAX)return -75;
    if(mask!=s->held)s->edges++;
    s->seq=seq;s->phase=phase;s->held=mask;s->steps=steps;return 0;
}
static inline void rw4_step_snapshot(const struct rw4_step_state *s,unsigned char out[32])
{
    const uint32_t words[8]={UINT32_C(0x52573441),1,s->seq,s->phase,s->held,s->steps,s->edges,0};
    for(unsigned int i=0;i<8;i++)rw4_put32(out+4*i,words[i]);
}
/* No live code references may be assumed absent from this flag alone. */
static inline int rw4_step_is_stopped(const struct rw4_step_state *s)
{ return s->phase==RW4_STOPPED&&s->held==0; }
#endif
