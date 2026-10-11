// PC-only ZIP inventory/selected Bluetooth review. No extraction, ADB or names exported.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {Readable} from 'node:stream';
import {createInflateRaw, inflateSync} from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const privateDirectory = path.join(root, 'tools/local/phone-hci-r134');
const maxArchive = 2 * 1024 ** 3;
const maxDirectory = 8 * 1024 ** 2;
const utf8 = new TextDecoder('utf-8', {fatal: true});
export function inventoryFailureCode(error) {
  const labels = ['Collection not established', 'One private archive required', 'Unexpected file type',
    'Unsupported archive size', 'Read out of bounds', 'Short archive read',
    'Unsupported or missing ZIP directory', 'ZIP64, split or unexpected directory',
    'Invalid entry', 'Invalid name bounds or split entry', 'Ambiguous archive name',
    'Unsupported Bluetooth entry', 'Unexpected directory remainder', 'Short read'];
  const index = labels.indexOf(error?.message);
  return index < 0 ? 'Z00' : 'Z' + String(index + 1).padStart(2, '0');
}
function parseArchive(readAt, size) {
  if (!Number.isSafeInteger(size) || size < 22 || size > maxArchive) throw Error('Unsupported archive size');
  function read(offset, length) {
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 ||
        length < 0 || offset + length > size || length > maxDirectory) throw Error('Read out of bounds');
    const bytes = readAt(offset, length);
    if (!Buffer.isBuffer(bytes) || bytes.length !== length) throw Error('Short archive read');
    return bytes;
  }
  const tailOffset = Math.max(0, size - 65557);
  const tail = read(tailOffset, size - tailOffset);
  let end = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (tail.readUInt32LE(i) === 0x06054b50 && i + 22 + tail.readUInt16LE(i + 20) === tail.length) {
      end = i; break;
    }
  }
  if (end < 0 || tail.readUInt16LE(end + 4) !== 0 || tail.readUInt16LE(end + 6) !== 0) {
    throw Error('Unsupported or missing ZIP directory');
  }
  const count = tail.readUInt16LE(end + 10);
  const directorySize = tail.readUInt32LE(end + 12);
  const directoryOffset = tail.readUInt32LE(end + 16);
  if (count > 32768 || tail.readUInt16LE(end + 8) !== count || directorySize > maxDirectory ||
      directoryOffset === 0xffffffff || directoryOffset + directorySize !== tailOffset + end) {
    throw Error('ZIP64, split or unexpected directory');
  }
  const directory = read(directoryOffset, directorySize);
  const seen = new Set();
  const candidates = [];
  const selected = [];
  const bluetoothMetadata = {stackConfigFiles: 0, vendorBluetoothFiles: 0, nestedBluetoothArchives: 0};
  let offset = 0, reportTextCount = 0, unrelatedNameAnomalies = 0, otherHciNamedEntries = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > directory.length || directory.readUInt32LE(offset) !== 0x02014b50) throw Error('Invalid entry');
    const nameSize = directory.readUInt16LE(offset + 28);
    const extraSize = directory.readUInt16LE(offset + 30);
    const commentSize = directory.readUInt16LE(offset + 32);
    const next = offset + 46 + nameSize + extraSize + commentSize;
    if (!nameSize || nameSize > 1024 || next > directory.length || directory.readUInt16LE(offset + 34) !== 0) {
      throw Error('Invalid name bounds or split entry');
    }
    const name = utf8.decode(directory.subarray(offset + 46, offset + 46 + nameSize));
    const reportText = /^bugreport-[^/]+\.txt$/.test(name);
    const match = name.match(/^FS\/data\/misc\/bluetooth\/logs\/(btsnoop|btsnooz)_hci\.log(?:\.last)?$/);
    const ambiguous = name.includes('\0') || name.includes('\\') || name.includes(':') || name.startsWith('/') ||
        name.split('/').some(part => part === '.' || part === '..') || seen.has(name);
    // Android reports can contain duplicate/colon names outside our allowed entries.
    // They are never opened or extracted; retain strict uniqueness for candidates.
    if (ambiguous && (match || reportText)) throw Error('Ambiguous archive name');
    if (ambiguous) unrelatedNameAnomalies++;
    // Discovery is metadata only: never select/open an unknown vendor path.
    if (!match && /(?:btsnoop|btsnooz|hci[_-](?:snoop|log))/i.test(name.split('/').at(-1))) otherHciNamedEntries++;
    if (!ambiguous) {
      if (/^FS\/(?:system|vendor|etc)(?:\/etc)?\/bluetooth\/bt_stack\.conf$/.test(name)) bluetoothMetadata.stackConfigFiles++;
      if (/^FS\/data\/vendor\/bluetooth\//.test(name)) bluetoothMetadata.vendorBluetoothFiles++;
      if (/(?:^|\/)bluetooth(?:\/|[^/]*\.(?:zip|gz|tar)$)/i.test(name) && /\.(?:zip|gz|tar)$/i.test(name)) bluetoothMetadata.nestedBluetoothArchives++;
    }
    seen.add(name);
    if (reportText) reportTextCount++;
    if (match || reportText) {
      const flags = directory.readUInt16LE(offset + 8);
      const method = directory.readUInt16LE(offset + 10);
      const compressedBytes = directory.readUInt32LE(offset + 20);
      const uncompressedBytes = directory.readUInt32LE(offset + 24);
      const localOffset = directory.readUInt32LE(offset + 42);
      const mode = directory.readUInt32LE(offset + 38) >>> 16;
      if ((flags & 1) || ![0, 8].includes(method) || (mode & 0xf000) === 0xa000 ||
          compressedBytes === 0xffffffff || uncompressedBytes === 0xffffffff ||
          localOffset + 30 > directoryOffset) throw Error('Unsupported Bluetooth entry');
      const kind = reportText ? 'REPORT_TEXT' : match[1] === 'btsnoop' ? 'SNOOP_FILE' : 'SNOOZ_FILE';
      selected.push({name, kind, flags, method, compressedBytes, uncompressedBytes, localOffset,
        crc: directory.readUInt32LE(offset + 16)});
      if (match) candidates.push({kind, compressedBytes, uncompressedBytes,
        payloadWithinReviewLimit: uncompressedBytes <= 128 * 1024 ** 2});
    }
    offset = next;
  }
  if (offset !== directory.length) throw Error('Unexpected directory remainder');
  return {selected, read, directoryOffset, report: {checkpoint: 'R135', metadataOnly: true, entryCount: count, unrelatedNameAnomalies, otherHciNamedEntries, bluetoothMetadata, bluetoothFileCandidates: candidates,
    reportTextCount, inlineSummarySearched: false, archiveIntegrityVerified: false,
    hciContentReviewed: false, attemptAttributionVerified: false,
    rawOutputSaved: false, extractedFiles: 0, adbExecuted: false}};
}
export function inventoryHciArchive(readAt, size) { return parseArchive(readAt, size).report; }
const crcTable = Uint32Array.from({length: 256}, (_, index) => {
  let value = index;
  for (let i = 0; i < 8; i++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});
export function crc32(bytes, initial = 0xffffffff) {
  let value = initial;
  for (const byte of bytes) value = (value >>> 8) ^ crcTable[(value ^ byte) & 255];
  return value >>> 0; // Caller complements only after the final chunk.
}
export function summarizeSnoop(bytes) {
  if (bytes.length < 16 || !bytes.subarray(0, 8).equals(Buffer.from('btsnoop\0')) ||
      bytes.readUInt32BE(8) !== 1 || bytes.readUInt32BE(12) !== 1002) throw Error('Unsupported HCI file');
  const packetTypes = {command: 0, acl: 0, sco: 0, event: 0, iso: 0};
  const names = [null, 'command', 'acl', 'sco', 'event', 'iso'];
  let offset = 16, records = 0;
  while (offset < bytes.length) {
    if (offset + 24 > bytes.length || ++records > 131072) throw Error('Invalid HCI records');
    const original = bytes.readUInt32BE(offset), included = bytes.readUInt32BE(offset + 4);
    offset += 24;
    if (included < 1 || included > original || offset + included > bytes.length || !names[bytes[offset]]) {
      throw Error('Invalid HCI records');
    }
    packetTypes[names[bytes[offset]]]++;
    offset += included;
  }
  return {format: 'BTSNOOP_HCI_UART', headerRecognized: true, records, packetTypes,
    payloadExported: false, attemptAttributionVerified: false};
}
export function summarizeInlineSnooz(base64) {
  const canonical = base64.replace(/\s/g, '');
  if (canonical.length > 2 * 1024 ** 2 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(canonical)) {
    throw Error('Invalid Bluetooth summary');
  }
  const bytes = Buffer.from(canonical, 'base64');
  if (bytes.length < 9 || ![1, 2].includes(bytes[0])) throw Error('Unsupported Bluetooth summary');
  const version = bytes[0], data = inflateSync(bytes.subarray(9), {maxOutputLength: 2 * 1024 ** 2});
  const headerSize = version === 1 ? 7 : 9;
  const names = {16: 'event', 17: 'acl', 18: 'sco', 23: 'iso', 32: 'command', 33: 'acl', 34: 'sco', 45: 'iso'};
  const packetTypes = {command: 0, acl: 0, sco: 0, event: 0, iso: 0};
  let offset = 0, records = 0;
  while (offset < data.length) {
    if (offset + headerSize > data.length || ++records > 131072) throw Error('Invalid Bluetooth summary');
    const length = data.readUInt16LE(offset), type = data[offset + headerSize - 1];
    if (length < 1 || !names[type] || offset + headerSize + length - 1 > data.length ||
        (version === 2 && data.readUInt16LE(offset + 2) < length)) throw Error('Invalid Bluetooth summary');
    packetTypes[names[type]]++;
    offset += headerSize + length - 1;
  }
  return {format: 'BTSNOOZ_INLINE', version, records, packetTypes,
    payloadExported: false, attemptAttributionVerified: false};
}
export function newBluetoothLogCounts() {
  return {recognizedRows: 0, clientInitFailures: 0, openEventFailures: 0,
    sdpFailureMarkers: 0, sendChannelFailures: 0, snoopOpenFailures: 0};
}
export function countBluetoothLogLine(line, counts) {
  // Exact Android brief/threadtime log headers only; discard message after fixed counts.
  // These are global historical markers, never attributed to our app or this attempt.
  const brief = line.match(/^[VDIWEF]\/(bluetooth|bt_btif_sock|bt_btif_sock_rfcomm)\s*\(\s*\d{1,10}\):\s*(.*)$/);
  const timed = line.match(/^\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\s+\d{1,10}\s+\d{1,10}\s+[VDIWEF]\s+(bluetooth|bt_btif_sock|bt_btif_sock_rfcomm)\s*:\s*(.*)$/);
  const match = brief ?? timed;
  if (!match) return;
  counts.recognizedRows++;
  const message = match[2];
  if (/INIT unsuccessful, status .*?\. Cleaning up slot_id\s+\d+/.test(message)) counts.clientInitFailures++;
  if (/CONNECT unsuccessful, status .*?\. Cleaning up slot_id\s+\d+/.test(message)) counts.openEventFailures++;
  if (/SDP service discovery completed for slot_id:\s*\d+\s+with the result status:/.test(message)) counts.sdpFailureMarkers++;
  if (/send_app_scn\(\) failed, closing slot_id/.test(message)) counts.sendChannelFailures++;
  if (/Unable to open snoop log at/.test(message)) counts.snoopOpenFailures++;
}
export async function reviewHciArchive(readAt, size) {
  const archive = parseArchive(readAt, size);
  const fileResults = [], inlineResults = [];
  const configuredModeCounts = {disabled: 0, full: 0, filtered: 0, kernel: 0};
  const bluetoothLogCounts = newBluetoothLogCounts();
  for (const entry of archive.selected) {
    const limit = entry.kind === 'REPORT_TEXT' ? 512 * 1024 ** 2 : 128 * 1024 ** 2;
    if (entry.uncompressedBytes > limit) throw Error('Bluetooth review limit exceeded');
    const header = archive.read(entry.localOffset, 30);
    const nameSize = header.readUInt16LE(26), extraSize = header.readUInt16LE(28);
    const payloadOffset = entry.localOffset + 30 + nameSize + extraSize;
    if (header.readUInt32LE(0) !== 0x04034b50 || header.readUInt16LE(6) !== entry.flags ||
        header.readUInt16LE(8) !== entry.method || nameSize > 1024 ||
        !archive.read(entry.localOffset + 30, nameSize).equals(Buffer.from(entry.name)) ||
        payloadOffset + entry.compressedBytes > archive.directoryOffset) throw Error('Invalid selected entry');
    function* chunks() {
      for (let offset = 0; offset < entry.compressedBytes; offset += 65536) {
        yield archive.read(payloadOffset + offset, Math.min(65536, entry.compressedBytes - offset));
      }
    }
    const input = Readable.from(chunks());
    const stream = entry.method === 8 ? input.pipe(createInflateRaw()) : input;
    if (stream !== input) input.on('error', error => stream.destroy(error));
    let count = 0, crc = 0xffffffff, carry = '', inside = false, found = 0, base64 = '';
    const data = [];
    const inline = [];
    function scanLine(line) {
      countBluetoothLogLine(line, bluetoothLogCounts);
      // Exact Bluetooth property only. No broad search, free text or other properties retained.
      const mode = line.match(/^\s*\[persist\.bluetooth\.btsnooplogmode\]: \[(disabled|full|filtered|kernel)\]\s*$/);
      if (mode) configuredModeCounts[mode[1]]++;
      if (line.includes('--- BEGIN:BTSNOOP_LOG_SUMMARY')) {
        if (inside || ++found > 1) throw Error('Ambiguous Bluetooth summary');
        inside = true;
      } else if (line.includes('--- END:BTSNOOP_LOG_SUMMARY')) {
        if (!inside) throw Error('Invalid Bluetooth summary markers');
        inside = false; inline.push(summarizeInlineSnooz(base64)); base64 = '';
      } else if (inside) {
        base64 += line.trim();
        if (base64.length > 2 * 1024 ** 2) throw Error('Bluetooth summary limit exceeded');
      }
    }
    try {
      for await (const chunk of stream) {
        count += chunk.length;
        if (count > limit || count > entry.uncompressedBytes) throw Error('Bluetooth review limit exceeded');
        crc = crc32(chunk, crc);
        if (entry.kind !== 'REPORT_TEXT') data.push(chunk);
        else {
          // Discard all general report text; only retain the exact Bluetooth marker section.
          const text = carry + chunk.toString('latin1');
          let start = 0, end;
          while ((end = text.indexOf('\n', start)) !== -1) { scanLine(text.slice(start, end)); start = end + 1; }
          carry = text.slice(start);
          if (carry.length > 65536) {
            if (inside) throw Error('Bluetooth summary line limit exceeded');
            carry = carry.slice(-256);
          }
        }
      }
      if (entry.kind === 'REPORT_TEXT' && carry) scanLine(carry);
      if (inside || count !== entry.uncompressedBytes || ((crc ^ 0xffffffff) >>> 0) !== entry.crc) {
        throw Error('Incomplete or inconsistent Bluetooth entry');
      }
      if (entry.kind === 'REPORT_TEXT') inlineResults.push(...inline);
      else fileResults.push({kind: entry.kind, ...summarizeSnoop(Buffer.concat(data))});
    } finally { stream.destroy(); input.destroy(); }
  }
  return {checkpoint: 'R136', fileResults, inlineSummarySearched: archive.report.reportTextCount === 1,
    inlineResults, configuredModeCounts, bluetoothLogCounts, effectiveLoggingVerified: false,
    selectedEntryCrcVerified: true, generalReportTextExported: false,
    rawOutputSaved: false, extractedFiles: 0, adbExecuted: false, attemptAttributionVerified: false};
}
async function inspectLocalReport(mode, directory = privateDirectory, checkpoint = 'R134') {
  const review = JSON.parse(fs.readFileSync(path.join(directory, 'collection-review.json'), 'utf8'));
  if (review.checkpoint !== checkpoint || review.privateReportSaved !== true) throw Error('Collection not established');
  const files = fs.readdirSync(directory, {withFileTypes: true}).filter(entry => entry.isFile() && /\.zip$/i.test(entry.name));
  if (files.length !== 1) throw Error('One private archive required');
  const file = path.join(directory, files[0].name);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Unexpected file type');
  const fd = fs.openSync(file, 'r');
  try {
    const readAt = (offset, length) => {
      const bytes = Buffer.alloc(length);
      if (fs.readSync(fd, bytes, 0, length, offset) !== length) throw Error('Short read');
      return bytes;
    };
    return mode === 'review' ? await reviewHciArchive(readAt, stat.size) : inventoryHciArchive(readAt, stat.size);
  } finally { fs.closeSync(fd); }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  if (action === 'plan' && [2, 3].includes(process.argv.length)) {
    console.log(JSON.stringify({executionPerformed: false, metadataOnly: true, adbExecuted: false, extractedFiles: 0}));
  } else if (['inventory', 'review', 'inventory-capture', 'review-capture'].includes(action) && process.argv.length === 3) {
    try { console.log(JSON.stringify(await inspectLocalReport(action.replace('-capture', ''),
      action.endsWith('-capture') ? path.join(root, 'tools/local/phone-hci-r136') : privateDirectory,
      action.endsWith('-capture') ? 'R136' : 'R134'))); }
    catch (error) { console.error('Private archive inventory refused or failed (' + inventoryFailureCode(error) + '); no names, content or extraction exported.'); process.exitCode = 1; }
  } else { console.error('Use plan, inventory, review, inventory-capture or review-capture'); process.exitCode = 1; }
}
