// Small one-shot UI revision; reuse the exact installed DoomRAM ELF and WAD.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,firstRunSource} from './doom-first-run-source.mjs';import {ramPngLauncher} from './doom-ram-png-source.mjs';import {snapshotAssets} from './doom-snapshot-source.mjs';import {png} from './first-c-assets.mjs';import {ownTextPixel} from './native-info-legend.mjs';
export {root,sha256};
function once(s,a,b){if(s.split(a).length!==2)throw Error('TraceTemplateChanged');return s.replace(a,()=>b);}
export function traceSource(){
 const elf=fs.readFileSync(path.join(root,'build/doom-ram-png-r304/doom.elf')),wad=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad'));
 if(elf.length!==604992||sha256(elf)!=='6a5d43df8a3c9753c6b943ca5fd25a9835edd7cd97b4f93a33aa199d8926704e')throw Error('InstalledElfChanged');
 const old=ramPngLauncher(elf,wad),config={...old.config,id:'365219956',ui_base:'/data/app/watchface/market/365219956/lua/'};
 let controller=once(old.parts.controller,'    local base=config.base','    local function checkpoint(n)if view.stage then view.stage(n)end end\n    local base=config.base');
 const changes=[
 ["assets();assert(registry()=='','another module present');nodes_absent()","checkpoint(10);assets();checkpoint(11);assert(registry()=='','another module present');checkpoint(12);nodes_absent()"],
 ["local old,errno=read(lease_path,2048)","checkpoint(13);local old,errno=read(lease_path,2048)"],
 ["status('LOADING')","checkpoint(14);status('LOADING')"],
 ["local key=registry();assert(own_record(key),'loaded identity unavailable')","checkpoint(15);local key=registry();assert(own_record(key),'loaded identity unavailable')"],
 ["local s=state();assert(s[3]==0","checkpoint(16);local s=state();assert(s[3]==0"],
 ["write_new(lease_path,lease_header..key..'\\n')","checkpoint(17);write_new(lease_path,lease_header..key..'\\n')"],
 ["command(1);wait_ticks=0","checkpoint(18);command(1);wait_ticks=0"],
 ["local s=state()\n        if s[6]==1 then","checkpoint(19);local s=state()\n        if s[6]==1 then\n            checkpoint(30)"],
 ["local key=registry();if key==''then return end","checkpoint(40);local key=registry();if key==''then return end"]];
 for(const [a,b]of changes)controller=once(controller,a,b);
 const prior=firstRunSource();let first=prior.parts.first.replaceAll('\r\n','\n');
 first=once(first,"path=config.base..'doom1.wad'","path=config.wad_path");
 first=once(first,'    local function ram()','    local function ram()\n        view.stage(2)');
 first=once(first,"assert(umem and umem.free>=config.min_free","if umem then view.ram(umem.free,umem.max)end\n        assert(umem and umem.free>=config.min_free");
 first=once(first,"attempted=true;save_marker();checking=true","view.stage(1);attempted=true;save_marker();ram();view.stage(1);checking=true");
 const parts={controller,first,crc:prior.parts.crc,parser:prior.parts.parser};
 const factory='local native=(function()\n'+controller+'\nend)()\nlocal memory=(function()\n'+parts.parser+'\nend)()\nlocal crc=(function()\n'+parts.crc+'\nend)()\nlocal launcher=(function()\n'+first+'\nend)()\nreturn {new=function(c,f,s,v)return launcher.new(c,f,s,v,native,memory,crc)end}';
 const main=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/trace-main.lua'),'utf8'),serial='{'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}';
 const source=once(once(main,'__CONFIG__',serial),'__FACTORY__',factory).replace(/^--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('TraceSourceLimit');
 return{source,config,parts,sourceSha256:sha256(source)};
}
export function traceAssets(){
 const assets=snapshotAssets();for(const n of ['up','left','right','fire','pause','reference'])delete assets[n];
 const glyphs=['1111110','0110000','1101101','1111001','0110011','1011011','1011111','1110000','1111111','1111011'];
 const boxes=[[3,2,10,4],[10,3,12,10],[10,10,12,17],[3,16,10,18],[1,10,3,17],[1,3,3,10],[3,9,10,11]];
 for(let d=0;d<10;d++)assets['d'+d]=png(16,20,(x,y)=>boxes.some(([x0,y0,x1,y1],i)=>glyphs[d][i]==='1'&&x>=x0&&x<x1&&y>=y0&&y<y1)?[255,255,255]:[16,32,48]);
 for(const name of ['free','max'])assets[name]=png(64,20,(x,y)=>ownTextPixel(name.toUpperCase(),x,y,[16,32,48]));
 assets.preview=png(390,450,(x,y)=>x>=130&&x<260&&y>=168&&y<272&&(y-168)%26<16?[255,255,255]:[16,32,48]);return assets;
}
