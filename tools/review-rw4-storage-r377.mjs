// SPDX-License-Identifier: GPL-2.0-only
// Fixed offline firmware window, never executed or patched.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {root,sha256} from './doom-ready-source-r351.mjs';
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'),b=fs.readFileSync(file);
assert.equal(sha256(b),'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
const exe=path.join(root,'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
assert.equal(sha256(fs.readFileSync(exe)),'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
const r=spawnSync(exe,['-D','-b','binary','-m','arm','-EL','-M','force-thumb','--start-address=0x43c97c','--stop-address=0x43cd90',file],{encoding:'utf8',windowsHide:true,timeout:10000,maxBuffer:131072});
assert.equal(r.status,0);for(const expression of [/43ca5c:.*cmp\s+r4, #19/,/43ca5e:.*bhi.*0x43cbc2/,/43cc0a:.*cmp.w\s+r5, #15728640/,/43cc12:.*bcs.*0x43ccb8/,/43ccb8:.*movs\s+r0, #3/])assert(expression.test(r.stdout),String(expression));
assert.equal(b.readUInt32LE(0x43cd54),0x3bff187c+1102296);
const out=path.join(root,'artifacts/research/ultimate-storage-r377');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'quota-window.txt'),r.stdout,{flag:'wx'});
const result={checkpoint:'R377',imageSha256:sha256(b),prepareOffset:0x43ca08,marketCountRefusedAt:20,
 marketBytesIncludingIncomingRefusedAt:15728640,aggregateQuota:true,originalPackage:13090600,retainedCarrier:4827044,
 combinedBytes:13090600+4827044,excessBeforeOtherFaces:13090600+4827044-15728640,
 freeDiskLogThreshold:94371840,freeDiskBytesActuallyMeasured:false,firmwareExecuted:false,physicalWatchUsed:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
