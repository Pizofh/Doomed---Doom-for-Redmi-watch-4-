// PC-only ZIP metadata inventory. Never extracts entries, runs ADB or prints names.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const privateDirectory = path.join(root, 'tools/local/phone-hci-r134');
const maxArchive = 2 * 1024 ** 3;
const maxDirectory = 8 * 1024 ** 2;
const utf8 = new TextDecoder('utf-8', {fatal: true});
export function inventoryHciArchive(readAt, size) {
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
  if (count > 8192 || tail.readUInt16LE(end + 8) !== count || directorySize > maxDirectory ||
      directoryOffset === 0xffffffff || directoryOffset + directorySize !== tailOffset + end) {
    throw Error('ZIP64, split or unexpected directory');
  }
  const directory = read(directoryOffset, directorySize);
  const seen = new Set();
  const candidates = [];
  let offset = 0, reportTextCount = 0;
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
    if (name.includes('\0') || name.includes('\\') || name.includes(':') || name.startsWith('/') ||
        name.split('/').some(part => part === '.' || part === '..') || seen.has(name)) throw Error('Ambiguous archive name');
    seen.add(name);
    if (/^bugreport-[^/]+\.txt$/.test(name)) reportTextCount++;
    const match = name.match(/^FS\/data\/misc\/bluetooth\/logs\/(btsnoop|btsnooz)_hci\.log(?:\.last)?$/);
    if (match) {
      const flags = directory.readUInt16LE(offset + 8);
      const method = directory.readUInt16LE(offset + 10);
      const compressedBytes = directory.readUInt32LE(offset + 20);
      const uncompressedBytes = directory.readUInt32LE(offset + 24);
      const localOffset = directory.readUInt32LE(offset + 42);
      const mode = directory.readUInt32LE(offset + 38) >>> 16;
      if ((flags & 1) || ![0, 8].includes(method) || (mode & 0xf000) === 0xa000 ||
          compressedBytes === 0xffffffff || uncompressedBytes === 0xffffffff ||
          localOffset + 30 > directoryOffset) throw Error('Unsupported Bluetooth entry');
      candidates.push({kind: match[1] === 'btsnoop' ? 'SNOOP_FILE' : 'SNOOZ_FILE',
        compressedBytes, uncompressedBytes, payloadWithinReviewLimit: uncompressedBytes <= 128 * 1024 ** 2});
    }
    offset = next;
  }
  if (offset !== directory.length) throw Error('Unexpected directory remainder');
  return {checkpoint: 'R135', metadataOnly: true, entryCount: count, bluetoothFileCandidates: candidates,
    reportTextCount, inlineSummarySearched: false, archiveIntegrityVerified: false,
    hciContentReviewed: false, attemptAttributionVerified: false,
    rawOutputSaved: false, extractedFiles: 0, adbExecuted: false};
}
function inventoryLocalReport() {
  const review = JSON.parse(fs.readFileSync(path.join(privateDirectory, 'collection-review.json'), 'utf8'));
  if (review.checkpoint !== 'R134' || review.privateReportSaved !== true) throw Error('Collection not established');
  const files = fs.readdirSync(privateDirectory, {withFileTypes: true}).filter(entry => entry.isFile() && /\.zip$/i.test(entry.name));
  if (files.length !== 1) throw Error('One private archive required');
  const file = path.join(privateDirectory, files[0].name);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Unexpected file type');
  const fd = fs.openSync(file, 'r');
  try {
    return inventoryHciArchive((offset, length) => {
      const bytes = Buffer.alloc(length);
      if (fs.readSync(fd, bytes, 0, length, offset) !== length) throw Error('Short read');
      return bytes;
    }, stat.size);
  } finally { fs.closeSync(fd); }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  if (action === 'plan' && [2, 3].includes(process.argv.length)) {
    console.log(JSON.stringify({executionPerformed: false, metadataOnly: true, adbExecuted: false, extractedFiles: 0}));
  } else if (action === 'inventory' && process.argv.length === 3) {
    try { console.log(JSON.stringify(inventoryLocalReport())); }
    catch { console.error('Private archive inventory refused or failed; no names, content or extraction exported.'); process.exitCode = 1; }
  } else { console.error('Use plan or inventory'); process.exitCode = 1; }
}
