// SPDX-License-Identifier: GPL-2.0-only
// Fixed offline contract review. Produces no runtime bindings or firmware bytes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const check=process.argv.length===3&&process.argv[2]==='--check';
assert(process.argv.length===2||check,'Fixed review only');
const root=fileURLToPath(new URL('../',import.meta.url));
const bytes=fs.readFileSync(path.join(root,'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const imageSha256=hash(bytes);
assert.equal(imageSha256,'2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
// Explicit instruction/literal checks anchor the manual disassembly conclusions.
for(const [offset,hex] of [[0x4e1aca,'08bf'],[0x4e1acc,'0835'],
 [0x4e1ace,'2d04'],[0x4e1ad0,'45f00f03'],[0x4e1fa4,'1c14'],
 [0x4e1532,'0121']]) {
 assert.equal(bytes.subarray(offset,offset+hex.length/2).toString('hex'),hex,'Instruction changed at '+offset.toString(16));
}
const configPointer=bytes.readUInt32LE(0x4e1c9c),configOffset=configPointer-0x3bff187c;
assert.equal(bytes.toString('ascii',configOffset,bytes.indexOf(0,configOffset)),'/etc/media//media_focus.conf');
const entries=[['focus_request',0x4e19bc],['focus_abandon',0x4e1f94],
 ['proxy_connect',0x4e14e8],['socket_create',0x498780]];
const result={checkpoint:'R361',imageSha256,fingerprintBytes:64,callable:false,
 physicalDeploymentAuthorized:false,firmwareExecuted:false,
 entries:entries.map(([name,fileOffset])=>({name,fileOffset,sha256:hash(bytes.subarray(fileOffset,fileOffset+64))})),
 focus:{requestArguments:['int *initial','const char *scenario','callback','void *cookie'],
  returnRepresentation:'encoded 32-bit integer token, not a heap pointer',
  normalToken:'(id << 16) | 15; initial==1 adds 8 to id before encoding',
  abandon:'signed token >14, arithmetic shift right 16, table removal under shared lock',
  configuration:'/etc/media//media_focus.conf',scenarioVerified:false,
  callbackQuiescenceVerified:false},
 proxy:{socketTypeArgument:1,protocolArgument:0,localDomain:1,remoteDomain:65,
  explicitNonblockingFlagInCreate:false,timeoutConfiguredInReviewedConnect:false,
  lowerSocketWaitBoundVerified:false},
 unresolved:['exact scenario and speaker route','bounded connect/accept/control/data IO',
  'callback quiescence after focus abandonment','all lower socket implementations']};
const target=path.join(root,'doom/platform-rw4/audio/focus-contract-r361.json');
if(check)assert.deepEqual(JSON.parse(fs.readFileSync(target,'utf8')),result);
else fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checked:check,candidates:entries.length,callable:false,physicalWatchUsed:false}));
