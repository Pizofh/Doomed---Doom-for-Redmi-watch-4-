// User-manual Android bugreport collection. No automatic execution on import/default.
// A bugreport is private and broad: obtaining it requires a separate user decision.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'tools/local/phone-hci-r134');
const maxOutput = 1024 * 1024;
export function collectPhoneReport(run, directory, checkpoint = 'R134') {
  if (!['R134', 'R136'].includes(checkpoint)) throw Error('Unknown report checkpoint');
  // Refuse overwrite or reuse; no cleanup, retry, Bluetooth or logging fallback.
  if (!path.isAbsolute(directory) || fs.existsSync(directory)) throw Error('Fresh private directory required');
  const state = run(['-d', 'get-state'], 30000);
  if (!state || state.error || state.status !== 0 || typeof state.stdout !== 'string' ||
      Buffer.byteLength(state.stdout) > maxOutput || state.stdout.trim() !== 'device') {
    throw Error('One authorized USB phone required');
  }
  fs.mkdirSync(directory, {recursive: true});
  const report = run(['-d', 'bugreport', directory], 300000);
  if (!report || report.error || report.status !== 0) throw Error('Private report failed');
  const entries = fs.readdirSync(directory, {withFileTypes: true});
  // ADB may create ancillary files. Never print their names or contents.
  const zipEntries = entries.filter(entry => entry.isFile() && /\.zip$/i.test(entry.name));
  if (zipEntries.length !== 1) throw Error('One report archive required');
  const archive = path.join(directory, zipEntries[0].name);
  const stat = fs.lstatSync(archive);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size < 22 || stat.size > 2 * 1024 ** 3) {
    throw Error('Unexpected report archive');
  }
  const prefix = Buffer.alloc(4);
  const fd = fs.openSync(archive, 'r');
  try { if (fs.readSync(fd, prefix, 0, 4, 0) !== 4) throw Error('Short archive'); }
  finally { fs.closeSync(fd); }
  if (!prefix.equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) throw Error('Unexpected archive header');
  const result = {checkpoint, privateReportSaved: true,
    archiveHeaderRecognized: true, archiveContentReviewed: false, hciIncluded: null,
    rawConsoleOutputSaved: false, bluetoothOperationRequested: false,
    watchCommandRequested: false, logConfigurationChanged: false,
    phoneDiagnosticFilesMayBeWritten: true};
  fs.writeFileSync(path.join(directory, 'collection-review.json'), JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
  return result;
}
function trustedRun(args, timeout) {
  const sdk = path.join(root, 'tools/local/android-build/sdk/platform-tools');
  const pins = {
    'adb.exe': 'b4a6b455702684652cccf7b46258b29e653538904359a58fd4931cf3ef286b3f',
    'AdbWinApi.dll': 'c1d653030b4bde65d3e07e4d0b0979e17be56df1436cdd15528630f27808050d',
    'AdbWinUsbApi.dll': '0710e894d9b40f71a670c13c694079d564c92c1279da382cfe4850983aaebe1b'
  };
  for (const [name, pin] of Object.entries(pins)) {
    const file = path.join(sdk, name);
    if (fs.lstatSync(file).isSymbolicLink() || createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== pin) {
      throw Error('SDK binary changed');
    }
  }
  return spawnSync(path.join(sdk, 'adb.exe'), args, {cwd: sdk, shell: false, windowsHide: true,
    encoding: 'utf8', timeout, maxBuffer: maxOutput});
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  if (['plan', 'plan-capture'].includes(action) && [2, 3].includes(process.argv.length)) {
    console.log(JSON.stringify({executionPerformed: false, userDecisionRequired: true,
      commands: [['-d', 'get-state'], ['-d', 'bugreport', action === 'plan-capture' ? 'tools/local/phone-hci-r136' : 'tools/local/phone-hci-r134']],
      reportContainsOtherPhoneDiagnostics: true, watchCommandRequested: false,
      bluetoothOperationRequested: false, logConfigurationChanged: false}));
  } else if (['collect', 'collect-capture'].includes(action) && process.argv.length === 3) {
    try { console.log(JSON.stringify(collectPhoneReport(trustedRun,
      action === 'collect-capture' ? path.join(root, 'tools/local/phone-hci-r136') : destination,
      action === 'collect-capture' ? 'R136' : 'R134'))); }
    catch {
      console.error('Private report collection refused or failed. Do not share raw output or retry; private partial files may remain.');
      process.exitCode = 1;
    }
  } else { console.error('Use plan, collect, plan-capture or collect-capture'); process.exitCode = 1; }
}
