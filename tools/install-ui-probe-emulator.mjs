// Install ONLY the own Lua UI-probe package into the owned emulator guest.
// No compiler ADB, USB selection, stock face replacement, or physical-device path.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';
import { guardEmulator, snapshotData, resetGuest } from './emulator-ui.mjs';

const action = process.argv[2] ?? 'install';
if (!['install', 'update', 'refresh'].includes(action) || process.argv.length > 3) throw new Error('Expected install|update|refresh');
guardEmulator();
const variant = 'ui-probe';
const id = '365799903';
const guest = `/data/app/watchface/market/${id}`;
const build = JSON.parse(fs.readFileSync(path.join(projectRoot, 'artifacts/package-review/ui-probe-package.json'), 'utf8'));
const source = path.join(build.work, 'output/UIProbe.face');
if (!path.resolve(source).startsWith(path.join(projectRoot, 'emulator/local/ui-probe-'))) throw new Error('Build path outside own work area');
const bytes = fs.readFileSync(source);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
if (bytes.length < 168 || bytes.length > 4 * 1024 * 1024 || bytes.readUInt32LE(0) !== 0x1234a55a ||
    !bytes.includes(Buffer.from('lua/main.lua'))) throw new Error('Unexpected package');
if (build.status !== 0 || !build.stdout.includes('No Errors') || !build.stdout.includes('adb util is missing')) throw new Error('No reviewed successful build');
const uiSource = fs.readFileSync(path.join(projectRoot, build.workerFrameMode===true?'experiments/native-worker-frame/main.lua':build.workerMode===true?'experiments/native-launcher/main.lua':build.controlsMode===true?'experiments/lua-controls/main.lua':'experiments/lua-ui/main.lua'));
const ownSource = build.bridgeMode === true ? Buffer.concat([
  fs.readFileSync(path.join(projectRoot, 'experiments/lua-native-bridge/control.lua')), Buffer.from(build.loopMode===true?'\nRW4_FRAME_LOOP=true\n':'\n'), uiSource
]) : uiSource;
if (hash(bytes) !== build.outputSha256 || hash(ownSource) !== build.sourceSha256) throw new Error('Package/source differ from own build');
const installFolder = path.join(projectRoot, `artifacts/emulator/watchface-${id}`);
let prior = null;
if (action === 'update' || action === 'refresh') {
  const latest = path.join(installFolder, 'latest-install.json');
  prior = JSON.parse(fs.readFileSync(fs.existsSync(latest) ? latest : path.join(installFolder, 'install.json'), 'utf8'));
  if (prior.id !== id || prior.guest !== guest || prior.physicalTransport !== false) throw new Error('Not an owned prior install');
} else if (fs.existsSync(installFolder)) throw new Error('Existing install record: inspect before retrying');
const destination = prior ? path.join(installFolder, `${action}-${Date.now()}`) : installFolder;
fs.mkdirSync(destination, { recursive: true });
function adb(args, label) {
  const result = spawnSync(path.join(packageRoot, 'platform-tools/adb.exe'),
    ['-H', '127.0.0.1', '-P', '5039', '-s', 'emulator-5554', ...args],
    { shell: false, windowsHide: true, encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024,
      env: { ...process.env, ADB_MDNS_AUTO_CONNECT: '0' } });
  fs.writeFileSync(path.join(destination, `${label}.json`), JSON.stringify({ args, status: result.status,
    stdout: result.stdout, stderr: result.stderr, error: result.error?.message ?? null }, null, 2) + '\n');
  if (result.error || result.status !== 0) throw new Error(`${label}: ADB failed; inspect local record`);
  return result.stdout + result.stderr;
}
if (!prior) {
  const absent = adb(['shell', 'ls', guest], '01-check-absence');
  if (!/^nsh: ls: stat failed: 2\r?$/im.test(absent)) throw new Error('New ID not demonstrably absent');
} else {
  const cache = path.join(destination, 'watchface-list-check.json');
  adb(['pull', '/data/app/watchface/watchface_list.json', cache], '01-current-face');
  const list = JSON.parse(fs.readFileSync(cache, 'utf8')).watchface_list;
  const face = list.find(f => f.id === id);
  if (!face || String(face.in_use) !== '0') throw new Error('Select another watchface before updating own resource');
  const old = path.join(destination, 'resource-before.bin');
  adb(['pull', `${guest}/resource.bin`, old], '01-prior-resource');
  if (hash(fs.readFileSync(old)) !== prior.installedPackageSha256) throw new Error('Prior resource differs; not replacing');
}
const loadedModules = adb(['shell', 'lsmod'], '01-native-reset-gate');
if (['rw4wframe', 'rw4worker', 'rw4bridge', 'rw4task', 'rw4time', 'rw4fs', 'rw4stdio'].some(n => loadedModules.includes(n))) {
  throw new Error('Own native module is still loaded; complete its lifecycle before updating/resetting');
}
if (action === 'refresh' && /^nsh: ls: stat failed: 2\r?$/im.test(
  adb(['shell', 'ls', `${guest}/lua/main.lua`], '01-refresh-lua-gate'))) {
  throw new Error('Refresh requires an existing derived Lua file; no resource write performed');
}
const snapshot = await snapshotData();
adb(['pull', '/data/app/watchface/watchface_list.json', path.join(destination, 'watchface-list-before.json')], '02-cache-backup');
// Same two header edits as the inspected AdbBridge.SetWatchfaceId IL.
// Change only our PC artifact; preserve the compiler output unchanged.
const prepared = Buffer.from(bytes);
prepared[5] = 10;
prepared.write(id, 40, 9, 'ascii');
const resource = path.join(destination, 'resource.bin');
fs.writeFileSync(resource, prepared);
const record = { action, variant, bridgeMode: build.bridgeMode === true, id, guest, snapshot, originalPackageSha256: hash(bytes),
  installedPackageSha256: hash(prepared), headerEdits: [{ offset: 5, value: 10 }, { offset: 40, ascii: id }],
  physicalTransport: false, createdAtUtc: new Date().toISOString(), resetRequested: false };
