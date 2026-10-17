/* SPDX-License-Identifier: GPL-2.0-only */
#include "transport-guard.h"
void doomed_audio_guard_init(struct doomed_audio_guard *g) {
 if (g) { g->serial=0; g->pending=0; g->since=0; g->budget=0; g->bytes=0;
  g->op=DA_NONE; g->stage=DA_EMPTY; g->owned=0; g->fault=0; g->paused=0; g->close_attempted=0; }
}
uint32_t doomed_audio_begin(struct doomed_audio_guard *g, enum doomed_audio_op op,
 uint32_t now, uint32_t budget, uint32_t bytes) {
 if (!g || g->pending || !budget || budget>60000 || g->serial==UINT32_MAX) return 0;
 if (op==DA_OPEN) { if (g->owned || g->fault || g->stage!=DA_EMPTY) return 0; }
 else {
  if (!g->owned || op<DA_PREPARE || op>DA_CLOSE) return 0;
  if (op==DA_CLOSE && g->close_attempted) return 0;
  if (op!=DA_CLOSE && g->fault) return 0;
  if (op==DA_PREPARE && g->stage!=DA_OPENED) return 0;
  if (op==DA_START && g->stage!=DA_PREPARED) return 0;
  if (op==DA_WRITE && (g->stage!=DA_PLAYING || g->paused || !bytes || bytes>1024 || (bytes&1))) return 0;
  if (op==DA_STOP && g->stage!=DA_PLAYING) return 0;
 }
 if (op!=DA_WRITE && bytes) return 0;
 if (op==DA_OPEN) g->close_attempted=0;
 if (op==DA_CLOSE) g->close_attempted=1;
 g->pending=++g->serial; g->op=op; g->since=now; g->budget=budget; g->bytes=bytes;
 return g->pending;
}
int doomed_audio_expired(struct doomed_audio_guard *g, uint32_t now) {
 if (!g || !g->pending || (uint32_t)(now-g->since)<g->budget) return 0;
 g->fault=1; return 1;
}
int doomed_audio_complete(struct doomed_audio_guard *g, uint32_t token,
 int result, unsigned released) {
 if (!g || !token || g->pending!=token || released>1) return -1;
 enum doomed_audio_op op=g->op;
 unsigned ok=(op==DA_WRITE ? result==(int)g->bytes : result==0);
 g->pending=0; g->op=DA_NONE;
 if (released) {
  g->owned=0; g->stage=DA_EMPTY;
  if (op!=DA_CLOSE && !(op==DA_OPEN && !ok)) ok=0;
 } else {
  /* Even a failed OPEN may have acquired resources: no proof, no free. */
  g->owned=1;
  if (op==DA_CLOSE) ok=0;
  if (ok) {
   if (op==DA_OPEN) g->stage=DA_OPENED;
   if (op==DA_PREPARE) g->stage=DA_PREPARED;
   if (op==DA_START) g->stage=DA_PLAYING;
   if (op==DA_STOP) g->stage=DA_STOPPED;
  }
 }
 if (!ok) g->fault=1;
 return ok && !g->fault ? 0 : -1;
}
void doomed_audio_pause(struct doomed_audio_guard *g, unsigned paused) {
 if (g) g->paused=!!paused;
 /* Only stops submissions; queued sound is not claimed to be silent. */
}
int doomed_audio_unloadable(const struct doomed_audio_guard *g) {
 return g && !g->pending && !g->owned;
}
