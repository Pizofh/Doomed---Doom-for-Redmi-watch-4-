// SPDX-License-Identifier: GPL-2.0-only
// Static inspection of a pinned image as DATA. Never opens a watch or emulator.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
assert.equal(process.argv.length,2);const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file),hash=x=>createHash('sha256').update(x).digest('hex');
assert.equal(hash(b),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
const codeBase=0x0c100000,roBase=0x3bff187c;
function textAtLiteral(at){const off=b.readUInt32LE(at)-roBase;assert(off>=0&&off<b.length);const end=b.indexOf(0,off);assert(end>off&&end-off<256);const s=b.subarray(off,end).toString('ascii');assert(/^[\x09\x0a\x0d\x20-\x7e]+$/.test(s));return s;}
function call(at){const a=b.readUInt16LE(at),c=b.readUInt16LE(at+2);assert.equal(a&0xf800,0xf000);assert.equal(c&0xd000,0xd000);const sign=(a>>>10)&1;let d=(sign<<24)|((1^(((c>>>13)&1)^sign))<<23)|((1^(((c>>>11)&1)^sign))<<22)|((a&1023)<<12)|((c&2047)<<1);if(sign)d-=0x2000000;return at+4+d;}
assert.equal(textAtLiteral(0x4b69f8),'dev/input0');
const selector=b.readUInt32LE(0x4b69fc);assert.equal(selector,0x3c1cdedc);
const setup=[{value:2,family:'Chipone',modelLabel:'ICNT8918',call:0x4b698e,target:0x1d6a40,success:0x4b6a10},{value:1,family:'Zinitix',modelLabel:'ZTW662',call:0x4b69a6,target:0x1d6528,success:0x4b6a0c},{value:3,family:'Hynitron',modelLabel:'CST9217',call:0x4b69ba,target:0x1d67a0,success:0x4b6a08}];
for(const r of setup){assert.equal(call(r.call),r.target);r.successText=textAtLiteral(r.success);}
for(const [at,halfword] of [[0x4b6994,0xda22],[0x4b69ac,0xda10],[0x4b69c0,0xdb14],[0x4b69c2,0x2303],[0x4b69c8,0x7023],[0x4b69d0,0x2001],[0x4b69d4,0x7020],[0x4b69dc,0x2202],[0x4b69e4,0x701a],[0x4b69f0,0x7025]])assert.equal(b.readUInt16LE(at),halfword);
assert.equal(textAtLiteral(0x1de77c),'cst9217_ts_getstate');
assert.equal(textAtLiteral(0x1d6b1c),'bes_ts_icnt8918_setup');
assert(b.subarray(0x697f8,b.indexOf(0,0x697f8)).toString().includes('ztw662'));
const maxCache=b.readUInt32LE(0x1dce68);assert.equal(maxCache,0x3c1aeba2);
assert(textAtLiteral(0x1dce6c).includes('cts_get_max_num'));
assert.equal(b.readUInt16LE(0x1dcdea),0x701a); // strb from successful register read.
assert.equal(call(0x1de38e),0x1dcd54); // queried during successful Chipone setup.
assert.equal(b.readUInt16LE(0x1dc95a),0x2510); // 16 bytes requested by normal raw path.
assert.equal(b.readUInt16LE(0x1dc970),0x9500); // fifth argument = length in r5.
assert.equal(call(0x1dc972),0x1dbcf8);
const updateEntryCalls=[{call:0x1dbbc0,target:0x1db350,family:'Zinitix'},{call:0x1de392,target:0x1de0c8,family:'Chipone'},{call:0x1deab6,target:0x1df5d8,family:'Hynitron'}];
for(const r of updateEntryCalls)assert.equal(call(r.call),r.target);
assert(textAtLiteral(0x1de290).includes('Need update Firmware'));
assert.equal(textAtLiteral(0x1db9f4),'ts_upgrade_firmware');
assert.equal(textAtLiteral(0x1df8e8),'hynitron_upgrade_firmware');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');assert.equal(hash(fs.readFileSync(exe)),'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
const out=path.join(root,'artifacts/research/rw4-touch-r400-repro-v2');assert(!fs.existsSync(out),'Existing review; inspect before repeating');fs.mkdirSync(out,{recursive:true});
const windows=[['selector',0x4b6988,0x4b6a18],['chipone-cache',0x1dcd54,0x1dce88],['chipone-packet',0x1dc940,0x1dcb00],['hynitron-packet',0x1de5a4,0x1de6e8],['zinitix-packet',0x1daab0,0x1dab80],['zinitix-update',0x1db350,0x1dba50],['chipone-update',0x1de0c8,0x1de2a8],['hynitron-update',0x1df5d8,0x1df910]];
for(const [name,start,end] of windows){const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address='+start,'--stop-address='+end,file],{encoding:'utf8',windowsHide:true,shell:false,timeout:10000,maxBuffer:524288});assert(!r.error&&r.status===0);fs.writeFileSync(path.join(out,name+'.txt'),r.stdout);}
const result={checkpoint:'R400',imageSha256:hash(b),codeBase,roBase,setupOrder:setup,selectorAddress:selector,updateEntryCalls,
 selectorReadFromWatch:false,chiponeMaxCacheAddress:maxCache,chiponeMaxReadFromWatch:false,
 chiponeMaxRegister:0x801a,chiponeNormalReadBytes:16,chiponeSecondContactLayoutProven:false,
 activeHardwareDriverKnown:false,physicalTransport:false,emulatorUsed:false,firmwareExecuted:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
