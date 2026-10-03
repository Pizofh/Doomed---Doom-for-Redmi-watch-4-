// Reproduce the reviewed, emulator-only hello. No SDK install or guest execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
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
function run(executable, args) {
  const r = spawnSync(executable, args, { cwd: projectRoot, shell: false, windowsHide: true,
    encoding: 'utf8', timeout: 20000, maxBuffer: 2 * 1024 * 1024 });
  logs.push({ executable, args, status: r.status, stdout: r.stdout, stderr: r.stderr });
  if (r.error || r.status !== 0) throw new Error(`Tool failed: ${path.basename(executable)}: ${r.error?.message ?? r.stderr}`);
  return r.stdout;
}
const image = path.join(packageRoot, 'system-images/vela-release-4.0/nuttx');
const guest = JSON.parse(run(process.execPath, [path.join(projectRoot, 'tools/inspect-native.mjs'), image, 'modules']));
const guestHash = '849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa';
if (guest.sha256 !== guestHash) throw new Error('Guest differs from inspected loader');
const puts = guest.selectedSymbols.find(s => s.name === 'puts' && (s.info & 15) === 2);
if (!puts || !(Number(puts.value) & 1) || puts.size !== 96) throw new Error('Expected guest Thumb puts symbol missing');
const destination = path.join(projectRoot, 'build/hello-native');
fs.mkdirSync(destination, { recursive: true });
const source = 'experiments/hello-native/hello.c';
const flags = ['-mcpu=cortex-a7', '-mthumb', '-mfpu=neon-vfpv4', '-mfloat-abi=hard', '-mlong-calls',
  '-std=c17', '-Os', '-ffreestanding', '-fno-builtin', '-fno-common', '-fno-unwind-tables',
  '-fno-asynchronous-unwind-tables', '-fno-stack-protector', '-Wall', '-Wextra', '-Werror'];
run(path.join(root, 'bin/arm-none-eabi-gcc.exe'), [...flags, '-c', source, '-o', 'build/hello-native/hello.o']);
for (const variant of ['import', 'bound']) {
  const output = `build/hello-native/hello-${variant}.elf`;
  run(path.join(root, 'arm-none-eabi/bin/ld.exe'), ['-r', '-e', 'rw4_hello_init',
    ...(variant === 'bound' ? [`--defsym=puts=${puts.value}`] : []), 'build/hello-native/hello.o', '-o', output]);
  const readelf = run(path.join(root, 'bin/arm-none-eabi-readelf.exe'), ['-h', '-A', '-S', '-r', '-s', output]);
  const disassembly = run(path.join(root, 'bin/arm-none-eabi-objdump.exe'), ['-dr', output]);
  const bytes = fs.readFileSync(path.join(projectRoot, output));
  const relocations = [...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m => m[0]);
  const undefinedNames = [...readelf.matchAll(/\bUND\s+(\S+)[ \t]*$/gm)].map(m => m[1]);
  if (bytes.readUInt16LE(16) !== 1 || bytes.readUInt16LE(18) !== 40 || bytes[4] !== 1 || bytes[5] !== 1 ||
      bytes.readUInt32LE(24) !== 1 || bytes.readUInt32LE(36) !== 0x5000000 ||
      relocations.length !== 2 || relocations.some(r => r !== 'R_ARM_ABS32') ||
      !readelf.includes('Tag_ABI_VFP_args: VFP registers') || !/00000001\s+28\s+FUNC.*rw4_hello_init/.test(readelf) ||
      (variant === 'bound' ? undefinedNames.length !== 0 :
        undefinedNames.length !== 1 || undefinedNames[0] !== 'puts')) {
    throw new Error('ELF differs from the reviewed ABI/layout; inspect before running');
  }
  const record = { variant, contractReviewed: true, guestSha256: guestHash, sha256: hash(bytes), bytes: bytes.length,
    sourceSha256: hash(fs.readFileSync(path.join(projectRoot, source))), flags, entry: 1, relocations,
    imports: variant === 'import' ? ['puts'] : [], imageBoundSymbol: variant === 'bound' ? puts : null,
    hardwareScope: 'emulator only', reviewedAtUtc: new Date().toISOString() };
  fs.writeFileSync(path.join(destination, `${variant}-review.json`), JSON.stringify(record, null, 2) + '\n');
  fs.writeFileSync(path.join(destination, `${variant}-readelf.txt`), readelf);
  fs.writeFileSync(path.join(destination, `${variant}-disassembly.txt`), disassembly);
  console.log(JSON.stringify({ variant, bytes: bytes.length, sha256: record.sha256 }));
}
fs.writeFileSync(path.join(destination, 'build-log.json'), JSON.stringify({ tools: pins, logs }, null, 2) + '\n');
