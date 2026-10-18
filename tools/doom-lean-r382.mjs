// SPDX-License-Identifier: GPL-2.0-only
// Defer the 30 diagnostic widgets until ERROR/CLOSED. No engine/guard changes.
import assert from 'node:assert/strict';import {root,sha256,bootLauncher,bootAssets} from './doom-boot-r381.mjs';import {once} from './doom-ready-source-r351.mjs';import {png} from './first-c-assets.mjs';
export {root,sha256};
export function leanLauncher(){
 const old=bootLauncher(),config={...old.config,id:'365220004',ui_base:'/data/app/watchface/market/365220004/lua/'};
 let s=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 const changes=[
 ['local backend,start,overlay,hits,mode,pause_label','local backend,start,overlay,hits,mode,pause_label,ensure_mode'],
 ["phase=name\nstatus_image:set", "phase=name\nif name=='CHECKING' then if panel then panel:delete();panel=nil;digits={};labels={}end;if mode then mode:delete();mode=nil end end\nstatus_image:set"],
 ['local panel=object(root,20,300,350,126,0)\npanel:add_flag(F.HIDDEN)','local panel'],
 ['local page,digits,labels=1,{},{}\nfor row=1,3 do','local page,digits,labels=1,{},{}\nlocal function ensure_panel()\nif panel then return end\npanel=object(root,20,300,350,126,0)\nfor row=1,3 do'],
 ["end\nend\nlocal function record()\nvalues[13]","end\nend\nend\nlocal function record()\nensure_panel()\nvalues[13]"],
 [";record();panel:clear_flag(F.HIDDEN);mode:clear_flag(F.HIDDEN)",";record();panel:clear_flag(F.HIDDEN);ensure_mode();mode:clear_flag(F.HIDDEN)"],
 ["else panel:add_flag(F.HIDDEN);mode:add_flag(F.HIDDEN)end","else if panel then panel:add_flag(F.HIDDEN)end;if mode then mode:add_flag(F.HIDDEN)end end"],
 ["mode=button(root,'mode',265,267,110,28,100,function()page=page%6+1;record()end,false)\nmode:add_flag(F.HIDDEN)","ensure_mode=function()if mode then return end;mode=button(root,'mode',265,267,110,28,100,function()page=page%6+1;record()end,false)end"]];
 for(const [a,b]of changes)s=once(s,a,b);
 assert(Buffer.byteLength(s)<=32768);assert.equal(config.min_free,old.config.min_free);assert.equal(config.min_largest,old.config.min_largest);assert.equal(config.elf_sha,old.config.elf_sha);
 return{source:s,config,sourceSha256:sha256(s)};
}
export function leanAssets(){const a=bootAssets();a.preview=png(390,450,(x,y)=>((x>=65&&x<325&&y>=90&&y<345&&(x<80||x>=310||y<105||y>=330))||(x>=130&&x<260&&y>=135&&y<315&&(y-135)%30<14))?[80,190,255]:[16,32,48]);return a;}
