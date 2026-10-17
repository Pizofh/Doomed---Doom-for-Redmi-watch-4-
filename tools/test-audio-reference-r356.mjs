import assert from 'node:assert/strict';
import {decodeDmx, createMonoMixer} from './audio-reference-r356.mjs';
function dmx(data, rate = 11025) {
  const bytes = Buffer.alloc(40 + data.length, 128);
  bytes.writeUInt16LE(3); bytes.writeUInt16LE(rate, 2); bytes.writeUInt32LE(data.length + 32, 4);
  Buffer.from(data).copy(bytes, 24); return bytes;
}
const raw = dmx(Array.from({length: 32}, (_, i) => 128 + i));
assert.deepEqual([...decodeDmx(raw).samples], Array.from({length: 32}, (_, i) => 128 + i));
assert.throws(() => decodeDmx(raw.subarray(0, raw.length - 1)));
assert.throws(() => decodeDmx(dmx(Array(16).fill(128))));
for (const [offset, value] of [[0, 2], [2, 0]]) {
  const bad = Buffer.from(raw); bad.writeUInt16LE(value, offset); assert.throws(() => decodeDmx(bad));
}
const badLength = Buffer.from(raw); badLength.writeUInt32LE(0xffffffff, 4);
assert.throws(() => decodeDmx(badLength));
const sound = {rate: 11025, samples: Buffer.from([128, 255, 0, 129])};
const mixer = createMonoMixer(22050); mixer.start(0, sound, 127);
assert.deepEqual([...mixer.render(10)], [0, 0, 32512, 32512, -32768, -32768, 256, 256, 0, 0]);
assert.equal(mixer.playing(0), false);
mixer.start(0, sound, 127); mixer.pause(true);
assert.deepEqual([...mixer.render(4)], [0, 0, 0, 0]);
mixer.pause(false); assert.deepEqual([...mixer.render(4)], [0, 0, 32512, 32512]);
mixer.stopAll(); assert.deepEqual([...mixer.render(2)], [0, 0]);
for (let id = 0; id < 4; id++) mixer.start(id, {rate: 22050, samples: Buffer.from([255, 0])}, 127);
assert.deepEqual([...mixer.render(3)], [32767, -32768, 0]);
const split = createMonoMixer(16000), whole = createMonoMixer(16000);
split.start(0, decodeDmx(raw), 127); whole.start(0, decodeDmx(raw), 127);
assert.deepEqual([...split.render(17), ...split.render(83)], [...whole.render(100)]);
for (const invalid of [0, -1, 513, 1.5]) assert.throws(() => mixer.render(invalid));
assert.throws(() => mixer.start(4, sound)); assert.throws(() => mixer.start(0, sound, 128));
mixer.start(0, sound, 0); assert.deepEqual([...mixer.render(10)], Array(10).fill(0));
mixer.start(0, sound); mixer.stop(0); assert.equal(mixer.playing(0), false);
console.log(JSON.stringify({passed: true, scope: 'Host PCM reference: bounds, padding, resampling, clipping, pause, release and block continuity', physicalAudio: false}));
