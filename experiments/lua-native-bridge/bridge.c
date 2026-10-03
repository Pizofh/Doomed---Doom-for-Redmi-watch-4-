/* Emulator-only virtual character device. No worker, hardware or flash I/O.
 * ABI: exact guest DWARF file_operations=40 bytes, write offset12.
 * module_info contract reviewed previously; this is FLAT, not a sandbox. */
#include <stdint.h>
#include <stddef.h>
/* Exact guest DWARF: file size32, f_priv offset20. Other fields opaque. */
struct file { unsigned char opaque[20]; void *f_priv; unsigned char tail[8]; };
_Static_assert(sizeof(struct file)==32 && offsetof(struct file, f_priv)==20, "guest file ABI");
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
static const char frame_node[] = "/dev/rw4frame";
/* LVGL9 little-endian .bin file: 12-byte header, RGB565 pixels.
 * This is copied through Lua io to tmpfs, never exposed as a native pointer. */
#define FRAME_WIDTH 320u
#define FRAME_HEIGHT 140u
#define FRAME_BYTES (12u + FRAME_WIDTH * FRAME_HEIGHT * 2u)
static unsigned frame_refs;
static const unsigned char frame_header[12] = {0x19,0x12,0,0,0x40,1,0x8c,0,0x80,2,0,0};
static const uint16_t colors[8] = {0xf800,0x07e0,0x001f,0xffff,0xffe0,0x07ff,0xf81f,0};

static int frame_open(struct file *f) {
    /* Failed opens can be followed by close in this guest. Mark success per
     * descriptor. NSH spawn inherits descriptors, so multiple opens must work.
     * f_priv holds a packed integer cookie, never a dereferenced pointer:
     * low17bits = cursor+1, bit17 = snapshot phase. Zero means no reference. */
    f->f_priv=NULL;
    if (!active || paused) return -11;
    f->f_priv=(void *)(uintptr_t)(1u | ((touches & 1u)<<17));
    frame_refs++;
    return 0;
}
static int frame_close(struct file *f) {
    if (!f->f_priv) return 0;
    f->f_priv=NULL;
    if (!frame_refs) return -22;
    frame_refs--; return 0;
}
static int frame_read(struct file *f, char *buffer, unsigned length) {
    if (!f->f_priv || !frame_refs) return -22;
    unsigned cookie=(unsigned)(uintptr_t)f->f_priv;
    unsigned frame_pos=(cookie & 0x1ffffu)-1u, frame_phase=(cookie>>17)&1u;
    if (frame_pos > FRAME_BYTES) return -22;
    if (!active || paused) return -11;
    if (length > FRAME_BYTES-frame_pos) length=FRAME_BYTES-frame_pos;
    for (unsigned i=0;i<length;i++) {
        unsigned offset=frame_pos+i;
        if (offset < 12) buffer[i]=(char)frame_header[offset];
        else {
            unsigned pixel=(offset-12)/2, x=pixel%FRAME_WIDTH, y=pixel/FRAME_WIDTH;
            uint16_t color=y<70 ? colors[(x/40+frame_phase)&7u] :
                ((((x/16)^(y/16)^frame_phase)&1u) ? 0xffff : 0);
            buffer[i]=(char)(color >> (((offset-12)&1u)*8));
        }
    }
    frame_pos+=length;
    f->f_priv=(void *)(uintptr_t)((frame_pos+1u) | (frame_phase<<17));
    if (frame_pos==FRAME_BYTES && length)
        printf("RW4_C_FRAME: bytes=%u phase=%u refs=%u\n", FRAME_BYTES, frame_phase, frame_refs);
    return (int)length; /* Bounded file-like stream with EOF, unlike bridge snapshots. */
}
static const struct file_operations frame_operations = {
    frame_open, frame_close, frame_read, NULL, {0,0,0,0,0,0}
};

static int bridge_open(struct file *f) { f->f_priv=&refs; refs++; return 0; }
static int bridge_close(struct file *f) {
    if (f->f_priv!=&refs) return 0;
    f->f_priv=NULL;
    if (!refs) return -22;
    refs--; return 0;
}
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
    if (refs || frame_refs) return -16;
    int frame_result=unregister_driver(frame_node);
    printf("RW4_C_FRAME: unregister=%d refs=%u\n", frame_result, frame_refs);
    if (frame_result < 0) return frame_result;
    int result=unregister_driver(node);
    printf("RW4_C_BRIDGE: unregister=%d refs=%u\n", result, refs);
    return result;
}
int rw4_bridge_init(struct mod_info *info) {
    if (!info) return -22;
    int result=register_driver(node, &operations, 0600u, NULL);
    printf("RW4_C_BRIDGE: register=%d\n", result);
    if (result < 0) return result;
    result=register_driver(frame_node, &frame_operations, 0400u, NULL);
    printf("RW4_C_FRAME: register=%d\n", result);
    if (result < 0) { unregister_driver(node); return result; }
    info->uninitializer=bridge_uninit;
    info->arg=NULL;
    info->exports=NULL;
    info->nexports=0;
    return 0;
}
