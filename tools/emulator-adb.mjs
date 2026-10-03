// Emulator-only inspection. No arbitrary shell, push, install, flash or USB target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { packageRoot, projectRoot, verifyEmulator } from './verify-emulator.mjs';

const action = process.argv[2];
if (!['version', 'connect', 'devices', 'inventory', 'capabilities', 'post-sample', 'lua-api', 'lua-loader', 'ui-help'].includes(action)) {
  throw new Error('Usage: node tools/emulator-adb.mjs version|connect|devices|inventory|capabilities|post-sample|lua-api|lua-loader|ui-help');
}
const endpoint = 'emulator-5554';
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
  ADB_SERVER_SOCKET: `tcp:localhost:${serverPort}`, ANDROID_ADB_SERVER_PORT: serverPort,
  ADB_MDNS_AUTO_CONNECT: '0' };
function assertOwnedEmulator() {
  verifyEmulator();
  const record = JSON.parse(fs.readFileSync(path.join(projectRoot, 'artifacts/emulator/host-process.json'), 'utf8'));
  if (record.exitedAtUtc || record.executable !== path.join(packageRoot, 'emulator/emulator.exe') ||
      !record.args.includes(path.join(packageRoot, 'system-images/vela-release-4.0/nuttx'))) {
    throw new Error('No matching project launcher record');
  }
  const systemRoot = process.env.SystemRoot;
  const network = spawnSync(path.join(systemRoot, 'System32/netstat.exe'), ['-ano', '-p', 'tcp'],
    { encoding: 'utf8', shell: false, windowsHide: true, timeout: 5000 });
  if (network.status !== 0) throw new Error('Cannot inspect loopback listener ownership');
  const listeners = network.stdout.split(/\r?\n/).map(line => line.trim().split(/\s+/))
    .filter(fields => fields[0] === 'TCP' && fields[3] === 'LISTENING');
  const ports = [5554, 5555, 2512, 8554];
  const owners = ports.map(port => listeners.find(fields => fields[1] === `127.0.0.1:${port}`)?.[4]);
  if (!owners[0] || !/^\d+$/.test(owners[0]) || owners.some(owner => owner !== owners[0])) {
    throw new Error('Emulator bridge and forwarded port do not belong to the same loopback process');
  }
  const owner = spawnSync(path.join(systemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe'),
    ['-NoProfile', '-NonInteractive', '-Command', `(Get-Process -Id ${owners[0]} -ErrorAction Stop).Path`],
    { encoding: 'utf8', shell: false, windowsHide: true, timeout: 5000 });
  const expectedQemu = path.join(packageRoot, 'emulator/qemu/windows-x86_64/qemu-system-armel-headless.exe');
  if (owner.status !== 0 || owner.stdout.trim().toLowerCase() !== expectedQemu.toLowerCase()) {
    throw new Error('Loopback listeners are not owned by the reviewed project QEMU');
  }
  fs.writeFileSync(path.join(destination, 'transport-ownership.json'), JSON.stringify({ endpoint,
    qemuPid: Number(owners[0]), qemuExecutable: expectedQemu, ports,
    physicalTransport: false, verifiedAtUtc: new Date().toISOString() }, null, 2) + '\n');
}
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
  const start = invoke(['-L', `tcp:localhost:${serverPort}`, '--one-device',
    'RW4_EMULATOR_NO_USB_TRANSPORT', 'start-server'], 'server-start');
  if (start.status !== 0) throw new Error('Dedicated ADB server failed; see server-start.json');
  const common = ['-H', '127.0.0.1', '-P', serverPort];
  if (action === 'connect') {
    assertOwnedEmulator();
    const result = invoke([...common, '-s', endpoint, 'get-state'], 'connect');
    console.log((result.stdout + result.stderr).trim());
    process.exitCode = result.status === 0 && result.stdout.trim() === 'device' ? 0 : 1;
  } else if (action === 'devices') {
    console.log(invoke([...common, 'devices', '-l'], 'devices').stdout.trim());
  } else {
    assertOwnedEmulator();
    const devices = invoke([...common, 'devices', '-l'], 'devices');
    if (!devices.stdout.split(/\r?\n/).some(line => {
      const fields = line.trim().split(/\s+/);
      return fields[0] === endpoint && fields[1] === 'device';
    })) {
      throw new Error('Expected loopback emulator is not online; no shell commands sent');
    }
    const inventoryCommands = [ ['help'], ['uname'], ['version'], ['ps'], ['free'], ['mount'], ['df'],
      ['ls', '/'], ['ls', '/dev'], ['ls', '/data'], ['ls', '/proc'], ['ls', '/bin'],
      ['ls', '/data/app'], ['ls', '/data/app/watchface'], ['env'], ['getprop'] ];
    const capabilityCommands = [ ['uname', '-a'], ['help', '-v', 'lua'], ['help', '-v', 'insmod'],
      ['help', '-v', 'exec'], ['help', '-v', 'iwasm'], ['lsmod'], ['ls', '/system'],
      ['ls', '/data/app/watchface/market'], ['ls', '/tmp'],
      ['lua', '-e', '"print(_VERSION); print(type(os.execute)); print(type(package.loadlib)); print(type(package.preload.lvgl))"'] ];
    // Enumerate entries without explicitly constructing widgets or invoking UI APIs.
    // require('lvgl') can itself initialize native binding state; this is not a pure read.
    const luaApiCode = "local lv=require('lvgl'); local function list(n,t) print('TABLE',n,type(t)); if type(t)~='table' then return end; local keys={}; for k in pairs(t) do if type(k)=='string' then keys[#keys+1]=k end end; table.sort(keys); for i,k in ipairs(keys) do if i>120 then break end; print(k,type(t[k])) end end; list('lvgl',lv); list('disp',lv.disp); list('module-meta',getmetatable(lv)); local mt=getmetatable(lv._root); list('root-meta',mt); if type(mt)=='table' then list('root-index',mt.__index) end; for _,n in ipairs({'miwear','activity','navigator','screen'}) do list(n,package.loaded[n]) end";
    const uiHelpCommands = [['am'], ['help', '-v', 'am'], ['lua', '-h'],
      ['ls', '/watchface/lua'], ['ls', '/data/app/watchface/builtin']];
    const loaderCode = "local f,e,w=package.loadlib('/tmp/rw4-nonexistent-loader-probe.elf','luaopen_rw4probe'); print('LOADLIB_PROBE',type(f),e,w)";
    const commands = action === 'lua-loader' ? [['lua', '-e', `"${loaderCode}"`]] : action === 'ui-help' ? uiHelpCommands : action === 'lua-api' ? [['lua', '-e', `"${luaApiCode}"`]] : action === 'capabilities' ? capabilityCommands : action === 'post-sample' ?
      [['ps'], ['free'], ['ls', '/data/app/watchface/market']] : inventoryCommands;
    const summary = [];
    for (const [index, command] of commands.entries()) {
      const name = action === 'lua-loader' ? 'lua-loader-probe' : action === 'ui-help' ? `ui-help-${index + 1}-${command[0]}` : action === 'lua-api' ? 'lua-api-module-entries' : action === 'post-sample' ? `post-${String(index + 1).padStart(2, '0')}-${command[0]}` :
        action === 'capabilities' ? `cap-${String(index + 1).padStart(2, '0')}-${command[0]}` :
        `${String(index + 1).padStart(2, '0')}-${command.join('-').replaceAll('/', '_')}`;
      const result = invoke([...common, '-s', endpoint, 'shell', ...command], name);
      summary.push({ command, status: result.status, outputBytes: Buffer.byteLength(result.stdout + result.stderr) });
    }
    fs.writeFileSync(path.join(destination, `${action}-summary.json`), JSON.stringify(summary, null, 2) + '\n');
    console.log(JSON.stringify(summary, null, 2));
  }
}
