// Narrow offline inspection of this APK. Never runs DEX/native code.
// v2 reference: https://source.android.com/docs/security/features/apksigning/v2
// Supports one RSA-PKCS1/SHA256 or SHA512 signer; not a replacement for apksigner.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash, createPublicKey, verify, X509Certificate} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const apkPath = path.join(root, 'tools/local/gadgetbridge/nodomain.freeyourgadget.gadgetbridge_253_01cce93.apk');
const sha = b => createHash('sha256').update(b).digest();
function check(ok, message) { if (!ok) throw Error(message); }
function lpFields(b) {
  const fields = [];
  for (let p = 0; p < b.length;) {
    check(p + 4 <= b.length, 'Truncated length prefix');
    const n = b.readUInt32LE(p); p += 4;
    check(n <= b.length - p, 'Invalid length prefix');
    fields.push(b.subarray(p, p + n)); p += n;
  }
  return fields;
}
function zipLayout(b) {
  let eocd = -1;
  for (let p = b.length - 22; p >= Math.max(0, b.length - 65557); p--) {
    if (b.readUInt32LE(p) === 0x06054b50 && p + 22 + b.readUInt16LE(p + 20) === b.length) { eocd = p; break; }
  }
  check(eocd >= 0, 'No ZIP EOCD');
  const cd = b.readUInt32LE(eocd + 16), size = b.readUInt32LE(eocd + 12);
  check(b.readUInt32LE(eocd + 4) === 0 && cd + size === eocd, 'Unsupported ZIP layout');
  const entries = [], names = new Set();
  for (let p = cd; p < eocd;) {
    check(p + 46 <= eocd && b.readUInt32LE(p) === 0x02014b50, 'Invalid central directory');
    const nl = b.readUInt16LE(p + 28), xl = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32);
    check(p + 46 + nl + xl + cl <= eocd, 'Invalid ZIP entry');
    const name = b.subarray(p + 46, p + 46 + nl).toString('utf8');
    check(!/(^[/\\]|^[A-Za-z]:|(^|[/\\])\.\.([/\\]|$))/.test(name) && !names.has(name), 'Unsafe or duplicate ZIP name');
    names.add(name);
    const offset = b.readUInt32LE(p + 42);
    check(offset + 30 <= cd && b.readUInt32LE(offset) === 0x04034b50, 'Invalid local ZIP header');
    const localName = b.subarray(offset + 30, offset + 30 + b.readUInt16LE(offset + 26)).toString('utf8');
    check(name === localName, 'Local/central filename differs');
    entries.push({name, offset, compressedBytes: b.readUInt32LE(p + 20), bytes: b.readUInt32LE(p + 24), method: b.readUInt16LE(p + 10)});
    p += 46 + nl + xl + cl;
  }
  check(entries.length === b.readUInt16LE(eocd + 10) && entries.length === b.readUInt16LE(eocd + 8), 'ZIP entry count mismatch');
  return {eocd, cd, entries};
}
function contentDigest(b, blockStart, cd, eocd, hashName) {
  const hash = bytes => createHash(hashName).update(bytes).digest();
  const end = Buffer.from(b.subarray(eocd)); end.writeUInt32LE(blockStart, 16);
  const chunks = [];
  for (const section of [b.subarray(0, blockStart), b.subarray(cd, eocd), end]) {
    for (let p = 0; p < section.length; p += 1048576) {
      const chunk = section.subarray(p, p + 1048576), prefix = Buffer.alloc(5);
      prefix[0] = 0xa5; prefix.writeUInt32LE(chunk.length, 1);
      chunks.push(hash(Buffer.concat([prefix, chunk])));
    }
  }
  const prefix = Buffer.alloc(5); prefix[0] = 0x5a; prefix.writeUInt32LE(chunks.length, 1);
  return hash(Buffer.concat([prefix, ...chunks]));
}
function inspectV2(b, {cd, eocd}) {
  check(cd >= 32 && b.subarray(cd - 16, cd).toString('ascii') === 'APK Sig Block 42', 'No signing block');
  const size = Number(b.readBigUInt64LE(cd - 24)), start = cd - size - 8;
  check(Number.isSafeInteger(size) && start >= 0 && size >= 24 && b.readBigUInt64LE(start) === BigInt(size), 'Invalid signing block size');
  let v2;
  for (let p = start + 8; p < cd - 24;) {
    check(p + 8 <= cd - 24, 'Truncated signing pair');
    const n = Number(b.readBigUInt64LE(p)); p += 8;
    check(Number.isSafeInteger(n) && n >= 4 && n <= cd - 24 - p, 'Invalid signing pair');
    if (b.readUInt32LE(p) === 0x7109871a) { check(!v2, 'Duplicate v2 block'); v2 = b.subarray(p + 4, p + n); }
    p += n;
  }
  check(v2, 'No v2 signature');
  const outer = lpFields(v2); check(outer.length === 1, 'Invalid v2 signers sequence');
  const signers = lpFields(outer[0]); check(signers.length === 1, 'Inspector supports one signer');
  const parts = lpFields(signers[0]); check(parts.length === 3, 'Invalid signer');
  const [signed, signatures, publicKey] = parts, sigs = lpFields(signatures);
  check(sigs.length === 1, 'Inspector supports one signature algorithm');
  const algorithm = sigs[0].readUInt32LE(0), hashName = algorithm === 0x0103 ? 'sha256' : algorithm === 0x0104 ? 'sha512' : null;
  check(hashName, 'Unsupported signing algorithm');
  const signature = lpFields(sigs[0].subarray(4)); check(signature.length === 1, 'Invalid signature');
  const key = createPublicKey({key: publicKey, format: 'der', type: 'spki'});
  check(verify(hashName, signed, key, signature[0]), 'v2 signed-data verification failed');
  const signedParts = lpFields(signed);
  // This APK has an extra empty length-prefixed field in signed data. All
  // bytes, including that padding, were covered by the verified signature.
  check(signedParts.length >= 3 && signedParts.slice(3).every(p => p.length === 0), 'Unsupported signed-data extension');
  const digests = lpFields(signedParts[0]);
  check(digests.length === 1 && digests[0].readUInt32LE(0) === algorithm, 'Signature/digest algorithm differs');
  const digest = lpFields(digests[0].subarray(4)); check(digest.length === 1, 'Invalid content digest');
  check(contentDigest(b, start, cd, eocd, hashName).equals(digest[0]), 'v2 APK content digest mismatch');
  const certs = lpFields(signedParts[1]); check(certs.length > 0, 'No certificate');
  const cert = new X509Certificate(certs[0]);
  check(cert.publicKey.export({format: 'der', type: 'spki'}).equals(publicKey), 'Certificate/public key mismatch');
  return {scheme: 'v2', algorithm: 'RSA-PKCS1/' + hashName.toUpperCase(), signatureAndContentDigestVerified: true,
    certificateSha256: sha(cert.raw).toString('hex'), subject: cert.subject, blockStart: start,
    trailingEmptySignedFields: signedParts.length - 3,
    scope: 'Limited inspector; v3/v4, Android platform acceptance and behavior not verified'};
}
function unzip(b, entry) {
  check(entry && entry.bytes <= 4 * 1024 * 1024, 'Missing/oversized manifest');
  const start = entry.offset + 30 + b.readUInt16LE(entry.offset + 26) + b.readUInt16LE(entry.offset + 28);
  const data = b.subarray(start, start + entry.compressedBytes);
  const plain = entry.method === 8 ? inflateRawSync(data, {maxOutputLength: 4 * 1024 * 1024}) : entry.method === 0 ? data : null;
  check(plain && plain.length === entry.bytes, 'Manifest decompression failed'); return plain;
}
function manifestMetadata(b) {
  check(b.readUInt16LE(0) === 3 && b.readUInt32LE(4) === b.length, 'Not binary XML');
  let strings = [], result = {permissions: [], permissionDetails: [], components: []};
  for (let p = b.readUInt16LE(2); p < b.length;) {
    const type = b.readUInt16LE(p), header = b.readUInt16LE(p + 2), size = b.readUInt32LE(p + 4);
    check(size >= header && header >= 8 && p + size <= b.length, 'Invalid XML chunk');
    if (type === 1) {
      const count = b.readUInt32LE(p + 8), utf8 = !!(b.readUInt32LE(p + 16) & 0x100), start = p + b.readUInt32LE(p + 20);
      check(count <= 10000 && header + count * 4 <= size, 'Invalid string pool');
      strings = Array.from({length: count}, (_, i) => {
        let q = start + b.readUInt32LE(p + header + i * 4);
        const length = () => { const a = b[q++]; return a & 0x80 ? ((a & 0x7f) << 8) | b[q++] : a; };
        if (utf8) { length(); const n = length(); check(q + n < p + size, 'Invalid UTF8 string'); return b.subarray(q, q + n).toString('utf8'); }
        let n = b.readUInt16LE(q); q += 2;
        if (n & 0x8000) { n = ((n & 0x7fff) * 65536) + b.readUInt16LE(q); q += 2; }
        check(q + n * 2 < p + size, 'Invalid UTF16 string'); return b.subarray(q, q + n * 2).toString('utf16le');
      });
    } else if (type === 0x0102) {
      const tag = strings[b.readUInt32LE(p + 20)], start = p + 16 + b.readUInt16LE(p + 24);
      const stride = b.readUInt16LE(p + 26), count = b.readUInt16LE(p + 28), attrs = {};
      check(stride >= 20 && start + stride * count <= p + size, 'Invalid XML attributes');
      for (let i = 0; i < count; i++) {
        const q = start + i * stride, name = strings[b.readUInt32LE(q + 4)], raw = b.readUInt32LE(q + 8), type = b[q + 15], data = b.readUInt32LE(q + 16);
        attrs[name] = raw !== 0xffffffff ? strings[raw] : type === 3 ? strings[data] : type === 0x12 ? !!data : data;
      }
      if (tag === 'manifest') for (const name of ['package', 'versionName', 'versionCode']) result[name] = attrs[name];
      if (tag === 'uses-sdk') for (const name of ['minSdkVersion', 'targetSdkVersion']) result[name] = attrs[name];
      if (tag === 'application') result.debuggable = attrs.debuggable ?? false;
      if (tag === 'uses-permission' || tag === 'uses-permission-sdk-23') {
        result.permissions.push(attrs.name);
        result.permissionDetails.push(attrs);
      }
      if (['activity', 'activity-alias', 'service', 'receiver', 'provider'].includes(tag)) result.components.push({kind: tag, ...attrs});
    }
    p += size;
  }
  return result;
}
export function inspectApk(b) {
  check(b.length <= 64 * 1024 * 1024, 'Oversized APK');
  const layout = zipLayout(b), signature = inspectV2(b, layout);
  const manifest = manifestMetadata(unzip(b, layout.entries.find(e => e.name === 'AndroidManifest.xml')));
  return {executionPerformed: false, apkSha256: sha(b).toString('hex'), sizeBytes: b.length,
    zipEntryCount: layout.entries.length, unsafeOrDuplicateNames: false, signature, manifest,
    signatureEntriesAtEnd: layout.entries.slice(-3).map(e => e.name)};
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    check(process.argv.length === 2, 'No arguments supported');
    const report = inspectApk(await fs.readFile(apkPath));
    const out = path.join(root, 'artifacts/research/gadgetbridge-apk-inspection.json');
    await fs.mkdir(path.dirname(out), {recursive: true});
    await fs.writeFile(out, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  } catch (error) { console.error('Static APK inspection failed: ' + error.message); process.exitCode = 1; }
}
