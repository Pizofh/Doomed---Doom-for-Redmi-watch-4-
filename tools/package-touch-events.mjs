// Compile the pinned Lua sample on the PC. No ADB, device install or Doom build.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot } from './verify-emulator.mjs';

const variant = process.argv[2] ?? 'original';
if (!['original', 'default-font'].includes(variant)) throw new Error('Expected original|default-font');
const compilerRoot = path.join(projectRoot, 'tools/local/easyface-v4.23-review');
const compiler = path.join(compilerRoot, 'Compiler.exe');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
if (hash(fs.readFileSync(compiler)) !== 'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a' ||
    hash(fs.readFileSync(path.join(compilerRoot, 'DeviceInfo.db'))) !== '7fde4b233d75e36985f709e84ea4c164c494b02d109bcdb5f50f0ab76e6c3f76') {
  throw new Error('Compiler or device database differs from reviewed release');
}
// MainBody IL checks for adb.exe beside Compiler.exe before invoking AdbBridge.
// Its bridge is unscoped and performs rm/reboot; keep that path unavailable.
const allowedCompilerFiles = new Set(['Compiler.exe', 'DeviceInfo.db', 'EasyFace_en.exe']);
if (fs.readdirSync(compilerRoot).some(name => !allowedCompilerFiles.has(name)) ||
    fs.existsSync(path.join(compilerRoot, 'adb.exe'))) throw new Error('Compiler directory must contain no ADB/dependencies beyond the reviewed subset');
const expected = new Map([
  ['app/lua/cat.png', '4c5d19b1be6a4c693ff57f616c87376cffe0eb37'],
  ['app/lua/image.lua', '07258c4d46147aa1db2584d1c3cf35e8a394c339'],
  ['app/lua/main.lua', '7ae831f99a67a89942360c8d89534f2e37f2b379'],
  ['app/lua/root.lua', '9253ff2df1daaee4bd68c4ab1e230caea46efa1c'],
  ['TouchEvents.fprj', '775a7998e8bf6156b6af93886eaa410e5b46e87d'],
  ['images/preview.png', '249b163530f4f402e9ab7a9253b79b64ca2cc20d'],
]);
const sourceRoot = path.join(projectRoot, 'third_party/miwatch-lua-watchfaces/RedmiWatch4/TouchEvents');
const copies = [...expected].map(([filename, sha]) => {
  const bytes = fs.readFileSync(path.join(sourceRoot, filename));
  if (crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') !== sha) {
    throw new Error(`Source differs from pinned upstream: ${filename}`);
  }
  return { filename, bytes };
});
const work = path.join(projectRoot, `emulator/local/touch-watchface-${variant}`);
if (fs.existsSync(work)) throw new Error('Build directory exists; inspect previous output before retrying');
for (const { filename, bytes } of copies) {
  const target = path.join(work, filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (variant === 'default-font' && filename === 'app/lua/main.lua') {
    const text = bytes.toString('utf8');
    const marker = /^\s*text_font = lvgl\.Font\("misansw regular", 32\)\s*\r?\n/m;
    if (!marker.test(text)) throw new Error('Expected font declaration absent');
    fs.writeFileSync(target, text.replace(marker, ''));
  } else fs.writeFileSync(target, bytes);
}
const output = path.join(work, 'output');
fs.mkdirSync(output);
const env = { ...process.env, TEMP: work, TMP: work,
  PATH: path.join(process.env.SystemRoot, 'System32') };
const args = ['-b', path.join(work, 'TouchEvents.fprj'), output, 'TouchEvents.face', '365799901'];
const result = spawnSync(compiler, args, { cwd: work, env, shell: false, windowsHide: true,
  timeout: 30000, maxBuffer: 2 * 1024 * 1024, encoding: 'utf8' });
const record = { variant, args, compilerSha256: hash(fs.readFileSync(compiler)),
  status: result.status, error: result.error?.message ?? null, stdout: result.stdout, stderr: result.stderr,
  adbBesideCompiler: false, installed: false, createdAtUtc: new Date().toISOString() };
fs.writeFileSync(path.join(projectRoot, `artifacts/package-review/touch-package-${variant}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
// This compiler sometimes returns status 0 after catching an error.
if (result.error || result.status !== 0 || !/No Errors/.test(result.stdout) ||
    !/adb util is missing, skipping to upload/.test(result.stdout)) {
  throw new Error('Packaging failed or expected no-ADB branch was not observed; inspect log');
}
const bytes = fs.readFileSync(path.join(output, 'TouchEvents.face'));
if (bytes.length < 168 || bytes.length > 4 * 1024 * 1024) throw new Error('Unexpected package size');
record.outputSha256 = hash(bytes);
fs.writeFileSync(path.join(projectRoot, `artifacts/package-review/touch-package-${variant}.json`), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ outputBytes: bytes.length, sha256: hash(bytes),
  headerHex: bytes.subarray(0, 64).toString('hex'), installed: false }, null, 2));
