// Attempt the unchanged upstream RW4 sample through the existing CLI Lua runtime.
// Files are uploaded only to tmpfs; this does not install or register a watchface.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';

const guard = spawnSync(process.execPath, [path.join(projectRoot, 'tools/emulator-adb.mjs'), 'connect'],
  { cwd: projectRoot, encoding: 'utf8', windowsHide: true, shell: false, timeout: 20000 });
if (guard.status !== 0) throw new Error(`Emulator ownership/state verification failed: ${guard.stderr}`);
const executable = path.join(packageRoot, 'platform-tools/adb.exe');
const common = ['-H', '127.0.0.1', '-P', '5039', '-s', 'emulator-5554'];
const destination = path.join(projectRoot, 'artifacts/emulator/lua-touch');
const sourceRoot = path.join(projectRoot, 'third_party/miwatch-lua-watchfaces/RedmiWatch4/TouchEvents/app/lua');
const variant = process.argv[2] ?? 'original';
if (!['original', 'default-font'].includes(variant)) throw new Error('Usage: node tools/try-touch-events.mjs [original|default-font]');
const guestRoot = variant === 'original' ? '/tmp/rw4-doom-touch-20261003' : '/tmp/rw4-doom-touch-default-font-20261003';
const expected = new Map([
  ['cat.png', '4c5d19b1be6a4c693ff57f616c87376cffe0eb37'],
  ['image.lua', '07258c4d46147aa1db2584d1c3cf35e8a394c339'],
  ['main.lua', '7ae831f99a67a89942360c8d89534f2e37f2b379'],
  ['root.lua', '9253ff2df1daaee4bd68c4ab1e230caea46efa1c'],
]);
const sourceEntries = fs.readdirSync(sourceRoot, { withFileTypes: true });
if (sourceEntries.length !== expected.size || sourceEntries.some(entry => !entry.isFile() || !expected.has(entry.name))) {
  throw new Error('Unexpected files or directories in upstream sample upload');
}
for (const [name, sha] of expected) {
  const bytes = fs.readFileSync(path.join(sourceRoot, name));
  const actual = crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (actual !== sha) throw new Error(`Upstream file changed: ${name}`);
}
let uploadRoot = sourceRoot;
if (variant === 'default-font') {
  uploadRoot = path.join(projectRoot, 'emulator/local/touch-default-font');
  fs.mkdirSync(uploadRoot, { recursive: true });
  for (const [name] of expected) {
    const data = fs.readFileSync(path.join(sourceRoot, name));
    if (name === 'main.lua') {
      const original = data.toString('utf8');
      const marker = /^\s*text_font = lvgl\.Font\("misansw regular", 32\)\s*\r?\n/m;
      if (!marker.test(original)) throw new Error('Expected upstream font line not found');
      fs.writeFileSync(path.join(uploadRoot, name), original.replace(marker, ''));
    } else fs.writeFileSync(path.join(uploadRoot, name), data);
  }
}
fs.mkdirSync(destination, { recursive: true });
function invoke(args, name) {
  const result = spawnSync(executable, [...common, ...args], { shell: false, windowsHide: true,
    timeout: 15000, maxBuffer: 1024 * 1024, encoding: 'utf8' });
  const record = { args: [...common, ...args], status: result.status, error: result.error?.message ?? null,
    stdout: result.stdout ?? '', stderr: result.stderr ?? '', createdAtUtc: new Date().toISOString() };
  fs.writeFileSync(path.join(destination, `${variant}-${name}.json`), JSON.stringify(record, null, 2) + '\n');
  if (result.error || result.status !== 0) throw new Error(`${name} failed; see artifact`);
  return record;
}
const before = invoke(['shell', 'ls', guestRoot], '00-before');
if (!/No such file|does not exist|^nsh: ls: stat failed: 2\r?$/im.test(before.stdout + before.stderr)) {
  throw new Error('Temporary sample directory already exists or absence cannot be established');
}
invoke(['push', uploadRoot, guestRoot], '01-push-source');
const code = `package.path='${guestRoot}/?.lua;'..package.path; SCRIPT_PATH='${guestRoot}/'; dofile(SCRIPT_PATH..'main.lua')`;
const attempt = invoke(['shell', 'lua', '-e', `"${code}"`], '02-run-original');
console.log(JSON.stringify({ variant, uploadedTo: guestRoot, storage: 'tmpfs', watchfaceInstalled: false,
  sourceModified: variant !== 'original', originalPreserved: true, stdout: attempt.stdout, stderr: attempt.stderr }, null, 2));
