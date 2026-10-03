/* Emulator-only NuttX ET_REL initializer. No threads or retained callbacks. */
extern int puts(const char *message);

int rw4_hello_init(void *module_info)
{
    (void)module_info;
    return puts("RW4 emulator: hello C") < 0 ? -5 : 0;
}
