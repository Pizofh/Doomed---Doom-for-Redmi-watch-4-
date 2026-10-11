// Fake USB runner and synthetic config only. No phone/ADB/radio.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {inspectBluetoothConfig, summarizeStackConfig, classifySnoopPath} from './phone-bluetooth-config.mjs';
const calls = [];
const ok = stdout => ({status: 0, stdout, stderr: ''});
const result = inspectBluetoothConfig(args => {
  calls.push(args);
  if (args[1] === 'get-state') return ok('device\n');
  if (args[2] === 'getprop') return ok(args[3] === 'ro.build.type' ? 'user' : args[3] === 'persist.bluetooth.btsnooplogmode' ? 'disabled' : '/private/SECRET');
  if (args[3].startsWith('/vendor/')) return ok('BtSnoopFileName=/data/misc/bluetooth/logs/btsnoop_hci.log\nBtSnoopLogOutput=false\nSecret=PRIVATE-KEY\n');
  return {status: 1, stdout: '', stderr: args[3].startsWith('/system/') ? 'Permission denied PRIVATE' : 'No such file PRIVATE'};
});
assert.deepEqual(calls, [['-d', 'get-state'], ['-d', 'shell', 'getprop', 'ro.build.type'],
  ['-d', 'shell', 'getprop', 'persist.bluetooth.btsnooplogmode'], ['-d', 'shell', 'getprop', 'persist.bluetooth.btsnooppath'],
  ['-d', 'shell', 'cat', '/vendor/etc/bluetooth/bt_stack.conf'],
  ['-d', 'shell', 'cat', '/system/etc/bluetooth/bt_stack.conf'], ['-d', 'shell', 'cat', '/etc/bluetooth/bt_stack.conf']]);
assert.equal(result.buildType, 'user'); assert.equal(result.legacyPathProperty, 'OTHER_UNEXPORTED');
assert.equal(result.configs[0].pathCategory, 'AOSP_DEFAULT');
assert.deepEqual(result.configs.slice(1).map(item => item.status), ['DENIED', 'NOT_FOUND']);
assert.equal(result.activeOutputPathVerified, false);
assert.ok(!/SECRET|PRIVATE|\/private\//.test(JSON.stringify(result)));
assert.equal(classifySnoopPath('/sdcard/private/../key'), 'OTHER_UNEXPORTED');
assert.equal(classifySnoopPath('/data/vendor/bluetooth/logs/snoop'), 'VENDOR_BLUETOOTH');
assert.equal(classifySnoopPath('/storage/emulated/0/log/snoop'), 'SHARED_STORAGE');
assert.equal(summarizeStackConfig('# BtSnoopFileName=/SECRET\nLinkKey=SECRET').pathRows, 0);
assert.equal(summarizeStackConfig('BtSnoopFileName=/sdcard/log\nBtSnoopFileName=/SECRET').pathCategory, 'CONFLICT');
assert.equal(summarizeStackConfig('BtSnoopLogOutput=true\nBtSnoopLogOutput=false').outputDeclared, 'CONFLICT');
assert.throws(() => inspectBluetoothConfig(() => ok('unauthorized')));
assert.throws(() => inspectBluetoothConfig(() => ({...ok('device'), error: Error('SECRET')})));
assert.throws(() => summarizeStackConfig('x'.repeat(65537)));
for (const args of [[], ['plan'], ['invalid'], ['collect', 'extra']]) {
  const run = spawnSync(process.execPath, ['tools/phone-bluetooth-config.mjs', ...args], {encoding: 'utf8'});
  assert.equal(run.status, args.length <= 1 && args[0] !== 'invalid' ? 0 : 1);
  if (run.status === 0) assert.equal(JSON.parse(run.stdout).executionPerformed, false);
}
console.log('PASS: fixed USB config reads, no default ADB, safe categories, denied/missing files and privacy (synthetic only)');
