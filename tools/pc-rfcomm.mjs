// Offline by default. Explicit probe uses a reviewed private target and supervisor.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {supervise, validateTarget} from './pc-rfcomm-supervisor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'experiments/pc-rfcomm');
const output = path.join(root, 'artifacts/pc-rfcomm');
const exe = path.join(output, 'Rw4PcRfcomm.exe');
const metadata = path.join(output, 'build.json');
const compiler = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';
const sources = ['Probe.cs', 'WinSockTransport.cs', 'PhysicalWorker.cs', 'SelfTests.cs'];
const args = process.argv.slice(2);
const action = args[0] ?? 'plan';
const hashFile = file => {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Unexpected file type');
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
};
const sourceHashes = () => Object.fromEntries(sources.map(file => [file, hashFile(path.join(dir, file))]));
function run(file, argv) {
  const result = spawnSync(file, argv, {cwd: root, encoding: 'utf8', windowsHide: true,
    shell: false, timeout: 60000, maxBuffer: 1024 * 1024});
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw Error('Offline tool launch failed');
  return result.status;
}
try {
  if (action === 'plan' && args.length <= 1) {
    console.log(JSON.stringify({checkpoint: 'R148', physicalEnabled: false,
      actions: ['build', 'test', 'simulate success|refused|timeout|error|close-failure', 'probe (review R154 first)'],
      bluetoothOperationRequested: false, watchCommandRequested: false}));
  } else if (action === 'build' && args.length === 1) {
    const inputs = sourceHashes();
    const compilerSha256 = hashFile(compiler);
    fs.mkdirSync(output, {recursive: true});
    const status = run(compiler, ['/nologo', '/target:exe', '/platform:x64', '/optimize+',
      '/warn:4', '/warnaserror+', '/out:' + exe, ...sources.map(file => path.join(dir, file))]);
    if (status !== 0) throw Error('Compilation failed');
    fs.writeFileSync(metadata, JSON.stringify({checkpoint: 'R148', sourceHashes: inputs,
      compilerSha256, executableSha256: hashFile(exe), physicalEnabled: false,
      physicalProbePrepared: true}, null, 2) + '\n');
    console.log(JSON.stringify({checkpoint: 'R148', built: true,
      executableSha256: hashFile(exe), physicalEnabled: false, bluetoothOperationRequested: false}));
  } else if ((action === 'test' && args.length === 1) || (action === 'probe' && args.length === 1) ||
      (action === 'simulate' && args.length === 2 &&
      ['success', 'refused', 'timeout', 'error', 'close-failure'].includes(args[1]))) {
    const prior = JSON.parse(fs.readFileSync(metadata, 'utf8'));
    if (prior.physicalEnabled !== false || prior.executableSha256 !== hashFile(exe) ||
        JSON.stringify(prior.sourceHashes) !== JSON.stringify(sourceHashes())) throw Error('Rebuild changed/unverified source');
    if (action === 'probe') {
      const targetFile = path.join(root, 'tools/local/pc-rfcomm/target.json');
      const stat = fs.lstatSync(targetFile);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 4096) throw Error('Target refused');
      const address = validateTarget(JSON.parse(fs.readFileSync(targetFile, 'utf8')));
      const report = await supervise(exe, address);
      console.log(JSON.stringify(report));
      process.exitCode = report.outcome === 'Opened' && report.closeConfirmed && report.workerExitConfirmed ? 0 : 1;
    } else process.exitCode = run(exe, args);
  } else throw Error('Unsupported action');
} catch {
  console.error('PC RFCOMM refused or failed. Check documented action, build hashes and private reviewed target; no fallback or raw errors.');
  process.exitCode = 1;
}
