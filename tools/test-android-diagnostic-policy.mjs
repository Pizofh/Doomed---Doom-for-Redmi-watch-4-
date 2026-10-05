// Compile/run our own pure Java policy only. No APK, SDK, upstream code or Bluetooth.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build/android-diagnostic-policy');
fs.mkdirSync(out, {recursive: true});
for (const [cmd, args] of [
  ['javac', ['--release', '17', '-d', out,
    path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticPolicy.java'),
    path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticSession.java'),
    path.join(root, 'experiments/android-diagnostic/Rw4DiagnosticPolicyTest.java')]],
  ['java', ['-cp', out, 'nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi.Rw4DiagnosticPolicyTest']]
]) {
  const run = spawnSync(cmd, args, {windowsHide: true, encoding: 'utf8'});
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  if (run.error || run.status !== 0) throw Error('Own policy compile/test failed');
}
