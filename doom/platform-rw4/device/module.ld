/* One text allocation. C uses owned nonlocal exit, not EHABI unwinding. */
SECTIONS
{
    .text : ALIGN(8) { *(.text .text.*) }
    .rodata : { *(.rodata .rodata.*) }
    .data : { *(.data .data.*) }
    .bss : { *(.bss .bss.*) *(COMMON) }
    /DISCARD/ : { *(.ARM.exidx* .ARM.extab*) }
}
