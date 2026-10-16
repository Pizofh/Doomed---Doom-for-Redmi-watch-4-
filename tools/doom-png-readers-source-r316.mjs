// Candidate own transport change only. Never edits the installed R304 source/ELF.
import {pngTransport} from './doom-ram-png-source.mjs';
function region(s,start,end,next){const a=s.indexOf(start),b=s.indexOf(end,a+start.length);if(a<0||b<0||s.indexOf(start,a+1)>=0)throw Error('ReaderTemplateChanged');return s.slice(0,a)+next+s.slice(b);}
export function pngReadersTransport(){
 let s=pngTransport();if(s.split('static unsigned image_cursor;').length!==2)throw Error('CursorTemplateChanged');
 s=s.replace('static unsigned image_cursor;','/* Image positions live in each VFS file, not a shared cursor. */');
 s=region(s,'static int image_open(struct rw4_device_file *f)','/* Internal post-cache retirement.',`static int image_open(struct rw4_device_file *f)
{
    if(!f)return -22;
    image_cookie_set(f,0);
    /* Serial presentation/CRC work stays on the START UI owner. */
    if(started&&owner!=(unsigned)rw4_host_owner_token())return -1;
    if(enter())return -16;
    unsigned refs=atomic_load(&image_ref);
    do{if(refs>=8){leave();return -16;}}
    while(!atomic_compare_exchange_weak(&image_ref,&refs,refs+1));
    image_cookie_set(f,IMAGE_COOKIE);image_position(f,0);return 0;
}
static int image_close(struct rw4_device_file *f)
{
    if(!image_owned(f))return -22;
    image_cookie_set(f,0);atomic_fetch_sub(&image_ref,1);leave();return 0;
}
static int image_file_position(struct rw4_device_file *f,unsigned *position)
{
    if(!image_owned(f))return -22;
    if(started&&owner!=(unsigned)rw4_host_owner_token())return -1;
    if(get32((const char *)f+12))return -22;
    *position=get32((const char *)f+8);
    return *position<=RW4_IMAGE_BYTES?0:-22;
}
`);
 s=region(s,'static int image_read(struct rw4_device_file *f,char *b,unsigned n)','static int64_t image_seek(',`static int image_read(struct rw4_device_file *f,char *b,unsigned n)
{
    unsigned position;int rc=image_file_position(f,&position);
    if(rc)return rc;
    if(!b&&n)return -22;
    unsigned left=RW4_IMAGE_BYTES-position;if(n>left)n=left;
    if(n&&position+n>RW4_IMAGE_HEADER_BYTES&&image_slot==2){
        for(unsigned slot=0;slot<2;slot++){
            unsigned expected=READY;
            if(atomic_compare_exchange_strong(&frames[slot].state,&expected,READING)){image_slot=slot;break;}
        }
        if(image_slot==2)return -11;
        rw4_image_prepare(frames[image_slot].bytes+32);
    }
    const unsigned char *pixels=image_slot<2?frames[image_slot].bytes+32:NULL;
    int count=rw4_image_read(pixels,position,b,n);
    if(count>=0)image_position(f,position+(unsigned)count);
    return count;
}
`);
 s=region(s,'static int64_t image_seek(struct rw4_device_file *f,int64_t offset,int origin)','static int uninit(',`static int64_t image_seek(struct rw4_device_file *f,int64_t offset,int origin)
{
    unsigned position;int rc=image_file_position(f,&position);if(rc)return rc;
    int64_t result=rw4_image_seek(&position,offset,origin);
    if(result>=0)image_position(f,position);
    return result;
}
`);
 return s;
}
