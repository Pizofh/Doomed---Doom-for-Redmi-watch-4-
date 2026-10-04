/* Keep one executable section: the inspected ET_REL loader uses .text+entry.
 * Compilation uses function sections to force long calls before this merge. */
SECTIONS
{
    .text : { *(.text .text.*) }
    .rodata : { *(.rodata .rodata.*) }
    .data : { *(.data .data.*) }
    .bss : { *(.bss .bss.*) *(COMMON) }
}
