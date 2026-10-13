/* Offline RW4 loader candidate. No hardware execution is authorized. */
__attribute__((aligned(8))) int rw4_minimal_init(void *module_info)
{
    (void)module_info;
    return 0;
}
