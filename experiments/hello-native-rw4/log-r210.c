/* PC-only candidate. Stock 2.2.86 address bindings are inferred, not a SDK.
 * No hardware deployment is authorized by compiling this file.
 */
#include <stddef.h>
#include <stdint.h>
#include "log-bindings-r210.h" /* Generated only after pinned-image checks. */

_Static_assert(sizeof(uintptr_t) == 4, "ARM32 only");
_Static_assert(sizeof(size_t) == 4, "32-bit size_t required");

typedef void *(*stream_base_fn)(void);
typedef size_t (*write_fn)(const void *, size_t, size_t, void *);
typedef int (*flush_fn)(void *);

/* Reading executable memory itself is NOT proven safe on the physical RW4.
 * A fault cannot be caught by this guard. FNV is a bounded mismatch check,
 * not cryptographic firmware authentication or an ABI proof.
 */
static inline __attribute__((always_inline)) uint32_t code_fingerprint(uintptr_t address)
{
    const volatile unsigned char *code = (const volatile unsigned char *)address;
    uint32_t hash = UINT32_C(2166136261);
    for (size_t i = 0; i < 64; ++i) {
        hash ^= code[i];
        hash *= UINT32_C(16777619);
    }
    return hash;
}

__attribute__((aligned(8), section(".text.entry")))
int rw4_log_init(void *module_info)
{
    (void)module_info;
    if (code_fingerprint(RW4_STREAM_BASE & ~(uintptr_t)1) != RW4_STREAM_FNV ||
        code_fingerprint(RW4_WRITE & ~(uintptr_t)1) != RW4_WRITE_FNV ||
        code_fingerprint(RW4_FLUSH & ~(uintptr_t)1) != RW4_FLUSH_FNV) {
        return -8;
    }

    void *base = ((stream_base_fn)RW4_STREAM_BASE)();
    if (base == NULL) {
        return -22;
    }
    /* +128 is observed in the stock Lua caller; no invented FILE layout. */
    void *output = (unsigned char *)base + RW4_STDOUT_OFFSET;
    static const char message[] = "RW4_C_HELLO_R210\n";
    size_t written = ((write_fn)RW4_WRITE)(message, 1, sizeof(message) - 1, output);
    int flushed = ((flush_fn)RW4_FLUSH)(output);
    return written == sizeof(message) - 1 && flushed == 0 ? 0 : -5;
}
