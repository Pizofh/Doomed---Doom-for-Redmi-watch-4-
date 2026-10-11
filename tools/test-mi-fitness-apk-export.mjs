// Fake ADB replies and fake ZIP header only; never runs ADB or executes an APK.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {copyInstalledMiFitness, diagnoseBluetoothExport} from './export-mi-fitness-apk.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'build/mi-fitness-export-test-' + Date.now());
const calls = [];
const fakeZip = Buffer.from('504b0304' + '00'.repeat(28), 'hex');
function fake(args) {
  calls.push(args);
  if (args.join(' ') === '-d get-state') return {status: 0, stdout: 'device\r\n'};
  if (args.join(' ') === '-d shell pm path com.xiaomi.wearable') return {status: 0,
    stdout: 'package:/data/app/~~synthetic/com.xiaomi.wearable-synthetic/base.apk\npackage:/data/app/~~synthetic/com.xiaomi.wearable-synthetic/split_config.apk\n'};
  if (args[1] === 'pull') { fs.writeFileSync(args[3], fakeZip); return {status: 0, stdout: 'private-output-not-exported'}; }
  throw Error('Unapproved operation');
}
const report = copyInstalledMiFitness(fake, path.join(output, 'success'));
assert.equal(report.sizeBytes, 32); assert.equal(report.packagePartsReported, 2);
assert.equal(report.signatureVerified, false); assert.equal(report.bluetoothOperationRequested, false);
assert.deepEqual(calls.slice(0, 2), [['-d', 'get-state'], ['-d', 'shell', 'pm', 'path', 'com.xiaomi.wearable']]);
assert.equal(calls[2][0], '-d'); assert.equal(calls[2][1], 'pull');
assert.equal(fs.existsSync(path.join(output, 'success/MiFitness-base.apk.partial')), false);
const json = JSON.stringify(report);
for (const secret of ['synthetic', 'private-output', '/data/app/', 'split_config']) assert.equal(json.includes(secret), false);
const previousCalls = calls.length;
assert.throws(() => copyInstalledMiFitness(fake, path.join(output, 'success')));
assert.equal(calls.length, previousCalls); // Existing export refuses before device access.
let pulls = 0;
for (const response of ['', 'package:/data/user/0/com.xiaomi.wearable/auth.apk',
  'package:/data/app/pkg/../base.apk', 'package:/data/app/pkg/base.apk;echo-secret',
  'package:/data/app/a/base.apk\npackage:/data/app/b/base.apk', 'package:/data/app/pkg/base.apk\nwarning-private']) {
  assert.throws(() => copyInstalledMiFitness(args => {
    if (args[1] === 'get-state') return {status: 0, stdout: 'device'};
    if (args[1] === 'pull') pulls++;
    return {status: 0, stdout: response};
  }, path.join(output, 'bad-' + pulls)));
}
assert.equal(pulls, 0);
assert.throws(() => copyInstalledMiFitness(() => ({status: 0, stdout: 'unauthorized'}), path.join(output, 'unauthorized')));
assert.throws(() => copyInstalledMiFitness(() => ({status: 1, stdout: 'private-error'}), path.join(output, 'failed')));
assert.throws(() => copyInstalledMiFitness(fake, path.resolve(root, '..', 'outside-export')));
const coreCalls = [];
const coreReport = copyInstalledMiFitness(args => {
  coreCalls.push(args);
  if (args.join(' ') === '-d get-state') return {status: 0, stdout: 'device'};
  if (args.join(' ') === '-d shell pm path com.xiaomi.mi_connect_service') return {status: 0,
    stdout: 'package:/system_ext/priv-app/MiConnectService/MiConnectService.apk'};
  if (args[1] === 'pull') { fs.writeFileSync(args[3], fakeZip); return {status: 0, stdout: 'private-core-path'}; }
  throw Error('Unapproved operation');
}, path.join(output, 'core'), 'core');
assert.equal(coreReport.packageRequested, 'com.xiaomi.mi_connect_service');
assert.equal(coreReport.packagePartsReported, 1);
assert.deepEqual(coreCalls.slice(0, 2), [['-d', 'get-state'], ['-d', 'shell', 'pm', 'path', 'com.xiaomi.mi_connect_service']]);
assert.equal(coreCalls[2][1], 'pull');
assert.equal(fs.existsSync(path.join(output, 'core/MiConnectService-base.apk')), true);
assert(!JSON.stringify(coreReport).includes('private-core-path'));
assert.throws(() => copyInstalledMiFitness(fake, path.join(output, 'unknown'), 'arbitrary.package'));
for (const remote of ['/apex/com.android.btservices/app/Bluetooth/Bluetooth.apk',
  '/apex/com.android.bt@123456/app/Bluetooth/Bluetooth.apk',
  '/system/app/Bluetooth/Bluetooth.apk']) {
  const btCalls = [];
  const result = copyInstalledMiFitness(args => {
    btCalls.push(args);
    if (args[1] === 'get-state') return {status: 0, stdout: 'device'};
    if (args[1] === 'shell') { assert.deepEqual(args, ['-d', 'shell', 'pm', 'path', 'com.android.bluetooth']); return {status: 0, stdout: 'package:' + remote}; }
    if (args[1] === 'pull') { assert.equal(args[2], remote); fs.writeFileSync(args[3], fakeZip); return {status: 0, stdout: 'PRIVATE'}; }
    throw Error('Unexpected command');
  }, path.join(output, 'bluetooth-' + calls.length + '-' + remote.length), 'bluetooth');
  assert.equal(btCalls.length, 3);
  assert.equal(result.packageRequested, 'com.android.bluetooth');
  assert.equal(result.apkExecuted, false);
  assert.ok(!JSON.stringify(result).includes(remote));
}
for (const remote of ['/apex/com.android.bt/app/Bluetooth/../Bluetooth.apk',
  '/apex/private.module/app/Bluetooth/Bluetooth.apk', '/data/user/0/com.android.bluetooth/secret.apk']) {
  let pulled = false;
  assert.throws(() => copyInstalledMiFitness(args => {
    if (args[1] === 'get-state') return {status: 0, stdout: 'device'};
    if (args[1] === 'pull') pulled = true;
    return {status: 0, stdout: 'package:' + remote};
  }, path.join(output, 'rejected-bluetooth'), 'bluetooth'));
  assert.equal(pulled, false);
}
const planned = spawnSync(process.execPath, ['tools/export-mi-fitness-apk.mjs', 'plan-bluetooth'], {cwd: root, encoding: 'utf8'});
assert.equal(planned.status, 0); assert.equal(JSON.parse(planned.stdout).executionPerformed, false);
for (const [label, state] of [['offline', 'offline'], ['unauthorized', 'unauthorized']]) {
  let count = 0;
  const result = diagnoseBluetoothExport(() => { count++; return {status: 0, stdout: state}; }, path.join(output, 'diagnose-' + label));
  assert.equal(count, 1); assert.equal(result.usbState, state); assert.equal(result.copyPerformed, false);
}
assert.equal(diagnoseBluetoothExport(() => ({status: 1, stdout: '', stderr: 'error: device unauthorized PRIVATE'}),
  path.join(output, 'diagnose-error')).usbState, 'unauthorized');
