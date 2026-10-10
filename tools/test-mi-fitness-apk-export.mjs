// Fake ADB replies and fake ZIP header only; never runs ADB or executes an APK.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {copyInstalledMiFitness} from './export-mi-fitness-apk.mjs';
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
console.log('PASS: fake USB-only APK export, exact read commands, no raw paths/data in report, malformed-path rejection, no overwrite, no fallback; no real ADB/phone executed.');
