// SPDX-License-Identifier: GPL-2.0-only
// Verify native profile before reading private inputs or creating an install journal.
import {spawnSync} from 'node:child_process';import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
export function assertLargeNativeDispatchReady(){
 const r=spawnSync(reviewedLargeExecutable(),['session-large-r281'],{input:'\n',encoding:'utf8',windowsHide:true,shell:false,timeout:5000});
 if(r.error||r.status!==2||r.stdout.trim()!=='E:InvalidTarget')throw Error('NativeProfileNotReady');
}
export function assertRetailNativeDispatchReady(){
 const r=spawnSync(reviewedLargeExecutable(),['session-retail-r374'],{input:'\n',encoding:'utf8',windowsHide:true,shell:false,timeout:5000});
 if(r.error||r.status!==2||r.stdout.trim()!=='E:InvalidTarget')throw Error('NativeProfileNotReady');
}
