// SPDX-License-Identifier: GPL-2.0-only
// Inspect stock memory-command code as DATA. No shell/device command is run.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
assert.equal(process.argv.length,2);const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),hash=b=>createHash('sha256').update(b).digest('hex');
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file);
assert.equal(hash(b),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
function text(ptr){const off=ptr-0x3bff187c,end=b.indexOf(0,off);assert(off>=0&&end>off&&end-off<128);return b.subarray(off,end).toString('ascii');}
assert.equal(text(b.readUInt32LE(0x77e20)),'mw');assert.equal(b.readUInt32LE(0x77e24),0x0c100000+0x21f7f8+1);assert.equal(b.readUInt32LE(0x77e28),0x302);
assert.equal(text(b.readUInt32LE(0x77e2c)),'<hex-address>[=<hex-value>] [<hex-byte-count>]');
// No '=' -> null result -> address parse -> argc<=2 -> ONE read/print/return.
for(const [at,v] of [[0x21f804,0x213d],[0x21f812,0xb340],[0x21f870,0xf1b9],[0x21f872,0x0f02],[0x21f876,0xdd22],[0x21f8c0,0x682b],[0x21f8d2,0x2000],[0x21f8d8,0xe8bd],[0x21f8da,0x8ff0]])assert.equal(b.readUInt16LE(at),v);
// Separate assignment arm contains the target store; it is not on that path.
assert.equal(b.readUInt16LE(0x21f84a),0x602b);
const plan=[{slot:'selector',address:0x3c1cdedc,bytes:4,shift:0,mask:255},{slot:'chiponeMaxCache',address:0x3c1aeba0,bytes:4,shift:16,mask:255,onlyWhenSelector:2}];
for(const r of plan){assert.equal(r.address%4,0);r.arguments=['mw',r.address.toString(16)];assert.equal(r.arguments.length,2);assert(/^[0-9a-f]{8}$/.test(r.arguments[1]));assert(!/[=;&|$`<>]/.test(r.arguments.join(' ')));}
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');assert.equal(hash(fs.readFileSync(exe)),'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
const out=path.join(root,'artifacts/research/rw4-touch-r401-repro');assert(!fs.existsSync(out),'Existing review');fs.mkdirSync(out,{recursive:true});
const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address=0x21f7f8','--stop-address=0x21f92c',file],{encoding:'utf8',windowsHide:true,shell:false,timeout:10000,maxBuffer:65536});assert(!r.error&&r.status===0);fs.writeFileSync(path.join(out,'stock-mw-handler.txt'),r.stdout);
const result={checkpoint:'R401',imageSha256:hash(b),handlerSha256:hash(b.subarray(0x21f7f8,0x21f92c)),stockCommand:'mw',plan,
 noAssignmentOrCountArgument:true,readPathTargetStore:false,newNativeModuleRequiredForThisCommand:false,
 shellRouteValidatedLive:false,diagnosticPrepared:false,physicalTransport:false,watchCommandExecuted:false,emulatorUsed:false,
 scope:'Fixed read-only argument design and pinned static path, not an executable diagnostic or live safety guarantee'};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
