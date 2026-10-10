// Static inspection of our own build output. Never installs or executes the APK.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {inspectApk} from './inspect-gadgetbridge-apk.mjs';
import {diagnosticPermissions, permissionAllowed, assertNoSensitiveAccess} from './android-diagnostic-permissions.mjs';

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
    manifest.versionName !== '0.94.0-rw4-diagnostic-r104' || manifest.versionCode !== 253 ||
    manifest.minSdkVersion !== 23 || manifest.targetSdkVersion !== 35 || manifest.debuggable !== false) throw Error('Unexpected diagnostic APK identity/configuration');
if (!manifest.permissions.every(permissionAllowed) ||
    [...diagnosticPermissions.keys()].some(name => !manifest.permissions.includes(name))) throw Error('Unexpected diagnostic permissions after manifest merge');
assertNoSensitiveAccess(manifest);
for (const name of ['android.permission.BLUETOOTH', 'android.permission.BLUETOOTH_ADMIN', 'android.permission.ACCESS_FINE_LOCATION']) {
  if (Number(manifest.permissionDetails.find(row => row.name === name)?.maxSdkVersion) !== 30) throw Error('Legacy permission lacks API 30 limit');
}
const scanFlags = manifest.permissionDetails.find(row => row.name === 'android.permission.BLUETOOTH_SCAN')?.usesPermissionFlags;
if (![65536, 'neverForLocation'].includes(scanFlags)) throw Error('Scan location flag differs');
const coreService = 'nodomain.freeyourgadget.gadgetbridge.service.DeviceCommunicationService';
for (const component of manifest.components) {
  if (component.kind === 'service' || component.kind === 'receiver') {
    if (component.exported !== false || component.enabled !== (component.name === coreService)) throw Error('Unrestricted service or receiver after manifest merge');
  }
  if (component.kind === 'activity-alias' && (component.exported !== false || component.enabled !== false)) throw Error('Unexpected exported activity alias');
  if (component.kind === 'activity' && component.exported !== (component.name === 'nodomain.freeyourgadget.gadgetbridge.activities.ControlCenterv2')) throw Error('Unexpected activity export');
}
if (!manifest.components.some(c => c.kind === 'service' && c.name === coreService && c.enabled === true)) throw Error('Diagnostic service missing');
const out = path.join(root, 'artifacts/research/android-diagnostic-apk-inspection.json');
const report = {...inspection, apkPath: path.relative(root, path.join(source, apkRelative)).replace(/\\/g, '/'),
  preparedSourcesSha256: state.files, sourceArchiveSha256: state.sourceArchiveSha256,
  hardwareGateOpen: false, runtimeTested: false,
  privacyAndGlobalLifecycleAuditComplete: false,
  declaredPermissionsAndComponentsRestricted: true,
  noSensitiveAccessDeclarations: true,
  officialApksignerReport: 'artifacts/research/android-diagnostic-apksigner-r104.txt'};
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
