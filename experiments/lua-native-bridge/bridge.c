/* Emulator-only virtual character device. No worker, hardware or flash I/O.
 * ABI: exact guest DWARF file_operations=40 bytes, write offset12.
 * module_info contract reviewed previously; this is FLAT, not a sandbox. */
#include <stdint.h>
#include <stddef.h>
struct file;
struct file_operations {
    int (*open)(struct file *);
    int (*close)(struct file *);
    int (*read)(struct file *, char *, unsigned);
    int (*write)(struct file *, const char *, unsigned);
    uint32_t unused[6]; /* seek/ioctl/mmap/truncate/poll/unlink: NULL */
};
struct mod_info {
    int (*uninitializer)(void *);
    void *arg;
    const void *exports;
    int nexports;
};
_Static_assert(sizeof(struct file_operations) == 40, "guest fops ABI");
_Static_assert(offsetof(struct file_operations, write) == 12, "write offset");
_Static_assert(sizeof(struct mod_info) == 16, "guest module ABI");
extern int register_driver(const char *, const struct file_operations *, unsigned, void *);
extern int unregister_driver(const char *);
extern int printf(const char *, ...);
#define MAGIC 0x34574252u
static unsigned refs, sequence, active, paused, touches, last_x, last_y, last_op;
static const char node[] = "/dev/rw4bridge";

static int bridge_open(struct file *f) { (void)f; refs++; return 0; }
static int bridge_close(struct file *f) { (void)f; if (!refs) return -22; refs--; return 0; }
static uint32_t word(const unsigned char *b) {
    return (uint32_t)b[0] | (uint32_t)b[1]<<8 | (uint32_t)b[2]<<16 | (uint32_t)b[3]<<24;
}
static int bridge_write(struct file *f, const char *buffer, unsigned length) {
    (void)f;
    const unsigned char *b = (const unsigned char *)buffer;
    if (length != 24 || word(b) != MAGIC || word(b+20) != 1) return -22;
    unsigned seq=word(b+4), op=word(b+8), x=word(b+12), y=word(b+16);
    if (seq <= sequence || op < 1 || op > 5 || x >= 390 || y >= 450) return -22;
    if (op == 1) { active=1; paused=0; touches=0; last_x=last_y=0; }
    if (op == 2) paused=1;
    if (op == 3) paused=0;
    if (op == 4) { active=0; paused=1; }
    if (op == 5 && active && !paused) { touches++; last_x=x; last_y=y; }
    sequence=seq; last_op=op;
    printf("RW4_C_BRIDGE: seq=%u op=%u active=%u paused=%u touches=%u x=%u y=%u\n",
           sequence, op, active, paused, touches, last_x, last_y);
    return (int)length;
}
static int bridge_read(struct file *f, char *buffer, unsigned length) {
    (void)f;
    if (length < 32) return -22;
    uint32_t words[8] = {MAGIC, sequence, active, paused, touches, last_x, last_y, last_op};
    unsigned char *b=(unsigned char *)buffer;
    for (unsigned i=0;i<8;i++) for (unsigned j=0;j<4;j++) b[i*4+j]=(unsigned char)(words[i]>>(j*8));
    return 32; /* Snapshot protocol: caller reads EXACTLY32 then closes, not EOF stream. */
}
static const struct file_operations operations = {
    bridge_open, bridge_close, bridge_read, bridge_write, {0,0,0,0,0,0}
};
static int bridge_uninit(void *arg) {
    (void)arg;
    /* Controlled single Lua caller closes every handle before rmmod.
     * Not a concurrency contract for arbitrary third-party opens. */
    if (refs) return -16;
    int result=unregister_driver(node);
    printf("RW4_C_BRIDGE: unregister=%d refs=%u\n", result, refs);
    return result;
}
int rw4_bridge_init(struct mod_info *info) {
    if (!info) return -22;
    int result=register_driver(node, &operations, 0600u, NULL);
    printf("RW4_C_BRIDGE: register=%d\n", result);
    if (result < 0) return result;
    info->uninitializer=bridge_uninit;
    info->arg=NULL;
    info->exports=NULL;
    info->nexports=0;
    return 0;
}
