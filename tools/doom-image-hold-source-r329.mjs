// Check availability without retiring the presentation currently being drawn.
import {imageLeaseTransport} from './doom-image-lease-source-r327.mjs';
function once(s,a,b){if(s.split(a).length!==2)throw Error('HoldTemplateChanged: '+a);return s.replace(a,()=>b);}
export function imageHoldTransport(){
 let s=imageLeaseTransport();
 s=once(s,'static int image_acquire(void);','static int image_acquire(void);\nstatic int image_waiting(void);');
 s=once(s,'if(op<1||op>8||(op!=2&&value))return -22;','if(op<1||op>9||(op!=2&&value))return -22;');
 s=once(s,'}else if(op==8){','}else if(op==8||op==9){');
 s=once(s,'rc=image_acquire();','rc=op==8?image_acquire():image_waiting();');
 s=once(s,'static int image_acquire(void)\n{',`/* The producer only publishes READY; the UI is the sole consumer in this
 * launcher. A positive check keeps the old READING lease and every ref intact.
 * It does not prepare pixels, allocate, wait, or advance a reader position. */
static int image_waiting(void)
{
    for(unsigned slot=0;slot<2;slot++)
        if(atomic_load(&frames[slot].state)==READY)return 0;
    return -11;
}
static int image_acquire(void)
{`);
 return s;
}
