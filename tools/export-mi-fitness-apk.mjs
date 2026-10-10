// Copy one of two fixed installed phone APKs only on explicit user-run export.
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
function installedBase(text) {
  if (typeof text !== 'string' || text.length > 32768) throw Error('Unexpected package response');
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 1 || rows.length > 64) throw Error('Unexpected package count');
  const paths = rows.map(row => {
    // Fixed package query, strict path grammar, direct argv to `pull` (no shell).
    if (row.length > 1024 || !/^package:\/(?:data\/app|system\/app|system\/priv-app|product\/app|product\/priv-app|system_ext\/app|system_ext\/priv-app)\/[A-Za-z0-9_./+=~-]+\.apk$/.test(row)
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
  core: {package: 'com.xiaomi.mi_connect_service', file: 'MiConnectService-base.apk', directory: 'mi-connect-service'}
});
export function copyInstalledMiFitness(run, destination, target = 'fitness') {
  if (!Object.hasOwn(targets, target)) throw Error('Unknown fixed package');
  const selectedTarget = targets[target];
  contained(destination);
  const apk = contained(path.join(destination, selectedTarget.file));
  const partial = contained(apk + '.partial'), review = contained(path.join(destination, 'export-review.json'));
  if ([apk, partial, review].some(p => fs.existsSync(p))) throw Error('Existing export refused');
  if (result(run, ['-d', 'get-state']).trim() !== 'device') throw Error('One authorized USB phone required');
  const selected = installedBase(result(run, ['-d', 'shell', 'pm', 'path', selectedTarget.package]));
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
  if (process.argv.length > 3 || !['plan', 'export', 'plan-core', 'export-core'].includes(action)) throw Error('Only fixed plan/export modes supported');
  const target = action.endsWith('-core') ? 'core' : 'fitness', selectedTarget = targets[target];
  if (action.startsWith('plan')) {
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
