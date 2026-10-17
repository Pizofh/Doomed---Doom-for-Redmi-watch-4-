// Offline WAD inspection + PCM file only. Does not open any audio output device.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyShareware} from './wad-data.mjs';
import {decodeDmx, createMonoMixer} from './audio-reference-r356.mjs';
if (process.argv.length !== 2) throw Error('No arguments supported');
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'artifacts/research/audio-r356');
if (fs.existsSync(out)) throw Error('Output exists');
const wad = fs.readFileSync(path.join(root, 'tools/local/doom-shareware/doom1.wad'));
const review = verifyShareware(wad), sounds = [];
for (let i = 0; i < review.count; i++) {
  const entry = review.directory + i * 16;
  const name = wad.toString('ascii', entry + 8, entry + 16).replace(/\0.*$/, '');
  if (!name.startsWith('DS')) continue;
  const offset = wad.readInt32LE(entry), length = wad.readInt32LE(entry + 4);
  const sound = decodeDmx(wad.subarray(offset, offset + length));
  sounds.push({name, rate: sound.rate, samples: sound.samples.length, sound});
}
const pistol = sounds.find(s => s.name === 'DSPISTOL');
if (!pistol) throw Error('Missing pistol effect');
const rate = 22050, frames = rate * 2, pcm = Buffer.alloc(frames * 2);
const mixer = createMonoMixer(rate);
for (let offset = 0; offset < frames; offset += 441) {
  if (offset === 0 || offset === 22050) mixer.start(offset === 0 ? 0 : 1, pistol.sound, 48);
  const block = mixer.render(Math.min(441, frames - offset));
  for (let i = 0; i < block.length; i++) pcm.writeInt16LE(block[i], (offset + i) * 2);
}
const header = Buffer.alloc(44);
header.write('RIFF'); header.writeUInt32LE(pcm.length + 36, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);
const report = {scope: 'Host reference only, not native integration or hardware playback',
  effects: sounds.map(({sound, ...metadata}) => metadata),
  effectCount: sounds.length, sampleRates: [...new Set(sounds.map(s => s.rate))],
  largestEffectSamples: Math.max(...sounds.map(s => s.samples)),
  pcm: {rate, channels: 1, bits: 16, durationSeconds: 2},
  physicalWatchUsed: false, devicePlayback: false, redistribution: false};
fs.mkdirSync(out, {recursive: true});
fs.writeFileSync(path.join(out, 'pistol-local-only.wav'), Buffer.concat([header, pcm]), {flag: 'wx'});
fs.writeFileSync(path.join(out, 'review.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({...report, effects: report.effectCount, output: 'artifacts/research/audio-r356/'}));
