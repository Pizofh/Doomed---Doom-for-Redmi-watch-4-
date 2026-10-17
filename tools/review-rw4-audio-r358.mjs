// Static AP inspection only. No firmware execution, module, radio or ioctl.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv.length !== 2) throw Error('Fixed review only');
const file = path.join(root, 'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const bytes = fs.readFileSync(file);
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (sha256 !== '2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db') throw Error('Image changed');
const output = path.join(root, 'artifacts/research/audio-r358');
if (fs.existsSync(output)) throw Error('Review exists');
const strings = [];
let start = 0;
for (let i = 0; i <= bytes.length; i++) {
  if (i < bytes.length && bytes[i] >= 32 && bytes[i] <= 126) continue;
  if (i - start >= 5 && i - start <= 256) {
    const value = bytes.toString('ascii', start, i);
    if (/audio|pcm|speaker|codec|audiotrack|nxplayer|media_player|media_session|af_stream/i.test(value))
      strings.push({offset: start, value});
  }
  start = i + 1;
}
const names = strings.filter(s => /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(s.value) || /^\/dev\//.test(s.value));
for (const entry of names) {
  entry.references = [];
  entry.referenceCount = 0;
  for (const base of [0x3bff187c, 0x1bff187c, 0x0c100000]) {
    const needle = Buffer.alloc(4); needle.writeUInt32LE(base + entry.offset);
    for (let at = bytes.indexOf(needle); at >= 0; at = bytes.indexOf(needle, at + 1)) {
      entry.referenceCount++;
      if (entry.references.length < 64) entry.references.push({base, offset: at});
    }
  }
}
fs.mkdirSync(output, {recursive: true});
fs.writeFileSync(path.join(output, 'strings.json'), JSON.stringify(strings, null, 2) + '\n', {flag: 'wx'});
fs.writeFileSync(path.join(output, 'names.json'), JSON.stringify(names, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({imageSha256: sha256, strings: strings.length, names: names.length,
  selected: names.filter(s => /^nxplayer|^audio_(open|close|ioctl|register)$|^\/dev\/audio\//.test(s.value))
    .map(({offset, value, referenceCount}) => ({offset, value, references: referenceCount})),
  physicalWatchUsed: false, firmwareExecuted: false}));
