/* Bounded framebuffer experiment for the inspected Goldfish guest only.
 * Shares the stock renderer's framebuffer; no exclusive ownership is claimed.
 */
extern int open(const char *, int, ...);
extern int close(int);
extern int ioctl(int, int, ...);
extern int printf(const char *, ...);
extern void *malloc(unsigned int);
extern void free(void *);
extern void *memcpy(void *, const void *, unsigned int);
extern int usleep(unsigned int);

struct video_info {
    unsigned char fmt;
    unsigned short width, height;
    unsigned char planes;
};
struct plane_info {
    void *memory;
    unsigned int length;
    unsigned short stride;
    unsigned char display, bpp;
    unsigned int virtual_width, virtual_height, xoffset, yoffset;
};
_Static_assert(sizeof(struct video_info) == 8, "Guest video ABI");
_Static_assert(sizeof(struct plane_info) == 28, "Guest plane ABI");
_Static_assert(__builtin_offsetof(struct plane_info, display) == 10, "Guest plane selector");

int rw4_display_init(void *module_info)
{
    struct video_info video = {0};
    struct plane_info plane = {0};
    const unsigned short colors[6] = {0xf800, 0xffe0, 0x07e0, 0x07ff, 0x001f, 0xf81f};
    unsigned char *backup;
    volatile unsigned short *pixels;
    int fd, show_result, restore_result, close_result;
    (void)module_info;
    fd = open("/dev/fb0", 3); /* NuttX O_RDWR, no create/truncate. */
    if (fd < 0) return -5;
    if (ioctl(fd, 0x2801, (unsigned long)&video) < 0 ||
        ioctl(fd, 0x2802, (unsigned long)&plane) < 0 ||
        video.fmt != 11 || video.width != 390 || video.height != 450 || video.planes != 1 ||
        plane.bpp != 16 || plane.stride != 780 || plane.length != 702000 ||
        plane.virtual_width != 390 || plane.virtual_height != 900 ||
        plane.xoffset != 0 || (plane.yoffset != 0 && plane.yoffset != 450) ||
        !plane.memory || ((unsigned long)plane.memory & 1)) {
        close(fd);
        printf("RW4_FB_PATTERN: rejected geometry\n");
        return -5;
    }
    backup = malloc(plane.length);
    if (!backup) { close(fd); return -12; }
    memcpy(backup, plane.memory, plane.length);
    pixels = plane.memory;
    for (unsigned int y = 0; y < 900; y++) {
        for (unsigned int x = 0; x < 390; x++) {
            unsigned short color = colors[x / 65];
            if ((y % 450) >= 350) color = (((x / 20) + (y / 20)) & 1) ? 0xffff : 0;
            pixels[y * 390 + x] = color;
        }
    }
    show_result = ioctl(fd, 0x2818, (unsigned long)&plane); /* FBIOPAN_DISPLAY */
    printf("RW4_FB_PATTERN: visible pan=%d bytes=%u\n", show_result, plane.length);
    if (show_result == 0) {
        for (unsigned int i = 0; i < 20; i++) {
            if (usleep(400000) < 0) break; /* Interrupted sleep shortens display. */
        }
    }
    memcpy(plane.memory, backup, plane.length);
    restore_result = ioctl(fd, 0x2818, (unsigned long)&plane);
    free(backup);
    close_result = close(fd);
    printf("RW4_FB_PATTERN: restored show=%d pan=%d close=%d\n", show_result, restore_result, close_result);
    return show_result < 0 || restore_result < 0 || close_result < 0 ? -5 : 0;
}
