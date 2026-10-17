// Reserve a complete presentation before exposing its PNG to the decoder.
// Prior physical transports remain immutable. No waiting, allocation or bindings.
import {imageCountersTransport} from './doom-image-counters-source-r325.mjs';
function once(s,a,b){if(s.split(a).length!==2)throw Error('LeaseTemplateChanged: '+a);return s.replace(a,()=>b);}
export function imageLeaseTransport(){
 let s=imageCountersTransport();
 s=once(s,'static void image_diagnostics(uint32_t *);','static void image_diagnostics(uint32_t *);\nstatic int image_acquire(void);');
 s=once(s,'if(op<1||op>7||(op!=2&&value))return -22;','if(op<1||op>8||(op!=2&&value))return -22;');
 s=once(s,'    }else{\n        /* Caller must delete/detach',`    }else if(op==8){
        if(!started||joined||atomic_load(&stop))return -16;
        rc=image_acquire();
    }else{
        /* Caller must delete/detach`);
 const acquire=`/* Only control command8 on the UI owner acquires a frame. Metadata probes
 * may still read the fixed PNG header. A decoder body read never selects a
 * new generation or performs checksum preparation, even on EAGAIN. */
static int image_acquire(void)
{
    if(atomic_load(&image_ref)||image_slot<2)return -16;
    for(unsigned slot=0;slot<2;slot++){
        unsigned expected=READY;
        if(atomic_compare_exchange_strong(&frames[slot].state,&expected,READING)){
            image_slot=slot;rw4_image_prepare(frames[slot].bytes+32);return 0;
        }
    }
    return -11;
}
`;
 s=once(s,'static int image_read_inner(',acquire+'static int image_read_inner(');
 const begin=s.indexOf('    if(n&&position+n>RW4_IMAGE_HEADER_BYTES&&image_slot==2){');
 const end=s.indexOf('    const unsigned char *pixels=',begin);
 if(begin<0||end<0)throw Error('LeaseReadTemplateChanged');
 s=s.slice(0,begin)+'    if(n&&position+n>RW4_IMAGE_HEADER_BYTES&&image_slot==2)return -11;\n'+s.slice(end);
 return s;
}
