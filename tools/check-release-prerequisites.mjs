// Read-only inventory of public build inputs. Never reads connection data.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha256 = b => createHash('sha256').update(b).digest('hex');
export function checkPrerequisites(base = root) {
  const results = [];
  function check(name, relative, expected, max = 32 * 1024 * 1024) {
    let status = 'missing';
    try {
      const filename = path.join(base, relative), stat = fs.lstatSync(filename);
      const resolved = path.relative(fs.realpathSync(base), fs.realpathSync(filename));
      if (stat.isSymbolicLink() || !stat.isFile() || stat.size > max ||
          resolved.startsWith('..') || path.isAbsolute(resolved)) status = 'refused';
      else status = !expected || sha256(fs.readFileSync(filename)) === expected ? 'present' : 'changed';
    } catch (error) { if (error.code !== 'ENOENT') status = 'unreadable'; }
    results.push({name, path: relative, status});
  }
  check('Arm GCC', 'tools/local/arm-14.3-review/bin/arm-none-eabi-gcc.exe',
    '6121d01ff6254766be6cb9ca493bc7b8ce9b7dee250f27d30e5596fa3ff873e4');
  check('Arm objdump', 'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe',
    'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1');
  check('EasyFace compiler', 'tools/local/easyface-v4.23-review/Compiler.exe',
    'bfb8c3b6666b79de165884d832c69d46e5bbfa581c65c1e188cddfc4b9d6723a');
  check('RW4 inspection image', 'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin',
    '2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db');
  check('Shareware 1.9 WAD', 'tools/local/doom-shareware/doom1.wad',
    '1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771');
  check('Pads RW4 baseline', 'build/doom-pads-r349/rw4/doom.elf',
    '98d9082e606f213633c379593bb8b7937f9de3bbdf24f0c5269fa369001a0423');
  check('Pads link recipe', 'build/doom-pads-r349/rw4/build-log.json');
  check('Engine baseline', 'build/doom-rw4-engine/engine-port.o');
  check('Libc baseline review', 'build/doom-rw4-libc/review.json');
  check('Tested face package', 'build/doom-ready-r351/package/DoomReady-id-only.face',
    'fa2146fde2cb9bba9a7637779c747fdbbb24faf62e7b56386c66e575f3ead5c8');
  let upstream = {status: 'missing-lock', verified: 0};
  try {
    const lock = JSON.parse(fs.readFileSync(path.join(base, 'doom/doomgeneric-source.lock.json')));
    if (lock.revision !== 'dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284' || lock.files.length !== 181)
      throw Error('Source lock changed');
    upstream = {status: 'verified', verified: 0};
    for (const entry of lock.files) {
      if (!/^(LICENSE|README\.TXT|README\.md|doomgeneric\/(Makefile|[a-z0-9_.]+))$/.test(entry.path))
        throw Error('Source path refused');
      const relative = 'third_party/doomgeneric/' + entry.path;
      check('Pinned upstream source', relative, null, 2 * 1024 * 1024);
      const item = results.at(-1);
      if (item.status === 'present') {
        const bytes = fs.readFileSync(path.join(base, relative));
        const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
        if (bytes.length !== entry.size || blob !== entry.gitBlobSha1) item.status = 'changed';
        else upstream.verified++;
      }
      if (item.status !== 'present') upstream.status = 'incomplete';
    }
  } catch { upstream.status = 'invalid-or-missing-lock'; }
  return {nodeMajor: Number(process.versions.node.split('.')[0]), platform: process.platform,
    upstream, present: results.filter(r => r.status === 'present').length,
    issues: results.filter(r => r.status !== 'present'),
    cleanCheckoutBuildSupported: false,
    note: 'Incremental research build; this inventory is not a complete dependency graph or an installation gate.',
    deviceOperationPerformed: false, privateConnectionDataRead: false};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw Error('No arguments supported');
  console.log(JSON.stringify(checkPrerequisites(), null, 2));
}
