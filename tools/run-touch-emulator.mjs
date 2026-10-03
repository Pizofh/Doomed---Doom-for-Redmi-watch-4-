// Reviewed C observer and synthetic gestures on the owned PC guest only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';
import { guardEmulator, snapshotData, gesture } from './emulator-ui.mjs';

if (process.argv.length !== 2) throw new Error('This experiment accepts no target/command arguments');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const guestHash = '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if (digest(fs.readFileSync(path.join(packageRoot, 'system-images/vela-release-4.0/nuttx'))) !== guestHash) {
  throw new Error('Guest differs from input/loader review');
}
const review = JSON.parse(fs.readFileSync(path.join(projectRoot, 'build/native-touch/observer-review.json'), 'utf8'));
const source = path.join(projectRoot, 'build/native-touch/observer.elf');
const binary = fs.readFileSync(source);
if (!review.contractReviewed || review.guestSha256 !== guestHash || review.sha256 !== digest(binary)) {
  throw new Error('Missing matching static review');
}
guardEmulator();
const folder = path.join(projectRoot, `artifacts/emulator/native-touch-${Date.now()}`);
fs.mkdirSync(folder);
const moduleName = 'rw4touch';
const guestFile = '/tmp/rw4touch-observer.elf';
const adbPath = path.join(packageRoot, 'platform-tools/adb.exe');
const target = ['-H', '127.0.0.1', '-P', '5039', '-s', 'emulator-5554'];
const env = { ...process.env, ADB_MDNS_AUTO_CONNECT: '0' };
function adb(args, label) {
  const result = spawnSync(adbPath, [...target, ...args], { shell: false, windowsHide: true,
    encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024, env });
  fs.writeFileSync(path.join(folder, `${label}.json`), JSON.stringify({ args, status: result.status,
    stdout: result.stdout, stderr: result.stderr, error: result.error?.message ?? null }, null, 2) + '\n');
  if (result.error || result.status !== 0) throw new Error(`${label}: ADB failed; inspect guest before retrying`);
  return result.stdout + result.stderr;
}
function screenshot(label) {
  const name = `${path.basename(folder)}-${label}`;
  const result = spawnSync(process.execPath, [path.join(projectRoot, 'tools/emulator-screenshot.mjs'), name],
    { cwd: projectRoot, shell: false, windowsHide: true, encoding: 'utf8', timeout: 15000 });
  fs.writeFileSync(path.join(folder, `screenshot-${label}.json`), JSON.stringify({ name, status: result.status,
    stdout: result.stdout, stderr: result.stderr }, null, 2) + '\n');
  if (result.status !== 0) throw new Error('Screenshot failed');
}
if (adb(['shell', 'lsmod'], '01-lsmod-before').includes(moduleName)) throw new Error('Module already registered');
if (!/^nsh: ls: stat failed: 2\r?$/im.test(adb(['shell', 'ls', guestFile], '02-file-absence'))) {
  throw new Error('Temporary filename not demonstrably absent');
}
const snapshot = await snapshotData();
adb(['push', source, guestFile], '03-push');
const readback = path.join(folder, 'observer-readback.elf');
adb(['pull', guestFile, readback], '04-readback');
if (digest(fs.readFileSync(readback)) !== digest(binary)) throw new Error('Readback differs; not loading');
guardEmulator();
screenshot('before');
let actions = null, actionError = null;
const start = new Date().toISOString();
const output = await new Promise((resolve, reject) => {
  const args = [...target, 'shell', 'insmod', guestFile, moduleName];
  const child = spawn(adbPath, args, { shell: false, windowsHide: true, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  const timer = setTimeout(() => { child.kill(); }, 20000); // Client timeout cannot stop guest code.
  child.stdout.on('data', bytes => {
    stdout += bytes.toString('utf8');
    if (!actions && stdout.includes('RW4_TOUCH: ready independent-reader')) {
      actions = (async () => {
        await gesture(60, 90, 60, 90);
        await gesture(90, 200, 145, 225);
        screenshot('watchface-during');
        await gesture(195, 410, 195, 40); // Stock control panel, while C observes.
        screenshot('panel-during');
        await gesture(195, 60, 195, 420); // Return to original watchface.
      })().catch(error => { actionError = error.message; });
    }
  });
  child.stderr.on('data', bytes => { stderr += bytes.toString('utf8'); });
  child.once('error', error => { clearTimeout(timer); reject(error); });
  child.once('close', status => {
    clearTimeout(timer);
    fs.writeFileSync(path.join(folder, '05-insmod.json'), JSON.stringify({ args, status, stdout, stderr,
      start, end: new Date().toISOString() }, null, 2) + '\n');
    if (status !== 0) reject(new Error('Observer ADB failed; inspect guest, do not unload live code blindly'));
    else resolve(stdout + stderr);
  });
});
if (actions) await actions;
const registered = adb(['shell', 'lsmod'], '06-lsmod-after').includes(moduleName);
if (registered) {
  adb(['shell', 'rmmod', moduleName], '07-rmmod');
  if (adb(['shell', 'lsmod'], '08-lsmod-unloaded').includes(moduleName)) throw new Error('Module still registered');
}
adb(['shell', 'rm', guestFile], '09-remove-temp');
const finalUname = adb(['shell', 'uname', '-a'], '10-uname-after');
await gesture(60, 90, 60, 90);
screenshot('after');
const complete = output.match(/RW4_TOUCH: complete events=(\d+) idle=(\d+) close=(-?\d+) result=(-?\d+)/);
const expectedInput = output.includes('flags=11 pos_valid=1 raw=60,90') &&
  output.includes('flags=11 pos_valid=1 raw=145,225') &&
  output.includes('flags=14 pos_valid=1 raw=145,225');
const result = { folder, guestSha256: guestHash, binarySha256: digest(binary), registered,
  unloaded: registered, actionError, expectedInput, observation: complete ? { events: Number(complete[1]),
    idle: Number(complete[2]), close: Number(complete[3]), result: Number(complete[4]) } : null,
  output, finalUname, backup: snapshot.folder, physicalTransport: false,
  persistentPayloadInstalled: false, stockUiResponseRequiresScreenshotReview: true };
fs.writeFileSync(path.join(folder, 'result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!registered || !complete || !expectedInput || Number(complete[3]) !== 0 || Number(complete[4]) !== 0 || actionError) {
  throw new Error('Observer validation incomplete; inspect saved logs');
}
