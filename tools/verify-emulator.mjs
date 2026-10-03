import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const packageRoot = path.join(projectRoot, 'emulator/local/reviewed-v1.0');
export function verifyEmulator() {
  const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'third_party/openvela-emulator-binaries.lock.json'), 'utf8'));
  const results = manifest.files.map(file => {
    const data = fs.readFileSync(path.join(packageRoot, 'emulator', file.path));
    const blob = crypto.createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    return { path: file.path, expected: file.gitBlobSha1, actual: blob, matches: blob === file.gitBlobSha1 && data.length === file.sizeBytes };
  });
  const report = { officialRepository: manifest.repository, revision: manifest.revision, checked: results.length,
    matched: results.filter(r => r.matches).length, mismatches: results.filter(r => !r.matches), executed: false };
  if (report.mismatches.length) throw new Error(JSON.stringify(report));
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = verifyEmulator();
  const destination = path.join(projectRoot, 'artifacts/package-review');
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, 'official-binary-comparison.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
