// SPDX-License-Identifier: GPL-2.0-only
// R_GenerateLookup needs width/column offsets, not patch pixel posts.
import assert from 'node:assert/strict';
function once(s,a,b){assert.equal(s.split(a).length,2,a);return s.replace(a,()=>b);}
export function textureHeaders(original){
 const helper=`
/* Temporary header cache belongs to the Doom zone and only R_InitTextures.
 * Every read still traverses the verified packed reader. Pixel loading and
 * compositing retain the upstream path. Runtime abort cleans the whole zone. */
static patch_t **rw4_lookup_headers;
static patch_t *rw4_lookup_header(int number)
{
    if ((unsigned)number >= numlumps) I_Error("lookup lump index");
    if (!rw4_lookup_headers) {
        rw4_lookup_headers = Z_Malloc(numlumps * sizeof(*rw4_lookup_headers), PU_STATIC, 0);
        memset(rw4_lookup_headers, 0, numlumps * sizeof(*rw4_lookup_headers));
    }
    if (rw4_lookup_headers[number]) return rw4_lookup_headers[number];
    lumpinfo_t *lump = &lumpinfo[number];
    unsigned char header[8];
    if (lump->size < 8 || lump->position < 0 ||
        (unsigned)lump->position > lump->wad_file->length ||
        (unsigned)lump->size > lump->wad_file->length - (unsigned)lump->position ||
        W_Read(lump->wad_file, (unsigned)lump->position, header, 8) != 8)
        I_Error("lookup patch header");
    unsigned width = (unsigned)header[0] | (unsigned)header[1] << 8;
    if (!width || width > 32767 || width > ((unsigned)lump->size - 8) / 4)
        I_Error("lookup patch width");
    unsigned bytes = 8 + width * 4;
    patch_t *p = Z_Malloc(bytes, PU_STATIC, 0);
    memcpy(p, header, 8);
    if (W_Read(lump->wad_file, (unsigned)lump->position + 8,
               (byte *)p + 8, bytes - 8) != bytes - 8)
        I_Error("lookup patch columns");
    rw4_lookup_headers[number] = p;
    return p;
}
static void rw4_lookup_headers_free(void)
{
    if (!rw4_lookup_headers) return;
    for (unsigned i = 0; i < numlumps; i++)
        if (rw4_lookup_headers[i]) Z_Free(rw4_lookup_headers[i]);
    Z_Free(rw4_lookup_headers); rw4_lookup_headers = 0;
}
`;
 let s=once(original,'void R_GenerateLookup (int texnum)',helper+'\nvoid R_GenerateLookup (int texnum)');
 const at=s.indexOf('void R_GenerateLookup (int texnum)');
 s=s.slice(0,at)+once(s.slice(at),'realpatch = W_CacheLumpNum (patch->patch, PU_CACHE);','realpatch = rw4_lookup_header(patch->patch);');
 s=once(s,'    GenerateTextureHashTable();','    rw4_lookup_headers_free();\n    GenerateTextureHashTable();');
 return s;
}

