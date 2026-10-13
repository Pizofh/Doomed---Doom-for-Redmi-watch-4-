// Narrow, offline index of an already signature-verified APK. Candidate offsets
// are deliberately NOT a disassembler: confirm every call in official SDK smali.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {installedApkTargets} from './installed-apk-targets.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv.length > 3 || process.argv[2] && !['--core','--firmware'].includes(process.argv[2])) throw Error('Use no arguments, --core or --firmware');
const firmwareMode=process.argv[2]==='--firmware';
const target = installedApkTargets[process.argv[2] === '--core' ? 'core' : 'fitness'];
const out = path.join(root, 'artifacts/research', target.output);
const outputFile=path.join(out,firmwareMode?'firmware-index-r193.json':'dex-index.json');
if(firmwareMode&&fs.existsSync(outputFile))throw Error('ExistingFirmwareIndex');
const review = JSON.parse(fs.readFileSync(path.join(out, 'review.json')));
const apk = fs.readFileSync(path.join(root, 'tools/local', target.directory, target.file));
if (!review.signatureVerified || !review.manifestVerified || review.apkSha256 !== target.sha256 ||
  createHash('sha256').update(apk).digest('hex') !== target.sha256) throw Error('Unverified/changed input');
const check = (ok, msg) => { if (!ok) throw Error(msg); };
let eocd = -1;
for (let p = apk.length - 22; p >= Math.max(0, apk.length - 65557); p--) {
  if (apk.readUInt32LE(p) === 0x06054b50 && p + 22 + apk.readUInt16LE(p + 20) === apk.length) { eocd = p; break; }
}
check(eocd >= 0 && apk.readUInt32LE(eocd + 4) === 0, 'Unsupported ZIP');
const cd = apk.readUInt32LE(eocd + 16);
check(cd + apk.readUInt32LE(eocd + 12) === eocd, 'Invalid ZIP directory');
const entries = [], names = new Set();
for (let p = cd; p < eocd;) {
  check(p + 46 <= eocd && apk.readUInt32LE(p) === 0x02014b50, 'Invalid ZIP entry');
  const nl = apk.readUInt16LE(p + 28), xl = apk.readUInt16LE(p + 30), cl = apk.readUInt16LE(p + 32);
  check(p + 46 + nl + xl + cl <= eocd, 'Truncated ZIP entry');
  const name = apk.subarray(p + 46, p + 46 + nl).toString('utf8');
  check(!names.has(name), 'Duplicate ZIP entry'); names.add(name);
  if (/^classes(?:[2-9]|[1-9][0-9]+)?\.dex$/.test(name)) entries.push({name,
    offset: apk.readUInt32LE(p + 42), packed: apk.readUInt32LE(p + 20),
    size: apk.readUInt32LE(p + 24), method: apk.readUInt16LE(p + 10)});
  p += 46 + nl + xl + cl;
}
check(entries.length > 0 && entries.length <= 64, 'Invalid DEX count');
const results = [];
for (const entry of entries) {
  const p = entry.offset;
  check(p + 30 <= cd && apk.readUInt32LE(p) === 0x04034b50 && entry.size <= 32 * 1024 * 1024, 'Invalid DEX ZIP header');
  const nl = apk.readUInt16LE(p + 26), xl = apk.readUInt16LE(p + 28);
  check(apk.subarray(p + 30, p + 30 + nl).toString('utf8') === entry.name, 'DEX filename mismatch');
  const start = p + 30 + nl + xl;
  check(start + entry.packed <= cd && [0, 8].includes(entry.method), 'Invalid DEX payload');
  const compressed = apk.subarray(start, start + entry.packed);
  const b = entry.method === 8 ? inflateRawSync(compressed, {maxOutputLength: 32 * 1024 * 1024}) : compressed;
  check(b.length === entry.size && /^dex\n0(35|37|38|39|40)\0$/.test(b.subarray(0, 8).toString('ascii')), 'Unsupported DEX');
  check(b.readUInt32LE(32) === b.length && b.readUInt32LE(36) === 112 && b.readUInt32LE(40) === 0x12345678, 'Invalid DEX header');
  function table(header, width, limit = 1000000) {
    const count = b.readUInt32LE(header), offset = b.readUInt32LE(header + 4);
    check(count <= limit && offset + count * width <= b.length, 'Invalid DEX table');
    return {count, offset};
  }
  function uleb(cursor) {
    let n = 0;
    for (let shift = 0; shift < 35; shift += 7) {
      check(cursor.p < b.length, 'Truncated ULEB');
      const v = b[cursor.p++]; n += (v & 127) * 2 ** shift;
      if (!(v & 128)) { check(n <= 0xffffffff, 'ULEB overflow'); return n; }
    }
    throw Error('Invalid ULEB');
  }
  const st = table(56, 4), tt = table(64, 4), mt = table(88, 8, 65536), ct = table(96, 32);
  const strings = Array.from({length: st.count}, (_, i) => {
    const cursor = {p: b.readUInt32LE(st.offset + 4 * i)}; uleb(cursor);
    const end = b.indexOf(0, cursor.p);
    check(end >= cursor.p && end - cursor.p <= 1024 * 1024, 'Invalid DEX string');
    // Our search is ASCII only, not a general MUTF-8 decoder.
    return b.subarray(cursor.p, end).toString('utf8');
  });
  const types = Array.from({length: tt.count}, (_, i) => strings[b.readUInt32LE(tt.offset + i * 4)]);
  check(types.every(t => typeof t === 'string'), 'Invalid DEX type index');
  const methods = Array.from({length: mt.count}, (_, i) => {
    const p = mt.offset + i * 8;
    const owner = types[b.readUInt16LE(p)], name = strings[b.readUInt32LE(p + 4)];
    check(owner && name, 'Invalid DEX method index'); return {owner, name};
  });
  const targets = firmwareMode?new Set():new Set(methods.flatMap((m, i) =>
    m.owner === 'Landroid/bluetooth/BluetoothDevice;' && /^(create.*Rfcomm.*|connectGatt)$/.test(m.name) ||
    m.owner === 'Landroid/bluetooth/BluetoothSocket;' && m.name === 'connect' ||
    ['Lcom/xiaomi/wearable/spp/SystemClient;', 'Lcom/xiaomi/wearable/spp/b;'].includes(m.owner) && m.name === '<init>' ||
    ['Lcom/xiaomi/wearable/core/client/MiWearCoreClient;', 'Lcom/xiaomi/wearable/core/client/IMiWearCoreClient;'].includes(m.owner) && m.name === 'disconnect' ||
    m.owner === 'Lcom/xiaomi/wearable/core/CoreExtKt;' && m.name === 'setLyraEnabled' ||
    /^Lcom\/xiaomi\/(fit\/device\/model|fitness\/device\/manager)\//.test(m.owner) &&
      ['disconnectDevice', 'setCurrentStatus'].includes(m.name) ? [i] : []));
  const firmwarePattern=/firmware|(?:^|[\/_.-])ota(?:[\/_.-]|$)|2\.2\.86|M2315W1|Redmi Watch 4/i;
  const modelIds = new Set(strings.flatMap((s, i) => (firmwareMode?firmwarePattern.test(s):/^(?:Redmi Watch 4(?: .*)?|M2315W1)$/.test(s)) ? [i] : []));
  const candidates = [];
  for (let c = 0; c < ct.count; c++) {
    const cp = ct.offset + c * 32, cls = types[b.readUInt32LE(cp)];
    const data = b.readUInt32LE(cp + 24); if (!data) continue;
    const cursor = {p: data};
    const sf = uleb(cursor), inf = uleb(cursor), dm = uleb(cursor), vm = uleb(cursor);
    check(sf + inf + dm + vm <= 1000000, 'Invalid class data count');
    for (let f = 0; f < sf + inf; f++) { uleb(cursor); uleb(cursor); }
    for (const count of [dm, vm]) {
      let mi = 0;
      for (let m = 0; m < count; m++) {
        mi += uleb(cursor); uleb(cursor); const code = uleb(cursor);
        check(mi < methods.length, 'Invalid encoded method'); if (!code) continue;
        check(code + 16 <= b.length, 'Invalid code item');
        const size = b.readUInt32LE(code + 12), start = code + 16;
        check(start + size * 2 <= b.length, 'Truncated code item');
        for (let unit = 0; unit + 1 < size; unit++) {
          const p = start + unit * 2, op = b[p], index = b.readUInt16LE(p + 2);
          if (((op >= 0x6e && op <= 0x72) || (op >= 0x74 && op <= 0x78)) && targets.has(index)) {
            candidates.push({class: cls, method: methods[mi].name, unit, target: methods[index]});
          } else if ((op === 0x1a && modelIds.has(index)) ||
            (op === 0x1b && unit + 2 < size && modelIds.has(b.readUInt32LE(p + 2)))) {
            candidates.push({class: cls, method: methods[mi].name, unit,
              ...(firmwareMode?{firmwareLiteralCandidate:true,stringIndex:op===0x1a?index:b.readUInt32LE(p+2)}:{modelLiteralCandidate:true})});
          }
        }
      }
    }
  }
  check(candidates.length <= 10000, 'Too many candidates');
  const classNames = Array.from({length: ct.count}, (_, c) => types[b.readUInt32LE(ct.offset + c * 32)]);
  results.push({dex: entry.name, bytes: b.length, sha256: createHash('sha256').update(b).digest('hex'),
    classCount: ct.count, modelLiteralsPresent: modelIds.size,
    ...(firmwareMode?{firmwareLiterals:[...modelIds].map(index=>({index,value:strings[index]}))}:{}),candidates});
  // Names only in a separate ignored index, never all string constants.
  if(!firmwareMode)fs.writeFileSync(path.join(out, entry.name + '-classes.txt'), classNames.join('\n') + '\n');
}
const report = {apkSha256: review.apkSha256, apkExecuted: false,
  limitation: 'Candidate scan includes operands/payloads, not instruction boundaries. Confirm in SDK smali; no RW4 routing claim.', dex: results};
fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n',firmwareMode?{flag:'wx'}:undefined);
console.log(JSON.stringify({...(firmwareMode?{checkpoint:'R193',scope:'firmware-literal-candidates',rawStringsPrivate:true}:{}),
  dexCount: results.length,candidateCount: results.reduce((n, d) => n + d.candidates.length, 0),apkExecuted:false}));
