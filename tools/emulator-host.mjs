import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { verifyEmulator, packageRoot, projectRoot } from './verify-emulator.mjs';

const action = process.argv[2] ?? 'help';
if (!['help', 'environment', 'virtual-device', 'list', 'start'].includes(action)) throw new Error('Usage: node tools/emulator-host.mjs help|environment|virtual-device|list|start');
verifyEmulator();
const destination = path.join(projectRoot, 'artifacts/emulator');
fs.mkdirSync(destination, { recursive: true });
const stateRoot = path.join(projectRoot, 'emulator/local/run-state');
const avdRoot = path.join(stateRoot, 'avd');
const avdPath = path.join(avdRoot, 'RedmiWatch4.vvd');
const userRoot = path.join(stateRoot, 'user');
fs.mkdirSync(userRoot, { recursive: true });
if (!fs.existsSync(avdPath)) {
  fs.cpSync(path.join(packageRoot, 'avd/RedmiWatch4.vvd'), avdPath, { recursive: true, errorOnExist: true, force: false });
  // Correct copied profile labels only. Preserve original package and ZIP unchanged.
  const configPath = path.join(avdPath, 'config.ini');
  const config = fs.readFileSync(configPath, 'utf8').replace(/^AvdId=RedmiWatch5$/m, 'AvdId=RedmiWatch4')
    .replace(/^avd.ini.displayname=RedmiWatch5$/m, 'avd.ini.displayname=RedmiWatch4');
  fs.writeFileSync(configPath, config);
  fs.writeFileSync(path.join(avdRoot, 'RedmiWatch4.ini'), `path=${avdPath}\npath.rel=RedmiWatch4.vvd\n`);
}
const env = { ...process.env, ANDROID_AVD_HOME: avdRoot, ANDROID_EMULATOR_HOME: packageRoot,
  ANDROID_USER_HOME: userRoot, ANDROID_SDK_HOME: userRoot, ANDROID_PREFS_ROOT: userRoot,
  ADB_SERVER_SOCKET: 'tcp:127.0.0.1:5039', ANDROID_ADB_SERVER_PORT: '5039' };
const executable = path.join(packageRoot, 'emulator/emulator.exe');
if (action !== 'start') {
  const args = action === 'list' ? ['-vela', '-list-avds'] : [action === 'help' ? '-help' : `-help-${action}`];
  const result = spawnSync(executable, args, { cwd: packageRoot, env, shell: false, windowsHide: true,
    timeout: 15000, maxBuffer: 2 * 1024 * 1024, encoding: 'utf8' });
  fs.writeFileSync(path.join(destination, `emulator-${action}.txt`), (result.stdout ?? '') + (result.stderr ?? ''));
  console.log(JSON.stringify({ action, status: result.status, error: result.error?.message, output: result.stdout?.slice(0, 500) }));
  if (result.error || result.status !== 0) process.exitCode = 1;
} else {
  const registration = path.join(process.env.USERPROFILE, '.vela/RedmiWatch4.ini');
  if (!fs.existsSync(registration)) throw new Error('VVD registration missing. Follow docs/emulator.md; the required host-profile copy must be performed manually.');
  const ini = fs.readFileSync(registration, 'utf8');
  if (!ini.split(/\r?\n/).includes(`path=${avdPath}`)) throw new Error('VVD registration does not point at the isolated project profile. No launch performed.');
  const priorPath = path.join(destination, 'host-process.json');
  if (fs.existsSync(priorPath)) {
    const prior = JSON.parse(fs.readFileSync(priorPath, 'utf8'));
    if (!prior.exitedAtUtc) throw new Error('Recorded launch exists. Inspect its PID/status before starting another instance.');
    fs.renameSync(priorPath, path.join(destination, `finished-launch-${Date.now()}.json`));
  }
  const imageRoot = path.join(packageRoot, 'system-images/vela-release-4.0');
  const args = ['-verbose', '-vela', '-avd', 'RedmiWatch4', '-sysdir', imageRoot, '-datadir', avdPath,
    '-kernel', path.join(imageRoot, 'nuttx'), '-system', path.join(imageRoot, 'vela_system.bin'),
    '-data', path.join(avdPath, 'vela_data.bin'), '-no-window', '-no-audio', '-no-snapshot', '-show-kernel',
    '-network-user-mode-options', 'hostfwd=tcp:127.0.0.1:2512-10.0.2.15:101', '-qemu', '-semihosting'];
  const stdoutPath = path.join(destination, 'host-stdout.txt');
  const stderrPath = path.join(destination, 'host-stderr.txt');
  const out = fs.openSync(stdoutPath, 'w');
  const err = fs.openSync(stderrPath, 'w');
  const child = spawn(executable, args, { cwd: packageRoot, env, shell: false, windowsHide: true, stdio: ['ignore', out, err] });
  fs.closeSync(out); fs.closeSync(err);
  child.once('error', error => { console.error(error.message); process.exitCode = 1; });
  child.once('spawn', () => {
    const record = { pid: child.pid, executable, args, createdAtUtc: new Date().toISOString(),
      stateRoot, physicalTransport: false, stdoutPath, stderrPath };
    fs.writeFileSync(path.join(destination, 'host-process.json'), JSON.stringify(record, null, 2) + '\n');
    console.log(JSON.stringify({ action, pid: child.pid, headless: true, forwardedEndpoint: '127.0.0.1:2512' }));
  });
  child.once('exit', (code, signal) => {
    const recordPath = path.join(destination, 'host-process.json');
    if (fs.existsSync(recordPath)) {
      const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
      if (record.pid === child.pid) fs.writeFileSync(recordPath, JSON.stringify({ ...record,
        exitedAtUtc: new Date().toISOString(), exitCode: code, signal }, null, 2) + '\n');
    }
    console.log(JSON.stringify({ event: 'exit', code, signal }));
    process.exitCode = code ?? 1;
  });
}
