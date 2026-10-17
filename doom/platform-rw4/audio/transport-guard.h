/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_TRANSPORT_GUARD_H
#define DOOMED_TRANSPORT_GUARD_H
#include <stdint.h>
enum doomed_audio_op { DA_NONE, DA_OPEN, DA_PREPARE, DA_START, DA_WRITE, DA_STOP, DA_CLOSE };
enum doomed_audio_stage { DA_EMPTY, DA_OPENED, DA_PREPARED, DA_PLAYING, DA_STOPPED };
/* Single owner. Marshal worker completions to this owner; never call concurrently.
 * This guard makes no firmware calls and cannot cancel a blocked worker.
 * The adapter must retain the module, handle and PCM while pending/owned.
 * Initialize once for the entire lifetime, never reset to clear a fault. */
struct doomed_audio_guard {
 uint32_t serial, pending, since, budget, bytes;
 enum doomed_audio_op op;
 enum doomed_audio_stage stage;
 unsigned owned, fault, paused, close_attempted;
};
void doomed_audio_guard_init(struct doomed_audio_guard *g);
/* Returns a nonzero completion token, or zero without changing ownership.
 * Budgets are 1..60000 ms; writes are 1..1024 bytes, even-sized S16 mono. */
uint32_t doomed_audio_begin(struct doomed_audio_guard *g, enum doomed_audio_op op,
 uint32_t now, uint32_t budget, uint32_t bytes);
/* A successful OPEN owns a handle. Failed OPEN must explicitly report released.
 * CLOSE is only complete with released=1. Errors otherwise retain ownership.
 * result: 0 for control success, exact byte count for WRITE, negative for error.
 * released=1 is adapter proof of no remaining handle/callback/PCM references.
 * A timeout is sticky; late completion can reclaim resources, never restart sound. */
int doomed_audio_complete(struct doomed_audio_guard *g, uint32_t token,
 int result, unsigned released);
int doomed_audio_expired(struct doomed_audio_guard *g, uint32_t now);
void doomed_audio_pause(struct doomed_audio_guard *g, unsigned paused);
int doomed_audio_unloadable(const struct doomed_audio_guard *g);
#endif
