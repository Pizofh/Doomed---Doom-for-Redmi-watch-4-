// Emulator-only inspection. No arbitrary shell, push, install, flash or USB target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { packageRoot, projectRoot } from './verify-emulator.mjs';

const action = process.argv[2];
if (!['version', 'connect', 'devices', 'inventory'].includes(action)) {
  throw new Error('Usage: node tools/emulator-adb.mjs version|connect|devices|inventory');
}
const endpoint = '127.0.0.1:2512';
const serverPort = '5039';
const executable = path.join(packageRoot, 'platform-tools/adb.exe');
const expected = '0e606318957baac81b997ccd8ee4bcdff79964a9921da07c716aea3e8d856af7';
const actual = crypto.createHash('sha256').update(fs.readFileSync(executable)).digest('hex');
if (actual !== expected) throw new Error('ADB differs from the inspected Google-signed binary');
const userRoot = path.join(projectRoot, 'emulator/local/adb-user');
const destination = path.join(projectRoot, 'artifacts/emulator/adb');
fs.mkdirSync(userRoot, { recursive: true });
fs.mkdirSync(destination, { recursive: true });
const env = { ...process.env, ANDROID_SDK_HOME: userRoot, ANDROID_USER_HOME: userRoot,
  ADB_SERVER_SOCKET: `tcp:127.0.0.1:${serverPort}`, ANDROID_ADB_SERVER_PORT: serverPort,
  ADB_MDNS_AUTO_CONNECT: '0' };
function invoke(args, name) {
  const result = spawnSync(executable, args, { cwd: packageRoot, env, shell: false, windowsHide: true,
    timeout: 15000, maxBuffer: 1024 * 1024, encoding: 'utf8' });
  const record = { args, endpoint, createdAtUtc: new Date().toISOString(), status: result.status,
    signal: result.signal, error: result.error?.message ?? null,
    stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
  fs.writeFileSync(path.join(destination, `${name}.json`), JSON.stringify(record, null, 2) + '\n');
  if (result.error) throw new Error(`${name}: ${result.error.message}; inspection stopped`);
  return record;
}
if (action === 'version') {
  console.log(invoke(['version'], 'version').stdout.trim());
} else {
  // The impossible project-specific USB serial filters USB connections in this dedicated server.
  // TCP traffic uses only the fixed loopback guest endpoint. mDNS autoconnection is disabled.
  const start = invoke(['-L', `tcp:127.0.0.1:${serverPort}`, '--one-device',
    'RW4_EMULATOR_NO_USB_TRANSPORT', 'start-server'], 'server-start');
  if (start.status !== 0) throw new Error('Dedicated ADB server failed; see server-start.json');
  const common = ['-H', '127.0.0.1', '-P', serverPort];
  if (action === 'connect') {
    const result = invoke([...common, 'connect', endpoint], 'connect');
    console.log((result.stdout + result.stderr).trim());
    process.exitCode = result.status ?? 1;
  } else if (action === 'devices') {
    console.log(invoke([...common, 'devices', '-l'], 'devices').stdout.trim());
  } else {
    const devices = invoke([...common, 'devices', '-l'], 'devices');
    if (!devices.stdout.split(/\r?\n/).some(line => line.startsWith(`${endpoint}\tdevice`))) {
      throw new Error('Expected loopback emulator is not online; no shell commands sent');
    }
    const commands = [ ['help'], ['uname'], ['version'], ['ps'], ['free'], ['mount'], ['df'],
      ['ls', '/'], ['ls', '/dev'], ['ls', '/data'], ['ls', '/proc'], ['ls', '/bin'],
      ['ls', '/data/app'], ['ls', '/data/app/watchface'], ['env'], ['getprop'] ];
    const summary = [];
    for (const [index, command] of commands.entries()) {
      const name = `${String(index + 1).padStart(2, '0')}-${command.join('-').replaceAll('/', '_')}`;
      const result = invoke([...common, '-s', endpoint, 'shell', ...command], name);
      summary.push({ command, status: result.status, outputBytes: Buffer.byteLength(result.stdout + result.stderr) });
    }
    fs.writeFileSync(path.join(destination, 'inventory-summary.json'), JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
  }
}
