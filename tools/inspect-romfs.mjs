// Read-only ROMFS inspection of the reviewed emulator image. Never mounts,
// executes, patches, or writes image contents. Paths use container.bin:/file.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { packageRoot } from './verify-emulator.mjs';

const imagePath = path.join(packageRoot, 'system-images/vela-release-4.0/vela_system.bin');
const image = fs.readFileSync(imagePath);
const selectedPath = process.argv[2];
const entries = [];
const magic = Buffer.from('-rom1fs-');
function parse(buffer, prefix, nesting = 0) {
  if (nesting > 3 || !buffer.subarray(0, 8).equals(magic)) throw new Error('Unsupported ROMFS container');
  const size = buffer.readUInt32BE(8);
  if (size < 32 || size > buffer.length) throw new Error('ROMFS size exceeds container');
  let checksum = 0;
  for (let i = 0; i + 4 <= Math.min(512, size); i += 4) checksum = (checksum + buffer.readUInt32BE(i)) >>> 0;
  if (checksum !== 0) throw new Error('Invalid ROMFS superblock checksum');
  function textAt(offset) {
    const end = buffer.indexOf(0, offset);
    if (end < offset || end >= size || end - offset > 255) throw new Error('Invalid ROMFS name');
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(offset, end)), end };
  }
  const volume = textAt(16);
  const root = Math.ceil((volume.end + 1) / 16) * 16;
  function header(offset) {
    if (offset % 16 || offset < root || offset + 16 > size) throw new Error('Invalid inode offset');
    const nextMode = buffer.readUInt32BE(offset);
    const name = textAt(offset + 16);
    const start = Math.ceil((name.end + 1) / 16) * 16;
    const bytes = buffer.readUInt32BE(offset + 8);
    if (start + bytes > size) throw new Error('ROMFS file exceeds container');
    return { name: name.text, next: nextMode & 0xfffffff0, type: nextMode & 7,
      spec: buffer.readUInt32BE(offset + 4), start, bytes };
  }
  const visited = new Set();
  function walk(offset, directory, depth) {
    if (depth > 32) throw new Error('Directory depth exceeds bound');
    while (offset) {
      if (visited.has(offset) || entries.length > 20000) throw new Error('ROMFS loop or entry limit');
      visited.add(offset);
      const h = header(offset);
      if (h.name !== '.' && h.name !== '..') {
        if (!h.name || /[\\/]/.test(h.name)) throw new Error('Invalid basename');
        const filename = `${directory}/${h.name}`;
        const qualified = prefix + filename;
        entries.push({ path: qualified, bytes: h.bytes, type: h.type });
        if (selectedPath === qualified) {
          if (h.type !== 2 || h.bytes > 256 * 1024) throw new Error('Only bounded regular text files may be read');
          const data = buffer.subarray(h.start, h.start + h.bytes);
          if (data.includes(0)) throw new Error('Selected file is binary');
          console.log(new TextDecoder('utf-8', { fatal: true }).decode(data));
        }
        if (h.type === 1 && h.spec) walk(h.spec, filename, depth + 1);
        else if (h.type === 2 && h.bytes >= 32 && buffer.subarray(h.start, h.start + 8).equals(magic)) {
          parse(buffer.subarray(h.start, h.start + h.bytes), qualified + ':', nesting + 1);
        }
      }
      offset = h.next;
    }
  }
  const rootHeader = header(root);
  if (rootHeader.type !== 1) throw new Error('Root is not a directory');
  walk(rootHeader.spec, '', 0);
}
parse(image, '');
if (selectedPath && !entries.some(entry => entry.path === selectedPath)) throw new Error('ROMFS path not found');
if (!selectedPath) console.log(JSON.stringify({ imageBytes: image.length,
  sha256: crypto.createHash('sha256').update(image).digest('hex'), entryCount: entries.length,
  entries: entries.filter(entry => /\.(lua|json|ini|txt|sh)$/.test(entry.path) ||
    /^\/[^/:]+\.bin$/.test(entry.path)).slice(0, 100) }, null, 2));
