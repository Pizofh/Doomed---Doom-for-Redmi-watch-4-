// Synthetic central directories only; no real report, extraction, ADB or radio.
import assert from 'node:assert/strict';
import {inventoryHciArchive, inventoryFailureCode} from './inspect-phone-hci-report.mjs';

function archive(names) {
  const locals = [], entries = [];
  let position = 0;
  for (const item of names) {
    const {name, method = 8, flags = 0, size = 2000, mode = 0, disk = 0} = typeof item === 'string' ? {name: item} : item;
    const encoded = Buffer.from(name);
    const local = Buffer.alloc(30 + encoded.length);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(encoded.length, 26);
    encoded.copy(local, 30);
    locals.push(local);
    const entry = Buffer.alloc(46 + encoded.length);
    entry.writeUInt32LE(0x02014b50);
    entry.writeUInt16LE(flags, 8); entry.writeUInt16LE(method, 10);
    entry.writeUInt32LE(100, 20); entry.writeUInt32LE(size, 24);
    entry.writeUInt16LE(encoded.length, 28); entry.writeUInt16LE(disk, 34);
    entry.writeUInt32LE((mode * 65536) >>> 0, 38);
    entry.writeUInt32LE(position, 42); encoded.copy(entry, 46);
    entries.push(entry); position += local.length;
  }
  const directory = Buffer.concat(entries);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(names.length, 8); end.writeUInt16LE(names.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(position, 16);
  return Buffer.concat([...locals, directory, end]);
}
const inspect = bytes => inventoryHciArchive((offset, length) => bytes.subarray(offset, offset + length), bytes.length);
const name = 'FS/data/misc/bluetooth/logs/btsnooz_hci.log';
const fixture = archive(['bugreport-PRIVATE-PHONE-NAME.txt', 'private-app-KEY-NOT-FOR-EXPORT.txt', name,
  'FS/data/misc/bluetooth/logs/btsnoop_hci.log.last', 'other/btsnoop_hci.log']);
const result = inspect(fixture);
assert.equal(result.entryCount, 5); assert.equal(result.reportTextCount, 1);
assert.deepEqual(result.bluetoothFileCandidates.map(entry => entry.kind), ['SNOOZ_FILE', 'SNOOP_FILE']);
assert.equal(result.extractedFiles, 0); assert.equal(result.archiveIntegrityVerified, false);
assert.equal(result.otherHciNamedEntries, 1);
assert.equal(inspect(archive(['vendor/btsnoop_hci.log.filtered', 'vendor/hci_log_PRIVATE.bin', 'private-app.txt'])).otherHciNamedEntries, 2);
const metadata = inspect(archive(['FS/vendor/etc/bluetooth/bt_stack.conf', 'FS/system/etc/bluetooth/bt_stack.conf',
  'FS/etc/bluetooth/bt_stack.conf', 'FS/data/vendor/bluetooth/PRIVATE.bin',
  'bluetooth-PRIVATE.zip', 'FS/data/bluetooth/nested.gz', 'private-app.zip']));
assert.deepEqual(metadata.bluetoothMetadata, {stackConfigFiles: 3, vendorBluetoothFiles: 1, nestedBluetoothArchives: 2});
assert.ok(!JSON.stringify(metadata).includes('PRIVATE'));
for (const canary of ['PRIVATE-PHONE-NAME', 'KEY-NOT-FOR-EXPORT', name, 'other/']) assert.ok(!JSON.stringify(result).includes(canary));
assert.equal(inspect(archive(['unrelated.txt'])).bluetoothFileCandidates.length, 0);
assert.equal(inspect(archive([{name, size: 200 * 1024 ** 2}])).bluetoothFileCandidates[0].payloadWithinReviewLimit, false);
for (const names of [[name, name],
  [{name, flags: 1}], [{name, method: 99}], [{name, mode: 0xa000}], [{name, disk: 1}]]) assert.throws(() => inspect(archive(names)));
const unrelated = inspect(archive(['../escape', '/absolute', 'C:\\private', 'bad\0name', 'same', 'same']));
assert.equal(unrelated.unrelatedNameAnomalies, 5);
assert.equal(unrelated.extractedFiles, 0);
assert.equal(unrelated.bluetoothFileCandidates.length, 0);
assert.throws(() => inspect(fixture.subarray(0, fixture.length - 1)));
assert.throws(() => inventoryHciArchive(() => Buffer.alloc(0), fixture.length));
assert.throws(() => inventoryHciArchive(() => { throw Error('Must not read'); }, 2 * 1024 ** 3 + 1));
const split = Buffer.from(fixture); split.writeUInt16LE(1, split.length - 18); assert.throws(() => inspect(split));
const excessive = Buffer.from(fixture); excessive.writeUInt16LE(32769, excessive.length - 12); assert.throws(() => inspect(excessive));
assert.equal(inventoryFailureCode(Error('ZIP64, split or unexpected directory')), 'Z08');
assert.equal(inventoryFailureCode(Error('PRIVATE-NAME-DO-NOT-EXPORT')), 'Z00');
assert.equal(inspect(archive(Array.from({length: 13173}, (_, i) => 'synthetic/' + i))).entryCount, 13173);
const remainder = Buffer.concat([fixture, Buffer.from('extra')]); assert.throws(() => inspect(remainder));
console.log('PASS: bounded ZIP inventory, fixed Bluetooth paths, no content/extraction, privacy and malformed inputs (synthetic only)');
