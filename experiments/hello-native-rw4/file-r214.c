/* PC-only, image-bound API candidate. No hardware deployment authorized. */
#include <stddef.h>
#include <stdint.h>
#include "log-bindings-r214.h"
_Static_assert(sizeof(uintptr_t) == 4 && sizeof(size_t) == 4, "ARM32 only");
typedef void *(*open_fn)(const char *, const char *);
typedef size_t (*read_fn)(void *, size_t, size_t, void *);
typedef size_t (*write_fn)(const void *, size_t, size_t, void *);
typedef int (*stream_fn)(void *);
static inline __attribute__((always_inline)) uint32_t fingerprint(uintptr_t address)
{
    const volatile unsigned char *code = (const volatile unsigned char *)(address & ~(uintptr_t)1);
    uint32_t hash = UINT32_C(2166136261);
    for (size_t i = 0; i < 64; ++i) { hash ^= code[i]; hash *= UINT32_C(16777619); }
    return hash;
}
__attribute__((aligned(8), section(".text.entry")))
int rw4_file_init(void *module_info)
{
    (void)module_info;
    static const uintptr_t addresses[] = {RW4_OPEN,RW4_CLOSE,RW4_READ,RW4_WRITE,RW4_FLUSH};
    static const uint32_t hashes[] = {RW4_OPEN_FNV,RW4_CLOSE_FNV,RW4_READ_FNV,RW4_WRITE_FNV,RW4_FLUSH_FNV};
    for (size_t i = 0; i < 5; ++i) if (fingerprint(addresses[i]) != hashes[i]) return -8;
    static const char owner[] = "RW4-NATIVELOG-R211\n";
    static const char root[] = "/data/app/watchface/market/365219999/lua/";
    (void)root; /* Lua separately enforces the identical canonical root. */
    void *marker = ((open_fn)RW4_OPEN)("/data/app/watchface/market/365219999/lua/log-attempt-r211.txt", "rb");
    if (marker == NULL) return -22;
    unsigned char bytes[sizeof(owner)];
    size_t got = ((read_fn)RW4_READ)(bytes, 1, sizeof(bytes), marker);
    int closed = ((stream_fn)RW4_CLOSE)(marker);
    if (got != sizeof(owner) - 1 || closed != 0) return -22;
    for (size_t i = 0; i < sizeof(owner) - 1; ++i) if (bytes[i] != (unsigned char)owner[i]) return -22;
    /* x is mapped to O_EXCL by the inspected mode parser. No wb fallback. */
    void *output = ((open_fn)RW4_OPEN)("/data/app/watchface/market/365219999/lua/native-stdout-r211.txt", "wbx");
    if (output == NULL) return -17;
    static const char message[] = "RW4_C_FILE_R214\n";
    size_t written = ((write_fn)RW4_WRITE)(message, 1, sizeof(message) - 1, output);
    int flushed = ((stream_fn)RW4_FLUSH)(output);
    closed = ((stream_fn)RW4_CLOSE)(output);
    return written == sizeof(message) - 1 && flushed == 0 && closed == 0 ? 0 : -5;
}
