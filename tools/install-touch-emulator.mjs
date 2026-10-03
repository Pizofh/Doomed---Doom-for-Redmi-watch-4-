// Install ONLY our reviewed TouchEvents package into the owned emulator guest.
// No compiler ADB, USB selection, stock face replacement, or physical-device path.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';
import { guardEmulator, snapshotData, resetGuest } from './emulator-ui.mjs';

const variant = process.argv[2] ?? 'original';
if (!['original', 'default-font'].includes(variant)) throw new Error('Expected original|default-font');
guardEmulator();
const id = variant === 'original' ? '365799901' : '365799902';
const guest = `/data/app/watchface/market/${id}`;
const source = path.join(projectRoot, `emulator/local/touch-watchface-${variant}/output/TouchEvents.face`);
const bytes = fs.readFileSync(source);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
if (bytes.length < 168 || bytes.length > 4 * 1024 * 1024 || bytes.readUInt32LE(0) !== 0x1234a55a ||
    !bytes.includes(Buffer.from('lua/main.lua'))) throw new Error('Unexpected package');
const recordPath = path.join(projectRoot, `artifacts/package-review/touch-package-${variant}.json`);
const build = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
if (build.status !== 0 || !build.stdout.includes('No Errors') || !build.stdout.includes('adb util is missing')) throw new Error('No reviewed successful local build');
const expectedPackageHash = build.outputSha256 ?? (variant === 'original' ? 'd5f16ec9a0d625dc63016e6aea8ae1a6839cf457988249c300f37ee5a444a8a9' : null);
if (hash(bytes) !== expectedPackageHash) throw new Error('Package differs from successful reviewed build');
const destination = path.join(projectRoot, `artifacts/emulator/watchface-${id}`);
if (fs.existsSync(destination)) throw new Error('Existing install record: inspect before retrying');
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
const absent = adb(['shell', 'ls', guest], '01-check-absence');
if (!/^nsh: ls: stat failed: 2\r?$/im.test(absent)) throw new Error('New ID not demonstrably absent');
const snapshot = await snapshotData();
adb(['pull', '/data/app/watchface/watchface_list.json', path.join(destination, 'watchface-list-before.json')], '02-cache-backup');
// Same two header edits as the inspected AdbBridge.SetWatchfaceId IL.
// Change only our PC artifact; preserve the compiler output unchanged.
const prepared = Buffer.from(bytes);
prepared[5] = 10;
prepared.write(id, 40, 9, 'ascii');
const resource = path.join(destination, 'resource.bin');
fs.writeFileSync(resource, prepared);
const record = { variant, id, guest, snapshot, originalPackageSha256: hash(bytes),
  installedPackageSha256: hash(prepared), headerEdits: [{ offset: 5, value: 10 }, { offset: 40, ascii: id }],
  physicalTransport: false, createdAtUtc: new Date().toISOString(), resetRequested: false };
fs.writeFileSync(path.join(destination, 'install.json'), JSON.stringify(record, null, 2) + '\n');
adb(['shell', 'mkdir', guest], '03-mkdir');
adb(['push', resource, `${guest}/resource.bin`], '04-push');
const reread = path.join(destination, 'resource-readback.bin');
adb(['pull', `${guest}/resource.bin`, reread], '05-readback');
if (hash(fs.readFileSync(reread)) !== hash(prepared)) throw new Error('Readback mismatch; no reset requested');
// The upstream emulator rescans its watchfaces after this cache removal + reset.
// The previous cache and data image are preserved; no recursive rm is used.
adb(['shell', 'rm', '/data/app/watchface/watchface_list.json'], '06-invalidate-cache');
await resetGuest();
record.resetRequested = true;
fs.writeFileSync(path.join(destination, 'install.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ id, variant, readbackMatched: true, resetRequested: true,
  backup: snapshot.folder, physicalTransport: false }, null, 2));
