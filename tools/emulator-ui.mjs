// Fixed loopback EmulatorController endpoint; never uses hardware/USB.
// Protocol: AOSP controller.proto @3784ee8181ab600b8a1d009a5e03cf9afe78865a.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http2 from 'node:http2';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './verify-emulator.mjs';

export function guardEmulator() {
  const result = spawnSync(process.execPath, [path.join(projectRoot, 'tools/emulator-adb.mjs'), 'connect'],
    { shell: false, windowsHide: true, encoding: 'utf8', timeout: 20000 });
  if (result.status !== 0) throw new Error('Emulator ownership/state verification failed');
}
function integer(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 65535) throw new Error('Invalid protobuf integer');
  const bytes = [];
  do { bytes.push((value & 127) | (value > 127 ? 128 : 0)); value = Math.floor(value / 128); } while (value);
  return Buffer.from(bytes);
}
const field = (n, v) => Buffer.concat([integer(n * 8), integer(v)]);
export async function rpc(name, payload = Buffer.alloc(0)) {
  if (!['getVmState', 'setVmState', 'sendMouse', 'sendKey'].includes(name)) throw new Error('RPC not allowed');
  return await new Promise((resolve, reject) => {
    const client = http2.connect('http://127.0.0.1:8554');
    const chunks = [];
    let count = 0;
    let status;
    const timer = setTimeout(() => { client.destroy(); reject(new Error(`${name}: timeout`)); }, 8000);
    const finish = error => { clearTimeout(timer); client.close(); reject(error); };
    client.once('error', finish);
    const request = client.request({ ':method': 'POST', ':path': `/android.emulation.control.EmulatorController/${name}`,
      'content-type': 'application/grpc', te: 'trailers', 'grpc-timeout': '5S' });
    request.on('trailers', headers => { status = headers['grpc-status']; });
    request.on('data', chunk => {
      count += chunk.length;
      if (count > 4096) { request.close(); finish(new Error('RPC response exceeds bound')); }
      else chunks.push(chunk);
    });
    request.once('error', finish);
    request.once('end', () => {
      clearTimeout(timer); client.close();
      const frame = Buffer.concat(chunks);
      if (status !== '0' || frame.length < 5 || frame[0] !== 0 || frame.readUInt32BE(1) !== frame.length - 5) {
        reject(new Error(`${name}: invalid gRPC response, status=${status}`));
      } else resolve(frame.subarray(5));
    });
    const prefix = Buffer.alloc(5); prefix.writeUInt32BE(payload.length, 1);
    request.end(Buffer.concat([prefix, payload]));
  });
}
async function state() {
  const result = await rpc('getVmState');
  if (result.length !== 2 || result[0] !== 8) throw new Error('Unexpected VM state response');
  return result[1];
}
export async function snapshotData() {
  guardEmulator();
  if (await state() !== 1) throw new Error('Guest must be RUNNING before snapshot');
  const source = path.join(projectRoot, 'emulator/local/run-state/avd/RedmiWatch4.vvd/vela_data.bin');
  if (fs.statSync(source).size !== 134217728 || fs.lstatSync(source).isSymbolicLink()) throw new Error('Unexpected mutable data image');
  const folder = path.join(projectRoot, `emulator/local/backups/before-touch-${Date.now()}`);
  fs.mkdirSync(folder, { recursive: true });
  const target = path.join(folder, 'vela_data.bin');
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  let resumed = false;
  let checksum;
  try {
    await rpc('setVmState', field(1, 3)); // PAUSED, not shutdown/terminate.
    if (await state() !== 3) throw new Error('Pause was not observed');
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
    checksum = hash(source);
    if (hash(target) !== checksum) throw new Error('Snapshot differs from paused image');
  } finally {
    await rpc('setVmState', field(1, 1));
    resumed = await state() === 1;
    if (!resumed) throw new Error('Guest resume not confirmed; inspect emulator before continuing');
  }
  const record = { folder, source, sha256: checksum, resumed, createdAtUtc: new Date().toISOString(),
    ramSnapshot: false, filesystemConsistencyVerified: false, note: 'Paused host image copy; not a guest filesystem consistency check' };
  fs.writeFileSync(path.join(folder, 'snapshot.json'), JSON.stringify(record, null, 2) + '\n');
  return record;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function mouse(x, y, buttons) { await rpc('sendMouse', Buffer.concat([field(1, x), field(2, y), field(3, buttons)])); }
function point(x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= 390 || y < 0 || y >= 450) throw new Error('Point outside 390x450 display');
}
export async function gesture(x1, y1, x2, y2, holdMs = 0) {
  point(x1, y1); point(x2, y2);
  if (!Number.isInteger(holdMs) || holdMs < 0 || holdMs > 3000) throw new Error('Invalid hold duration');
  try {
    await mouse(x1, y1, 0);
    await delay(150); // Move the released pointer before starting a new gesture.
    await mouse(x1, y1, 1);
    if (x1 === x2 && y1 === y2) {
      await delay(holdMs || 100); // A tap must stay below the long-press threshold.
    } else {
      await delay(holdMs || 150); // Let the guest sample the initial press.
      for (let i = 1; i <= 8; i++) {
        await delay(60);
        await mouse(Math.round(x1 + (x2 - x1) * i / 8), Math.round(y1 + (y2 - y1) * i / 8), 1);
      }
    }
  } finally { await mouse(x2, y2, 0); await delay(250); }
}
export async function resetGuest() { guardEmulator(); await rpc('setVmState', field(1, 9)); }

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, ...args] = process.argv.slice(2);
  if (!['snapshot', 'tap', 'swipe', 'hold', 'back', 'reset'].includes(action)) throw new Error('Expected snapshot|tap x y|hold x y|swipe x1 y1 x2 y2|back|reset');
  guardEmulator();
  if (action === 'snapshot') console.log(JSON.stringify(await snapshotData(), null, 2));
  else if (action === 'reset') {
    await resetGuest();
    console.log(JSON.stringify({ action, emulatorOnly: true }));
  }
  else if (action === 'back') {
    // W3C GoBack -> evdev translation; keypress includes release.
    const key = Buffer.from('GoBack');
    await rpc('sendKey', Buffer.concat([field(2, 2), integer(34), integer(key.length), key]));
    console.log(JSON.stringify({ action, emulatorOnly: true }));
  } else {
    const numbers = args.map(Number);
    if (numbers.length !== (action === 'swipe' ? 4 : 2)) throw new Error('Wrong coordinate count');
    const [x, y, x2 = x, y2 = y] = numbers;
    await gesture(x, y, x2, y2, action === 'hold' ? 2200 : 0);
    console.log(JSON.stringify({ action, coordinates: numbers, emulatorOnly: true }));
  }
}
