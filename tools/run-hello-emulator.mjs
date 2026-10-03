// Owned PC emulator only. No arbitrary command, target, module or firmware.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';
import { guardEmulator, snapshotData } from './emulator-ui.mjs';

const variant = process.argv[2];
if (!['import', 'bound'].includes(variant)) throw new Error('Expected import|bound');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const guestHash = '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if (digest(fs.readFileSync(path.join(packageRoot, 'system-images/vela-release-4.0/nuttx'))) !== guestHash) {
  throw new Error('Guest differs from the loader/ABI inspection');
}
const build = JSON.parse(fs.readFileSync(path.join(projectRoot, `build/hello-native/${variant}-review.json`), 'utf8'));
const source = path.join(projectRoot, `build/hello-native/hello-${variant}.elf`);
const binary = fs.readFileSync(source);
if (!build.contractReviewed || build.guestSha256 !== guestHash || build.sha256 !== digest(binary)) {
  throw new Error('Missing matching static review');
}
guardEmulator();
const folder = path.join(projectRoot, 'artifacts/emulator', `hello-${variant}-${Date.now()}`);
fs.mkdirSync(folder);
const moduleName = 'rw4hello';
const guestFile = `/tmp/rw4hello-${variant}.elf`;
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
const reread = path.join(folder, 'hello-readback.elf');
adb(['pull', guestFile, reread], '04-readback');
if (digest(fs.readFileSync(reread)) !== digest(binary)) throw new Error('Guest file differs; not loading');
guardEmulator();
const output = adb(['shell', 'insmod', guestFile, moduleName], '05-insmod');
const after = adb(['shell', 'lsmod'], '06-lsmod-after');
const registered = after.includes(moduleName);
const initializerMessage = output.includes('RW4 emulator: hello C');
if (registered) {
  adb(['shell', 'rmmod', moduleName], '07-rmmod');
  if (adb(['shell', 'lsmod'], '08-lsmod-unloaded').includes(moduleName)) {
    throw new Error('Module remains registered after rmmod; stop');
  }
}
// Remove only this verified temporary file after the module has been unloaded.
adb(['shell', 'rm', guestFile], '09-remove-temp');
const finalUname = adb(['shell', 'uname', '-a'], '10-uname-after');
const result = { variant, guestSha256: guestHash, binarySha256: digest(binary), registered,
  initializerMessage, unloaded: registered, output, finalUname, folder, backup: snapshot.folder,
  persistentPayloadInstalled: false, physicalTransport: false };
fs.writeFileSync(path.join(folder, 'result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (registered && !initializerMessage) throw new Error('Registered without expected message; inspection required');
