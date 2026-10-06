// Package the already reviewed local APK for a manual, Bluetooth-off phone test.
// No build, download, phone discovery, install, ADB or radio operations.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {inspectApk} from './inspect-gadgetbridge-apk.mjs';
import {permissionAllowed} from './android-diagnostic-permissions.mjs';

if (process.argv.length !== 2) throw Error('No arguments supported');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apkHash = 'bf95f228b51e4ff1920f918b9c8502f0d85b9a7d8975b40e5c82fedcee975fd2';
const certHash = '47eeb041e241c7ab785ed8bdcf06c6fcce90020e52d4794aa3c6c66590577709';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const source = path.join(root, 'build/android-diagnostic-worktree/gadgetbridge');
const apk = path.join(source, 'app/build/outputs/apk/mainline/rw4diagnostic/app-mainline-rw4diagnostic.apk');
const out = path.join(root, 'artifacts/android-offline-test-r87');

function checkedPath(filename) {
  const absolute = path.resolve(filename);
  const rel = path.relative(root, absolute);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw Error('Path escapes project');
  for (let current = absolute; current !== root; current = path.dirname(current)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Linked path refused');
  }
  return absolute;
}
const state = JSON.parse(fs.readFileSync(checkedPath(path.join(root, 'tools/local/android-build/prepared.json'))));
if (state.apkMatchesPreparedSources !== true || state.apkSha256 !== apkHash || state.hardwareGateOpen !== false) throw Error('APK/source review is not current');
for (const file of state.files) {
  if (hash(fs.readFileSync(checkedPath(path.join(source, file.relative)))) !== file.sha256) throw Error('Prepared source changed');
}
const bytes = fs.readFileSync(checkedPath(apk));
if (hash(bytes) !== apkHash) throw Error('APK differs from the reviewed build; inspect it first');
const report = inspectApk(bytes);
if (report.signature.certificateSha256 !== certHash || report.manifest.package !== 'nodomain.freeyourgadget.gadgetbridge.rw4diagnostic'
    || report.manifest.versionName !== '0.94.0-rw4-diagnostic-r87' || report.manifest.debuggable !== false
    || report.manifest.permissions.length !== 10 || !report.manifest.permissions.every(permissionAllowed)) throw Error('APK identity or capabilities changed');

// Refuse to overwrite a changed bundle. Re-running with identical inputs is harmless.
function write(filename, content) {
  const dest = checkedPath(path.join(out, filename));
  if (fs.existsSync(dest)) {
    if (!fs.lstatSync(dest).isFile() || hash(fs.readFileSync(dest)) !== hash(Buffer.from(content))) throw Error('Existing bundle differs; preserve it for inspection');
  } else fs.writeFileSync(dest, content, {flag: 'wx'});
}
checkedPath(out);
fs.mkdirSync(out, {recursive: true});
write('RW4Diagnostics-r87.apk', bytes);
write('SHA256SUMS.txt', apkHash + '  RW4Diagnostics-r87.apk\n');
write('TEST.md', fs.readFileSync(checkedPath(path.join(root, 'docs/android-offline-test.md'))));
write('review.json', JSON.stringify({
  status: 'prepared-for-manual-review', apk: 'RW4Diagnostics-r87.apk', apkSha256: apkHash,
  certificateSha256: certHash, versionName: report.manifest.versionName,
  package: report.manifest.package, minSdk: report.manifest.minSdkVersion,
  permissionCount: report.manifest.permissions.length,
  testedOnAndroid: false, phoneInstallationAuthorized: false, hardwareGateOpen: false,
  scope: 'Phone app launch/exit only, Bluetooth disabled, runtime permissions denied, no device registration/key input.'
}, null, 2) + '\n');
console.log(JSON.stringify({status: 'offline-test-bundle-prepared', folder: path.relative(root, out),
  apk: 'RW4Diagnostics-r87.apk', apkSha256: apkHash, installed: false, hardwareGateOpen: false}));
