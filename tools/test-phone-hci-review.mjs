// Complete synthetic ZIPs/packets only. No phone data, ADB or radio.
import assert from 'node:assert/strict';
import {deflateRawSync, deflateSync} from 'node:zlib';
import {crc32, summarizeSnoop, summarizeInlineSnooz, reviewHciArchive,
  newBluetoothLogCounts, countBluetoothLogLine} from './inspect-phone-hci-report.mjs';

const magic = Buffer.from('6274736e6f6f700000000001000003ea', 'hex');
const snoozName = 'FS/data/misc/bluetooth/logs/btsnooz_hci.log';
function zip(items) {
  const bodies = [], directory = [];
  let position = 0;
  for (const {name, bytes, method = 8, corruptCrc = false} of items) {
    const text = Buffer.from(name), compressed = method === 8 ? deflateRawSync(bytes) : bytes;
    const crc = (((crc32(bytes) ^ 0xffffffff) >>> 0) + Number(corruptCrc)) >>> 0;
    const local = Buffer.alloc(30 + text.length);
    local.writeUInt32LE(0x04034b50); local.writeUInt16LE(method, 8); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(text.length, 26); text.copy(local, 30);
    const central = Buffer.alloc(46 + text.length);
    central.writeUInt32LE(0x02014b50); central.writeUInt16LE(method, 10); central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(bytes.length, 24);
    central.writeUInt16LE(text.length, 28); central.writeUInt32LE(position, 42); text.copy(central, 46);
    bodies.push(local, compressed); directory.push(central); position += local.length + compressed.length;
  }
  const cd = Buffer.concat(directory), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(items.length, 8); end.writeUInt16LE(items.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(position, 16);
  return Buffer.concat([...bodies, cd, end]);
}
const review = b => reviewHciArchive((offset, length) => b.subarray(offset, offset + length), b.length);
function inline(version = 2) {
  const secret = Buffer.from('DO-NOT-EXPORT-KEY-OR-MAC');
  const header = Buffer.alloc(version === 2 ? 9 : 7);
  header.writeUInt16LE(secret.length + 1);
  if (version === 2) header.writeUInt16LE(secret.length + 1, 2);
  header[header.length - 1] = 32;
  const file = Buffer.alloc(9); file[0] = version;
  return Buffer.concat([file, deflateSync(Buffer.concat([header, secret]))]).toString('base64');
}
assert.equal(((crc32(Buffer.from('123456789')) ^ 0xffffffff) >>> 0), 0xcbf43926);
assert.equal(summarizeSnoop(magic).records, 0);
for (const version of [1, 2]) {
  const r = summarizeInlineSnooz(inline(version));
  assert.equal(r.records, 1); assert.equal(r.packetTypes.command, 1);
  assert.ok(!JSON.stringify(r).includes('DO-NOT-EXPORT'));
}
const payload = Buffer.concat([Buffer.from([1]), Buffer.from('DO-NOT-EXPORT-KEY-OR-MAC')]);
const record = Buffer.alloc(24); record.writeUInt32BE(payload.length); record.writeUInt32BE(payload.length, 4);
assert.equal(summarizeSnoop(Buffer.concat([magic, record, payload])).records, 1);
assert.throws(() => summarizeSnoop(Buffer.concat([magic, record])));
assert.throws(() => summarizeSnoop(Buffer.alloc(16)));
assert.throws(() => summarizeInlineSnooz('not-base64 PRIVATE'));
assert.throws(() => summarizeInlineSnooz(Buffer.alloc(9).toString('base64')));
const text = Buffer.from('PRIVATE HEALTH CANARY\n' + 'x'.repeat(65520) +
  '\n--- BEGIN:BTSNOOP_LOG_SUMMARY (fixture) ---\n' + inline() +
  '\n--- END:BTSNOOP_LOG_SUMMARY ---\nPRIVATE NOTIFICATION CANARY\n');
for (const method of [0, 8]) {
  const result = await review(zip([{name: snoozName, bytes: magic, method},
    {name: 'bugreport-PRIVATE-DEVICE.txt', bytes: text, method},
    {name: 'private-app.txt', bytes: Buffer.from('Never read me')} ]));
  assert.equal(result.fileResults[0].records, 0);
  assert.equal(result.inlineSummarySearched, true);
  assert.equal(result.inlineResults[0].records, 1);
  assert.equal(result.selectedEntryCrcVerified, true);
  for (const secret of ['CANARY', 'PRIVATE-DEVICE', 'DO-NOT-EXPORT', 'Never read me', snoozName]) {
    assert.ok(!JSON.stringify(result).includes(secret));
  }
}
await assert.rejects(review(zip([{name: snoozName, bytes: magic, corruptCrc: true}])));
await assert.rejects(review(zip([{name: snoozName, bytes: Buffer.alloc(16)}])));
await assert.rejects(review(zip([{name: 'bugreport-fixture.txt', bytes: Buffer.from('--- BEGIN:BTSNOOP_LOG_SUMMARY\n')}])));
await assert.rejects(review(zip([{name: 'bugreport-fixture.txt', bytes: Buffer.concat([text, text])}])));
const absent = await review(zip([{name: 'bugreport-fixture.txt', bytes: Buffer.from('PRIVATE NON BLUETOOTH')} ]));
assert.equal(absent.inlineResults.length, 0); assert.equal(absent.inlineSummarySearched, true);
const propertyText = Buffer.from('x'.repeat(65510) + '\n[persist.bluetooth.btsnooplogmode]: [full]\n' +
  '[persist.bluetooth.btsnooplogmode]: [disabled]\n' +
  '[persist.bluetooth.secret]: [PRIVATE-KEY]\n' +
  'notification says [persist.bluetooth.btsnooplogmode]: [kernel]\n' +
  '[persist.bluetooth.btsnooplogmode]: [PRIVATE-VALUE]\n');
for (const method of [0, 8]) {
  const properties = await review(zip([{name: 'bugreport-fixture.txt', bytes: propertyText, method}]));
  assert.deepEqual(properties.configuredModeCounts, {disabled: 1, full: 1, filtered: 0, kernel: 0});
  assert.equal(properties.effectiveLoggingVerified, false);
  assert.ok(!JSON.stringify(properties).includes('PRIVATE'));
}
const logCounts = newBluetoothLogCounts();
for (const line of [
  'E/bluetooth(123): CONNECT unsuccessful, status PRIVATE. Cleaning up slot_id 7',
  '10-11 10:00:00.001  123  456 E bt_btif_sock_rfcomm: send_app_scn() failed, closing slot_id 8 PRIVATE',
  'E/bluetooth(123): Unable to open snoop log at PRIVATE-PATH, error: PRIVATE',
  'E/private-app(123): CONNECT unsuccessful, status PRIVATE. Cleaning up slot_id 9',
  'notification E/bluetooth(123): Unable to open snoop log at PRIVATE',
]) countBluetoothLogLine(line, logCounts);
assert.deepEqual(logCounts, {recognizedRows: 3, clientInitFailures: 0, openEventFailures: 1,
  sdpFailureMarkers: 0, sendChannelFailures: 1, snoopOpenFailures: 1});
assert.ok(!JSON.stringify(logCounts).includes('PRIVATE'));
console.log('PASS: selected ZIP stream/CRC, bounded Bluetooth summaries, empty/truncated records, marker boundaries and privacy (synthetic only)');
