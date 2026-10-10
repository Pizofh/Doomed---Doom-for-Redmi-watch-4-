// User-run, bounded read of existing native Bluetooth logs. No raw output retained.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ownPackage = 'nodomain.freeyourgadget.gadgetbridge.rw4diagnostic';
const maxBytes = 2 * 1024 * 1024;
const maxRows = 2000;
const tags = ['bluetooth', 'bt_btif_sock', 'bt_btif_sock_rfcomm'];
const logArgs = ['-d', 'shell', 'logcat', '-b', 'main', '-b', 'system', '-d', '-t', String(maxRows),
  '-v', 'brief', ...tags.map(tag => tag + ':V'), '*:S'];
const portNames = Object.freeze({
  0: 'PORT_SUCCESS', 1: 'PORT_UNKNOWN_ERROR', 2: 'PORT_ALREADY_OPENED', 3: 'PORT_CMD_PENDING',
  4: 'PORT_APP_NOT_REGISTERED', 5: 'PORT_NO_MEM', 6: 'PORT_NO_RESOURCES', 7: 'PORT_BAD_BD_ADDR',
  9: 'PORT_BAD_HANDLE', 10: 'PORT_NOT_OPENED', 11: 'PORT_LINE_ERR', 12: 'PORT_START_FAILED',
  13: 'PORT_PAR_NEG_FAILED', 14: 'PORT_PORT_NEG_FAILED', 15: 'PORT_SEC_FAILED',
  16: 'PORT_PEER_CONNECTION_FAILED', 17: 'PORT_PEER_FAILED', 18: 'PORT_PEER_TIMEOUT',
  19: 'PORT_CLOSED', 20: 'PORT_TX_FULL', 21: 'PORT_LOCAL_CLOSED', 22: 'PORT_LOCAL_TIMEOUT',
  23: 'PORT_TX_QUEUE_DISABLED', 24: 'PORT_PAGE_TIMEOUT', 25: 'PORT_INVALID_SCN'
});
const failureNames = ['CLIENT_INIT_FAILURE', 'OPEN_EVENT_FAILURE', 'SDP_DISCOVERY_FAILURE', 'SEND_CHANNEL_FAILURE'];
function bounded(text) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > maxBytes ||
      /Permission Denial|SecurityException|Unknown command|Can't find service|logcat:.*(?:denied|failed)/i.test(text)) {
    throw Error('Unsupported or denied read');
  }
  return text;
}
export function summarizeRfcommLogs(text, ownUid) {
  if (!Number.isSafeInteger(ownUid) || ownUid < 0 || ownUid > 2147483647) throw Error('Unknown app owner');
  const rows = bounded(text).split(/\r?\n/);
  const parsed = [];
  let nonemptyRows = 0;
  for (const line of rows) {
    if (!line.trim() || /^--------- beginning of /.test(line)) continue;
    if (++nonemptyRows > maxRows || line.length > 32768) throw Error('Unexpected log window');
    const match = line.match(/^([VDIWEF])\/([A-Za-z0-9_.-]+)\s*\(\s*(\d{1,10})\):\s*(.*)$/);
    if (match && tags.includes(match[2])) parsed.push({pid: match[3], message: match[4]});
  }
  const ownClosures = [];
  const portCounts = Object.fromEntries(Object.values(portNames).map(name => [name, 0]));
  const candidateFailures = Object.fromEntries(failureNames.map(name => [name, 0]));
  for (let i = 0; i < parsed.length; i++) {
    const {pid, message} = parsed[i];
    if (message.includes('disconnected from RFCOMM socket connections for device:')) {
      const owner = message.match(/app_uid:\s*(\d{1,10}),\s*slot_id:\s*(\d{1,10}),\s*socket_id:\s*\d{1,20}(?:\s|$)/);
      if (owner && Number(owner[1]) === ownUid) ownClosures.push({i, pid, slot: owner[2]});
    }
    // Never interpret bitmask codes from the similarly named event callback.
    if (/\bbta_jv_port_mgmt_cl_cback\b/.test(message)) {
      const code = message.match(/\bcode=(PORT_[A-Z_]+|\d{1,2})(?=[,\s]|$)/)?.[1];
      const name = /^\d+$/.test(code ?? '') ? portNames[Number(code)] :
        Object.values(portNames).includes(code) ? code : null;
      if (name) portCounts[name]++;
    }
  }
  for (let i = 0; i < parsed.length; i++) {
    const {pid, message} = parsed[i];
    let name = null, slot = null;
    const patterns = [
      ['CLIENT_INIT_FAILURE', /INIT unsuccessful, status [^\r\n]*?\. Cleaning up slot_id\s+(\d{1,10})(?:\s|$)/],
      ['OPEN_EVENT_FAILURE', /CONNECT unsuccessful, status [^\r\n]*?\. Cleaning up slot_id\s+(\d{1,10})(?:\s|$)/],
      ['SDP_DISCOVERY_FAILURE', /SDP service discovery completed for slot_id:\s*(\d{1,10})\s+with the result status:/],
      ['SEND_CHANNEL_FAILURE', /send_app_scn\(\) failed, closing slot_id\s*:?\s*(\d{1,10})(?:\s|$)/]
    ];
    for (const [label, pattern] of patterns) {
      const match = message.match(pattern);
      if (match) { name = label; slot = match[1]; break; }
    }
    // Candidate correlation only: IDs can be reused, and this cannot date the r131 attempt.
    if (name && ownClosures.some(close => close.pid === pid && close.slot === slot && close.i > i && close.i - i <= 64)) {
      candidateFailures[name]++;
    }
  }
  return {nativeHeadersObserved: parsed.length > 0, ownCloseMarkers: ownClosures.length,
    candidateFailuresByOwnSlot: candidateFailures, portResultsWithoutAppAttribution: portCounts,
    attemptR131AttributionVerified: false, socketCurrentlyOpenVerified: false,
    absenceDoesNotDisproveFailure: true, bufferWindowLimited: true};
}

