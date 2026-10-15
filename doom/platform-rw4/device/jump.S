/* SPDX-License-Identifier: GPL-2.0-or-later
 * Owned nonlocal exit for our Thumb/base-PCS soft-float code only.
 * Ten words: r4-r11, caller SP, return LR. Never cross a task boundary.
 * Firmware calls must return before jumping; this is not a stock jmp_buf.
 */
.syntax unified
.thumb
.text
.balign 8
.global rw4_port_setjmp
.type rw4_port_setjmp, %function
.thumb_func
rw4_port_setjmp:
    stmia r0!, {r4-r11}
    mov r2, sp
    str r2, [r0]
    str lr, [r0, #4]
    movs r0, #0
    bx lr
.size rw4_port_setjmp, .-rw4_port_setjmp

.balign 8
.global rw4_port_longjmp
.type rw4_port_longjmp, %function
.thumb_func
rw4_port_longjmp:
    mov r2, r0
    mov r0, r1
    cmp r0, #0
    it eq
    moveq r0, #1
    ldmia r2!, {r4-r11}
    ldr r3, [r2]
    ldr lr, [r2, #4]
    mov sp, r3
    bx lr
.size rw4_port_longjmp, .-rw4_port_longjmp
