// Package the inspected APK locally. No installation, radio or device access.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {inspectApk} from './inspect-gadgetbridge-apk.mjs';
import {permissionAllowed, assertNoSensitiveAccess} from './android-diagnostic-permissions.mjs';

if (process.argv.length !== 2) throw Error('No arguments supported');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function checked(filename) {
  const absolute = path.resolve(root, filename);
  const relative = path.relative(root, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw Error('Package path escapes workspace');
  for (let current = absolute; current !== root; current = path.dirname(current)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Linked package path refused');
  }
  return absolute;
}
const state = JSON.parse(fs.readFileSync(checked('tools/local/android-build/prepared.json')));
const reviewed = JSON.parse(fs.readFileSync(checked('artifacts/research/android-diagnostic-apk-inspection.json')));
if (state.apkMatchesPreparedSources !== true || state.apkSha256 !== reviewed.apkSha256) throw Error('APK/source review is not current');
for (const file of state.files) {
  if (hash(fs.readFileSync(checked(path.join('build/android-diagnostic-worktree/gadgetbridge', file.relative)))) !== file.sha256) throw Error('Prepared source changed');
}
const bytes = fs.readFileSync(checked(reviewed.apkPath));
if (hash(bytes) !== reviewed.apkSha256) throw Error('APK changed after inspection');
const inspection = inspectApk(bytes);
const revision = /^0\.94\.0-rw4-diagnostic-(r114)$/.exec(inspection.manifest.versionName)?.[1];
const certificate = '47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709';
if (!revision || inspection.signature.certificateSha256 !== certificate ||
    inspection.manifest.package !== 'nodomain.freeyourgadget.gadgetbridge.rw4diagnostic' ||
    inspection.manifest.debuggable !== false || inspection.manifest.permissions.length !== 10 ||
    !inspection.manifest.permissions.every(permissionAllowed)) throw Error('Diagnostic identity or permissions changed');
assertNoSensitiveAccess(inspection.manifest);
const signedBytes = fs.readFileSync(checked(reviewed.officialApksignerReport));
const signed = signedBytes.toString(signedBytes[0] === 0xff && signedBytes[1] === 0xfe ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '');
if (!/^Verifies\r?$/m.test(signed) || !signed.includes(certificate)) throw Error('Official signature report missing');
const folder = checked('artifacts/android-diagnostic-' + revision);
fs.mkdirSync(folder, {recursive: true});
const apkName = 'RW4Diagnostics-' + revision + '.apk';
function write(name, content) {
  const dest = checked(path.join(folder, name));
  if (fs.existsSync(dest)) {
    if (hash(fs.readFileSync(dest)) !== hash(Buffer.from(content))) throw Error('Existing package differs');
  } else fs.writeFileSync(dest, content, {flag: 'wx'});
}
write(apkName, bytes);
write('SHA256SUMS.txt', reviewed.apkSha256 + '  ' + apkName + '\n');
write('review.json', JSON.stringify({version: inspection.manifest.versionName, apkSha256: reviewed.apkSha256,
  certificateSha256: certificate, androidUiTested: false, bluetoothTested: false,
  phoneInstallationPerformed: false, hardwareGateOpen: false, mode: 'manual-consolidated-diagnostic'}, null, 2) + '\n');
console.log(JSON.stringify({status: 'diagnostic-package-ready', apk: path.relative(root, path.join(folder, apkName)),
  apkSha256: reviewed.apkSha256, version: inspection.manifest.versionName, installationPerformed: false}));
