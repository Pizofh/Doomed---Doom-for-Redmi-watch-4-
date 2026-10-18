/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef DOOMED_MEDIA_SINK_H
#define DOOMED_MEDIA_SINK_H
struct doomed_media_api {
 int (*validate)(void);
 int (*focus_request)(int *,const char *,void (*)(int,void *),void *);
 int (*focus_abandon)(int);
 void *(*open)(const char *);
 int (*prepare)(void *,const char *,const char *);
 int (*start)(void *);
 int (*pause)(void *);
 int (*stop)(void *);
 int (*write)(void *,const void *,unsigned);
 int (*close)(void *,int);
};
const struct doomed_media_api *rw4_media_api(void);
/* Current synchronous call; 0 means idle. This is progress telemetry, not an
 * acknowledgement or cancellation mechanism. Safe to read from the UI. */
enum doomed_media_stage {MEDIA_IDLE,MEDIA_VALIDATE,MEDIA_FOCUS,MEDIA_OPEN,
 MEDIA_PREPARE,MEDIA_START,MEDIA_PAUSE,MEDIA_WRITE,MEDIA_STOP,MEDIA_CLOSE,MEDIA_ABANDON};
unsigned rw4_audio_device_stage(void);
#endif
