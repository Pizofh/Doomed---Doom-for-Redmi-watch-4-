// Substitute only the platform-specific native adapter and RAM collector.
import fs from 'node:fs';import path from 'node:path';import {root} from './doom-ready-r351.mjs';import {crc32} from './static-watchface-transfer.mjs';
export function readyUiFixture(p,elf){
 const native=fs.readFileSync(path.join(root,'experiments/doom-runtime-rw4/ready-s3-r351.lua'),'utf8');
 const implementation="local native=(function()\n"+native+"\nend)()\nlocal crc=(function()\n"+p.parts.crc+"\nend)()\nlocal store=(function()\n"+p.parts.store+"\nend)()\nlocal wrapper=(function()\n"+p.parts.wrapper+"\nend)()\nlocal memory={collect=function()return {{name='UMEM',free=16000000,max=8000000}}end}\nreturn {new=function(c,f,s,v)return wrapper.new(c,f,s,v,native,memory,crc,store)end}";
 return p.render({...p.config,base:'/tmp/rw4-ready351-state/',elf_bytes:elf.length,elf_crc:crc32(elf),ui_base:'/data/app/watchface/market/365799903/lua/',assets_base:'/tmp/rw4-ready351-assets/'},implementation);
}
