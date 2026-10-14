// Synthetic metadata only. Never reads firmware, keys, Bluetooth or a device.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root} from './first-c-source.mjs';
if(process.argv.length!==2)throw Error('FixedSyntheticExampleOnly');
const out=path.join(root,'artifacts/research/registry-boundary-r245');
if(fs.existsSync(out))throw Error('ExistingReport');
const complete='rw4step234,0c003001,0c003141,00000000,0,20100000,972,20101000,36\n';
// Example of a 64-byte bounded C buffer, reserving one byte for its terminator.
// This does not assert the stock printf/copy behavior or actual physical bytes.
const truncated=complete.slice(0,63),fields=truncated.split(',');
assert.equal(complete.length,65);assert.equal(fields.length,9);
assert.equal(fields[8],'3');assert.equal(truncated.endsWith('\n'),false);
assert.equal(Number.isInteger(Number(fields[8])),true);
const newlineOnlyMissing=complete.slice(0,-1);
assert.equal(newlineOnlyMissing.split(',')[8],'36');
assert.equal(newlineOnlyMissing.endsWith('\n'),false);
fs.mkdirSync(out,{recursive:true});
const report={checkpoint:'R245',syntheticOnly:true,completeBytes:complete.length,
 boundedBufferPayloadBytes:truncated.length,fieldsAfterTruncation:fields.length,
 completeFinalSize:36,truncatedFinalSize:3,bothSizesPassGenericUnsignedValidation:true,
 missingNewlineAloneDoesNotDistinguishTruncation:true,watchCommandRequested:false,
 bluetoothOperationRequested:false,moduleOperationRequested:false};
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