for (const [label, response, stage, saved] of [
  ['missing', '', 'PACKAGE_NO_PATH', false],
  ['unexpected', 'private error with KEY', 'PACKAGE_RESPONSE_REFUSED', false],
  ['allowed', 'package:/apex/com.android.bt/app/Bluetooth/Bluetooth.apk', 'READY_TO_COPY', true],
  ['versioned', 'package:/apex/com.android.btservices/app/Bluetooth@PRIVATE-BUILD/Bluetooth.apk', 'PACKAGE_PATH_REFUSED', true],
]) {
  const calls = [];
  const directory = path.join(output, 'diagnose-' + label);
  const result = diagnoseBluetoothExport(args => {
    calls.push(args);
    if (args[1] === 'get-state') return {status: 0, stdout: 'device'};
    assert.deepEqual(args, ['-d', 'shell', 'pm', 'path', 'com.android.bluetooth']);
    return {status: 0, stdout: response, stderr: ''};
  }, directory);
  assert.equal(calls.length, 2); assert.equal(result.stage, stage);
  assert.equal(result.privateMetadataSaved, saved); assert.equal(result.copyPerformed, false);
  assert.ok(!/PRIVATE|KEY|\/apex\//.test(JSON.stringify(result)));
  if (saved) {
    assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'package-path-metadata.json'))).paths[0], response.slice(8));
    assert.throws(() => diagnoseBluetoothExport(() => { throw Error('Must refuse before USB'); }, directory));
  }
}
console.log('PASS: fake USB-only APK export, exact read commands, no raw paths/data in report, malformed-path rejection, no overwrite, no fallback; no real ADB/phone executed.');
