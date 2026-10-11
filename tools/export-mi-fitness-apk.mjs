// Copy one of three fixed installed phone APKs only on explicit user-run export.
// No install, app launch, user-data read, Bluetooth operation or watch command.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sdk = path.join(root, 'tools/local/android-build/sdk/platform-tools');
const pins = {
  'adb.exe': 'b4a6b455702684652cccf7b46258b29e653538904359a58fd4931cf3ef286b3f',
  'AdbWinApi.dll': 'c1d653030b4bde65d3e07e4d0b0979e17be56df1436cdd15528630f27808050d',
  'AdbWinUsbApi.dll': '0710e894d9b40f71a670c13c694079d564c92c1279da382cfe4850983aaebe1b'
};
const hash = b => createHash('sha256').update(b).digest('hex');
function contained(filename) {
  const absolute = path.resolve(filename), relative = path.relative(root, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw Error('Workspace boundary');
  for (let current = absolute; current !== root; current = path.dirname(current)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Linked path refused');
  }
  return absolute;
}
function installedBase(text, allowBluetoothApex = false) {
  if (typeof text !== 'string' || text.length > 32768) throw Error('Unexpected package response');
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 1 || rows.length > 64) throw Error('Unexpected package count');
  const paths = rows.map(row => {
    // Fixed package query, strict path grammar, direct argv to `pull` (no shell).
    const appPath = /^package:\/(?:data\/app|system\/app|system\/priv-app|product\/app|product\/priv-app|system_ext\/app|system_ext\/priv-app)\/[A-Za-z0-9_./+=~-]+\.apk$/.test(row);
    const bluetoothApexPath = allowBluetoothApex && /^package:\/apex\/com\.android\.bt(?:services)?(?:@\d+)?\/app\/Bluetooth(?:Google)?\/[A-Za-z0-9_.-]+\.apk$/.test(row);
    if (row.length > 1024 || !(appPath || bluetoothApexPath)
        || row.includes('/../') || row.includes('/./')) throw Error('Unexpected package path');
    return row.slice(8);
  });
  const bases = paths.filter(p => p.endsWith('/base.apk'));
  if (bases.length === 1) return {remote: bases[0], parts: paths.length};
  if (paths.length === 1) return {remote: paths[0], parts: 1};
  throw Error('Ambiguous base APK');
}
function result(run, args) {
  const response = run(args);
  if (!response || response.error || response.status !== 0 || typeof response.stdout !== 'string') throw Error('ADB read failed');
  return response.stdout;
}
const targets = Object.freeze({
  fitness: {package: 'com.xiaomi.wearable', file: 'MiFitness-base.apk', directory: 'mi-fitness'},
  core: {package: 'com.xiaomi.mi_connect_service', file: 'MiConnectService-base.apk', directory: 'mi-connect-service'},
  bluetooth: {package: 'com.android.bluetooth', file: 'Bluetooth-base.apk', directory: 'phone-bluetooth'}
});
export function diagnoseBluetoothExport(run, destination) {
  contained(destination);
  const metadataFile = contained(path.join(destination, 'package-path-metadata.json'));
  if (fs.existsSync(metadataFile)) throw Error('Existing diagnosis refused');
  const report = {checkpoint: 'R143', diagnosticOnly: true, stage: 'USB_STATE',
    usbState: 'NOT_ESTABLISHED', packageRows: 0, basePathAccepted: false,
    privateMetadataSaved: false, copyPerformed: false, rawOutputExported: false,
    phoneAppLaunched: false, bluetoothOperationRequested: false, watchCommandRequested: false};
  const state = run(['-d', 'get-state']);
  if (!state || state.error || state.status !== 0 || typeof state.stdout !== 'string' || state.stdout.length > 1024) {
    const error = typeof state?.stderr === 'string' && state.stderr.length <= 4096 ? state.stderr : '';
    report.usbState = /device unauthorized/i.test(error) ? 'unauthorized' :
      /device offline/i.test(error) ? 'offline' : 'READ_FAILED'; return report;
  }
  const value = state.stdout.trim();
  report.usbState = ['device', 'offline', 'unauthorized'].includes(value) ? value : 'UNRECOGNIZED';
  if (value !== 'device') return report;
  report.stage = 'PACKAGE_QUERY';
  const reply = run(['-d', 'shell', 'pm', 'path', targets.bluetooth.package]);
  if (!reply || reply.error || typeof reply.stdout !== 'string' || reply.stdout.length > 32768 ||
      typeof reply.stderr !== 'string' || reply.stderr.length > 32768) return report;
  if (reply.status !== 0) { report.stage = 'PACKAGE_QUERY_FAILED'; return report; }
  if (!reply.stdout.trim()) { report.stage = 'PACKAGE_NO_PATH'; return report; }
  const rows = reply.stdout.trim().split(/\r?\n/);
  report.packageRows = rows.length;
  if (rows.length > 64) { report.stage = 'PACKAGE_RESPONSE_REFUSED'; return report; }
  // Retain only pm's APK path metadata, privately, for offline grammar review.
  // Unknown text is not saved; nothing here is used as a shell/command input.
  const paths = rows.map(row => row.match(/^package:(\/[^\r\n\0]{1,1024}\.apk)$/)?.[1]);
  if (paths.some(value => !value)) { report.stage = 'PACKAGE_RESPONSE_REFUSED'; return report; }
  try { installedBase(reply.stdout, true); report.basePathAccepted = true; report.stage = 'READY_TO_COPY'; }
  catch { report.stage = 'PACKAGE_PATH_REFUSED'; }
  fs.mkdirSync(destination, {recursive: true});
  fs.writeFileSync(metadataFile, JSON.stringify({packageRequested: targets.bluetooth.package, paths}, null, 2) + '\n', {flag: 'wx'});
  report.privateMetadataSaved = true;
  return report;
}
export function copyInstalledMiFitness(run, destination, target = 'fitness') {
  if (!Object.hasOwn(targets, target)) throw Error('Unknown fixed package');
  const selectedTarget = targets[target];
  contained(destination);
  const apk = contained(path.join(destination, selectedTarget.file));
  const partial = contained(apk + '.partial'), review = contained(path.join(destination, 'export-review.json'));
  if ([apk, partial, review].some(p => fs.existsSync(p))) throw Error('Existing export refused');
  if (result(run, ['-d', 'get-state']).trim() !== 'device') throw Error('One authorized USB phone required');
  const selected = installedBase(result(run, ['-d', 'shell', 'pm', 'path', selectedTarget.package]), target === 'bluetooth');
  fs.mkdirSync(destination, {recursive: true});
  fs.closeSync(fs.openSync(partial, 'wx')); // Reserve own local file, never overwrite an earlier export.
  result(run, ['-d', 'pull', selected.remote, partial]);
  const stat = fs.lstatSync(partial);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size < 4 || stat.size > 256 * 1024 * 1024) throw Error('Unexpected copied size');
  const bytes = fs.readFileSync(partial);
  if (bytes.readUInt32LE(0) !== 0x04034b50) throw Error('Copied file lacks ZIP header');
  // copyFile EXCL refuses any intervening target creation; partial stays on failure.
  fs.copyFileSync(partial, apk, fs.constants.COPYFILE_EXCL);
  fs.unlinkSync(partial);
  const report = {packageRequested: selectedTarget.package, source: 'installed-on-user-phone',
    baseOnly: true, packagePartsReported: selected.parts, sizeBytes: stat.size, apkSha256: hash(bytes),
    signatureVerified: false, manifestVerified: false, apkExecuted: false,
    phoneAppLaunched: false, bluetoothOperationRequested: false, watchCommandRequested: false};
  fs.writeFileSync(review, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
  return report;
}
function trustedRun(args) {
  for (const [name, digest] of Object.entries(pins)) {
    if (hash(fs.readFileSync(contained(path.join(sdk, name)))) !== digest) throw Error('SDK binary changed');
  }
  // This may start the PC ADB server and use its Android SDK host authorization key.
  // No raw stdout/stderr, phone serial or installed path reaches the report.
  return spawnSync(path.join(sdk, 'adb.exe'), args, {cwd: sdk, windowsHide: true, encoding: 'utf8',
    timeout: 120000, maxBuffer: 128 * 1024, shell: false});
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  if (process.argv.length > 3 || !['plan', 'export', 'plan-core', 'export-core', 'plan-bluetooth', 'export-bluetooth', 'diagnose-bluetooth'].includes(action)) throw Error('Only fixed plan/export modes supported');
  const target = action.endsWith('-core') ? 'core' : action.endsWith('-bluetooth') ? 'bluetooth' : 'fitness', selectedTarget = targets[target];
  if (action === 'diagnose-bluetooth') {
    try { console.log(JSON.stringify(diagnoseBluetoothExport(trustedRun, path.join(root, 'tools/local/phone-bluetooth-diagnostic-r143')))); }
    catch { console.error('Export diagnosis failed locally; no raw output, copy, radio action or retry performed.'); process.exitCode = 1; }
  } else if (action.startsWith('plan')) {
    console.log(JSON.stringify({action: 'plan', executionPerformed: false,
      commands: ['adb -d get-state', 'adb -d shell pm path ' + selectedTarget.package, 'adb -d pull <base APK path returned by pm> <local partial file>'],
      sdkPlatformTools: '37.0.1, pinned local Windows binaries',
      destination: 'tools/local/' + selectedTarget.directory + '/' + selectedTarget.file,
      prerequisites: 'one USB phone, user-approved USB debugging; no watch connection'}));
  } else {
    try { console.log(JSON.stringify(copyInstalledMiFitness(trustedRun, path.join(root, 'tools/local', selectedTarget.directory), target))); }
    catch { console.error('Export refused or failed. Check USB authorization, installed package and existing local export; no fallback, install or raw logs.'); process.exitCode = 1; }
  }
}
