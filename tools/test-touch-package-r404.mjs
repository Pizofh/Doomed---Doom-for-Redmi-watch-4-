// SPDX-License-Identifier: GPL-2.0-only
// Offline resource readback and closed-gate checks. No dispatcher is invoked.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha,config,identitySource,identityAssets} from './touch-identity-r404.mjs';
assert.equal(process.argv.length,2);
const out=path.join(root,'build/touch-id-r404/package');
const bytes=fs.readFileSync(path.join(out,'TouchID-id-only.face')),original=fs.readFileSync(path.join(out,'output/TouchID.face'));
const review=JSON.parse(fs.readFileSync(path.join(out,'review.json'))),source=Buffer.from(identitySource());
assert.equal(bytes.length,28348);assert.equal(sha(bytes),'1293f339b9188bec946207f1c1e208d0fe212657a5188b25343bd9af861b98b4');
assert.equal(review.sha256,sha(bytes));assert.equal(review.sourceSha256,sha(source));
assert.equal(bytes.subarray(40,49).toString(),config.id);assert.equal(bytes[5],0);
assert(bytes.subarray(0,40).equals(original.subarray(0,40))&&bytes.subarray(49).equals(original.subarray(49)));
assert(!review.uploadAuthorized&&!review.physicalReadAuthorized&&!review.physicalTransport&&!review.newNativeExecutableIncluded&&!review.gameOrSaveDataIncluded);
assert(review.physicalReadEnabledByManualButtonIfInstalled&&review.writesOwnCaptureAndMarker&&review.manualStartOnly);
const expected=new Map([['main.lua',source],...identityAssets().records]);assert.equal(review.entries.length,expected.size);
for(const entry of review.entries) {
  const data=expected.get(entry.name);assert(data);expected.delete(entry.name);
  assert(entry.offset>=168&&entry.offset+entry.size<=bytes.length);
  assert.equal(entry.size,data.length);assert.equal(entry.sha256,sha(data));
  assert(bytes.subarray(entry.offset,entry.offset+entry.size).equals(data));
  assert.equal(sha(fs.readFileSync(path.join(out,'app/lua',entry.name))),sha(data));
}
assert.equal(expected.size,0);assert.equal(review.entries.length,39);
const gates=fs.readFileSync(path.join(root,'tools/doom-deployment-physical.mjs'),'utf8');
const flags=[...gates.matchAll(/const (PHYSICAL_[A-Z0-9_]+)=(true|false);/g)];
assert(flags.length>=30&&flags.every(m=>m[2]==='false'),'ExistingPhysicalGateOpened');
for(const file of ['touch-identity-r404.mjs','touch-host-lua-r404.mjs','package-touch-id-r404.mjs','test-touch-ui-r404.mjs']) {
  const text=fs.readFileSync(path.join(root,'tools',file),'utf8');
  assert(!/from ['"][^'"]*(?:pc-rfcomm|doom-deployment-physical|doom-upload|pc-session)/.test(text));
}
const compiler=JSON.parse(fs.readFileSync(path.join(out,'compiler-result.json')));assert.equal(compiler.status,0);
assert(/adb util is missing, skipping to upload/.test(compiler.stdout));
const report={checkpoint:'R404',passed:true,bytes:bytes.length,packageSha256:sha(bytes),resourcesVerified:39,
  onlyHeaderIdPatched:true,closedPhysicalFlags:flags.length,compilerAdbAbsent:true,transportDispatcherRemainsClosed:true,
  physicalTransport:false,watchExecuted:false};
fs.writeFileSync(path.join(out,'package-test-with-transport.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
