// SPDX-License-Identifier: GPL-2.0-only
// OFFLINE contract model: returns command TEXT; never executes it or opens a device.
// This is not a Lua adapter, firmware attestation, or a deployable diagnostic.
const pins = Object.freeze([
  ['0c31f7f8', 0x4ff0e92d], // mw handler entry
  ['0c31f810', 0xb3404680], // no-assignment branch
  ['0c31f870', 0x0f02f1b9], // argc comparison
  ['0c31f8c0', 0x4620682b], // aligned word containing the one-word read (R403 correction)
  ['0c31f8d0', 0x20004798], // print/return
  ['0c5b6988', 0x481bb5b0], // controller selector entry
  ['0c5b69fc', 0x3c1cdedc], // selector RAM literal
].map(Object.freeze));
const selector = '3c1cdedc', cache = '3c1aeba0';
const names = Object.freeze({1: 'Zinitix ZTW662', 2: 'Chipone ICNT8918', 3: 'Hynitron CST9217'});

export const profile = Object.freeze({
  imageSha256: '2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db',
  handlerSha256: 'f5bd062657b334de1b7fa7d6537c5f07ce2c54547d70c815de41b75f56ea3ca0',
  pins, selector, cache, maximumRequests: pins.length + 2,
});

// Exact stock format: "  %p = 0x%08lx" followed by LF.
// %p may omit 0x and leading zeroes. No prompt, echo, extra line, or error accepted.
export function parseWord(text, address) {
  if (typeof text !== 'string' || text.length > 96) throw Error('OutputBound');
  const match = /^  (?:0x)?([0-9a-fA-F]{1,8}) = 0x([0-9a-fA-F]{8})\r?\n$/.exec(text);
  // JS $ can match before a final LF; consume the complete input explicitly.
  if (!match || match[0].length !== text.length) throw Error('OutputFormat');
  if (Number.parseInt(match[1], 16) !== Number.parseInt(address, 16)) throw Error('OutputAddress');
  return Number.parseInt(match[2], 16);
}

export function createReviewSession() {
  let state = 'IDLE', step = 0, pending = null, result = null;
  function request(kind, address) {
    // Addresses and commands originate solely from the closed internal plan.
    pending = Object.freeze({kind, address, command: 'mw ' + address});
    return pending;
  }
  function stop(reason) {
    state = 'STOPPED'; pending = null; result = Object.freeze({reason});
    return Object.freeze({state, ...result});
  }
  function done(value) {
    state = 'DONE'; pending = null; result = Object.freeze(value);
    return Object.freeze({state, ...result});
  }
  return Object.freeze({
    start() {
      if (state !== 'IDLE') throw Error('SingleAttemptOnly');
      state = 'PINS'; return request('pin', pins[0][0]);
    },
    accept(text) {
      if (!pending) throw Error('NoPendingRequest');
      let word;
      try { word = parseWord(text, pending.address); }
      catch (error) { return stop(error.message); }
      if (state === 'PINS') {
        if (word !== pins[step][1]) return stop('CodeMismatch');
        step++;
        if (step < pins.length) return request('pin', pins[step][0]);
        state = 'SELECTOR'; return request('selector', selector);
      }
      if (state === 'SELECTOR') {
        const id = word % 256;
        if (!names[id]) return stop('UnknownSelector');
        if (id !== 2) return done({selector: id, controller: names[id], multitouchProven: false});
        state = 'CACHE'; return request('chiponeCache', cache);
      }
      const max = Math.floor(word / 65536) % 256;
      if (max === 0) return stop('InvalidCache');
      return done({selector: 2, controller: names[2], cachedMaximum: max, multitouchProven: false});
    },
    abort() {
      if (state === 'DONE' || state === 'STOPPED') throw Error('TerminalSession');
      return stop('CaptureUnavailable');
    },
    status() { return Object.freeze({state, result}); },
  });
}
