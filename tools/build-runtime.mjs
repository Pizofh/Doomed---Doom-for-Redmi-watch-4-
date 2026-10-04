// Finite runtime contract probe for the exact inspected PC image; never hardware.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { projectRoot, packageRoot } from './verify-emulator.mjs';

const variant = 'runtime';
if (process.argv.length !== 2) throw new Error('This build accepts no target arguments');
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
const image=fs.readFileSync(path.join(packageRoot,'system-images/vela-release-4.0/nuttx'));if(hash(image)!==guestHash)throw Error('Guest changed');
const selectedSymbols=[];const shoff=image.readUInt32LE(32),shsize=image.readUInt16LE(46),count=image.readUInt16LE(48);
for(let i=0;i<count;i++){const p=shoff+i*shsize;if(image.readUInt32LE(p+4)!==2)continue;const off=image.readUInt32LE(p+16),n=image.readUInt32LE(p+20),link=shoff+image.readUInt32LE(p+24)*shsize;const strings=image.subarray(image.readUInt32LE(link+16),image.readUInt32LE(link+16)+image.readUInt32LE(link+20));for(let at=off;at<off+n;at+=16){const start=image.readUInt32LE(at),end=strings.indexOf(0,start),name=strings.toString('ascii',start,end);selectedSymbols.push({name,value:'0x'+image.readUInt32LE(at+4).toString(16),info:image[at+12]});}}
const guest={selectedSymbols};
const destination = path.join(projectRoot, 'build/native-runtime');
fs.mkdirSync(destination, { recursive: true });
const source = `experiments/native-runtime/runtime-probe.c`;
const flags = ['-mcpu=cortex-a7', '-mthumb', '-mfpu=neon-vfpv4', '-mfloat-abi=hard', '-mlong-calls',
  '-falign-functions=4', '-ffunction-sections', '-std=c17', '-Os', '-ffreestanding', '-fno-builtin', '-fno-common',
  '-fno-unwind-tables', '-fno-asynchronous-unwind-tables', '-fno-stack-protector', '-Wall', '-Wextra', '-Werror', '-Idoom/platform-rw4'];
const object = `build/native-runtime/${variant}.o`;
run(path.join(root, 'bin/arm-none-eabi-gcc.exe'), [...flags, '-c', source, '-o', 'build/native-runtime/probe.o']);
run(path.join(root, 'bin/arm-none-eabi-gcc.exe'), [...flags, '-c', 'doom/platform-rw4/runtime.c', '-o', 'build/native-runtime/shim.o']);
run(path.join(root, 'arm-none-eabi/bin/ld.exe'), ['-r','-T','doom/platform-rw4/module.ld','build/native-runtime/probe.o','build/native-runtime/shim.o','-o',object]);
const objectSymbols = run(path.join(root, 'bin/arm-none-eabi-readelf.exe'), ['-W', '-s', object]);
const imports = [...objectSymbols.matchAll(/\bUND[ \t]+(\S+)[ \t]*$/gm)].map(m => m[1]);
const allowed = ['fopen','fclose','fread','fseek','ftell','feof','ferror','clearerr','printf','malloc','free','vsnprintf','setjmp','longjmp','__errno','nxsched_gettid','pthread_create','pthread_join'];
const bindings = imports.map(name => {
  const symbol = guest.selectedSymbols.find(s => s.name === name && (s.info & 15) === 2);
  if (!allowed.includes(name) || !symbol) throw new Error(`Unreviewed import: ${name}`);
  return symbol;
});
const output = `build/native-runtime/${variant}.elf`;
run(path.join(root, 'arm-none-eabi/bin/ld.exe'), ['-r', '-e', 'rw4_runtime_init',
  ...bindings.map(s => `--defsym=${s.name}=${s.value}`), object, '-o', output]);
const readelf = run(path.join(root, 'bin/arm-none-eabi-readelf.exe'), ['-W', '-h', '-A', '-S', '-r', '-s', output]);
const disassembly = run(path.join(root, 'bin/arm-none-eabi-objdump.exe'), ['-dr', output]);
const bytes = fs.readFileSync(path.join(projectRoot, output));
const relocations = [...readelf.matchAll(/\bR_ARM_[A-Z0-9_]+\b/g)].map(m => m[0]);
if (bytes[4] !== 1 || bytes[5] !== 1 || bytes.readUInt16LE(16) !== 1 || bytes.readUInt16LE(18) !== 40 ||
    (bytes.readUInt32LE(24) & 3) !== 1 || bytes.readUInt32LE(36) !== 0x5000000 || bytes.length > 65536 ||
    relocations.some(r => r !== 'R_ARM_ABS32') || /\bUND[ \t]+\S+[ \t]*$/m.test(readelf)) {
  throw new Error('Unreviewed ELF layout/relocations; inspect before loading');
}
const known = {runtime: {source: 'e7c908f177034c26037640a099db79ee14ac309f38e7d65fdccc71622dbc7840', binary: '6fe5f39f45e9dcc7ffe28d97d51acd083a1a1806ba751be41218dadde529887a'}};
const sourceHash = hash([source,'doom/platform-rw4/runtime.c','doom/platform-rw4/runtime.h','doom/platform-rw4/module.ld'].map(p=>fs.readFileSync(path.join(projectRoot,p),'utf8').replace(/\r\n/g,'\n')).join('\n'));
const record = { variant, guestSha256: guestHash, sha256: hash(bytes), sourceSha256: sourceHash,
  bytes: bytes.length, entry: bytes.readUInt32LE(24), flags, bindings, relocations,
  contractReviewed: sourceHash === known[variant].source && hash(bytes) === known[variant].binary };
fs.writeFileSync(path.join(destination, `${variant}-review.json`), JSON.stringify(record, null, 2) + '\n');
fs.writeFileSync(path.join(destination, `${variant}-readelf.txt`), readelf);
fs.writeFileSync(path.join(destination, `${variant}-disassembly.txt`), disassembly);
fs.writeFileSync(path.join(destination, `${variant}-build-log.json`), JSON.stringify(logs, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
