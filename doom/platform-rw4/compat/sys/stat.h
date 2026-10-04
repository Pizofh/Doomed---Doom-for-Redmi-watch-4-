/* SPDX-License-Identifier: GPL-2.0-or-later
 * This core only uses mkdir from sys/stat.h. It is mapped to our deny helper.
 * No guest stat structure or mode_t ABI is exposed by this header. */
#ifndef RW4_ENGINE_SYS_STAT_H
#define RW4_ENGINE_SYS_STAT_H
#include "runtime.h"
#endif
