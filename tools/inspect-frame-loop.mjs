// Static inspection only; outputs stay ignored, proprietary bytes not published.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {projectRoot, packageRoot} from './verify-emulator.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const image=path.join(packageRoot,'system-images/vela-release-4.0/nuttx');
const exe=path.join(projectRoot,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
if(hash(fs.readFileSync(image))!=='849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa'||
   hash(fs.readFileSync(exe))!=='ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1')throw Error('Unreviewed static input');
const folder=path.join(projectRoot,'artifacts/package-review/frame-loop');
fs.mkdirSync(folder,{recursive:true});
function run(args){
  const r=spawnSync(exe,[...args,image],{shell:false,windowsHide:true,encoding:'utf8',timeout:20000,maxBuffer:32*1024*1024});
  if(r.error||r.status!==0)throw Error('Static inspection failed: '+(r.error?.message??r.stderr));
  return r.stdout;
}
const wanted=/^(?:luavgl_timer_.*|lv_timer_(?:handler|pause|resume|delete|del)|luavgl_obj_delete|luavgl_indev_wait_release|lv_indev_wait_release|lv_image_(?:cache_drop|header_cache_drop|set_src)|lv_cache_(?:drop|drop_all|release)|file_write|fs_write)$/;
const selected=run(['-t']).split(/\r?\n/).filter(l=>wanted.test(l.trim().split(/\s+/).at(-1)));
fs.writeFileSync(path.join(folder,'symbols.txt'),selected.join('\n')+'\n');
for(const name of ['luavgl_timer_create','luavgl_timer_cb','luavgl_timer_delete','luavgl_timer_gc',
  'luavgl_timer_set_paused','luavgl_obj_delete','luavgl_indev_wait_release','lv_indev_wait_release',
  'lv_image_cache_drop','lv_image_header_cache_drop','lv_cache_drop','file_write']){
  fs.writeFileSync(path.join(folder,name+'.txt'),run(['-d','--disassemble='+name]));
}
console.log(selected.join('\n'));
