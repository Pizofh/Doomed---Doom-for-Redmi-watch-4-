/* SPDX-License-Identifier: GPL-2.0-only */
/* Reuse the original model and all its publication/fence regressions. */
#define direct_tests_init direct_legacy_tests_init
#include "direct-view-tests-r342.c"
#undef direct_tests_init
#include "direct-detach-r368.h"
static int detach_tests(void)
{
    fixture();CHECK(!rw4_direct_start(&bridge));CHECK(!produce(1));CHECK(!rw4_direct_present(&bridge));
    struct rw4_direct_ticket t;uint32_t *data;
    CHECK(!rw4_direct_acquire(&bridge,&t,&data));unsigned dropped=m.dropped;
    CHECK(!rw4_direct_detach(&bridge));CHECK(!m.live&&!m.hooked&&!m.pending);
    CHECK(atomic_load(&bridge.producer_busy)&&m.dropped==dropped);
    CHECK(!rw4_direct_can_unload(&bridge));CHECK(!rw4_direct_detach(&bridge));
    CHECK(rw4_direct_retire(&bridge,0)==-16);CHECK(rw4_direct_retire(&bridge,1)==-16);
    CHECK(rw4_direct_publish(&bridge,t)==-16);CHECK(!rw4_direct_retire(&bridge,1));
    CHECK(m.dropped==dropped+2&&rw4_direct_can_unload(&bridge));
    CHECK(!rw4_direct_retire(&bridge,1)&&m.dropped==dropped+2);
    /* Hidden/clipped draw is an error, but must not prevent visual removal. */
    fixture();CHECK(!rw4_direct_start(&bridge));CHECK(!produce(2));m.no_events=1;
    CHECK(rw4_direct_present(&bridge)==-5);CHECK(!rw4_direct_detach(&bridge));
    CHECK(!m.live&&!m.hooked&&!m.pending&&atomic_load(&bridge.error)==DIRECT_E_EVENT);
    CHECK(rw4_direct_retire(&bridge,1)==-5);CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));
    m.hook(&bridge,&m,DIRECT_DELETED);m.live=m.hooked=0;m.hook=NULL;
    CHECK(!rw4_direct_detach(&bridge));CHECK(rw4_direct_retire(&bridge,1)==-5);
    CHECK(m.deleted==0&&m.dropped==2&&!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));m.fail_finish=m.finish_calls+1;
    CHECK(rw4_direct_detach(&bridge)==-5);CHECK(m.live&&m.hooked&&!m.deleted);
    CHECK(!rw4_direct_detach(&bridge));CHECK(!m.live&&!m.hooked);
    CHECK(rw4_direct_retire(&bridge,1)==-5&&!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));m.owner=99;
    CHECK(rw4_direct_detach(&bridge)==-1&&m.live);m.owner=17;m.validate_fail=1;
    CHECK(rw4_direct_detach(&bridge)==-5&&m.live);m.validate_fail=0;
    CHECK(!rw4_direct_detach(&bridge));CHECK(!rw4_direct_can_unload(&bridge));
    fixture();CHECK(!rw4_direct_start(&bridge));m.remove_fail=1;
    CHECK(rw4_direct_detach(&bridge)==-5&&m.live&&m.hooked);m.remove_fail=0;
    CHECK(!rw4_direct_detach(&bridge));CHECK(!m.live&&!m.hooked&&!rw4_direct_can_unload(&bridge));
    return 0;
}
int direct_tests_init(struct module_info *info)
{
    if(!info||run()||detach_tests())return -22;
    info->uninit=uninit;info->arg=NULL;info->exports=NULL;info->nexports=0;
    test_printf("DIRECT_R368 PASS checks=%u scenarios=%u compared_pixels=%u physical=0 graphics=modeled\n",checks,scenarios,48u*RW4_DIRECT_PIXELS);return 0;
}
