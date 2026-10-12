// Own implementation of wire fields studied in Gadgetbridge's Xiaomi sources.
// Pure functions: no files, network, hardware, logs or automatic service init.
import {createCipheriv, createDecipheriv, createHmac, timingSafeEqual} from 'node:crypto';

export const VERSION_QUERY = Buffer.from('badcfe00c00300000000ef', 'hex');
const fail = () => { throw Error('MalformedProtocol'); };
export function varint(value) {
  if (!Number.isSafeInteger(value) || value < 0) fail();
  let n = BigInt(value); const bytes = [];
  do { bytes.push(Number(n & 127n) | (n > 127n ? 128 : 0)); n >>= 7n; } while (n);
  return Buffer.from(bytes);
}
export function uint(field, value) { return Buffer.concat([varint(field * 8), varint(value)]); }
export function bytes(field, value) {
  if (!Buffer.isBuffer(value) || value.length > 65535) fail();
  return Buffer.concat([varint(field * 8 + 2), varint(value.length), value]);
}
const string = (field, value) => bytes(field, Buffer.from(value, 'utf8'));
export function command(type, subtype, auth = null) {
  if (!((type === 1 && [26,27].includes(subtype)) || (type === 2 && [1,2].includes(subtype)) ||
      (type === 4 && subtype === 0)))
    throw Error('CommandRefused');
  return Buffer.concat([uint(1, type), uint(2, subtype), ...(auth ? [bytes(3, auth)] : [])]);
}
export function fields(input) {
  if (!Buffer.isBuffer(input) || input.length > 65535) fail();
  const result = new Map(); let at = 0, count = 0;
  const read = () => {
    let n = 0n;
    for (let i = 0; i < 10; i++) {
      if (at >= input.length) fail();
      const b = input[at++]; n |= BigInt(b & 127) << BigInt(i * 7);
      if (!(b & 128)) { if (n > BigInt(Number.MAX_SAFE_INTEGER)) fail(); return Number(n); }
    }
    return fail();
  };
  while (at < input.length) {
    if (++count > 256) fail();
    const tag = read(), field = Math.floor(tag / 8), wire = tag & 7;
    if (field < 1 || field > 536870911) fail();
    let value;
    if (wire === 0) value = read();
    else if ([1,2,5].includes(wire)) {
      const size = wire === 2 ? read() : wire === 1 ? 8 : 4;
      if (size > input.length - at) fail();
      value = input.subarray(at, at + size); at += size;
    } else fail();
    const previous = result.get(field) ?? [];
    previous.push({wire, value}); result.set(field, previous);
  }
  return result;
}
export function one(message, field, wire, required = true) {
  const entries = message.get(field);
  if (!entries && !required) return null;
  if (!entries || entries.length !== 1 || entries[0].wire !== wire) fail();
  return entries[0].value;
}
export function v1Frame(channel, payload, {op = 2, serial = 0, dataType = 2, flags = 128} = {}) {
  if (![0,2].includes(channel) || payload.length > 4096 || serial < 0 || serial > 255) fail();
  const frame = Buffer.alloc(payload.length + 11);
  Buffer.from('badcfe','hex').copy(frame); frame[3] = channel; frame[4] = flags;
  frame.writeUInt16LE(payload.length + 3, 5); frame[7] = op; frame[8] = serial; frame[9] = dataType;
  payload.copy(frame,10); frame[frame.length - 1] = 239; return frame;
}
export function crc16(input) {
  let crc = 0;
  for (const b of input) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
  }
  return crc;
}
export function v2Frame(type, sequence, payload) {
  if (![1,2,3].includes(type) || sequence < 0 || sequence > 255 || payload.length > 4096) fail();
  const frame = Buffer.alloc(8 + payload.length); frame[0] = frame[1] = 165;
  frame[2] = type; frame[3] = sequence; frame.writeUInt16LE(payload.length,4);
  frame.writeUInt16LE(crc16(payload),6); payload.copy(frame,8); return frame;
}
export const SESSION_START = v2Frame(2,0,Buffer.from('0101030001000002020000fc03020020000402001027','hex'));
export class FrameReader {
  constructor() { this.version = 1; this.pending = Buffer.alloc(0); }
  push(chunk) {
    if (!Buffer.isBuffer(chunk) || this.pending.length + chunk.length > 131072) fail();
    this.pending = Buffer.concat([this.pending, chunk]);
  }
  next() {
    const b = this.pending;
    if (this.version === 1) {
      if (b.length < 7) return null;
      if (b[0] !== 186 || b[1] !== 220 || b[2] !== 254 || (b[3] & 240) || (b[4] & 15)) fail();
      const length = b.readUInt16LE(5), size = length + 8;
      if (length < 3) fail();
      if (b.length < size) return null;
      if (b[size - 1] !== 239) fail();
      this.pending = b.subarray(size);
      return {version:1, channel:b[3], flags:b[4], op:b[7], serial:b[8], dataType:b[9], payload:b.subarray(10,size - 1)};
    }
    if (b.length < 8) return null;
    if (b[0] !== 165 || b[1] !== 165) fail();
    const size = 8 + b.readUInt16LE(4);
    if (b.length < size) return null;
    const payload = b.subarray(8,size), type = b[2] & 15;
    if (![1,2,3].includes(type) || crc16(payload) !== b.readUInt16LE(6)) fail();
    this.pending = b.subarray(size);
    return {version:2, type, sequence:b[3], payload};
  }
}
const hmac = (key, input) => createHmac('sha256', key).update(input).digest();
export function derive(secret, phone, watch) {
  if ([secret,phone,watch].some(b => !Buffer.isBuffer(b) || b.length !== 16)) fail();
  const seed = hmac(Buffer.concat([phone,watch]),secret), label = Buffer.from('miwear-auth');
  const first = hmac(seed,Buffer.concat([label,Buffer.from([1])]));
  const second = hmac(seed,Buffer.concat([first,label,Buffer.from([2])]));
  const full = Buffer.concat([first,second]);
  return {rx:full.subarray(0,16),tx:full.subarray(16,32),rxNonce:full.subarray(32,36),txNonce:full.subarray(36,40)};
}
export function ccmEncrypt(key, nonce, plain) {
  const c = createCipheriv('aes-128-ccm',key,nonce,{authTagLength:4});
  c.setAAD(Buffer.alloc(0),{plaintextLength:plain.length});
  return Buffer.concat([c.update(plain),c.final(),c.getAuthTag()]);
}
export function ccmDecrypt(key, nonce, payload) {
  if (payload.length < 4) fail();
  const c = createDecipheriv('aes-128-ccm',key,nonce,{authTagLength:4});
  c.setAuthTag(payload.subarray(-4)); c.setAAD(Buffer.alloc(0),{plaintextLength:payload.length - 4});
  return Buffer.concat([c.update(payload.subarray(0,-4)),c.final()]);
}
export function packetNonce(prefix, counter = 0) {
  if (prefix.length !== 4 || !Number.isInteger(counter) || counter < 0 || counter > 65535) fail();
  const nonce = Buffer.alloc(12); prefix.copy(nonce); nonce.writeUInt32LE(counter,8); return nonce;
}
export function ctr(key,payload) {
  const c = createCipheriv('aes-128-ctr',key,key); return Buffer.concat([c.update(payload),c.final()]);
}
export function nonceCommand(phone) { return command(1,26,bytes(30,bytes(1,phone))); }
export function authResponse(secret,phone,noncePayload) {
  const root = fields(noncePayload);
  if (one(root,1,0) !== 1 || one(root,2,0) !== 26) fail();
  const auth = fields(one(root,3,2));
  const watchFields = fields(one(auth,31,2)), watch = one(watchFields,1,2), givenHmac = one(watchFields,2,2);
  const keys = derive(secret,phone,watch), expected = hmac(keys.rx,Buffer.concat([watch,phone]));
  if (givenHmac.length !== expected.length || !timingSafeEqual(givenHmac,expected)) throw Error('AuthHmacMismatch');
  // Reviewed Android API compatibility profile; identify this client as desktop.
  // Required unknown1=0 remains explicit (proto2), no device/cloud identity spoof.
  const api = Buffer.alloc(5); api[0] = 21; api.writeFloatLE(36,1);
  const info = Buffer.concat([uint(1,0),api,string(3,'RW4 Windows client'),uint(4,224),string(5,'ES')]);
  const response = Buffer.concat([bytes(1,hmac(keys.tx,Buffer.concat([phone,watch]))),
    bytes(2,ccmEncrypt(keys.tx,packetNonce(keys.txNonce),info))]);
  return {keys,payload:command(1,27,bytes(32,response))};
}
export function decodeCommand(payload) {
  const parsed = fields(payload);
  return {parsed,type:one(parsed,1,0),subtype:one(parsed,2,0),status:one(parsed,100,0,false)};
}
export function readBattery(message) {
  const system = fields(one(message.parsed,4,2));
  const power = fields(one(system,2,2)), battery = fields(one(power,1,2));
  const level = one(battery,1,0);
  if (!Number.isInteger(level) || level < 0 || level > 100) fail();
  return level;
}
export function readDeviceInfo(message) {
  const system = fields(one(message.parsed,4,2)), device = fields(one(system,3,2));
  // Serial is never requested separately or returned; the response may contain it.
  const firmwareBytes = one(device,2,2), modelBytes = one(device,4,2);
  if (firmwareBytes.length > 32 || modelBytes.length > 128) fail();
  const firmware = firmwareBytes.toString('utf8'), model = modelBytes.toString('utf8');
  return {firmware:/^\d+(?:\.\d+){1,4}$/.test(firmware) ? firmware : null,
    modelRecognized:['M2315W1','Redmi Watch 4','RedmiWatch4'].includes(model)};
}
export function readWatchfaces(message) {
  const watchface = fields(one(message.parsed,6,2));
  const list = fields(one(watchface,1,2)), records = list.get(1) ?? [];
  if (records.length > 128) fail();
  const entries = [], seen = new Set(); let activeCount = 0, deletableCount = 0, unknownIdCount = 0;
  for (const record of records) {
    if (record.wire !== 2) fail();
    const info = fields(record.value), idBytes = one(info,1,2);
    if (idBytes.length < 1 || idBytes.length > 128) fail();
    const idText = idBytes.toString('utf8');
    const numeric = /^\d{1,10}$/.test(idText) && BigInt(idText) <= 4294967295n;
    const id = numeric ? BigInt(idText).toString() : null;
    // Unknown identifiers are never printed; names/images are never returned.
    const identity = numeric ? 'numeric:'+id : 'opaque:'+idBytes.toString('hex');
    if (seen.has(identity)) fail(); seen.add(identity);
    const active = one(info,3,0,false) ?? 0, canDelete = one(info,4,0,false) ?? 0;
    if (![0,1].includes(active) || ![0,1].includes(canDelete)) fail();
    activeCount += active; deletableCount += canDelete;
    if (numeric) entries.push({id,active:active === 1,canDelete:canDelete === 1});
    else unknownIdCount++;
  }
  return {count:records.length,activeCount,deletableCount,unknownIdCount,entries};
}
