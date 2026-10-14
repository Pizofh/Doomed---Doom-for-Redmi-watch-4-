/* Fixed four-frame file probe. No tasks, display drivers or Doom code. */
#include <stddef.h>
#include <stdint.h>
#include "frames-bindings-r218.h"
_Static_assert(sizeof(uintptr_t) == 4 && sizeof(size_t) == 4, "ARM32 only");
typedef void *(*open_fn)(const char *, const char *);
typedef size_t (*read_fn)(void *, size_t, size_t, void *);
typedef size_t (*write_fn)(const void *, size_t, size_t, void *);
typedef int (*stream_fn)(void *);
#define INLINE static inline __attribute__((always_inline))
INLINE uint32_t fingerprint(uintptr_t address)
{
    const volatile unsigned char *code = (const volatile unsigned char *)(address & ~(uintptr_t)1);
    uint32_t hash = UINT32_C(2166136261);
    for (size_t i = 0; i < 64; ++i) { hash ^= code[i]; hash *= UINT32_C(16777619); }
    return hash;
}
INLINE uint32_t crc_update(uint32_t crc, const unsigned char *data, size_t length)
{
    for (size_t i = 0; i < length; ++i) {
        crc ^= data[i];
        for (unsigned j = 0; j < 8; ++j) crc = (crc >> 1) ^ ((crc & 1) ? UINT32_C(0xedb88320) : 0);
    }
    return crc;
}
INLINE void be32(unsigned char *p, uint32_t value)
{ for (unsigned i = 0; i < 4; ++i) p[i] = (unsigned char)(value >> (24 - 8 * i)); }
INLINE int put(void *file, const unsigned char *data, size_t length)
{ return ((write_fn)RW4_WRITE)(data, 1, length, file) == length; }
INLINE int chunk(void *file, const unsigned char *type, const unsigned char *data, size_t length)
{
    unsigned char head[8], end[4];
    be32(head, (uint32_t)length);
    for (unsigned i = 0; i < 4; ++i) head[i + 4] = type[i];
    uint32_t crc = crc_update(UINT32_C(0xffffffff), type, 4);
    crc = crc_update(crc, data, length);
    be32(end, crc ^ UINT32_C(0xffffffff));
    return put(file, head, 8) && put(file, data, length) && put(file, end, 4);
}
INLINE int frame(void *file, unsigned phase)
{
    static const unsigned char signature[8] = {137,80,78,71,13,10,26,10};
    static const unsigned char ihdr[13] = {0,0,0,96,0,0,0,64,8,2,0,0,0};
    static const unsigned char idat[] = "IDAT";
    /* zlib + one final uncompressed DEFLATE block: raw=(1+96*3)*64=18496. */
    static const unsigned char prefix[7] = {0x78,0x01,0x01,0x40,0x48,0xbf,0xb7};
    static const unsigned char palette[4][3] = {{255,0,0},{0,255,0},{0,0,255},{255,128,0}};
    unsigned char row[289], bytes[8];
    if (!put(file, signature, 8) || !chunk(file,(const unsigned char *)"IHDR",ihdr,13)) return 0;
    be32(bytes, 18507); for (unsigned i = 0; i < 4; ++i) bytes[i + 4] = idat[i];
    if (!put(file, bytes, 8) || !put(file, prefix, 7)) return 0;
    uint32_t crc = crc_update(UINT32_C(0xffffffff), idat, 4);
    crc = crc_update(crc, prefix, 7);
    uint32_t a = 1, b = 0;
    for (unsigned y = 0; y < 64; ++y) {
        row[0] = 0;
        for (unsigned x = 0; x < 96; ++x) {
            unsigned color = ((x >= 48 ? 1u : 0u) + (y >= 32 ? 2u : 0u) + phase) & 3u;
            int white = (x >= 8 + phase * 20 && x < 12 + phase * 20) || y == 31 || y == 32;
            for (unsigned c = 0; c < 3; ++c) row[1 + x * 3 + c] = white ? 255 : palette[color][c];
        }
        for (unsigned i = 0; i < sizeof(row); ++i) {
            a += row[i]; if (a >= 65521) a -= 65521;
            b += a; if (b >= 65521) b -= 65521;
        }
        crc = crc_update(crc, row, sizeof(row));
        if (!put(file, row, sizeof(row))) return 0;
    }
    be32(bytes, (b << 16) | a); crc = crc_update(crc, bytes, 4);
    be32(bytes + 4, crc ^ UINT32_C(0xffffffff));
    return put(file,bytes,8) && chunk(file,(const unsigned char *)"IEND",NULL,0);
}
__attribute__((aligned(8), section(".text.entry")))
int rw4_frames_init(void *module_info)
{
    (void)module_info;
    static const uintptr_t addresses[] = {RW4_OPEN,RW4_CLOSE,RW4_READ,RW4_WRITE,RW4_FLUSH};
    static const uint32_t hashes[] = {RW4_OPEN_FNV,RW4_CLOSE_FNV,RW4_READ_FNV,RW4_WRITE_FNV,RW4_FLUSH_FNV};
    for (unsigned i = 0; i < 5; ++i) if (fingerprint(addresses[i]) != hashes[i]) return -8;
    static const char owner[] = "RW4-FRAMES-R218\n";
    void *marker = ((open_fn)RW4_OPEN)(FRAME_ROOT "frames-attempt-r218.txt", "rb");
    if (marker == NULL) return -22;
    unsigned char bytes[sizeof(owner)];
    size_t got = ((read_fn)RW4_READ)(bytes,1,sizeof(bytes),marker);
    int closed = ((stream_fn)RW4_CLOSE)(marker);
    if (got != sizeof(owner)-1 || closed != 0) return -22;
    for (unsigned i = 0; i < sizeof(owner)-1; ++i) if (bytes[i] != (unsigned char)owner[i]) return -22;
    static const char *const paths[4] = {FRAME_ROOT "frame0-r218.png", FRAME_ROOT "frame1-r218.png",
                                        FRAME_ROOT "frame2-r218.png", FRAME_ROOT "frame3-r218.png"};
    for (unsigned phase = 0; phase < 4; ++phase) {
        void *file = ((open_fn)RW4_OPEN)(paths[phase], "wbx");
        if (file == NULL) return -17;
        int made = frame(file,phase);
        int flushed = ((stream_fn)RW4_FLUSH)(file);
        closed = ((stream_fn)RW4_CLOSE)(file);
        if (!made || flushed != 0 || closed != 0) return -5;
    }
    return 0;
}
