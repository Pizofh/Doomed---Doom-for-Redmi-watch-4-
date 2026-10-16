// Read-only local firmware candidate data; report bounded xrefs, never execute it.
import fs from 'node:fs';import path from 'node:path';import {firstCRoot as root,sha256} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const b=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
if(sha256(b)!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db')throw Error('FirmwareChanged');
for(const marker of ['.png\0','png\0','lv_png','lodepng','png_decoder','lv_png.c','fstat','stat failed','lv_fs_size']){
 const offsets=[];for(let at=b.indexOf(Buffer.from(marker));at>=0&&offsets.length<12;at=b.indexOf(Buffer.from(marker),at+1))offsets.push(at);
 const hits=offsets.map(offset=>{const refs=[];for(const base of [0x1bff187c,0x3bff187c,0x0c100000]){const p=Buffer.alloc(4);p.writeUInt32LE(base+offset);for(let at=b.indexOf(p);at>=0&&refs.length<24;at=b.indexOf(p,at+1))refs.push({at,base});}return{offset,refs};});
 console.log(JSON.stringify({marker,hits}));
}
