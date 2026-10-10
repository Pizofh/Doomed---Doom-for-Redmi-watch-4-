// Local static clues only. No radio, subprocess, network or raw-log export.
import fs from 'node:fs/promises';
import path from 'node:path';
import {TextDecoder} from 'node:util';
import {pathToFileURL} from 'node:url';
import {privateDirectory} from './check-mi-fitness-auth.mjs';

const markers = Object.freeze({
  CONNECT_GATT: /\bconnectGatt\b/i,
  BLUETOOTH_GATT: /\bBluetoothGatt\b/i,
  WRITE_CHARACTERISTIC: /\bwriteCharacteristic\b/i,
  CHARACTERISTIC_CALLBACK: /\bonCharacteristic(?:Read|Write|Changed)\b/i,
  GATT: /\bGATT\b/i,
  BLE: /\bBLE\b/i,
  BLUETOOTH_SOCKET: /\bBluetoothSocket\b/i,
  CREATE_RFCOMM: /\bcreate(?:Insecure)?RfcommSocket(?:ToServiceRecord)?\b/i,
  RFCOMM: /\bRFCOMM\b/i,
  SPP: /\bSPP\b/i,
  SPP_UUID: /\b00001101-0000-1000-8000-00805f9b34fb\b/i
});
const rw4Label = /\bRedmi Watch 4\b|\bM2315W1\b/i;
const maxFile = 32 * 1024 * 1024, maxTotal = 128 * 1024 * 1024;

export function inspectTransportMarkers(text) {
  const counts = Object.fromEntries(Object.keys(markers).map(label => [label,
    {lines: 0, sameLineRw4Label: 0}]));
  let skippedLongLines = 0;
  for (const line of text.split(/\r?\n/)) {
    if (line.length > 2 * 1024 * 1024) { skippedLongLines++; continue; }
    const labelled = rw4Label.test(line);
    for (const [label, regex] of Object.entries(markers)) {
      if (!regex.test(line)) continue;
      counts[label].lines++;
      if (labelled) counts[label].sameLineRw4Label++;
    }
  }
  return {counts, skippedLongLines};
}

export async function scanTransportDirectory(directory = privateDirectory) {
  const info = await fs.lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw Error('invalid-input');
  const entries = (await fs.readdir(directory, {withFileTypes: true}))
    .filter(entry => /\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(entry.name));
  if (!entries.length || entries.length > 100) throw Error('input-limit');
  const totals = inspectTransportMarkers('');
  let totalBytes = 0;
  const decoder = new TextDecoder('utf-8', {fatal: true});
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    const stat = await fs.lstat(filename);
    if (!stat.isFile() || stat.isSymbolicLink()) throw Error('invalid-input');
    totalBytes += stat.size;
    if (stat.size > maxFile || totalBytes > maxTotal) throw Error('input-limit');
    const bytes = await fs.readFile(filename);
    if (bytes.length !== stat.size || bytes.length > maxFile) throw Error('input-changed');
    if (bytes.includes(0)) throw Error('unsupported-encoding');
    const result = inspectTransportMarkers(decoder.decode(bytes));
    totals.skippedLongLines += result.skippedLongLines;
    for (const label of Object.keys(markers)) {
      totals.counts[label].lines += result.counts[label].lines;
      totals.counts[label].sameLineRw4Label += result.counts[label].sameLineRw4Label;
    }
  }
  return {
    status: Object.values(totals.counts).some(item => item.lines > 0) ? 'markers-found' : 'no-listed-markers',
    filesScanned: entries.length,
    ...totals,
    rw4TransportVerified: false,
    physicalUnitIdentityVerified: false,
    radioOperationPerformed: false
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 2) throw Error('invalid-arguments');
    console.log(JSON.stringify(await scanTransportDirectory(), null, 2));
  } catch {
    console.error('Transport check failed: use complete UTF-8 private .log files within input limits. No input or path printed.');
    process.exitCode = 1;
  }
}
