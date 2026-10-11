// User-manual USB configuration reads. No watch command, logging change or radio API.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxBytes = 65536;
const configPaths = ['/vendor/etc/bluetooth/bt_stack.conf',
  '/system/etc/bluetooth/bt_stack.conf', '/etc/bluetooth/bt_stack.conf'];
function bounded(reply) {
  if (!reply || reply.error || typeof reply.stdout !== 'string' ||
      typeof reply.stderr !== 'string' || Buffer.byteLength(reply.stdout) > maxBytes ||
      Buffer.byteLength(reply.stderr) > maxBytes) throw Error('Unsupported USB response');
  return reply;
}
export function classifySnoopPath(value) {
  if (value === '') return 'UNSET';
  if (value === '/data/misc/bluetooth/logs/btsnoop_hci.log') return 'AOSP_DEFAULT';
  if (/^\/data\/vendor\/bluetooth\/[A-Za-z0-9_.\/-]+$/.test(value) && !value.split('/').includes('..')) return 'VENDOR_BLUETOOTH';
  if (/^\/(?:sdcard|storage\/emulated\/\d+)\/[A-Za-z0-9_.\/-]+$/.test(value) && !value.split('/').includes('..')) return 'SHARED_STORAGE';
  return 'OTHER_UNEXPORTED';
}
export function summarizeStackConfig(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > maxBytes) throw Error('Oversized config');
  const paths = new Set(), output = new Set();
  let pathRows = 0, outputRows = 0;
  for (const line of text.split(/\r?\n/)) {
    // Stack config only; never inspect bt_config.conf (pairing keys/devices).
    const pathMatch = line.match(/^\s*BtSnoopFileName\s*=\s*([^\r\n]*)$/i);
    const enabledMatch = line.match(/^\s*BtSnoopLogOutput\s*=\s*(true|false)\s*$/i);
    if (pathMatch) { pathRows++; paths.add(classifySnoopPath(pathMatch[1].trim())); }
    if (enabledMatch) { outputRows++; output.add(enabledMatch[1].toLowerCase()); }
  }
  return {pathRows, pathCategory: paths.size === 1 ? [...paths][0] : paths.size ? 'CONFLICT' : 'NOT_DECLARED',
    outputRows, outputDeclared: output.size === 1 ? [...output][0] : output.size ? 'CONFLICT' : 'NOT_DECLARED'};
}
export function inspectBluetoothConfig(run) {
  function required(args) {
    const reply = bounded(run(args));
    if (reply.status !== 0) throw Error('USB read failed');
    return reply.stdout.trim();
  }
  if (required(['-d', 'get-state']) !== 'device') throw Error('One authorized phone required');
  const build = required(['-d', 'shell', 'getprop', 'ro.build.type']);
  const mode = required(['-d', 'shell', 'getprop', 'persist.bluetooth.btsnooplogmode']);
  const logPath = required(['-d', 'shell', 'getprop', 'persist.bluetooth.btsnooppath']);
  const configs = [];
  for (let index = 0; index < configPaths.length; index++) {
    const reply = bounded(run(['-d', 'shell', 'cat', configPaths[index]]));
    if (reply.status === 0) configs.push({candidate: index + 1, status: 'READ', ...summarizeStackConfig(reply.stdout)});
    else {
      const error = reply.stderr + reply.stdout;
      const status = /Permission denied|Permission Denial|Operation not permitted/i.test(error) ? 'DENIED' :
        /No such file|not found/i.test(error) ? 'NOT_FOUND' : 'READ_FAILED';
      configs.push({candidate: index + 1, status});
    }
  }
  return {checkpoint: 'R141', buildType: ['user', 'userdebug', 'eng'].includes(build) ? build : 'UNRECOGNIZED',
    configuredSnoopMode: ['disabled', 'full', 'filtered', 'kernel'].includes(mode) ? mode : mode === '' ? 'UNSET' : 'UNRECOGNIZED',
    legacyPathProperty: classifySnoopPath(logPath), configs,
    effectiveLoggingVerified: false, activeOutputPathVerified: false,
    rawOutputSaved: false, bluetoothOperationRequested: false, watchCommandRequested: false,
    logConfigurationChanged: false};
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
    if (fs.lstatSync(file).isSymbolicLink() || createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== pin) throw Error('SDK binary changed');
  }
  return spawnSync(path.join(sdk, 'adb.exe'), args, {cwd: sdk, shell: false,
    windowsHide: true, encoding: 'utf8', timeout: 15000, maxBuffer: maxBytes});
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  if (action === 'plan' && [2, 3].includes(process.argv.length)) {
    console.log(JSON.stringify({executionPerformed: false, commands: [['-d', 'get-state'],
      ...['ro.build.type', 'persist.bluetooth.btsnooplogmode', 'persist.bluetooth.btsnooppath'].map(key => ['-d', 'shell', 'getprop', key]),
      ...configPaths.map(file => ['-d', 'shell', 'cat', file])],
      rawOutputSaved: false, watchCommandRequested: false, logConfigurationChanged: false}));
  } else if (action === 'collect' && process.argv.length === 3) {
    try { console.log(JSON.stringify(inspectBluetoothConfig(trustedRun))); }
    catch { console.error('Bluetooth configuration read failed; no raw output, configuration change or retry performed.'); process.exitCode = 1; }
  } else { console.error('Use plan or collect'); process.exitCode = 1; }
}
