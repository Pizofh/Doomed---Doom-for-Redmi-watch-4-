// SPDX-License-Identifier: GPL-2.0-only
// Fingerprints only. Produces no callable addresses, linker script or payload.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
if(process.argv.length!==2)throw Error('Fixed review only');
const root=fileURLToPath(new URL('../',import.meta.url));
const file=path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const bytes=fs.readFileSync(file),hash=b=>createHash('sha256').update(b).digest('hex');
const imageSha256=hash(bytes);
if(imageSha256!=='2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db')throw Error('Image changed');
const entries=[['player_open',0x4e00a0],['player_close',0x4e00b0],
['player_prepare',0x4e0194],['player_write_data',0x4e0378],
['player_close_socket',0x4e03fc],['player_get_socket',0x4e0420],
['player_start',0x4e0440],['player_stop',0x4e0480]];
const result={checkpoint:'R359',imageSha256,fingerprintBytes:64,
 status:'Static candidates, incomplete lifecycle contract',callable:false,
 physicalDeploymentAuthorized:false,firmwareExecuted:false,
 entries:entries.map(([name,offset])=>({name,fileOffset:offset,sha256:hash(bytes.subarray(offset,offset+64))})),
 unresolved:['stream route and focus ownership','bounded prepare/write/control waits',
 'stop and close failure semantics','full referenced-callee review'],
};
const output=path.join(root,'doom/platform-rw4/audio/managed-candidates-r359.json');
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({candidates:result.entries.length,callable:false,physicalDeploymentAuthorized:false}));
