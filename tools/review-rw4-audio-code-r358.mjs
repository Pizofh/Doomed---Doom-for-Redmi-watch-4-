// Offline disassembly of fixed windows only; bytes remain in ignored artifacts.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv.length !== 2) throw Error('Fixed review only');
const file = path.join(root, 'tools/local/firmware-research/rw4-stock-candidate-r193/vela-ap-inspection-only.bin');
const exe = path.join(root, 'tools/local/arm-14.3-review/bin/arm-none-eabi-objdump.exe');
const digest = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if (digest(file) !== '2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db' ||
    digest(exe) !== 'ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1') throw Error('Inputs changed');
const output = path.join(root, 'artifacts/research/audio-r358/code');
if (fs.existsSync(output)) throw Error('Code review exists');
const windows = [
  ['bes-registration', 0x1fb500, 0x1fbb20],
  ['nxplayer', 0x217900, 0x218f00],
  ['stock-pcm-player', 0x280a00, 0x281500],
  ['audio-upper', 0x4b2400, 0x4b3060],
  ['media-write', 0x5b1700, 0x5b1c00],
];
fs.mkdirSync(output, {recursive: true});
for (const [name, start, end] of windows) {
  const result = spawnSync(exe, ['-D', '-b', 'binary', '-m', 'arm', '-EL', '-M', 'force-thumb',
    '--start-address=' + start, '--stop-address=' + end, file],
  {windowsHide: true, shell: false, encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024});
  if (result.error || result.status !== 0) throw Error('Disassembly failed');
  fs.writeFileSync(path.join(output, name + '.txt'), result.stdout, {flag: 'wx'});
}
fs.writeFileSync(path.join(output, 'review.json'), JSON.stringify({windows,
  firmwareExecuted: false, physicalWatchUsed: false}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({windows: windows.length, firmwareExecuted: false, physicalWatchUsed: false}));
