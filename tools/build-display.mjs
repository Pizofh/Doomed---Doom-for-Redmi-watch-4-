// Only the framebuffer inquiry/pattern for the inspected PC image.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';

const variant = process.argv[2];
if (!['probe', 'pattern'].includes(variant)) throw new Error('Expected probe|pattern');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const guestHash = '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
const root = path.join(projectRoot, 'tools/local/arm-14.3-review');
const pins = {
  'bin/arm-none-eabi-gcc.exe': '6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4',
  'bin/arm-none-eabi-objdump.exe': 'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1',
  'bin/arm-none-eabi-readelf.exe': 'e0f53e6cf812ca2a240b57fee99b6e77ec28cc515cc65c93d8ab0573b522d1c6',
  'libexec/gcc/arm-none-eabi/14.3.1/cc1.exe': '553e335a64f1bf784311202578e7102f2338930d3af3b39b7e1fa474adb0cf84',
  'arm-none-eabi/bin/as.exe': '3730b6d3752f021f4718e331b8f1295bb737ab5d9ee5b40ed7537958eb40a35f',
  'arm-none-eabi/bin/ld.exe': '041ff41f439498450235ecd561bd1365136e7969bb30705c5ddd5a2e3cba3132'
};
for (const [file, expected] of Object.entries(pins)) {
  if (hash(fs.readFileSync(path.join(root, file))) !== expected) throw new Error(`Reviewed tool changed: ${file}`);
}
const logs = [];
function run(exe, args) {
  const result = spawnSync(exe, args, { cwd: projectRoot, shell: false, windowsHide: true,
    timeout: 20000, maxBuffer: 2 * 1024 * 1024, encoding: 'utf8' });
  logs.push({ exe, args, status: result.status, stdout: result.stdout, stderr: result.stderr });
  if (result.error || result.status !== 0) throw new Error(`Tool failed: ${path.basename(exe)} ${result.error?.message ?? result.stderr}`);
  return result.stdout;
}
const guest = JSON.parse(run(process.execPath, [path.join(projectRoot, 'tools/inspect-native.mjs'),
  path.join(packageRoot, 'system-images/vela-release-4.0/nuttx'), 'display']));
if (guest.sha256 !== guestHash) throw new Error('Guest differs from inspected display driver');
const destination = path.join(projectRoot, 'build/display');
fs.mkdirSync(destination, { recursive: true });
const source = `experiments/framebuffer/${variant}.c`;
const flags = ['-mcpu=cortex-a7', '-mthumb', '-mfpu=neon-vfpv4', '-mfloat-abi=hard', '-mgeneral-regs-only', '-mlong-calls',
  '-falign-functions=4', '-std=c17', '-Os', '-ffreestanding', '-fno-builtin', '-fno-common',
  '-fno-unwind-tables', '-fno-asynchronous-unwind-tables', '-fno-stack-protector', '-Wall', '-Wextra', '-Werror'];
const object = `build/display/${variant}.o`;
run(path.join(root, 'bin/arm-none-eabi-gcc.exe'), [...flags, '-c', source, '-o', object]);
const objectSymbols = run(path.join(root, 'bin/arm-none-eabi-readelf.exe'), ['-s', object]);
const imports = [...objectSymbols.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m => m[1]);
const allowed = variant === 'probe' ? ['open', 'close', 'ioctl', 'printf', 'memset'] :
  ['open', 'close', 'ioctl', 'printf', 'malloc', 'free', 'memcpy', 'memset', 'usleep', 'fflush'];
const bindings = imports.map(name => {
  const symbol = guest.selectedSymbols.find(s => s.name === name && (s.info & 15) === 2);
  if (!allowed.includes(name) || !symbol) throw new Error(`Unreviewed import: ${name}`);
  return symbol;
});
const output = `build/display/${variant}.elf`;
run(path.join(root, 'arm-none-eabi/bin/ld.exe'), ['-r', '-e', 'rw4_display_init',
  ...bindings.map(s => `--defsym=${s.name}=${s.value}`), object, '-o', output]);
const readelf = run(path.join(root, 'bin/arm-none-eabi-readelf.exe'), ['-h', '-A', '-S', '-r', '-s', output]);
const disassembly = run(path.join(root, 'bin/arm-none-eabi-objdump.exe'), ['-dr', output]);
const bytes = fs.readFileSync(path.join(projectRoot, output));
const relocations = [...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m => m[0]);
if (bytes[4] !== 1 || bytes[5] !== 1 || bytes.readUInt16LE(16) !== 1 || bytes.readUInt16LE(18) !== 40 ||
    (bytes.readUInt32LE(24) & 3) !== 1 || bytes.readUInt32LE(36) !== 0x5000000 || bytes.length > 65536 ||
    relocations.some(r => r !== 'R_ARM_ABS32') || /\bUND[ \t]+\S+[ \t]*$/m.test(readelf)) {
  throw new Error('Unreviewed ELF layout/relocations; inspect before loading');
}
const known = {
  probe: { source: 'd2799ae125a1eb6a50aa2e9e506bcdd6baf6f815d5d4177439bdb26cd8ac6ae6',
    binary: 'd7e40268059936c285504bbbf84ffe59fdf2562358b0c762745ddad041e39674' },
  pattern: { source: '7ed7779b4ff4660f6613385f5f3f43040a940a562d68ee1696567cbd78c2c5a3',
    binary: '430c67fa9bad0c3be1c069608de88be91d8b0672db66aa5abfd9652969122bcb' }
};
const sourceHash = hash(fs.readFileSync(path.join(projectRoot, source), 'utf8').replace(/\r\n/g, '\n'));
const record = { variant, guestSha256: guestHash, sha256: hash(bytes), sourceSha256: sourceHash,
  bytes: bytes.length, entry: bytes.readUInt32LE(24), flags, bindings, relocations,
  contractReviewed: sourceHash === known[variant].source && hash(bytes) === known[variant].binary };
fs.writeFileSync(path.join(destination, `${variant}-review.json`), JSON.stringify(record, null, 2) + '\n');
fs.writeFileSync(path.join(destination, `${variant}-readelf.txt`), readelf);
fs.writeFileSync(path.join(destination, `${variant}-disassembly.txt`), disassembly);
fs.writeFileSync(path.join(destination, `${variant}-build-log.json`), JSON.stringify(logs, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