// Private derived data stays in ignored build outputs. The enclosing candidate
// retains full packed-file verification for the exact pinned Doom II WAD.
export function spriteHeaders(original,wad){
 assert(Buffer.isBuffer(wad)&&wad.length===14604584);
 const directory=wad.readUInt32LE(8),count=wad.readUInt32LE(4);assert.equal(count,2919);
 const lumps=Array.from({length:count},(_,i)=>{const p=directory+i*16;return{pos:wad.readUInt32LE(p),size:wad.readUInt32LE(p+4),name:wad.toString('ascii',p+8,p+16).replace(/\0.*$/,'')};});
 const first=lumps.findLastIndex(l=>l.name==='S_START')+1,last=lumps.findLastIndex(l=>l.name==='S_END')-1;assert(first>0&&last>=first);
 const rows=lumps.slice(first,last+1).map(l=>{assert(l.size>=8&&l.pos+l.size<=wad.length);return'{'+Array.from(wad.subarray(l.pos,l.pos+8)).join(',')+'}';});
 const table=`\n/* Exact verified Doom II sprite headers; pixels still use normal WAD IO. */\n_Alignas(4) static const unsigned char rw4_sprite_headers[${rows.length}][8]={\n${rows.join(',\n')}\n};\n`;
 let s=once(original,'void R_InitSpriteLumps (void)',table+'\nvoid R_InitSpriteLumps (void)');
 s=once(s,'    numspritelumps = lastspritelump - firstspritelump + 1;',`    numspritelumps = lastspritelump - firstspritelump + 1;\n    if(firstspritelump!=${first} || numspritelumps!=${rows.length}) I_Error("sprite metadata identity");`);
 s=once(s,'patch = W_CacheLumpNum (firstspritelump+i, PU_CACHE);','patch = (patch_t *)(const void *)rw4_sprite_headers[i];');
 return {source:s,bytes:rows.length*8,sprites:rows.length};
}

export function cachedTextureHeaders(original,wad){
 const directory=wad.readUInt32LE(8),count=wad.readUInt32LE(4);assert.equal(count,2919);
 const lumps=Array.from({length:count},(_,i)=>{const p=directory+i*16;return{pos:wad.readUInt32LE(p),size:wad.readUInt32LE(p+4),name:wad.toString('ascii',p+8,p+16).replace(/\0.*$/,'')};});
 const pnames=lumps.findLast(l=>l.name==='PNAMES');assert(pnames);const number=wad.readUInt32LE(pnames.pos),ids=new Set();assert(4+number*8<=pnames.size);
 for(let i=0;i<number;i++){const name=wad.toString('ascii',pnames.pos+4+i*8,pnames.pos+12+i*8).replace(/\0.*$/,'').toUpperCase();const id=lumps.findLastIndex(l=>l.name.toUpperCase()===name);if(id>=0)ids.add(id);}
 const bytes=[],entries=[];
 for(const id of [...ids].sort((a,b)=>a-b)){const l=lumps[id],width=wad.readUInt16LE(l.pos),length=8+width*4;assert(width>0&&width<=32767&&length<=l.size&&l.pos+l.size<=wad.length);entries.push(`{${id},${bytes.length},${l.pos},${l.size}}`);bytes.push(...wad.subarray(l.pos,l.pos+length));}
 const table=`
/* Build-derived metadata for this exact verified WAD, never pixel data. */
_Alignas(4) static const unsigned char rw4_patch_metadata[${bytes.length}]={${bytes.join(',')}};
static const struct {unsigned lump,offset,position,size;} rw4_patch_index[${entries.length}]={${entries.join(',')}};
static patch_t *rw4_cached_patch_header(int number)
{
    unsigned lo=0,hi=${entries.length};
    while(lo<hi){unsigned mid=lo+(hi-lo)/2;if(rw4_patch_index[mid].lump<(unsigned)number)lo=mid+1;else hi=mid;}
    if(number<0 || (unsigned)number>=numlumps || lo==${entries.length} || rw4_patch_index[lo].lump!=(unsigned)number ||
       lumpinfo[number].position!=(int)rw4_patch_index[lo].position || lumpinfo[number].size!=(int)rw4_patch_index[lo].size)
        I_Error("texture metadata identity");
    return (patch_t *)(const void *)(rw4_patch_metadata+rw4_patch_index[lo].offset);
}
`;
 let s=once(original,'void R_GenerateLookup (int texnum)',table+'\nvoid R_GenerateLookup (int texnum)');const at=s.indexOf('void R_GenerateLookup (int texnum)');s=s.slice(0,at)+once(s.slice(at),'realpatch = W_CacheLumpNum (patch->patch, PU_CACHE);','realpatch = rw4_cached_patch_header(patch->patch);');
 return{source:s,bytes:bytes.length+entries.length*16,patches:entries.length};
}
