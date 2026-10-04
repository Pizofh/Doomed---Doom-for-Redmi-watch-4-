/* SPDX-License-Identifier: GPL-2.0-or-later
 * Exact inspected PC guest. Single worker owns all non-atomic state. */
#ifndef RW4_DOOM_RUNTIME_H
#define RW4_DOOM_RUNTIME_H
#include <stddef.h>
#include <stdint.h>
#include <stdarg.h>
struct rw4_file;
struct rw4_runtime_stats {
    unsigned reason,code,owner,blocks,bytes,streams,peak_bytes,peak_blocks;
    unsigned allocated,freed,opened,closed,denied,cleanup_error;
};
/* reason:0 body returned,1 stop,2 quit,3 fatal,4 OOM/limit,5 invalid resource.
 * Run and snapshot only in the owner caller; request_stop may be another task. */
int rw4_runtime_run(void (*body)(void *),void *arg,const char *read_path,unsigned budget);
void rw4_runtime_request_stop(void);
void rw4_runtime_poll(void);
const struct rw4_runtime_stats *rw4_runtime_stats(void);
void *rw4_malloc(size_t);
void *rw4_calloc(size_t,size_t);
void *rw4_realloc(void *,size_t);
void rw4_free(void *);
char *rw4_strdup(const char *);
struct rw4_file *rw4_fopen(const char *,const char *);
int rw4_fclose(struct rw4_file *);
size_t rw4_fread(void *,size_t,size_t,struct rw4_file *);
size_t rw4_fwrite(const void *,size_t,size_t,struct rw4_file *);
int rw4_fseek(struct rw4_file *,long,int);
long rw4_ftell(struct rw4_file *);
int rw4_feof(struct rw4_file *);
int rw4_ferror(struct rw4_file *);
void rw4_clearerr(struct rw4_file *);
int rw4_fflush(struct rw4_file *);
int rw4_printf(const char *,...);
int rw4_fprintf(struct rw4_file *,const char *,...);
int rw4_vfprintf(struct rw4_file *,const char *,va_list);
int rw4_snprintf(char *,size_t,const char *,...);
int rw4_vsnprintf(char *,size_t,const char *,va_list);
int rw4_mkdir(const char *,unsigned);
int rw4_remove(const char *);
int rw4_rename(const char *,const char *);
int rw4_system(const char *);
int rw4_abs(int);
_Noreturn void rw4_exit(int);
_Noreturn void rw4_error(const char *,va_list);
extern struct rw4_file *const rw4_stdout;
extern struct rw4_file *const rw4_stderr;
#ifdef RW4_ENGINE
#define malloc rw4_malloc
#define calloc rw4_calloc
#define realloc rw4_realloc
#define free rw4_free
#define strdup rw4_strdup
#define abs rw4_abs
#define exit rw4_exit
#define system rw4_system
#define mkdir rw4_mkdir
#define remove rw4_remove
#define rename rw4_rename
#endif
#endif
