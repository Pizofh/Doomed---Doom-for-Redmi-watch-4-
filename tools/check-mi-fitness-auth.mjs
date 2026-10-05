// Local diagnostic only. No network, Bluetooth, subprocesses or credential export.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const privateDirectory = path.join(root, 'tools', 'local', 'mi-fitness-logs');
const maxFileBytes = 32 * 1024 * 1024;
const maxTotalBytes = 128 * 1024 * 1024;

// Documented field names plus snake_case variants. Generic token remains ambiguous.
// A match is syntax evidence only: it does not identify the watch or a usable key.
function collect(text, keys, fields) {
  const pattern = /(?<![\w])(?:encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)[\\'"\s]{0,16}[:=][\\'"\s]{0,16}(?:0x)?([a-fA-F0-9]{32})(?![\w])/g;
  for (const match of text.matchAll(pattern)) {
    keys.add(match[1].toLowerCase());
    fields.add(/^(encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)/.exec(match[0])[1]);
  }
}

export async function scanDirectory(directory) {
  const info = await fs.lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('invalid-input');
  const entries = (await fs.readdir(directory, {withFileTypes: true}))
    .filter(entry => /\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(entry.name));
  if (!entries.length || entries.length > 100) throw new Error('invalid-input');
  const keys = new Set(), fields = new Set();
  let totalBytes = 0, filesWithCandidates = 0, backupFilesScanned = 0;
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    const stat = await fs.lstat(filename);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('invalid-input');
    totalBytes += stat.size;
    if (stat.size > maxFileBytes || totalBytes > maxTotalBytes) throw new Error('input-limit');
    const bytes = await fs.readFile(filename);
    if (bytes.length > maxFileBytes || bytes.length !== stat.size) throw new Error('input-changed');
    // Reject UTF-16/binary instead of reporting a misleading negative result.
    if (bytes.includes(0)) throw new Error('unsupported-encoding');
    const fileKeys = new Set();
    collect(bytes.toString('utf8'), fileKeys, fields);
    if (fileKeys.size) filesWithCandidates++;
    for (const key of fileKeys) keys.add(key);
    if (/\.bak(?:\.\d+)?$/i.test(entry.name)) backupFilesScanned++;
  }
  return {
    status: keys.size ? 'candidate-found' : 'no-candidate-found',
    filesScanned: entries.length,
    backupFilesScanned,
    filesWithCandidates,
    distinctCandidateCount: keys.size,
    matchedFields: [...fields].sort(),
    deviceAssociationVerified: false,
    authenticationVerified: false
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 2) throw new Error('invalid-arguments');
    console.log(JSON.stringify(await scanDirectory(privateDirectory), null, 2));
  } catch {
    // Never echo filesystem errors, input paths, raw lines or credential values.
    console.error('Check failed: use the private folder with complete UTF-8 .log/.log.bak files (max 32 MiB each, 128 MiB total). No credentials printed.');
    process.exitCode = 1;
  }
}
