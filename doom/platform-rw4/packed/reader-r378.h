/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef RW4_PACKED_READER_R378_H
#define RW4_PACKED_READER_R378_H
#include <stddef.h>
void *rw4_packed_fopen(const char *,const char *);
int rw4_packed_fclose(void *);
size_t rw4_packed_fread(void *,size_t,size_t,void *);
int rw4_packed_fseek(void *,long,int);
long rw4_packed_ftell(void *);
int rw4_packed_feof(void *);
int rw4_packed_ferror(void *);
void rw4_packed_clearerr(void *);
#endif
