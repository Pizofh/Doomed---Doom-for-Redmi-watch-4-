// SPDX-License-Identifier: GPL-2.0-only
// Inspect the pinned WAD as data. No edits, rendering or watch interaction.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';import {verifyShareware} from './wad-data.mjs';
assert.equal(process.argv.length,2);const root=fileURLToPath(new URL('../',import.meta.url));
const b=fs.readFileSync(path.join(root,'tools/local/doom-shareware/doom1.wad')),w=verifyShareware(b);
const info=fs.readFileSync(path.join(root,'third_party/doomgeneric/doomgeneric/info.c'),'utf8');
const dead=new Map([...info.matchAll(/\/\/ (MT_\w+)\s*\r?\n\s*(\d+),\s*\/\/ doomednum\s*\r?\n\s*(S_[A-Z0-9_]+),\s*\/\/ spawnstate/g)]
 .filter(m=>/DIE|DEAD|GIBS/.test(m[3])).map(m=>[+m[2],{object:m[1],state:m[3]}]));
let map=null;const maps=[];
for(let i=0;i<w.count;i++){
 const at=w.directory+i*16,name=b.toString('ascii',at+8,at+16).replace(/\0.*$/,'');
 if(/^E1M[1-9]$/.test(name))map=name;
 if(name==='THINGS'&&map){const offset=b.readUInt32LE(at),size=b.readUInt32LE(at+4);assert(size%10===0&&offset+size<=b.length);
  const players=[],corpses=[];
  for(let j=0;j<size;j+=10){const p=offset+j,t=b.readUInt16LE(p+6),value={x:b.readInt16LE(p),y:b.readInt16LE(p+2),angle:b.readInt16LE(p+4),type:t,flags:b.readUInt16LE(p+8)};
   if(t>=1&&t<=4)players.push(value);if(dead.has(t))corpses.push({...value,...dead.get(t)});
  }maps.push({map,players,placedCorpses:corpses});map=null;
 }
}
assert.equal(maps.length,9);
const out=path.join(root,'artifacts/research/doom-start-r367.json');fs.writeFileSync(out,JSON.stringify({maps,physicalWatchUsed:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({e1m1:maps[0],physicalWatchUsed:false}));
