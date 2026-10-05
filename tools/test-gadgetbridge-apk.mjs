// Requires the privately downloaded APK; no Android execution or file mutation.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {apkPath, inspectApk} from './inspect-gadgetbridge-apk.mjs';
const bytes = await fs.readFile(apkPath), report = inspectApk(bytes);
assert.equal(report.apkSha256, '38b7666166f6fd0268b598ad0b40435744833f26b8cb7b13eb724ca61894a66b');
assert.equal(report.manifest.package, 'nodomain.freeyourgadget.gadgetbridge');
assert.equal(report.manifest.versionCode, 253);
assert.equal(report.manifest.versionName, '0.94.0');
assert.equal(report.signature.certificateSha256, '01cce9316fcb77ea02c6dea81fde9f3176469202c0cea0514c0e03cb969bc7be');
assert.equal(report.signature.signatureAndContentDigestVerified, true);
const payload = Buffer.from(bytes); payload[1000] ^= 1;
assert.throws(() => inspectApk(payload), /content digest mismatch/);
const signedData = Buffer.from(bytes); signedData[report.signature.blockStart + 64] ^= 1;
assert.throws(() => inspectApk(signedData), /signed-data verification failed/);
assert.throws(() => inspectApk(bytes.subarray(0, bytes.length - 1)));
console.log('PASS: pinned APK manifest/v2 signature plus payload/signed-data tamper and truncation rejection. Original APK unchanged; no APK code executed.');
