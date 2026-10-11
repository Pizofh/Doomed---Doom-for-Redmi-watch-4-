// Offline parent tests; fake process streams, no child or native API created.
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {sanitizeWorker, supervise, validateTarget} from './pc-rfcomm-supervisor.mjs';

const good = {checkpoint: 'R154', simulated: false, outcome: 'Opened', elapsedMs: 20,
  startRequests: 1, closeConfirmed: true, physicalEnabled: true,
  bluetoothOperationRequested: true, watchCommandRequested: false};
const target = {address: 'AA:BB:CC:DD:EE:01', model: 'M2315W1', firmware: '2.2.86', reviewedPlan: 'R154'};
assert.equal(validateTarget(target), 'AABBCCDDEE01');
for (const patch of [{address: 'PRIVATE-CANARY'}, {address: '00:00:00:00:00:00'},
  {model: 'OTHER'}, {firmware: 'OTHER'}, {reviewedPlan: 'OTHER'}, {key: 'PRIVATE-CANARY'}])
  assert.throws(() => validateTarget({...target, ...patch}));
assert.deepEqual(sanitizeWorker(JSON.stringify(good)), good);
for (const patch of [{raw: 'PRIVATE-CANARY'}, {outcome: 'PRIVATE-CANARY'},
  {elapsedMs: -1}, {startRequests: 2}, {watchCommandRequested: true}])
  assert.throws(() => sanitizeWorker(JSON.stringify({...good, ...patch})));

function fakeSpawn(scenario) {
  return (exe, argv, options) => {
    assert.deepEqual(argv, ['worker-reviewed-r154']);
    assert.equal(options.shell, false); assert.equal(options.windowsHide, true);
    const child = new EventEmitter();
    child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.stdin = new PassThrough();
    let input = ''; child.stdin.on('data', chunk => input += chunk);
    child.kill = signal => {
      assert.equal(signal, 'SIGKILL');
      if (scenario === 'unkillable') return false;
      queueMicrotask(() => child.emit('close', null)); return true;
    };
    child.stdin.on('finish', () => {
      assert.equal(input, 'AABBCCDDEE01\n');
      if (scenario === 'hang' || scenario === 'unkillable') return;
      queueMicrotask(() => {
        child.stderr.write('PRIVATE-CANARY');
        if (scenario === 'cancel') { process.emit('SIGINT'); return; }
        if (scenario === 'launch') { child.emit('error', Error('PRIVATE-CANARY')); return; }
        if (scenario === 'excess') { child.stdout.write('PRIVATE-CANARY'.repeat(2000)); return; }
        const report = scenario === 'reject'
          ? {checkpoint: 'R154', preflight: 'NotBonded', bluetoothOperationRequested: false, watchCommandRequested: false}
          : scenario === 'invalid' ? {raw: 'PRIVATE-CANARY'}
          : {...good, closeConfirmed: scenario !== 'close-failure'};
        child.stdout.write(JSON.stringify(report));
        child.emit('close', scenario === 'reject' ? 2 : scenario === 'close-failure' ? 1 : scenario === 'exit-mismatch' ? 1 : 0);
      });
    });
    return child;
  };
}
for (const scenario of ['success','reject','close-failure','invalid','exit-mismatch','excess','launch','hang','cancel','unkillable']) {
  const report = await supervise('FAKE-NO-EXECUTABLE', 'AABBCCDDEE01',
    {spawnWorker: fakeSpawn(scenario), deadlineMs: 20});
  assert.equal(report.workerExitConfirmed, scenario !== 'unkillable');
  assert.equal(JSON.stringify(report).includes('PRIVATE-CANARY'), false);
  assert.equal(JSON.stringify(report).includes('AABBCCDDEE01'), false);
  if (scenario === 'success') assert.equal(report.closeConfirmed, true);
  else if (scenario === 'reject') assert.equal(report.preflight, 'NotBonded');
  else if (scenario === 'close-failure') assert.equal(report.closeConfirmed, false);
  else assert.equal(report.supervisor, scenario === 'hang' || scenario === 'unkillable' ? 'Deadline' :
    scenario === 'cancel' ? 'Cancelled' :
    scenario === 'excess' ? 'OutputRefused' : scenario === 'launch' ? 'LaunchFailed' : 'ReportRefused');
}
assert.equal(process.listenerCount('SIGINT'), 0);
console.log(JSON.stringify({checkpoint: 'R154', supervisorTestsPassed: true,
  scenarios: 10, nativeSocketCalls: 0, bluetoothOperationRequested: false}));
