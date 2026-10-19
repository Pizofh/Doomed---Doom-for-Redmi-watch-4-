// SPDX-License-Identifier: GPL-2.0-only
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {tuneLauncher,root,sha256} from './doom-tune-r387.mjs';import {residentBytes} from './doom-fit-r386.mjs';import {once} from './doom-ready-source-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';
export {root,sha256};
export function finalLauncher(){
 const old=tuneLauncher(),dir=path.join(root,'build/doom-audio-r388/rw4'),elf=fs.readFileSync(path.join(dir,'doom.elf')),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json')));
 assert.equal(sha256(elf),r.elfSha256);assert.equal(r.packed.gamePath,'/data/app/watchface/market/365220009/lua/doom2-r384.wad');
 for(const n of ['doom-sfx','sink-worker'])assert.equal(r.generatedHashes[n],JSON.parse(fs.readFileSync(path.join(root,'build/doom-audio-r387/rw4/review.json'))).generatedHashes[n]);
 assert.equal(sha256(fs.readFileSync(path.join(dir,'direct-wide.c'))),sha256(fs.readFileSync(path.join(root,'doom/platform-rw4/device/direct-wide-r347.c'))));
 const importer=fs.readFileSync(path.join(root,'doom/platform-rw4/launcher/import-final-r388.lua'));
 assert(importer.length<12000);
 const base='/data/app/watchface/market/365220009/lua/',resident=residentBytes(elf),saved=old.memory.previousResident-resident;
 const minimum=Math.ceil((old.memory.previousMinimum-saved)/4096)*4096;
 const config={...old.config,id:'365220009',base,ui_base:base,elf_base:base,assets_base:base,wad_path:base+'doom2-r384.wad',module:'rw4doomii388',elf_sha:sha256(elf),elf_bytes:elf.length,elf_crc:crc32(elf),min_free:minimum,import_base:old.config.base,import_bytes:importer.length,import_crc:crc32(importer)};
 let source=old.source.replace(/^local config=.*$/m,'local config={'+Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join(',')+'}');
 source=once(source,'config.min_free=='+old.config.min_free,'config.min_free=='+minimum);
 source=once(source,'local checking,running,closing,verified=false,false,false,false',`local checking,running,closing,verified=false,false,false,false
local importing,imported=nil,false
local function cancel_import()if importing then importing.close();importing=nil end end
local function import_tick()
if not importing then
local f=assert(files.open(config.base..'import.lua','rb'));local s,why=f:read(config.import_bytes+1);assert(f:close())
assert(why==nil and s and #s==config.import_bytes and crc.finish(crc.update(0xffffffff,s))==config.import_crc,'import script CRC')
importing=assert(load(s,'@import388','t'))().new(config,files,system,crc)
end
if importing.tick()then cancel_import();imported=true;collectgarbage('collect')end
return imported
end`);
 source=once(source,'if checking then\nif verified then launch();return end',"if checking then\nif not imported then boot.stage=12;if not import_tick()then return end end\nif verified then launch();return end");
 source=once(source,'function b.stop()store.cancel();','function b.stop()cancel_import();store.cancel();');
 source=once(source,'function b.failed()verified=false;','function b.failed()pcall(cancel_import);verified=false;');
 source=once(source,'function b.close()closing=true;','function b.close()pcall(cancel_import);closing=true;');
 assert(Buffer.byteLength(source)<=32768);return{source,config,importer,sourceSha256:sha256(source),memory:{...old.memory,resident,saved,minimum},display:{zoom:306,positionY:30,source:[320,200],approxDisplay:[382.5,239.0625]}};
}
