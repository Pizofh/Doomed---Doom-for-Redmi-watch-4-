// Owned PC emulator only. No arbitrary command, target, module or firmware.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';
import { guardEmulator, snapshotData } from './emulator-ui.mjs';

const variant = process.argv[2];
if (!['probe', 'pattern'].includes(variant)) throw new Error('Expected probe|pattern');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const guestHash = '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if (digest(fs.readFileSync(path.join(packageRoot, 'system-images/vela-release-4.0/nuttx'))) !== guestHash) {
  throw new Error('Guest differs from the loader/ABI inspection');
}
const build = JSON.parse(fs.readFileSync(path.join(projectRoot, `build/display/${variant}-review.json`), 'utf8'));
const source = path.join(projectRoot, `build/display/${variant}.elf`);
const binary = fs.readFileSync(source);
if (!build.contractReviewed || build.guestSha256 !== guestHash || build.sha256 !== digest(binary)) {
  throw new Error('Missing matching static review');
}
guardEmulator();
const folder = path.join(projectRoot, 'artifacts/emulator', `display-${variant}-${Date.now()}`);
fs.mkdirSync(folder);
const moduleName = 'rw4display';
const guestFile = `/tmp/rw4display-${variant}.elf`;
function adb(args, label) {
  const result = spawnSync(path.join(packageRoot, 'platform-tools/adb.exe'),
    ['-H', '127.0.0.1', '-P', '5039', '-s', 'emulator-5554', ...args],
    { shell: false, windowsHide: true, encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024,
      env: { ...process.env, ADB_MDNS_AUTO_CONNECT: '0' } });
  fs.writeFileSync(path.join(folder, `${label}.json`), JSON.stringify({ args, status: result.status,
    stdout: result.stdout, stderr: result.stderr, error: result.error?.message ?? null }, null, 2) + '\n');
  if (result.error || result.status !== 0) throw new Error(`${label}: ADB failed; inspect guest, do not retry automatically`);
  return result.stdout + result.stderr;
}
const baseline = adb(['shell', 'lsmod'], '01-lsmod-before');
if (baseline.includes(moduleName)) throw new Error('Module already exists; inspect before loading');
const absence = adb(['shell', 'ls', guestFile], '02-file-absence');
if (!/^nsh: ls: stat failed: 2\r?$/im.test(absence)) throw new Error('Temporary filename not demonstrably absent');
const snapshot = await snapshotData();
adb(['push', source, guestFile], '03-push');
const reread = path.join(folder, 'display-readback.elf');
adb(['pull', guestFile, reread], '04-readback');
if (digest(fs.readFileSync(reread)) !== digest(binary)) throw new Error('Guest file differs; not loading');
guardEmulator();
function screenshot(label) {
  const result = spawnSync(process.execPath, [path.join(projectRoot, 'tools/emulator-screenshot.mjs'), label],
    { cwd: projectRoot, shell: false, windowsHide: true, encoding: 'utf8', timeout: 15000 });
  fs.writeFileSync(path.join(folder, `${label}.json`), JSON.stringify({ status: result.status,
    stdout: result.stdout, stderr: result.stderr }, null, 2) + '\n');
  return result.status === 0;
}
let duringScreenshot = null;
async function patternLoad() {
  const args = ['-H', '127.0.0.1', '-P', '5039', '-s', 'emulator-5554', 'shell', 'insmod', guestFile, moduleName];
  return await new Promise((resolve, reject) => {
    const child = spawn(path.join(packageRoot, 'platform-tools/adb.exe'), args,
      { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ADB_MDNS_AUTO_CONNECT: '0' } });
    let stdout = '', stderr = '';
    child.stdout.on('data', bytes => { stdout += bytes.toString('utf8'); });
    child.stderr.on('data', bytes => { stderr += bytes.toString('utf8'); });
    // Initializer restores pixels after <=8s; capture while it sleeps, without input.
    const capture = setTimeout(() => { duringScreenshot = screenshot(`native-pattern-during-${path.basename(folder)}`); }, 1800);
    const timer = setTimeout(() => { child.kill(); }, 18000);
    child.once('error', error => { clearTimeout(capture); clearTimeout(timer); reject(error); });
    child.once('close', status => {
      clearTimeout(capture); clearTimeout(timer);
      fs.writeFileSync(path.join(folder, '05-insmod.json'), JSON.stringify({ args, status, stdout, stderr }, null, 2) + '\n');
      if (status !== 0) reject(new Error('Pattern ADB failed; inspect guest before retrying'));
      else resolve(stdout + stderr);
    });
  });
}
if (variant === 'pattern') screenshot(`native-pattern-before-${path.basename(folder)}`);
const output = variant === 'probe' ? adb(['shell', 'insmod', guestFile, moduleName], '05-insmod') : await patternLoad();
const after = adb(['shell', 'lsmod'], '06-lsmod-after');
const registered = after.includes(moduleName);
const initializerMessage = output.includes(variant === 'probe' ? 'RW4_FB_PROBE: complete' : 'RW4_FB_PATTERN: restored');
if (registered) {
  adb(['shell', 'rmmod', moduleName], '07-rmmod');
  if (adb(['shell', 'lsmod'], '08-lsmod-unloaded').includes(moduleName)) {
    throw new Error('Module remains registered after rmmod; stop');
  }
}
// Remove only this verified temporary file after the module has been unloaded.
adb(['shell', 'rm', guestFile], '09-remove-temp');
const finalUname = adb(['shell', 'uname', '-a'], '10-uname-after');
const afterScreenshot = variant === 'pattern' ? screenshot(`native-pattern-after-${path.basename(folder)}`) : null;
const result = { variant, guestSha256: guestHash, binarySha256: digest(binary), registered,
  initializerMessage, unloaded: registered, output, finalUname, folder, backup: snapshot.folder,
  duringScreenshot, afterScreenshot, persistentPayloadInstalled: false, physicalTransport: false };
fs.writeFileSync(path.join(folder, 'result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (registered && !initializerMessage) throw new Error('Registered without expected message; inspection required');
