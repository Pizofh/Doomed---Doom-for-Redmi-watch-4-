/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef RW4_SLOT_R351_H
#define RW4_SLOT_R351_H
#include <stddef.h>
#include <stdint.h>
#define RW4_SLOT_CAPACITY 196608u
#define RW4_SLOT_PATH "/rw4-slot.dsg"
int rw4_slot_is(const void *);
void *rw4_slot_open(const char *);
int rw4_slot_close(void);
int rw4_slot_abort(void);
size_t rw4_slot_read(void *,size_t,size_t);
size_t rw4_slot_write(const void *,size_t,size_t);
int rw4_slot_seek(long,int);
long rw4_slot_tell(void);
int rw4_slot_eof(void);
int rw4_slot_error(void);
void rw4_slot_clear(void);
unsigned rw4_slot_length(void);
unsigned rw4_slot_crc(void);
unsigned rw4_slot_valid(void);
unsigned rw4_slot_opened(void);
extern const struct rw4_device_fops rw4_slot_ops;
/* These are owned by the transport; only the original UI owner transfers. */
int rw4_slot_ui_enter(void);
void rw4_slot_ui_leave(void);
unsigned rw4_slot_action_take(void);
void rw4_slot_action_done(unsigned,unsigned);
#endif
