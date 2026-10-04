/* Prefer ABS32 calls; GCC self-recursion still needs reviewed THM_CALL. */
#ifdef __arm__
#pragma long_calls
#endif
