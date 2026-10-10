// User-run USB inspection. No raw dumps retained, app launch or radio commands.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const remotePackage = 'com.xiaomi.mi_connect_service';
const localPackage = 'com.xiaomi.wearable';
const commands = Object.freeze([
  ['-d', 'get-state'],
  ['-d', 'shell', 'am', 'get-current-user'],
  ['-d', 'shell', 'dumpsys', 'activity', 'services', remotePackage],
  ['-d', 'shell', 'dumpsys', 'activity', 'services', localPackage],
  ['-d', 'shell', 'dumpsys', 'package', 'com.xiaomi.wearable']
]);
const maxBytes = 2 * 1024 * 1024;
function bounded(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > maxBytes ||
      /Permission Denial|SecurityException|Unknown command|Can't find service/i.test(text)) {
    throw Error('Unsupported or denied state read');
  }
  return text;
}
export function summarizeServiceState(serviceText, user, packageName) {
  if (!Number.isInteger(user) || user < 0 || user > 99999) throw Error('Invalid user response');
  if (![remotePackage, localPackage].includes(packageName)) throw Error('Unknown fixed package');
  const lines = bounded(serviceText).split(/\r?\n/);
  const headerRecognized = lines.some(line => /^ACTIVITY MANAGER SERVICES\b/.test(line.trim()));
  const explicitNothing = lines.some(line => /^\s*\(nothing\)\s*$/.test(line));
  let activeUser = null, selected = false, count = 0, assigned = 0, nullApp = 0;
  let activeSections = 0, parsedActiveRecords = 0, unparsedRecordLines = 0, otherUserCoreRecords = 0;
  for (const line of lines) {
    if (line.length > 32768) throw Error('Unexpected state line');
    const header = line.match(/^\s*User (\d+) active services:\s*$/);
    if (header) { activeUser = Number(header[1]); activeSections++; selected = false; continue; }
    // Never count restarting, pending, destroying or connection-table records.
    if (/^\s*(?:Restarting|Pending|Destroying|Connection bindings to|Delayed start of|Starting background).*services?:?/i.test(line)) {
      activeUser = null; selected = false;
    }
    if (/^\s*\* ServiceRecord\{/.test(line)) {
      selected = false;
      const record = line.match(/^\s*\* ServiceRecord\{[0-9a-f]+ u(\d+) ([A-Za-z0-9_.$]+)\/([A-Za-z0-9_.$]+)(?:\s[^}]*)?\}\s*$/i);
      if (!record) { unparsedRecordLines++; continue; }
      if (activeUser === null || Number(record[1]) !== activeUser) continue;
      parsedActiveRecords++;
      const cls = record[3].startsWith('.') ? record[2] + record[3] : record[3];
      const isCore = record[2] === packageName && cls === 'com.xiaomi.wearable.core.MiWearCoreService';
      if (isCore && activeUser !== user) otherUserCoreRecords++;
      selected = headerRecognized && activeUser === user && isCore;
      if (selected) count++;
      continue;
    }
    if (selected && /^\s*app=ProcessRecord\{[^\r\n]*\}\s*$/.test(line)) assigned++;
    if (selected && /^\s*app=null\s*$/.test(line)) nullApp++;
  }
  const formatRecognized = headerRecognized && unparsedRecordLines === 0 &&
    (explicitNothing || activeSections > 0 && parsedActiveRecords > 0);
  return {headerRecognized, serviceFormatRecognized: formatRecognized, explicitNothing,
    activeSections, parsedActiveRecords, unparsedRecordLines, otherUserCoreRecords,
    activeCoreRecords: formatRecognized ? count : null,
    coreProcessRecord: formatRecognized && count === 1 && assigned === 1 && nullApp === 0 ? 'assigned' :
      formatRecognized && count === 1 && nullApp === 1 && assigned === 0 ? 'null' : 'not-established'};
}
export function summarizePhoneCoreState(serviceText, packageText, user, localText = null) {
  const remote = summarizeServiceState(serviceText, user, remotePackage);
  const local = localText === null ? null : summarizeServiceState(localText, user, localPackage);
  const pkgLines = bounded(packageText).split(/\r?\n/);
  const pkgRecognized = pkgLines.some(line => /^\s*Package \[com\.xiaomi\.wearable\] \(/.test(line));
  const statuses = pkgLines.filter(line => new RegExp('^\\s*User ' + user + ':').test(line))
    .map(line => line.match(/\bstopped=(true|false)\b/)?.[1]).filter(Boolean);
  const stopped = pkgRecognized && statuses.length === 1 ? statuses[0] === 'true' : null;
  return {remote, local, miFitnessStopped: stopped, currentWatchSocketVerified: false};
}
export function inspectPhoneCoreState(run) {
  function read(args) {
    const reply = run([...args]);
    if (!reply || reply.error || reply.status !== 0) throw Error('USB inspection failed');
    return bounded(reply.stdout);
  }
  if (read(commands[0]).trim() !== 'device') throw Error('One authorized USB phone required');
  const userText = read(commands[1]).trim();
  if (!/^\d{1,5}$/.test(userText)) throw Error('Unsupported current-user response');
  const remote = read(commands[2]), local = read(commands[3]), pkg = read(commands[4]);
  return summarizePhoneCoreState(remote, pkg, Number(userText), local);
}
function trustedRun(args) {
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
  return spawnSync(path.join(sdk, 'adb.exe'), args, {cwd: sdk, shell: false,
    windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: maxBytes});
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  const label = process.argv[3];
  if (action === 'plan' && [2, 3].includes(process.argv.length)) {
    console.log(JSON.stringify({executionPerformed: false, commands,
      rawOutputSaved: false, automaticAppStop: false, bluetoothOperationRequested: false}));
  } else if (action === 'collect' && ['baseline', 'stopped'].includes(label) && process.argv.length === 4) {
    try {
      const report = {checkpoint: 'R126', label, ...inspectPhoneCoreState(trustedRun),
        rawOutputSaved: false, bluetoothOperationRequested: false, watchCommandRequested: false};
      // Emit only the fixed-schema summary; the caller may save it locally if desired.
      console.log(JSON.stringify(report));
    } catch {
      console.error('State inspection refused or failed. Check USB authorization; no raw output, fallback or settings change performed.');
      process.exitCode = 1;
    }
  } else { console.error('Use plan or collect baseline|stopped'); process.exitCode = 1; }
}
