// Static inspection of our own build output. Never installs or executes the APK.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {inspectApk} from './inspect-gadgetbridge-apk.mjs';

if (process.argv.length !== 2) throw Error('No arguments supported');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build/android-diagnostic-worktree/gadgetbridge');
const apkRelative = 'app/build/outputs/apk/mainline/rw4diagnostic/app-mainline-rw4diagnostic.apk';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const state = JSON.parse(fs.readFileSync(path.join(root, 'tools/local/android-build/prepared.json')));
if (!state.files.every(file => sha(fs.readFileSync(path.join(source, file.relative))) === file.sha256)) throw Error('Prepared sources changed');
const bytes = fs.readFileSync(path.join(source, apkRelative));
const inspection = inspectApk(bytes);
const manifest = inspection.manifest;
if (manifest.package !== 'nodomain.freeyourgadget.gadgetbridge.rw4diagnostic' ||
    manifest.versionName !== '0.94.0-rw4-diagnostic' || manifest.versionCode !== 253 ||
    manifest.minSdkVersion !== 23 || manifest.targetSdkVersion !== 35 || manifest.debuggable !== false) throw Error('Unexpected diagnostic APK identity/configuration');
const out = path.join(root, 'artifacts/research/android-diagnostic-apk-inspection.json');
const report = {...inspection, apkPath: path.relative(root, path.join(source, apkRelative)).replace(/\\/g, '/'),
  preparedSourcesSha256: state.files, sourceArchiveSha256: state.sourceArchiveSha256,
  hardwareGateOpen: false, runtimeTested: false,
  privacyAndGlobalLifecycleAuditComplete: false,
  officialApksignerReport: 'artifacts/research/android-diagnostic-apksigner.txt'};
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
state.apkProduced = true;
state.apkSha256 = report.apkSha256;
state.apkPath = report.apkPath;
state.apkMatchesPreparedSources = true;
state.apkRuntimeTested = false;
state.hardwareGateOpen = false;
fs.writeFileSync(path.join(root, 'tools/local/android-build/prepared.json'), JSON.stringify(state, null, 2) + '\n');
console.log(JSON.stringify({status: 'own-apk-statically-inspected', apkSha256: report.apkSha256,
  sizeBytes: report.sizeBytes, manifest: {package: manifest.package, versionName: manifest.versionName,
    versionCode: manifest.versionCode, minSdkVersion: manifest.minSdkVersion,
    targetSdkVersion: manifest.targetSdkVersion, debuggable: manifest.debuggable,
    permissionCount: manifest.permissions.length,
    androidInternetPermissionDeclared: manifest.permissions.includes('android.permission.INTERNET')},
  hardwareGateOpen: false, executionPerformed: false}, null, 2));
