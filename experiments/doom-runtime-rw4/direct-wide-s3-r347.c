/* S3-only transform adapter; no RW4 function addresses or layout offsets. */
#define rw4_direct_backend_init rw4_direct_unscaled_init
#include "direct-s3-r343.c"
#undef rw4_direct_backend_init
extern void s3_scale(void *,uint32_t);
extern void s3_antialias(void *,int);
static void *(*original_create)(void *);
static void (*original_source)(void *,void *,const void *);
static unsigned scaled;
static void *wide_create(void *p){scaled=0;void *image=original_create(p);if(image)s3_position(image,35,30);return image;}
static void wide_source(void *p,void *image,const void *d)
{original_source(p,image,d);if(!scaled){s3_antialias(image,0);s3_scale(image,306);scaled=1;}}
int rw4_direct_backend_init(struct rw4_direct *b,uint32_t *a,uint32_t *c)
{
    int rc=rw4_direct_unscaled_init(b,a,c);if(rc)return rc;
    original_create=b->ops.create;original_source=b->ops.set_src;
    b->ops.create=wide_create;b->ops.set_src=wide_source;return 0;
}
