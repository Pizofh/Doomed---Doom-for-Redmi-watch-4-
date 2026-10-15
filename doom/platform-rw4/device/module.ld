/* One text allocation. C uses owned nonlocal exit, not EHABI unwinding. */
SECTIONS
{
    .text 0 : { *(.text .text.*) }
    .rodata 0 : { *(.rodata .rodata.*) }
    .data 0 : { *(.data .data.*) }
    .bss 0 : { *(.bss .bss.*) *(COMMON) }
    /DISCARD/ : { *(.ARM.exidx* .ARM.extab*) }
}
