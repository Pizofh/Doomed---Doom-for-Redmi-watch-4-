// SPDX-License-Identifier: GPL-2.0-only
// Keep the engine and RAM guards; bound startup independently from stopping.
import assert from 'node:assert/strict';import {root,sha256,leanLauncher,leanAssets} from './doom-lean-r382.mjs';import {once} from './doom-ready-source-r351.mjs';import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
export function startLauncher(){
 const old=leanLauncher(),config={...old.config,id:'365220005',ui_base:'/data/app/watchface/market/365220005/lua/'};
 let s=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 const changes=[
 ["wait_ticks=wait_ticks+1;assert(wait_ticks<200,'worker did not settle');return","wait_ticks=wait_ticks+1;if stopping then assert(wait_ticks<200,'worker stop timeout')else assert(wait_ticks<2250,'worker startup timeout')end;return"],
 ["end\n        if not paused and s[10]>0 then","end\n        wait_ticks=0\n        if not paused and s[10]>0 then"],
 ["local values={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}","local values={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}"],
 ["{'bootcode','bootread','bootsize'}}","{'bootcode','bootread','bootsize'},{'startflag','readyflag','endflag'},{'joinflag','reasonflag','exitflag'}}"],
 ['function view.native(s)\n','function view.native(s)\nvalues[19]=s[4];values[20]=s[5];values[21]=s[6];values[22]=s[7];values[23]=s[15];values[24]=s[16]\n'],
 ["{'file operation failed',601}","{'file operation failed',601},{'file close failed',602},{'worker startup timeout',701},{'worker stop timeout',702},{'cleanup incomplete',703},{'control identity/error',704},{'control snapshot read',705},{'control command write',706},{'unload reported an error',707},{'registry changed',708}"],
 ["end end\nbackend.failed()end end","end\nif boot.code==999 then boot.code=90000000+math.min(999999,tonumber(err:match(':(%d+):'))or 0)end\nend\nbackend.failed()end end"],
 ["assert(why==nil and type(value)=='string' and #value==288)","assert(why==nil and type(value)=='string' and #value==288,'control snapshot read')"],
 ["assert(f:write(string.pack('<I4I4I4I4',0x36445752,sequence+1,op,value or 0)))","assert(f:write(string.pack('<I4I4I4I4',0x36445752,sequence+1,op,value or 0)),'control command write')"],
 ['page=page%6+1','page=page%8+1']];
 for(const [a,b]of changes)s=once(s,a,b);
 assert(Buffer.byteLength(s)<=32768);assert.equal(config.min_free,7366211);assert.equal(config.min_largest,4194320);assert.equal(config.elf_sha,old.config.elf_sha);
 return{source:s,config,sourceSha256:sha256(s)};
}
export function startAssets(){
 const a=leanAssets();const extra={J:[7,2,2,2,18,18,12],Y:[17,17,10,4,4,4,4]};
 for(const [name,text]of Object.entries({startflag:'START',readyflag:'READY',endflag:'FINISH',joinflag:'JOIN',reasonflag:'REASON',exitflag:'EXIT'}))a[name]=png(96,20,(x,y)=>{const c=text[Math.floor(x/12)],g=extra[c],gx=Math.floor(x%12/2),gy=Math.floor(y/2);return g?gx<5&&gy<7&&(g[gy]&(1<<(4-gx)))?[255,255,255]:[16,32,48]:ownTextPixel(text,x,y,[16,32,48]);});
 a.preview=png(390,450,(x,y)=>((x>=65&&x<325&&y>=90&&y<345&&(x<80||x>=310||y<105||y>=330))||(y>=145&&y<290&&[135,185,235].some(at=>x>=at&&x<at+20)))?[255,180,50]:[16,32,48]);return a;
}
