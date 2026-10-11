// Synthetic runner only; no ADB, phone, real diagnostic data or radio.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {collectPhoneReport} from './phone-hci-report.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = path.join(root, 'artifacts/test-phone-hci-report');
fs.mkdirSync(fixtureRoot, {recursive: true});
const session = fs.mkdtempSync(path.join(fixtureRoot, 'synthetic-'));
const output = path.join(session, 'success');
const calls = [];
const result = collectPhoneReport((args, timeout) => {
  calls.push({args, timeout});
  if (args[1] === 'get-state') return {status: 0, stdout: 'device\n'};
  // A deliberately incomplete synthetic ZIP: collection only recognizes its header.
  fs.writeFileSync(path.join(args[2], 'private-canary-NEVER-EXPORT.zip'),
    Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(30)]));
  return {status: 0, stdout: 'private address and filename NEVER-EXPORT', stderr: 'private key NEVER-EXPORT'};
}, output);
assert.deepEqual(calls, [{args: ['-d', 'get-state'], timeout: 30000},
  {args: ['-d', 'bugreport', output], timeout: 300000}]);
assert.equal(result.privateReportSaved, true);
assert.equal(result.hciIncluded, null);
assert.equal(result.archiveContentReviewed, false);
assert.equal(result.watchCommandRequested, false);
assert.equal(result.logConfigurationChanged, false);
assert.ok(!JSON.stringify(result).includes('NEVER-EXPORT'));
assert.ok(!fs.readFileSync(path.join(output, 'collection-review.json'), 'utf8').includes('NEVER-EXPORT'));
assert.throws(() => collectPhoneReport(() => { throw Error('Must not run'); }, output));
assert.throws(() => collectPhoneReport(() => { throw Error('Must not run'); }, 'relative'));
for (const [label, reply] of [['offline', {status: 0, stdout: 'offline'}],
  ['unauthorized', {status: 0, stdout: 'unauthorized'}], ['error', {status: 1}],
  ['spawn-error', {status: 0, error: Error('private')}], ['large', {status: 0, stdout: 'x'.repeat(1048577)}]]) {
  let count = 0;
  assert.throws(() => collectPhoneReport(() => { count++; return reply; }, path.join(session, label)));
  assert.equal(count, 1);
}
for (const label of ['missing', 'bad-header', 'two-zips', 'timeout']) {
  let count = 0;
  assert.throws(() => collectPhoneReport((args) => {
    count++;
    if (args[1] === 'get-state') return {status: 0, stdout: 'device'};
    if (label === 'timeout') return {status: null, error: Error('private')};
    if (label === 'bad-header') fs.writeFileSync(path.join(args[2], 'bad.zip'), Buffer.alloc(32));
    if (label === 'two-zips') for (const name of ['a.zip', 'b.zip']) fs.writeFileSync(path.join(args[2], name), Buffer.alloc(32));
    return {status: 0};
  }, path.join(session, label)));
  assert.equal(count, 2); // No retry or fallback.
}
const captured = collectPhoneReport((args) => {
  if (args[1] === 'get-state') return {status: 0, stdout: 'device'};
  fs.writeFileSync(path.join(args[2], 'synthetic.zip'), Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(30)]));
  return {status: 0};
}, path.join(session, 'capture'), 'R136');
assert.equal(captured.checkpoint, 'R136');
assert.throws(() => collectPhoneReport(() => { throw Error('Must not run'); }, path.join(session, 'bad-checkpoint'), 'arbitrary'));
for (const args of [[], ['plan'], ['plan-capture'], ['unknown'], ['collect', 'extra'], ['collect-capture', 'extra']]) {
  const run = spawnSync(process.execPath, [path.join(root, 'tools/phone-hci-report.mjs'), ...args], {encoding: 'utf8'});
  assert.equal(run.status, args.length <= 1 && args[0] !== 'unknown' ? 0 : 1);
  if (run.status === 0) assert.equal(JSON.parse(run.stdout).executionPerformed, false);
}
console.log('PASS: fixed user-manual bugreport collection, no default ADB, privacy, refusal and no fallback (synthetic only)');
