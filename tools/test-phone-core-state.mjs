// Synthetic replies only. Never starts ADB or touches a phone/watch.
import assert from 'node:assert/strict';
import {inspectPhoneCoreState, summarizePhoneCoreState} from './phone-core-state.mjs';
const component = 'com.xiaomi.mi_connect_service/com.xiaomi.wearable.core.MiWearCoreService';
const services = 'ACTIVITY MANAGER SERVICES (dumpsys activity services)\n' +
  '  User 0 active services:\n  * ServiceRecord{abc u0 ' + component + '}\n' +
  '    app=ProcessRecord{canary 543:private-process/u0s1000}\n' +
  '    intent=Intent { private-key=never-export-me MAC=AA:BB:CC:DD:EE:FF }\n';
const pkg = stopped => 'Packages:\n  Package [com.xiaomi.wearable] (abc):\n' +
  '    User 0: installed=true stopped=' + stopped + ' hidden=false\n';
const assigned = summarizePhoneCoreState(services, pkg(true), 0);
assert.equal(assigned.activeCoreRecords, 1);
assert.equal(assigned.coreProcessRecord, 'assigned');
assert.equal(assigned.miFitnessStopped, true);
assert.equal(assigned.currentWatchSocketVerified, false);
assert.equal(summarizePhoneCoreState(services, pkg(false), 0).miFitnessStopped, false);
assert.equal(summarizePhoneCoreState(services.replace(/app=ProcessRecord\{[^\n]+/, 'app=null'), pkg(false), 0).coreProcessRecord, 'null');
assert.equal(summarizePhoneCoreState(services.replace('User 0 active services:', 'Restarting services:'), pkg(true), 0).activeCoreRecords, 0);
assert.equal(summarizePhoneCoreState(services.replace('User 0 active services:', 'User 10 active services:'), pkg(true), 0).activeCoreRecords, 0);
assert.equal(summarizePhoneCoreState('unrecognized vendor format', pkg(true), 0).activeCoreRecords, null);
assert.equal(summarizePhoneCoreState(services, 'unrecognized', 0).miFitnessStopped, null);
assert.equal(summarizePhoneCoreState(services, pkg(true) + '    User 0: stopped=false\n', 0).miFitnessStopped, null);
for (const secret of ['canary', '543', 'private-process', 'never-export-me', 'AA:BB', 'u0s1000']) {
  assert.equal(JSON.stringify(assigned).includes(secret), false);
}
assert.throws(() => summarizePhoneCoreState('Permission Denial', pkg(true), 0));
assert.throws(() => summarizePhoneCoreState('x'.repeat(2 * 1024 * 1024 + 1), pkg(true), 0));
const calls = [];
const replies = ['device', '0', services, pkg(true)];
assert.deepEqual(inspectPhoneCoreState(args => {
  calls.push(args); return {status: 0, stdout: replies[calls.length - 1]};
}), assigned);
assert.deepEqual(calls, [
  ['-d', 'get-state'], ['-d', 'shell', 'am', 'get-current-user'],
  ['-d', 'shell', 'dumpsys', 'activity', 'services', component],
  ['-d', 'shell', 'dumpsys', 'package', 'com.xiaomi.wearable']
]);
assert.throws(() => inspectPhoneCoreState(() => ({status: 0, stdout: 'unauthorized'})));
assert.throws(() => inspectPhoneCoreState(() => ({status: 1, stdout: 'secret-error'})));
console.log('PASS: fixed USB reads, active-section parsing, stopped state, privacy canaries, bounds and refusal; no real ADB executed.');
