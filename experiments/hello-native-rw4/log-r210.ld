/* ET_REL entry must be relative to the loader's single text allocation. */
SECTIONS
{
    .text 0 : ALIGN(8)
    {
        KEEP(*(.text.entry))
        *(.text .text.*)
        *(.rodata .rodata.*)
    }
    .data : { *(.data .data.*) }
    .bss : { *(.bss .bss.* COMMON) }
}
