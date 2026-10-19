/* SPDX-License-Identifier: GPL-2.0-only
 * Included after reader-r378.c. Checks the exact stored stream once, without
 * inflating every page. The normal reader still verifies raw CRC on every miss.
 * Reuses its 64KB input buffer; owner game worker only, tracked cursor cleanup.
 */
extern int rw4_host_ferror(void *);
int rw4_packed_verify_physical(void *p,void (*poll)(void))
{
 struct cursor *c=find(p);if(!c||!poll)return -1;
 poll();cached_page[0]=cached_page[1]=UINT32_MAX;
 if(rw4_host_fseek(c->raw,0,0)){c->error=1;return -1;}
 (void)crc(input,0);uint32_t value=UINT32_MAX,total=0;
 while(total<RW4_PACK_BYTES){
  poll();unsigned wanted=RW4_PACK_BYTES-total;if(wanted>sizeof(input))wanted=sizeof(input);
  size_t n=rw4_host_fread(input,1,wanted,c->raw);
  if(!n||n>wanted||rw4_host_ferror(c->raw)){c->error=1;return -1;}
  total+=(uint32_t)n;for(unsigned i=0;i<n;i++)value=(value>>8)^crc_table[(value^input[i])&255u];
 }
 poll();unsigned char extra;size_t tail=rw4_host_fread(&extra,1,1,c->raw);
 if(tail||rw4_host_ferror(c->raw)||(value^UINT32_MAX)!=RW4_PACK_PHYSICAL_CRC||rw4_host_fseek(c->raw,0,0)){c->error=1;return -1;}
 c->pos=0;c->eof=0;return 0;
}
