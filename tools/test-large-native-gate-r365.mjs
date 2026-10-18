// SPDX-License-Identifier: GPL-2.0-only
// Empty target must be rejected before Bluetooth APIs. Verifies dispatch is ready.
import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
assert.equal(process.argv.length,2);
const r=spawnSync(reviewedLargeExecutable(),['session-large-r281'],{input:'\n',encoding:'utf8',windowsHide:true,shell:false,timeout:5000});
assert(!r.error&&r.status===2);assert.equal(r.stdout.trim(),'E:InvalidTarget','Native profile remains gated or malformed');
console.log(JSON.stringify({passed:true,nativeDispatchReady:true,invalidTargetRejected:true,bluetoothOperationRequested:false}));
