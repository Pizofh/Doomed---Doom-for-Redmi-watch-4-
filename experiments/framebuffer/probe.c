/* Read-only device inquiry for the SHA-pinned PC guest. Not Linux ioctl ABI. */
extern int open(const char *path, int flags, ...);
extern int close(int fd);
extern int ioctl(int fd, int request, ...);
extern int printf(const char *format, ...);

int rw4_display_init(void *module_info)
{
    unsigned int video[16] = {0};
    unsigned int plane[16] = {0};
    int fd, video_result, plane_result, close_result;
    (void)module_info;
    fd = open("/dev/fb0", 1); /* NuttX O_RDONLY, confirmed against guest caller. */
    if (fd < 0) {
        printf("RW4_FB_PROBE: open failed\n");
        return -5;
    }
    video_result = ioctl(fd, 0x2801, (unsigned long)video);
    plane_result = ioctl(fd, 0x2802, (unsigned long)plane);
    close_result = close(fd);
    printf("RW4_FB_RESULTS: video=%d plane=%d close=%d\n", video_result, plane_result, close_result);
    if (video_result < 0 || plane_result < 0 || close_result < 0) return -5;
    printf("RW4_FB_VIDEO:");
    for (unsigned int i = 0; i < 8; i++) printf(" %02x", ((unsigned char *)video)[i]);
    printf("\nRW4_FB_PLANE:");
    for (unsigned int i = 0; i < 28; i++) printf(" %02x", ((unsigned char *)plane)[i]);
    printf("\nRW4_FB_PROBE: complete\n");
    return 0;
}
