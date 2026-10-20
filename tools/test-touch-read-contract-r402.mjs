// SPDX-License-Identifier: GPL-2.0-only
// Host Node tests only. Stock AP is data. No shell, transport, Lua, or emulator.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {profile, parseWord, createReviewSession} from './touch-read-contract-r402.mjs';
assert.equal(process.argv.length, 2, 'FixedOfflineTestOnly');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = b => createHash('sha256').update(b).digest('hex');
const image = fs.readFileSync(path.join(root, 'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin'));
assert.equal(sha(image), profile.imageSha256);
assert.equal(sha(image.subarray(0x21f7f8, 0x21f92c)), profile.handlerSha256);
for (const [address, word] of profile.pins) {
  assert.equal(parseInt(address,16)%4,0,'UnalignedRead');
  assert.equal(image.readUInt32LE(parseInt(address, 16) - 0x0c100000), word);
}
for(const address of [profile.selector,profile.cache])assert.equal(parseInt(address,16)%4,0,'UnalignedRead');
for (const [at, expected] of [[0x21f920, '  %p = 0x%08lx'], [0x21f928, '\n']]) {
  const offset = image.readUInt32LE(at) - 0x3bff187c;
  assert.equal(image.subarray(offset, image.indexOf(0, offset)).toString('ascii'), expected);
}
const source = fs.readFileSync(path.join(root, 'tools/touch-read-contract-r402.mjs'), 'utf8');
assert(!/\b(?:import|require|eval|Function)\b|system\s*\.|\b(?:execute|spawn)\s*\(/.test(source));
const reply = (address, value) => '  0x' + address + ' = 0x' + value.toString(16).padStart(8, '0') + '\n';
let cases = 0;
function test(name, fn) { fn(); cases++; }
function pinned(session = createReviewSession()) {
  let req = session.start();
  for (const [address, word] of profile.pins) {
    assert.equal(req.address, address); assert.equal(req.kind, 'pin');
    assert.equal(req.command, 'mw ' + address);
    assert.match(req.command, /^mw [0-9a-f]{8}$/);
    req = session.accept(reply(address, word));
  }
  assert.equal(req.kind, 'selector'); return {session, req};
}
test('construction inert, submit and restart prohibited', () => {
  const session = createReviewSession(); assert.equal(session.status().state, 'IDLE');
  assert.throws(() => session.accept(''), /NoPending/);
  session.start(); assert.throws(() => session.start(), /SingleAttempt/);
});
for (const [name, text] of [
  ['canonical', reply(profile.selector, 0xffffffff)],
  ['CRLF', reply(profile.selector, 0xffffffff).replace('\n', '\r\n')],
  ['pointer without prefix', '  3c1cdedc = 0xffffffff\n'],
  ['upper hex', '  3C1CDEDC = 0xFFFFFFFF\n'],
]) test(name, () => assert.equal(parseWord(text, profile.selector), 0xffffffff));
for (const [name, text] of [
  ['empty', ''], ['null', null], ['missing newline', '  0x3c1cdedc = 0x00000002'],
  ['oversized', 'x'.repeat(97)], ['extra newline', reply(profile.selector, 2) + '\n'],
  ['extra word', reply(profile.selector, 2) + reply(profile.selector, 2)],
  ['echo', 'mw 3c1cdedc\n' + reply(profile.selector, 2)],
  ['prompt', reply(profile.selector, 2) + 'nsh> '],
  ['denial', 'nsh: mw: command not found\n'],
  ['short word', '  0x3c1cdedc = 0x2\n'],
  ['wide word', '  0x3c1cdedc = 0x100000002\n'],
  ['write suffix', reply(profile.selector, 2).trimEnd() + ' -> 0x00000001\n'],
  ['wrong address', reply(profile.cache, 2)], ['NUL', reply(profile.selector, 2) + '\0'],
]) test(name, () => {
  assert.throws(() => parseWord(text, profile.selector));
  const {session} = pinned(); assert.equal(session.accept(text).state, 'STOPPED');
  assert.throws(() => session.accept(reply(profile.selector, 2)), /NoPending/);
  assert.throws(() => session.start(), /SingleAttempt/);
});
for (let i = 0; i < profile.pins.length; i++) test('pin mismatch ' + i, () => {
  const session = createReviewSession(); session.start();
  for (let j = 0; j < i; j++) session.accept(reply(...profile.pins[j]));
  const [address, word] = profile.pins[i];
  assert.deepEqual(session.accept(reply(address, (word ^ 1) >>> 0)), {state: 'STOPPED', reason: 'CodeMismatch'});
});
for (const id of [1, 3]) test('no cache for selector ' + id, () => {
  const {session} = pinned(); const result = session.accept(reply(profile.selector, 0xaabbcc00 + id));
  assert.equal(result.state, 'DONE'); assert.equal(result.selector, id);
  assert.equal(result.multitouchProven, false); assert(!('cachedMaximum' in result));
  assert.throws(() => session.accept(''), /NoPending/);
});
for (const id of [0, 4, 255]) test('unknown selector ' + id, () => {
  const {session} = pinned(); assert.equal(session.accept(reply(profile.selector, id)).reason, 'UnknownSelector');
});
for (const max of [1, 2, 5, 255]) test('extract only cached byte ' + max, () => {
  const {session} = pinned(); const req = session.accept(reply(profile.selector, 0x98765402));
  assert.deepEqual(req, {kind: 'chiponeCache', address: profile.cache, command: 'mw ' + profile.cache});
  const result = session.accept(reply(profile.cache, 0xaa0000bb + max * 65536));
  assert.equal(result.cachedMaximum, max); assert.equal(result.multitouchProven, false);
});
test('zero cache stops', () => {
  const {session} = pinned(); session.accept(reply(profile.selector, 2));
  assert.equal(session.accept(reply(profile.cache, 0xff0000ff)).reason, 'InvalidCache');
});
test('capture failure stops at every stage without retry', () => {
  for (let completed = 0; completed < profile.maximumRequests; completed++) {
    const session = createReviewSession(); let req = session.start();
    for (let i = 0; i < completed; i++) {
      const value = req.kind === 'pin' ? profile.pins[i][1] : 2;
      req = session.accept(reply(req.address, value));
    }
    assert.equal(session.abort().state, 'STOPPED');
    assert.throws(() => session.start(), /SingleAttempt/);
  }
});
test('returned state and requests immutable', () => {
  const session = createReviewSession(); const req = session.start();
  assert.throws(() => { req.command = 'mw 0=0'; }, TypeError);
  assert.throws(() => { profile.pins[0][0] = '00000000'; }, TypeError);
  assert.throws(() => { session.status().state = 'PINS'; }, TypeError);
});
const report = {checkpoint: 'R402', cases, imageSha256: profile.imageSha256,
  modelSha256: sha(Buffer.from(source)), boundedRequests: profile.maximumRequests,
  stockOutputFormatCheckedAgainstPinnedImage: true, captureAndFaultsSimulated: true,
  hostModelOnly: true, luaRuntimeValidated: false, physicalMemoryRead: false,
  firmwareAttestedLive: false, physicalTransport: false, emulatorUsed: false,
  deployableDiagnostic: false, multitouchProven: false};
// R403 retains the original R402 report; revised source gets a distinct report.
const out = path.join(root, 'artifacts/research/rw4-touch-r402-contract-'+report.modelSha256.slice(0,12));
assert(!fs.existsSync(out), 'ExistingReport'); fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'review.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify(report));
