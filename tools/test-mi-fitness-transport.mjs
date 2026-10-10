import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {inspectTransportMarkers, scanTransportDirectory} from './check-mi-fitness-transport.mjs';

const key = '0123456789abcdef'.repeat(2), mac = 'AA:BB:CC:DD:EE:FF', serial = 'PRIVATE_SERIAL_SENTINEL';
const input = `Redmi Watch 4 connectGatt ${key} ${mac} ${serial}\nOther BluetoothSocket RFCOMM SPP\nM2315W1 GATT GATT writeCharacteristic\nBLEED gate = irrelevant\nOther BLE onCharacteristicChanged\nUnknown 00001101-0000-1000-8000-00805f9b34fb`;
const result = inspectTransportMarkers(input);
assert.deepEqual(result.counts.CONNECT_GATT, {lines: 1, sameLineRw4Label: 1});
assert.deepEqual(result.counts.RFCOMM, {lines: 1, sameLineRw4Label: 0});
assert.deepEqual(result.counts.GATT, {lines: 1, sameLineRw4Label: 1});
assert.deepEqual(result.counts.BLE, {lines: 1, sameLineRw4Label: 0});
assert.deepEqual(result.counts.SPP_UUID, {lines: 1, sameLineRw4Label: 0});
assert.equal(inspectTransportMarkers(JSON.stringify({devices: [{name: 'Redmi Watch 4'}, {name: 'Other', event: 'connectGatt'}]})).counts.CONNECT_GATT.sameLineRw4Label, 1);
// Same-line deliberately does not assert same-object or physical-unit attribution.
for (const privateText of [key, mac, serial, 'Redmi Watch 4', 'Other', 'devices']) {
  assert(!JSON.stringify(result).includes(privateText));
}
assert.equal(inspectTransportMarkers('GATT' + 'x'.repeat(2 * 1024 * 1024)).skippedLongLines, 1);

const testDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'rw4-transport-test-'));
// Remove only this verified freshly created temporary test directory.
assert(path.dirname(testDirectory) === path.resolve(os.tmpdir()) && path.basename(testDirectory).startsWith('rw4-transport-test-'));
try {
  await fs.writeFile(path.join(testDirectory, 'private.log'), input);
  await fs.writeFile(path.join(testDirectory, 'private.log.bak'), 'M2315W1 RFCOMM');
  await fs.writeFile(path.join(testDirectory, 'ignored.txt'), 'BluetoothGatt');
  const scan = await scanTransportDirectory(testDirectory);
  assert.equal(scan.filesScanned, 2);
  assert.deepEqual(scan.counts.RFCOMM, {lines: 2, sameLineRw4Label: 1});
  assert.equal(scan.rw4TransportVerified, false);
  assert.equal(scan.physicalUnitIdentityVerified, false);
  assert.equal(scan.radioOperationPerformed, false);
  for (const privateText of [key, mac, serial, testDirectory, 'private.log']) assert(!JSON.stringify(scan).includes(privateText));
  await fs.writeFile(path.join(testDirectory, 'invalid.log'), Buffer.from([0xff]));
  await assert.rejects(scanTransportDirectory(testDirectory));
  await fs.writeFile(path.join(testDirectory, 'invalid.log'), Buffer.from([0x41, 0x00]));
  await assert.rejects(scanTransportDirectory(testDirectory), /unsupported-encoding/);
} finally {
  await fs.rm(testDirectory, {recursive: true, force: true});
}
console.log('Mi Fitness transport clue tests passed; no raw input exported.');
