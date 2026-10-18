// SPDX-License-Identifier: GPL-2.0-only
// Download source as data from its primary upstream, then pin every byte.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';
const out=path.join(root,'third_party/tinf-r378'),lock=path.join(root,'doom/platform-rw4/packed/tinf-r378.lock.json');
let pinned=fs.existsSync(lock)?JSON.parse(fs.readFileSync(lock,'utf8')):null;
async function get(url){const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Doomed-source-review'}});assert(r.ok,'HTTP '+r.status);const b=Buffer.from(await r.arrayBuffer());assert(b.length<131072);return b;}
const commit=pinned?.commit??JSON.parse((await get('https://api.github.com/repos/jibsen/tinf/commits/master')).toString()).sha;
assert(/^[0-9a-f]{40}$/.test(commit));fs.mkdirSync(out,{recursive:true});
const files={};for(const name of ['src/tinflate.c','src/tinf.h','LICENSE']){
 const b=await get('https://raw.githubusercontent.com/jibsen/tinf/'+commit+'/'+name),hash=sha256(b);
 if(pinned)assert.equal(hash,pinned.files[name]);
 const dest=path.join(out,path.basename(name));if(fs.existsSync(dest))assert.equal(sha256(fs.readFileSync(dest)),hash);else fs.writeFileSync(dest,b,{flag:'wx'});files[name]=hash;
}
assert(fs.readFileSync(path.join(out,'tinf.h'),'utf8').includes('TINF_VER_STRING "1.2.1"'));
if(!pinned){fs.mkdirSync(path.dirname(lock),{recursive:true});pinned={upstream:'https://github.com/jibsen/tinf',commit,license:'Zlib',files};fs.writeFileSync(lock,JSON.stringify(pinned,null,2)+'\n',{flag:'wx'});}
console.log(JSON.stringify({...pinned,sourceExecuted:false}));
