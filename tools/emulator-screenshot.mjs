// Read one PNG from the reviewed local QEMU's documented EmulatorController RPC.
import fs from 'node:fs';
import path from 'node:path';
import http2 from 'node:http2';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './verify-emulator.mjs';

function fields(buffer) {
  const result = [];
  let position = 0;
  function varint() {
    let value = 0;
    let scale = 1;
    for (let i = 0; i < 10; i++) {
      if (position >= buffer.length) throw new Error('Truncated protobuf varint');
      const byte = buffer[position++];
      value += (byte & 127) * scale;
      if (!(byte & 128)) return value;
      scale *= 128;
    }
    throw new Error('Invalid protobuf varint');
  }
  while (position < buffer.length) {
    const tag = varint();
    const type = tag & 7;
    let value;
    if (type === 0) value = varint();
    else {
      const length = type === 2 ? varint() : type === 1 ? 8 : type === 5 ? 4 : -1;
      if (length < 0 || position + length > buffer.length) throw new Error('Invalid protobuf field');
      value = buffer.subarray(position, position + length);
      position += length;
    }
    result.push({ number: Math.floor(tag / 8), type, value });
  }
  return result;
}
// Importers must guard their PC emulator session once before sampling.
// Read-only, fixed loopback RPC; no external endpoint parameter.
export async function captureScreenshot(label) {
if (!/^[a-z0-9-]{1,60}$/.test(label)) throw new Error('Invalid screenshot label');
const destination = path.join(projectRoot, 'artifacts/emulator/screenshots');
fs.mkdirSync(destination, { recursive: true });
const response = await new Promise((resolve, reject) => {
  const client = http2.connect('http://127.0.0.1:8554');
  const chunks = [];
  let bytes = 0;
  let trailers = {};
  const timer = setTimeout(() => { client.destroy(); reject(new Error('Screenshot RPC timed out')); }, 10000);
  client.once('error', error => { clearTimeout(timer); reject(error); });
  const request = client.request({ ':method': 'POST', ':path': '/android.emulation.control.EmulatorController/getScreenshot',
    'content-type': 'application/grpc', te: 'trailers', 'grpc-timeout': '5S' });
  request.on('trailers', headers => { trailers = headers; });
  request.on('data', chunk => {
    bytes += chunk.length;
    if (bytes > 5 * 1024 * 1024) { client.destroy(); clearTimeout(timer); reject(new Error('Screenshot response exceeds bound')); }
    else chunks.push(chunk);
  });
  request.once('error', error => { client.destroy(); clearTimeout(timer); reject(error); });
  request.once('end', () => {
    client.close(); clearTimeout(timer);
    if (trailers['grpc-status'] && trailers['grpc-status'] !== '0') reject(new Error(`gRPC: ${JSON.stringify(trailers)}`));
    else resolve(Buffer.concat(chunks));
  });
  // Empty ImageFormat: PNG enum is 0, original display size, main display.
  request.end(Buffer.alloc(5));
});
if (response.length < 5 || response[0] !== 0 || response.readUInt32BE(1) !== response.length - 5) {
  throw new Error('Unexpected gRPC frame');
}
const message = fields(response.subarray(5));
const png = message.find(field => field.number === 4 && field.type === 2)?.value;
const report = { endpoint: '127.0.0.1:8554', rpc: 'getScreenshot', timestampUtc: new Date().toISOString(),
  imageBytes: png?.length ?? 0, fields: message.map(f => ({ number: f.number, type: f.type,
    value: Buffer.isBuffer(f.value) ? { bytes: f.value.length } : f.value })) };
fs.writeFileSync(path.join(destination, `${label}.json`), JSON.stringify(report, null, 2) + '\n');
if (!png?.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
  throw new Error('No PNG screenshot returned; display may be inactive');
}
const output = path.join(destination, `${label}.png`);
fs.writeFileSync(output, png);
return { output, bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20), timestamp:message.find(f=>f.number===6&&f.type===0)?.value??null };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if(process.argv.length>3)throw Error('Expected optional screenshot label');
  const guard = spawnSync(process.execPath, [path.join(projectRoot, 'tools/emulator-adb.mjs'), 'connect'],
    { encoding: 'utf8', shell: false, windowsHide: true, timeout: 20000 });
  if (guard.status !== 0) throw new Error('Project emulator ownership/state check failed');
  console.log(JSON.stringify(await captureScreenshot(process.argv[2] ?? 'current')));
}
