// Only fixed marker counts from existing private logs. No raw lines or radio.
import fs from 'node:fs/promises';
import path from 'node:path';
import {TextDecoder} from 'node:util';
import {pathToFileURL} from 'node:url';
import {privateDirectory} from './check-mi-fitness-auth.mjs';

const markers = Object.freeze({
  LYRA_DECISION: /useLyra\(\) called supportLyra:/,
  LYRA_ALL_TRUE: /useLyra\(\) called supportLyra:\s*true,\s*enable:\s*true,\s*permission:\s*true/,
  RUNNING_CLIENT: /runningOnClient\(\) called/,
  BIND_SUCCEEDED: /init\(\) called with: bind lyra service result\s+true/,
  BIND_FAILED: /init\(\) called with: bind lyra service result\s+false/,
  REMOTE_PACKAGE: /\bcom\.xiaomi\.mi_connect_service\b/,
  CORE_SERVICE: /\bMiWearCoreService\b/,
  SYSTEM_SPP_CONNECT: /start socket connect, socket =/,
  SPP_FAILURE: /socket connect failure, (?:>= u|< u|bluetooth exception code)/,
});
export function countCoreMarkers(text) {
  const counts = Object.fromEntries(Object.keys(markers).map(k => [k, 0]));
  let skippedLongLines = 0;
  for (const line of text.split(/\r?\n/)) {
    if (line.length > 2 * 1024 * 1024) { skippedLongLines++; continue; }
    for (const [name, regex] of Object.entries(markers)) if (regex.test(line)) counts[name]++;
  }
  return {counts, skippedLongLines};
}
export async function scanCoreMarkers() {
  const dir = await fs.lstat(privateDirectory);
  if (!dir.isDirectory() || dir.isSymbolicLink()) throw Error('invalid-input');
  const entries = (await fs.readdir(privateDirectory)).filter(name => /\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(name));
  if (!entries.length || entries.length > 100) throw Error('input-limit');
  let totalBytes = 0;
  const total = countCoreMarkers('');
  for (const name of entries) {
    const filename = path.join(privateDirectory, name), stat = await fs.lstat(filename);
    totalBytes += stat.size;
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 32 * 1024 * 1024 || totalBytes > 128 * 1024 * 1024) throw Error('input-limit');
    const bytes = await fs.readFile(filename);
    if (bytes.length !== stat.size || bytes.includes(0)) throw Error('input-changed-or-encoding');
    const result = countCoreMarkers(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
    total.skippedLongLines += result.skippedLongLines;
    for (const key of Object.keys(markers)) total.counts[key] += result.counts[key];
  }
  return {filesScanned: entries.length, ...total, rw4RouteVerified: false,
    currentPhoneServiceStateVerified: false, rawLinesExported: false, radioOperationPerformed: false};
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 2) throw Error('invalid-arguments');
    console.log(JSON.stringify(await scanCoreMarkers(), null, 2));
  } catch {
    console.error('Core marker check failed; no private input or path printed.'); process.exitCode = 1;
  }
}
