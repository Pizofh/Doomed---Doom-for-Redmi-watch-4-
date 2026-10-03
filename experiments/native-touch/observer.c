/* Exact SHA-pinned emulator ABI. Independent reader; no grab or injection.
 * No LVGL, framebuffer writes, callbacks, tasks, or persistent files.
 * The compiled guest broadcasts touch_event to per-open queues (unless grabbed).
 */
extern int open(const char *path, int flags, ...);
extern int close(int fd);
extern int read(int fd, void *buffer, unsigned int bytes);
extern int usleep(unsigned int microseconds);
extern int printf(const char *format, ...);
extern int fflush(void *stream);
extern int *__errno(void);

static unsigned int le16(const unsigned char *p)
{
    return (unsigned int)p[0] | ((unsigned int)p[1] << 8);
}

static unsigned int le32(const unsigned char *p)
{
    return le16(p) | (le16(p + 2) << 16);
}

int rw4_touch_init(void *module_info)
{
    unsigned int sample_words[8]; /* 32-byte guest sample; aligned stack buffer. */
    unsigned char *sample = (unsigned char *)sample_words;
    unsigned int events = 0, idle = 0;
    int last_x = -1, last_y = -1, result = 0;
    int fd;
    (void)module_info;

    /* Guest touch_read tests bit 6 before waiting: NuttX O_NONBLOCK.
     * O_RDONLY is bit 0, not the Linux value zero. No ioctl/TSIOC_GRAB.
     */
    fd = open("/dev/input0", 1 | 64);
    if (fd < 0) {
        printf("RW4_TOUCH: open failed errno=%d\n", *__errno());
        return -5;
    }
    printf("RW4_TOUCH: ready independent-reader\n");
    fflush((void *)0);

    /* At most 500 nonblocking reads and 500 requested 20ms sleeps.
     * This is a bounded observation window, not a strict wall-clock deadline.
     * Driver buffers/descriptor are released before initializer returns.
     */
    for (unsigned int i = 0; i < 500; i++) {
        int count = read(fd, sample, sizeof(sample_words));
        if (count < 0) {
            int error = *__errno();
            if (error != 11) { /* EAGAIN, matched to guest touch_read. */
                printf("RW4_TOUCH: read failed errno=%d\n", error);
                result = -5;
                break;
            }
            idle++;
        } else if (count == 0) {
            idle++;
        } else if (count != 32 || le32(sample) != 1) {
            printf("RW4_TOUCH: unexpected sample bytes=%d\n", count);
            result = -5;
            break;
        } else {
            unsigned int flags = sample[9];
            int raw_x = (short)le16(sample + 10);
            int raw_y = (short)le16(sample + 12);
            if ((flags & 16) != 0) {
                last_x = raw_x;
                last_y = raw_y;
            }
            events++;
            printf("RW4_TOUCH_EVENT: n=%u flags=%02x pos_valid=%u raw=%d,%d last=%d,%d time_us=%08x%08x\n",
                   events, flags, (flags & 16) != 0, raw_x, raw_y, last_x, last_y,
                   le32(sample + 28), le32(sample + 24));
            fflush((void *)0);
        }
        if (usleep(20000) < 0) {
            printf("RW4_TOUCH: sleep interrupted\n");
            result = -5;
            break;
        }
    }
    int closed = close(fd);
    printf("RW4_TOUCH: complete events=%u idle=%u close=%d result=%d\n",
           events, idle, closed, result);
    return closed < 0 ? -5 : result;
}
