/* SPDX-License-Identifier: GPL-2.0-or-later
 * Engine streams are OWNED WRAPPERS, never newlib FILE/reent structures. */
#ifndef RW4_ENGINE_STDIO_H
#define RW4_ENGINE_STDIO_H
#include "runtime.h"
typedef struct rw4_file FILE;
#define EOF (-1)
#define SEEK_SET 0
#define SEEK_CUR 1
#define SEEK_END 2
#define stdout rw4_stdout
#define stderr rw4_stderr
#define fopen rw4_fopen
#define fclose rw4_fclose
#define fread rw4_fread
#define fwrite rw4_fwrite
#define fseek rw4_fseek
#define ftell rw4_ftell
#define feof rw4_feof
#define ferror rw4_ferror
#define clearerr rw4_clearerr
#define fflush rw4_fflush
#define printf rw4_printf
#define fprintf rw4_fprintf
#define vfprintf rw4_vfprintf
#define snprintf rw4_snprintf
#define vsnprintf rw4_vsnprintf
int sscanf(const char *,const char *,...);
int puts(const char *);
int putchar(int);
#endif
