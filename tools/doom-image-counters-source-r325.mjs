// Independent C diagnostic transport. Prior physical sources remain immutable.
import {pngReadersTransport} from './doom-png-readers-source-r316.mjs';
function once(s,a,b){if(s.split(a).length!==2)throw Error('CountersTemplateChanged: '+a);return s.replace(a,()=>b);}
export function imageCountersTransport(){
 let s=pngReadersTransport();
 s=once(s,'static uint32_t control_snapshot[32];','static uint32_t control_snapshot[32];\nstatic atomic_uint image_diag[11];\nstatic void image_diagnostics(uint32_t *);');
 // Protocol2 keeps the 128-byte envelope and replaces game metrics with
 // diagnostic counters. A version1 launcher must reject this executable.
 s=once(s,'uint32_t initial[20]={RW4_CONTROL_MAGIC,1,','uint32_t initial[20]={RW4_CONTROL_MAGIC,2,');
 s=once(s,'for(unsigned i=0;i<12;i++)control_snapshot[20+i]=atomic_load(&metrics[i]);','image_diagnostics(control_snapshot+20);');
 for(const n of ['open','close','read','seek']){
  const result=n==='seek'?'int64_t':'int';
  s=once(s,'static '+result+' image_'+n+'(','static '+result+' image_'+n+'_inner(');
 }
 s=once(s,'int rw4_game_image_release(void)','static int image_release_inner(void)');
 const wrappers=`/* Site/errno only: never fd values, pointers, task identities or pixels. */
static void image_error(unsigned site,int rc)
{
    unsigned value=(site<<8)|(unsigned)(-rc>255?255:-rc),expected=0;
    (void)atomic_compare_exchange_strong(&image_diag[6],&expected,value);
    atomic_store(&image_diag[7],value);
}
static void image_diagnostics(uint32_t *out)
{
    out[0]=atomic_load(&image_ref);
    for(unsigned i=0;i<11;i++)out[i+1]=atomic_load(&image_diag[i]);
}
static int image_open(struct rw4_device_file *f)
{
    int rc=image_open_inner(f);
    if(rc<0)image_error(1,rc);else atomic_fetch_add(&image_diag[0],1);
    return rc;
}
static int image_close(struct rw4_device_file *f)
{
    int rc=image_close_inner(f);
    if(rc<0){atomic_fetch_add(&image_diag[2],1);image_error(2,rc);}
    else atomic_fetch_add(&image_diag[1],1);
    return rc;
}
static int image_read(struct rw4_device_file *f,char *b,unsigned n)
{
    atomic_fetch_add(&image_diag[3],1);
    unsigned maximum=atomic_load(&image_diag[8]);
    while(n>maximum&&!atomic_compare_exchange_weak(&image_diag[8],&maximum,n)){}
    int rc=image_read_inner(f,b,n);
    if(rc<0){atomic_fetch_add(&image_diag[4],1);image_error(3,rc);}
    else if(image_owned(f))atomic_store(&image_diag[10],get32((const char *)f+8));
    return rc;
}
static int64_t image_seek(struct rw4_device_file *f,int64_t offset,int origin)
{
    int64_t rc=image_seek_inner(f,offset,origin);
    if(rc<0){atomic_fetch_add(&image_diag[5],1);image_error(4,(int)rc);}
    return rc;
}
int rw4_game_image_release(void)
{
    int rc=image_release_inner();
    if(rc<0){atomic_fetch_add(&image_diag[9],1);image_error(5,rc);}
    return rc;
}
`;
 s=once(s,'static int uninit(',wrappers+'static int uninit(');
 return s;
}
