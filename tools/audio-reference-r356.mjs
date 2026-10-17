// Host-only reference for a future native SFX backend. No audio device or OS IO.
// DMX layout reference: pinned doomgeneric i_sdlsound.c, CacheSFX.
export function decodeDmx(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 8 || bytes.readUInt16LE(0) !== 3)
    throw Error('Invalid DMX header');
  const rate = bytes.readUInt16LE(2), length = bytes.readUInt32LE(4);
  if (rate < 4000 || rate > 48000 || length <= 48 || length > 262144 || length > bytes.length - 8)
    throw Error('Invalid DMX bounds/rate');
  // DMX excludes 16 padding samples at either end; retain a view, no PCM cache.
  return {rate, samples: bytes.subarray(24, 8 + length - 16)};
}
export function createMonoMixer(rate = 22050) {
  if (!Number.isInteger(rate) || rate < 8000 || rate > 48000) throw Error('Invalid output rate');
  const channels = Array(4).fill(null);
  const channel = id => {if (!Number.isInteger(id) || id < 0 || id >= 4) throw Error('Invalid channel');};
  let paused = false;
  return {
    start(id, sound, volume = 64) {
      channel(id);
      if (!sound || !Buffer.isBuffer(sound.samples) || sound.samples.length < 1 ||
          sound.samples.length > 262112 || !Number.isInteger(sound.rate) ||
          sound.rate < 4000 || sound.rate > 48000 || !Number.isInteger(volume) || volume < 0 || volume > 127)
        throw Error('Invalid sound');
      channels[id] = {sound, volume, position: 0, fraction: 0};
    },
    stop(id) {channel(id); channels[id] = null;},
    stopAll() {channels.fill(null); paused = false;},
    pause(value) {if (typeof value !== 'boolean') throw Error('Invalid pause'); paused = value;},
    playing(id) {channel(id); return channels[id] !== null;},
    render(count) {
      if (!Number.isInteger(count) || count < 1 || count > 512) throw Error('Invalid block size');
      const out = new Int16Array(count);
      if (paused) return out;
      for (let i = 0; i < count; i++) {
        let mixed = 0;
        for (let c = 0; c < channels.length; c++) {
          const voice = channels[c];
          if (!voice) continue;
          mixed += Math.trunc((voice.sound.samples[voice.position] - 128) * 256 * voice.volume / 127);
          voice.fraction += voice.sound.rate;
          voice.position += Math.floor(voice.fraction / rate);
          voice.fraction %= rate;
          if (voice.position >= voice.sound.samples.length) channels[c] = null;
        }
        out[i] = Math.max(-32768, Math.min(32767, mixed));
      }
      return out;
    },
  };
}
