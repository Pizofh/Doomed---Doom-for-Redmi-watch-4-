// Parent bounds the PC worker even if native Start/Poll/Close blocks.
import {spawn} from 'node:child_process';

const outcomes = new Set(['Pending', 'Opened', 'Deadline', 'Cancelled', 'GateClosed',
  'AuthenticationOrAccess', 'RadioTimeout', 'Disconnected', 'ChannelInUse', 'Resources',
  'DriverOrArgument', 'NativeFailure', 'LocalFailure']);
const preflights = new Set(['InvalidTarget', 'LayoutRefused', 'NoRadio', 'MultipleRadios',
  'CacheLookupFailed', 'NotBonded', 'WrongName', 'CleanupFailed', 'LocalFailure']);
export function sanitizeWorker(text) {
  const value = JSON.parse(text.trim());
  if (value.checkpoint !== 'R154' || value.watchCommandRequested !== false) throw Error('Invalid report');
  if (preflights.has(value.preflight) && value.bluetoothOperationRequested === false &&
      Object.keys(value).length === 4) return value;
  if (Object.keys(value).length !== 9 || !outcomes.has(value.outcome) ||
      value.simulated !== false || value.physicalEnabled !== true ||
      typeof value.closeConfirmed !== 'boolean' || typeof value.bluetoothOperationRequested !== 'boolean' ||
      !Number.isInteger(value.elapsedMs) || value.elapsedMs < 0 || value.elapsedMs > 30000 ||
      value.startRequests !== 1 || value.bluetoothOperationRequested !== true) throw Error('Invalid report');
  return value;
}
export function validateTarget(value) {
  if (!value || Object.keys(value).sort().join(',') !== 'address,firmware,model,reviewedPlan' ||
      value.model !== 'M2315W1' || value.firmware !== '2.2.86' || value.reviewedPlan !== 'R154' ||
      typeof value.address !== 'string' || !/^(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(value.address))
    throw Error('Target refused');
  const address = value.address.replaceAll(':', '');
  if (/^0{12}$/.test(address)) throw Error('Target refused');
  return address;
}
export async function supervise(executable, address, {deadlineMs = 30000, spawnWorker = spawn} = {}) {
  const child = spawnWorker(executable, ['worker-reviewed-r154'],
    {stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell: false});
  return await new Promise(resolve => {
    let stdout = '', settled = false, forced = null, deadline, fallback;
    const finish = result => {
      if (settled) return;
      settled = true; clearTimeout(deadline); clearTimeout(fallback);
      process.removeListener('SIGINT', cancel);
      resolve(result);
    };
    const abort = reason => {
      if (settled || forced) return;
      forced = reason;
      try { child.kill('SIGKILL'); } catch {}
      fallback = setTimeout(() => finish({checkpoint: 'R154', supervisor: reason,
        workerExitConfirmed: false, workerPid: child.pid ?? null, closeConfirmed: false,
        bluetoothOperationRequested: null, watchCommandRequested: false}), 1000);
    };
    const cancel = () => abort('Cancelled');
    process.on('SIGINT', cancel);
    child.stdout.on('data', chunk => {
      if (settled || forced) return;
      stdout += chunk.toString('utf8').slice(0, 16385);
      if (stdout.length > 16384) abort('OutputRefused');
    });
    child.stderr.resume(); // Never print or persist raw worker/OS errors.
    child.stdout.on('error', () => abort('OutputRefused'));
    child.stderr.on('error', () => {});
    child.stdin.on('error', () => abort('InputFailed'));
    child.on('error', () => abort('LaunchFailed'));
    child.on('close', code => {
      if (forced) return finish({checkpoint: 'R154', supervisor: forced,
        workerExitConfirmed: true, closeConfirmed: false,
        bluetoothOperationRequested: null, watchCommandRequested: false});
      try {
        const report = sanitizeWorker(stdout);
        const expected = report.preflight ? 2 : report.outcome === 'Opened' && report.closeConfirmed ? 0 : 1;
        if (code !== expected) throw Error('Unexpected exit');
        finish({...report, workerExitConfirmed: true});
      } catch {
        finish({checkpoint: 'R154', supervisor: 'ReportRefused', workerExitConfirmed: true,
          closeConfirmed: false, bluetoothOperationRequested: null, watchCommandRequested: false});
      }
    });
    deadline = setTimeout(() => abort('Deadline'), deadlineMs);
    child.stdin.end(address + '\n'); // Target is not in argv, output or logs.
  });
}