export function inspectRfcommLogs(run) {
  function read(args) {
    const reply = run([...args]);
    if (!reply || reply.error || reply.status !== 0) throw Error('USB read failed');
    return bounded(reply.stdout);
  }
  if (read(['-d', 'get-state']).trim() !== 'device') throw Error('One authorized USB phone required');
  const user = read(['-d', 'shell', 'am', 'get-current-user']).trim();
  if (!/^\d{1,5}$/.test(user)) throw Error('Unsupported Android user');
  const packages = read(['-d', 'shell', 'cmd', 'package', 'list', 'packages', '-U', '--user', user, ownPackage]);
  const matches = packages.split(/\r?\n/).map(line => line.match(
    /^package:nodomain\.freeyourgadget\.gadgetbridge\.rw4diagnostic uid:(\d{1,10})\s*$/)).filter(Boolean);
  if (matches.length !== 1) throw Error('Own app UID not established');
  const uid = Number(matches[0][1]);
  // Read only existing main/system ring buffers; no clear, enable, stream or bugreport.
  return summarizeRfcommLogs(read(logArgs), uid);
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
  return spawnSync(path.join(sdk, 'adb.exe'), args, {cwd: sdk, shell: false, windowsHide: true,
    encoding: 'utf8', timeout: 30000, maxBuffer: maxBytes});
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const action = process.argv[2] ?? 'plan';
  if (action === 'plan' && [2, 3].includes(process.argv.length)) {
    console.log(JSON.stringify({executionPerformed: false, commands: [
      ['-d', 'get-state'], ['-d', 'shell', 'am', 'get-current-user'],
      ['-d', 'shell', 'cmd', 'package', 'list', 'packages', '-U', '--user', 'CURRENT_USER', ownPackage], logArgs
    ], rawOutputSaved: false, bluetoothOperationRequested: false, logConfigurationChanged: false}));
  } else if (action === 'collect' && process.argv.length === 3) {
    try {
      console.log(JSON.stringify({checkpoint: 'R132', ...inspectRfcommLogs(trustedRun),
        rawOutputSaved: false, bluetoothOperationRequested: false, watchCommandRequested: false,
        logConfigurationChanged: false}));
    } catch {
      console.error('Existing-log review refused or failed. No raw logs, radio action or fallback performed.');
      process.exitCode = 1;
    }
  } else { console.error('Use plan or collect'); process.exitCode = 1; }
}
