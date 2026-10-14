/* Exact S3 initializer test fixture. Pure core + already-reviewed puts only. */
#include "core-r229.h"
extern int puts(const char *);
static void packet(unsigned char p[24],uint32_t seq,uint32_t op,uint32_t mask)
{ const uint32_t w[6]={UINT32_C(0x52573449),1,seq,op,mask,0};for(unsigned int i=0;i<6;i++)rw4_put32(p+4*i,w[i]); }
static void zero(volatile struct rw4_step_state *s)
{ s->seq=0;s->phase=0;s->held=0;s->steps=0;s->edges=0; }
#define CHECK(expression) do{if(!(expression))return -5;checks++;}while(0)
int rw4_step_tests_init(void *unused)
{
    (void)unused;unsigned int checks=0;struct rw4_step_state s;zero(&s);unsigned char p[24],out[32];
    packet(p,1,RW4_INPUT,1);CHECK(rw4_step_apply(&s,p,24)==-16&&s.seq==0&&s.held==0);
    packet(p,1,RW4_START,0);CHECK(rw4_step_apply(&s,p,24)==0&&s.phase==RW4_RUNNING);
    CHECK(rw4_step_apply(&s,p,24)==-22&&s.seq==1);
    for(uint32_t bit=1;bit<=8;bit<<=1){
        packet(p,s.seq+1,RW4_INPUT,bit);CHECK(rw4_step_apply(&s,p,24)==0&&s.held==bit);
        uint32_t edges=s.edges;
        packet(p,s.seq+1,RW4_INPUT,bit);CHECK(rw4_step_apply(&s,p,24)==0&&s.edges==edges);
        uint32_t steps=s.steps;
        packet(p,s.seq+1,RW4_STEP,0);CHECK(rw4_step_apply(&s,p,24)==0&&s.steps==steps+1&&s.held==bit);
        packet(p,s.seq+1,RW4_INPUT,0);CHECK(rw4_step_apply(&s,p,24)==0&&s.held==0);
    }
    packet(p,s.seq+1,RW4_INPUT,3);CHECK(rw4_step_apply(&s,p,24)==0&&s.held==3);
    packet(p,s.seq+1,RW4_PAUSE,0);CHECK(rw4_step_apply(&s,p,24)==0&&s.phase==RW4_PAUSED&&s.held==0);
    packet(p,s.seq+1,RW4_STEP,0);CHECK(rw4_step_apply(&s,p,24)==-16&&s.steps==4);
    packet(p,s.seq+1,RW4_INPUT,8);CHECK(rw4_step_apply(&s,p,24)==-16&&s.held==0);
    packet(p,s.seq+1,RW4_RESUME,0);CHECK(rw4_step_apply(&s,p,24)==0&&s.held==0);
    packet(p,s.seq+1,RW4_INPUT,8);CHECK(rw4_step_apply(&s,p,24)==0&&s.held==8);
    packet(p,s.seq+1,RW4_STOP,0);CHECK(rw4_step_apply(&s,p,24)==0&&rw4_step_is_stopped(&s));
    packet(p,s.seq+1,RW4_START,0);CHECK(rw4_step_apply(&s,p,24)==-16&&rw4_step_is_stopped(&s));
    rw4_step_snapshot(&s,out);CHECK(rw4_le32(out)==UINT32_C(0x52573441)&&rw4_le32(out+8)==s.seq&&rw4_le32(out+12)==RW4_STOPPED&&rw4_le32(out+16)==0);
    struct rw4_step_state t;zero(&t);packet(p,1,RW4_START,0);
    CHECK(rw4_step_apply(&t,p,23)==-22&&t.seq==0);
    p[0]^=1;CHECK(rw4_step_apply(&t,p,24)==-22&&t.seq==0);p[0]^=1;
    rw4_put32(p+4,2);CHECK(rw4_step_apply(&t,p,24)==-22&&t.seq==0);rw4_put32(p+4,1);
    rw4_put32(p+20,1);CHECK(rw4_step_apply(&t,p,24)==-22&&t.seq==0);rw4_put32(p+20,0);
    CHECK(rw4_step_apply(&t,p,24)==0);
    packet(p,3,RW4_INPUT,1);CHECK(rw4_step_apply(&t,p,24)==-22&&t.held==0);
    packet(p,2,RW4_INPUT,16);CHECK(rw4_step_apply(&t,p,24)==-22&&t.seq==1&&t.held==0);
    packet(p,2,99,0);CHECK(rw4_step_apply(&t,p,24)==-22&&t.seq==1);
    packet(p,2,RW4_STEP,1);CHECK(rw4_step_apply(&t,p,24)==-22&&t.seq==1);
    t.steps=UINT32_MAX;packet(p,2,RW4_STEP,0);CHECK(rw4_step_apply(&t,p,24)==-75&&t.seq==1);
    t.edges=UINT32_MAX;packet(p,2,RW4_INPUT,1);CHECK(rw4_step_apply(&t,p,24)==-75&&t.held==0);
    t.seq=UINT32_MAX;packet(p,0,RW4_STOP,0);CHECK(rw4_step_apply(&t,p,24)==-22);
    CHECK(checks==40);
    return puts("RW4_STEP_CORE_OK 41")<0?-5:0;
}
