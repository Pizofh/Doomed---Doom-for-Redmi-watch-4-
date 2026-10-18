// SPDX-License-Identifier: GPL-2.0-only
// Check the actual stock parser/demuxer contract as data. No firmware execution.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256} from './doom-ready-source-r351.mjs';
assert.equal(process.argv.length,2);
const b=fs.readFileSync(path.join(root,'artifacts/research/audio-server-r368/image.bin'));
assert.equal(sha256(b),'6e0dd7d67bfdf9c6ed6dc31b7b8a777c84d88d0d5ee992316c062b6ba3e2228c');
const map=p=>{
 let off;
 if(p>=0x3dc00020&&p<0x3dd9c434)off=p-0x3dbe97d0;
 else if(p>=0x20118000&&p<0x2011f1f0)off=p-0x20118000+0x900;
 else if(p>=0x2011f1f0&&p<0x2012df50)off=p-0x2011f1f0+0x7af0;
 else throw Error('Unreviewed image address');
 assert(off>=0&&off+4<=b.length);return off;
};
const text=p=>{const off=map(p),end=b.indexOf(0,off);assert(end>=off&&end-off<128);return b.toString('ascii',off,end);};
assert.equal(b.readUInt16LE(0xf2bc4),0xe8df);assert.equal(b.readUInt16LE(0xf2bc6),0xf003);
assert.equal(0xf2bc8+b[0xf2bc8]*2,0xf2bf6,'SET_OPTIONS command 3 dispatch');
assert.equal(b.readUInt16LE(0xf2bf6),0x4b9a);assert.equal(b.readUInt16LE(0xf2bf8),0x4a9a);
assert.equal(text(b.readUInt32LE(0xf2e60)),':');assert.equal(text(b.readUInt32LE(0xf2e64)),'=');
// av_find_input_format iterates this table; the fourth descriptor lives in the
// initialized RAM segment, not the RO alias. Resolve both from pinned headers.
assert.equal(b.readUInt32LE(0xee1c4),0x3dd8b4ac);
const formats=Array.from({length:5},(_,i)=>text(b.readUInt32LE(map(b.readUInt32LE(map(0x3dd8b4ac)+i*4)))));
assert.deepEqual(formats,['mp3','ogg','s16le','silk','wav']);
const parse=s=>Object.fromEntries(s.split(':').map(pair=>{const at=pair.indexOf('=');assert(at>0);return [pair.slice(0,at),pair.slice(at+1)];}));
const bad=parse('format=s16le,sample_rate=22050,channels=1');assert(!formats.includes(bad.format));
const source=fs.readFileSync(path.join(root,'doom/platform-rw4/audio/media-sink.c'),'utf8');
const options=source.match(/api->prepare\(player,0,"([^"]+)"\)/)?.[1];assert(options);
const corrected=parse(options);assert(formats.includes(corrected.format));
assert.deepEqual(corrected,{format:'s16le',sample_rate:'22050',channels:'1'});
const result={passed:true,imageSha256:sha256(b),pairSeparator:':',keyValueSeparator:'=',formats,
 oldOptionsSelectNoRegisteredFormat:true,newOptionsSelectPcm:true,physicalWatchUsed:false,firmwareExecuted:false};
fs.writeFileSync(path.join(root,'artifacts/research/audio-server-r368/contract-r369.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
