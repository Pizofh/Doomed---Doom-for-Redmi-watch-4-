// SPDX-License-Identifier: GPL-2.0-only
// Launcher-only diagnostics. Reuse the exact installed R378 engine and IWAD.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {packedLauncher,root,sha256} from './doom-packed-r378.mjs';import {once} from './doom-ready-source-r351.mjs';
import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
export function bootLauncher(){
 const elf=fs.readFileSync(path.join(root,'build/doom-audio-r378/rw4/doom.elf'));assert.equal(sha256(elf),'1de7d78294e7885513344990e477a4d7530aa85f2955eba7e1210b10f724d746');
 const old=packedLauncher(elf,fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')));
 const config={...old.config,id:'365220003',ui_base:'/data/app/watchface/market/365220003/lua/',assets_base:old.config.base};
 let s=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}\nlocal boot={stage=0,free=0,max=0,code=0,bytes=0}');
 const changes=[
 ["assert(ok and closed and yes,'file operation failed')","if not ok then error(result,0)end;assert(closed and yes,'file close failed')"],
 ["assets();assert(registry()=='','another module present');nodes_absent()","boot.stage=30;assets();boot.stage=40;assert(registry()=='','another module present');boot.stage=41;nodes_absent()"],
 ["local elf=assert(opened(base..'doom.elf'","boot.stage=31;local elf=assert(opened(base..'doom.elf'"],
 ["assert(opened(config.wad_path,'rb'","boot.stage=32;assert(opened(config.wad_path,'rb'"],
 ["local old,errno=read(lease_path,2048)","boot.stage=42;local old,errno=read(lease_path,2048)"],
 ["assert(capture('insmod '","boot.stage=50;assert(capture('insmod '"],
 ["local key=registry();assert(own_record(key)","boot.stage=51;local key=registry();assert(own_record(key)"],
 ["local s=state();assert(s[3]==0","boot.stage=52;local s=state();assert(s[3]==0"],
 ["command(1);wait_ticks=0","boot.stage=53;command(1);boot.stage=60;wait_ticks=0"],
 ["local key=registry();if key==''then return end","boot.stage=70;local key=registry();if key==''then return end;boot.stage=71"],
 ["local s=state();assert(s[4]==1 and s[9]>0,'resident identity')","boot.stage=72;local s=state();assert(s[4]==1 and s[9]>0,'resident identity')"],
 ["local function ram()\nlocal pools=assert(memory.collect(files));local umem","local function ram()\nboot.stage=20;local pools=assert(memory.collect(files));local umem"],
 ["assert(umem and umem.free>=config.min_free","boot.stage=21;if umem then boot.free=umem.free;boot.max=umem.max end\nassert(umem and umem.free>=config.min_free"],
 ["local function launch()ram();native.start()","local function launch()boot.stage=19;collectgarbage('collect');ram();native.start()"],
 ["assert(not current);total=0;value=0xffffffff;ticks=0;checking=true","boot.stage=10;boot.code=0;boot.free=0;boot.max=0;boot.bytes=0;assert(not current);total=0;value=0xffffffff;ticks=0;checking=true"],
 ["if not current then current=assert(files.open(config.base..'doom.elf','rb'))end","if not current then boot.stage=11;current=assert(files.open(config.base..'doom.elf','rb'))end\nboot.stage=12"],
 ["total=total+#bytes;assert(total<=config.elf_bytes)","total=total+#bytes;boot.bytes=total;assert(total<=config.elf_bytes)"],
 ["else close_file();assert(total==config.elf_bytes","else boot.stage=13;close_file();assert(total==config.elf_bytes"],
 ["local values={0,0,0,0,0,0,0,0,0,0,0,0}","local values={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}"],
 ["{'audio_stage','audio_quiet','image_live'}}","{'audio_stage','audio_quiet','image_live'},{'bootstage','bootfree','bootmax'},{'bootcode','bootread','bootsize'}}"],
 ["local function record()\nfor row=1,3 do","local function record()\nvalues[13]=boot.stage;values[14]=boot.free;values[15]=boot.max;values[16]=boot.code;values[17]=boot.bytes;values[18]=config.elf_bytes\nfor row=1,3 do"],
 ["labels[row]:set{src=asset_base..names[page][row]..'.png'}","labels[row]:set{src=(page>=5 and config.ui_base or asset_base)..names[page][row]..'.png'}"],
 ["local function safe(fn)local ok=pcall(fn);if not ok then backend.failed()end end",`local function safe(fn)local ok,err=pcall(fn);if not ok then
boot.code=999
if type(err)=='string' then
for _,p in ipairs({{'ELF checksum',101},{'insufficient UMEM',201},{'packed header',301},{'packed identity',302},{'packed layout',303},{'ELF missing',304},{'WAD missing',305},{'another module present',401},{'node retained',402},{'load reported an error',501},{'loaded identity unavailable',502},{'control unavailable',503},{'file operation failed',601}})do
if err:find(p[1],1,true)then boot.code=p[2];break end
end end
backend.failed()end end`],
 ["page=name=='ERROR' and 2 or 1","page=name=='ERROR' and 5 or 1"],
 ["page=page%4+1","page=page%6+1"]];
 for(const [a,b]of changes)s=once(s,a,b);
 assert(Buffer.byteLength(s)<=32768,'Lua source bound');
 assert.equal(config.base,old.config.base);assert.equal(config.module,old.config.module);assert.equal(config.min_free,7366211);assert.equal(config.min_largest,4194320);
 return{source:s,config,sourceSha256:sha256(s)};
}
export function bootAssets(){
 const assets={};for(const [name,label]of Object.entries({bootstage:'GATE',bootfree:'FREE',bootmax:'MAX',bootcode:'CODE',bootread:'READ',bootsize:'TOTAL'}))assets[name]=png(96,20,(x,y)=>ownTextPixel(label,x,y,[16,32,48]));
 assets.preview=png(390,450,(x,y)=>((x>=65&&x<325&&y>=90&&y<345&&(x<80||x>=310||y<105||y>=330))||(x>=130&&x<260&&y>=145&&y<295&&(y-145)%30<14))?[255,100,220]:[16,32,48]);return assets;
}
