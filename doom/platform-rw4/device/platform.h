/* SPDX-License-Identifier: GPL-2.0-or-later
 * Candidate contracts only. No firmware addresses in this header.
 */
#ifndef RW4_DEVICE_PLATFORM_H
#define RW4_DEVICE_PLATFORM_H
#include <stdint.h>
#include <stddef.h>
#include <stdatomic.h>
struct rw4_device_file; /* Image adapter uses candidate f_pos +8 and driver cookie +20. */
struct rw4_device_fops {
    int (*open)(struct rw4_device_file *);
    int (*close)(struct rw4_device_file *);
    int (*read)(struct rw4_device_file *,char *,unsigned);
    int (*write)(struct rw4_device_file *,const char *,unsigned);
    int64_t (*seek)(struct rw4_device_file *,int64_t,int);
    uintptr_t unused[3];
};
struct rw4_module_info { int (*uninit)(void *);void *arg;const void *exports;unsigned nexports; };
struct rw4_device_attr { uint32_t words[3]; };
_Static_assert(sizeof(struct rw4_device_fops)==32&&sizeof(struct rw4_module_info)==16&&sizeof(struct rw4_device_attr)==12,"candidate RW4 contracts");
_Static_assert(ATOMIC_INT_LOCK_FREE==2,"lock-free ARM words required");
extern int rw4_host_owner_token(void); /* Current-task identity, not a PID. */
extern int rw4_host_validate(void);
extern uint64_t rw4_host_clock_ticks(void);
extern int rw4_host_usleep(unsigned);
extern int rw4_host_attr_init(struct rw4_device_attr *);
extern int rw4_host_attr_stack(struct rw4_device_attr *,unsigned);
extern int rw4_host_attr_destroy(struct rw4_device_attr *);
extern int rw4_host_thread_create(int32_t *,const struct rw4_device_attr *,void *(*)(void *),void *);
extern int rw4_host_thread_join(int32_t,void **);
extern int rw4_host_register(const char *,const struct rw4_device_fops *,unsigned,void *);
extern int rw4_host_unregister(const char *);
#define RW4_FRAME_W 320u
#define RW4_FRAME_H 200u
#define RW4_CONTROL_MAGIC UINT32_C(0x32574452)
#define RW4_FRAME_MAGIC UINT32_C(0x32464452)
#ifndef RW4_GAME_WAD
#define RW4_GAME_WAD "/not-installed/rw4-doom/doom1.wad"
#endif
void rw4_game_body(void *);
int rw4_game_key(int *,unsigned char *);
int rw4_game_paused(void);
int rw4_game_stopping(void);
void rw4_game_ready(void);
void rw4_game_pause_ack(void);
void rw4_game_metrics(const uint32_t *);
void rw4_game_frame(const uint32_t *,unsigned);
#endif
