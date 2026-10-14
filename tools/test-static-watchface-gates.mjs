// Runs only local, closed entry points. Never supplies a real target or key.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {staticSpec,watchfaceVariants} from './static-watchface-spec.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for (const action of ['install','remove']) for(const variant of watchfaceVariants) {
  const result = spawnSync(process.execPath,[path.join(root,'tools/pc-static-watchface.mjs'),action,variant],
    {cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:3000,maxBuffer:4096});
  assert.equal(result.status,2);assert.equal(result.stderr,'');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status,'PhysicalGateClosed');assert.equal(report.bluetoothOperationRequested,false);
  assert.equal(report.variant,variant);
  assert.equal(report.contentKind,staticSpec(variant).contentKind);
  assert.equal(report.watchCommandRequested,false);assert.equal(report.filesTransferred,false);
}
for(const action of ['install-after-space','remove-after-space']) {
  const result=spawnSync(process.execPath,[path.join(root,'tools/pc-static-watchface.mjs'),action,'r173'],
    {cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:3000,maxBuffer:4096});
  assert.equal(result.status,2);assert.equal(JSON.parse(result.stdout).status,'PhysicalGateClosed');
}
const paced=spawnSync(process.execPath,[path.join(root,'tools/pc-static-watchface.mjs'),'install-paced-retry','r265'],{cwd:root,shell:false,windowsHide:true,encoding:'utf8',timeout:3000,maxBuffer:4096});
assert.equal(paced.status,2);assert.equal(paced.stderr,'');
const pacedReport=JSON.parse(paced.stdout);assert.equal(pacedReport.status,'PhysicalGateClosed');assert.equal(pacedReport.checkpoint,'R268');assert.equal(pacedReport.bluetoothOperationRequested,false);assert.equal(pacedReport.watchCommandRequested,false);assert.equal(pacedReport.filesTransferred,false);
const exe = path.join(root,'artifacts/pc-rfcomm/Rw4PcRfcomm.exe');
const metadata = JSON.parse(fs.readFileSync(path.join(root,'artifacts/pc-rfcomm/build.json'),'utf8'));
const stat = fs.lstatSync(exe);assert(stat.isFile() && !stat.isSymbolicLink());
assert.equal(createHash('sha256').update(fs.readFileSync(exe)).digest('hex'),metadata.executableSha256);
const result = spawnSync(exe,['session-static-r169'],
  {cwd:root,shell:false,windowsHide:true,encoding:'utf8',input:'',timeout:3000,maxBuffer:4096});
assert.equal(result.status,2);assert.equal(result.stdout.trim(),'E:GateClosed');
assert.equal(result.stderr,'');
console.log(JSON.stringify({checkpoint:'R169',cliAndNativeGatesVerified:true,nativeSocketCalls:0,
  bluetoothOperationRequested:false,watchCommandRequested:false,physicalFilesTransferred:false}));
