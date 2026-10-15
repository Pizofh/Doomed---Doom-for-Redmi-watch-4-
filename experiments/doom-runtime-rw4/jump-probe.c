/* SPDX-License-Identifier: GPL-2.0-or-later
 * Test our base-PCS jump implementation on the PC guest, not RW4 firmware.
 * Compiled without FP instructions; only its own live caller can be resumed.
 */
#include <stdint.h>
struct jump_state { uint32_t words[10]; } __attribute__((aligned(8)));
extern int rw4_port_setjmp(struct jump_state *) __attribute__((returns_twice));
extern _Noreturn void rw4_port_longjmp(struct jump_state *,int);
extern int printf(const char *,...);
static struct jump_state context;
static volatile unsigned touched;
static __attribute__((noinline)) void leaf(int value)
{
    volatile uint32_t padding[16];
    for(unsigned i=0;i<16;i++)padding[i]=3+i;
    touched+=padding[3];
    rw4_port_longjmp(&context,value);
}
static __attribute__((noinline)) void middle(int value)
{
    volatile uint32_t padding[16];
    for(unsigned i=0;i<16;i++)padding[i]=2+i;
    touched+=padding[2];
    leaf(value);
    touched+=padding[1];
}
static __attribute__((noinline)) void nested(int value)
{
    volatile uint32_t padding[16];
    for(unsigned i=0;i<16;i++)padding[i]=1+i;
    touched+=padding[1];
    middle(value);
    touched+=padding[1];
}
static __attribute__((noinline)) int one(int value)
{
    volatile uint32_t sentinel[4]={0x12345678,0x11223344,0xaabbccdd,0x87654321};
    volatile uintptr_t stack_before=(uintptr_t)sentinel;
    int result=rw4_port_setjmp(&context);
    if(!result)nested(value);
    return result==(value?value:1)&&stack_before==(uintptr_t)sentinel&&
        sentinel[0]==0x12345678&&sentinel[1]==0x11223344&&
        sentinel[2]==0xaabbccdd&&sentinel[3]==0x87654321;
}
int rw4_jump_probe_init(void *unused)
{
    (void)unused;
    int a=one(7),b=one(0);
    printf("RW4_JUMP_R271: nonzero=%d zero=%d touched=%u\n",a,b,touched);
    return 0; /* No worker, retained callback, device or heap allocation. */
}