fs.writeFileSync(path.join(destination, 'install.json'), JSON.stringify(record, null, 2) + '\n');
if (!prior) adb(['shell', 'mkdir', guest], '03-mkdir');
adb(['push', resource, `${guest}/resource.bin`], '04-push');
const reread = path.join(destination, 'resource-readback.bin');
adb(['pull', `${guest}/resource.bin`, reread], '05-readback');
if (hash(fs.readFileSync(reread)) !== hash(prepared)) throw new Error('Readback mismatch; no reset requested');
// A shorter script can retain the tail of the previously extracted main.lua
// in this guest. Preserve and invalidate only our derived Lua file, not stock.
const extracted = `${guest}/lua/main.lua`;
const cached = adb(['shell', 'ls', extracted], '05-derived-lua-check');
if (action === 'refresh' && /^nsh: ls: stat failed: 2\r?$/im.test(cached)) throw new Error('Refresh requires an existing derived Lua file; use update after inspection');
if (!/^nsh: ls: stat failed: 2\r?$/im.test(cached)) {
  adb(['pull', extracted, path.join(destination, 'derived-main-before.lua')], '05-derived-lua-backup');
  adb(['shell', 'rm', extracted], '05-derived-lua-invalidate');
  record.derivedLuaInvalidated = true;
  const fresh = path.join(destination, 'derived-main-current.lua');
  fs.writeFileSync(fresh, ownSource);
  adb(['push', fresh, extracted], '05-derived-lua-replace');
  const derivedReadback = path.join(destination, 'derived-main-readback.lua');
  adb(['pull', extracted, derivedReadback], '05-derived-lua-readback');
  if (hash(fs.readFileSync(derivedReadback)) !== hash(ownSource)) throw new Error('Derived Lua mismatch; no reset requested');
  record.derivedLuaReadbackMatched = true;
}
// The upstream emulator rescans its watchfaces after this cache removal + reset.
// The previous cache and data image are preserved; no recursive rm is used.
if (action !== 'refresh') {
  adb(['shell', 'rm', '/data/app/watchface/watchface_list.json'], '06-invalidate-cache');
  await resetGuest();
  record.resetRequested = true;
}
fs.writeFileSync(path.join(destination, 'install.json'), JSON.stringify(record, null, 2) + '\n');
fs.writeFileSync(path.join(installFolder, 'latest-install.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ id, variant, readbackMatched: true, resetRequested: record.resetRequested,
  backup: snapshot.folder, physicalTransport: false }, null, 2));
