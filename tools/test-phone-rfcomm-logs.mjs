// Synthetic buffers only. No ADB, phone or radio executed.
import assert from 'node:assert/strict';
import {inspectRfcommLogs, summarizeRfcommLogs} from './phone-rfcomm-logs.mjs';
const uid = 105321;
const log = (message, pid = 43000, tag = 'bt_btif_sock_rfcomm') => `I/${tag}( ${pid}): ${message}\n`;
const close = (owner = uid, slot = 91234) => log(`disconnected from RFCOMM socket connections for device: AA:BB:CC:DD:EE:FF, scn: 7, app_uid: ${owner}, slot_id: ${slot}, socket_id: 99887766`);
const fixture = log('CONNECT unsuccessful, status FAILURE. Cleaning up slot_id 91234') + close() +
  log('bta_jv_act.cc: bta_jv_port_mgmt_cl_cback code=15, port_handle=56432', 43000, 'bluetooth') +
  log('bta_jv_act.cc: bta_jv_port_mgmt_cl_cback code=PORT_PEER_TIMEOUT, port_handle=56432', 43000, 'bluetooth') +
  log('bta_jv_port_event_cl_cback code=15, private-key=never-export-me', 43000, 'bluetooth');
const report = summarizeRfcommLogs(fixture, uid);
assert.equal(report.ownCloseMarkers, 1);
assert.equal(report.candidateFailuresByOwnSlot.OPEN_EVENT_FAILURE, 1);
assert.equal(report.portResultsWithoutAppAttribution.PORT_SEC_FAILED, 1);
assert.equal(report.portResultsWithoutAppAttribution.PORT_PEER_TIMEOUT, 1);
assert.equal(report.attemptR131AttributionVerified, false);
assert.equal(report.socketCurrentlyOpenVerified, false);
for (const secret of ['105321', '43000', '91234', '99887766', '56432', 'AA:BB', 'private-key', 'never-export-me']) {
  assert.equal(JSON.stringify(report).includes(secret), false);
}
assert.equal(summarizeRfcommLogs(fixture, uid + 1).ownCloseMarkers, 0);
assert.equal(summarizeRfcommLogs(fixture, uid + 1).candidateFailuresByOwnSlot.OPEN_EVENT_FAILURE, 0);
assert.equal(summarizeRfcommLogs(log('CONNECT unsuccessful, status FAILURE. Cleaning up slot_id 91234', 123) + close(), uid).candidateFailuresByOwnSlot.OPEN_EVENT_FAILURE, 0);
assert.equal(summarizeRfcommLogs(close() + log('CONNECT unsuccessful, status FAILURE. Cleaning up slot_id 91234'), uid).candidateFailuresByOwnSlot.OPEN_EVENT_FAILURE, 0);
assert.equal(summarizeRfcommLogs(log('CONNECT unsuccessful, status FAILURE. Cleaning up slot_id 91234') + log('other').repeat(65) + close(), uid).candidateFailuresByOwnSlot.OPEN_EVENT_FAILURE, 0);
assert.equal(summarizeRfcommLogs('unrecognized vendor format secret-value\n', uid).nativeHeadersObserved, false);
assert.equal(summarizeRfcommLogs('', uid).ownCloseMarkers, 0);
assert.equal(summarizeRfcommLogs(log('bta_jv_port_mgmt_cl_cback code=8, port_handle=1', 1, 'bluetooth'), uid).portResultsWithoutAppAttribution.PORT_SEC_FAILED, 0);
assert.equal(summarizeRfcommLogs(fixture.replaceAll('bt_btif_sock_rfcomm', 'other-tag'), uid).ownCloseMarkers, 0);
for (const [message, category] of [
  ['INIT unsuccessful, status FAILURE. Cleaning up slot_id 91234', 'CLIENT_INIT_FAILURE'],
  ['SDP service discovery completed for slot_id: 91234 with the result status: FAILURE, scn: 0', 'SDP_DISCOVERY_FAILURE'],
  ['send_app_scn() failed, closing slot_id 91234', 'SEND_CHANNEL_FAILURE']
]) {
  assert.equal(summarizeRfcommLogs(log(message) + close(), uid).candidateFailuresByOwnSlot[category], 1);
  assert.equal(summarizeRfcommLogs(log(message) + close(uid, 999), uid).candidateFailuresByOwnSlot[category], 0);
}
assert.throws(() => summarizeRfcommLogs('Permission Denial secret-value', uid));
assert.throws(() => summarizeRfcommLogs('x'.repeat(2 * 1024 * 1024 + 1), uid));
assert.throws(() => summarizeRfcommLogs(log('other').repeat(2001), uid));
assert.throws(() => summarizeRfcommLogs('', -1));
const calls = [];
const replies = ['device', '0', `package:nodomain.freeyourgadget.gadgetbridge.rw4diagnostic uid:${uid}\n`, fixture];
assert.deepEqual(inspectRfcommLogs(args => { calls.push(args); return {status: 0, stdout: replies[calls.length - 1]}; }), report);
assert.deepEqual(calls, [
  ['-d', 'get-state'], ['-d', 'shell', 'am', 'get-current-user'],
  ['-d', 'shell', 'cmd', 'package', 'list', 'packages', '-U', '--user', '0', 'nodomain.freeyourgadget.gadgetbridge.rw4diagnostic'],
  ['-d', 'shell', 'logcat', '-b', 'main', '-b', 'system', '-d', '-t', '2000', '-v', 'brief', 'bluetooth:V', 'bt_btif_sock:V', 'bt_btif_sock_rfcomm:V', '*:S']
]);
assert.throws(() => inspectRfcommLogs(() => ({status: 1, stdout: 'private-key'})));
let step = 0;
assert.throws(() => inspectRfcommLogs(() => ({status: 0, stdout: ['device', '0', 'package:other.app uid:105321'][step++]})));
console.log('PASS: existing-log read only, exact app owner, bounded candidate correlation, unattributed port codes, unknown/denied formats and privacy canaries; no real ADB.');
