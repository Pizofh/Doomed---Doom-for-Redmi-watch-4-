// Redacted label association only; never proves key validity or possession.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {privateDirectory, scanDirectory} from './check-mi-fitness-auth.mjs';

const authField = /^(encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)$/;
const identityField = /^(name|model|deviceName|deviceModel|modelName|productName|device_name|device_model|localName)$/;
const rw4Label = /\bM2315W1\b|\bRedmi Watch 4\b/i;
const candidateLine = /(?<![\w])(?:encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)[\\'"\s]{0,16}[:=][\\'"\s]{0,16}(?:0x)?[a-fA-F0-9]{32}(?![\w])/;

export function inspectAssociation(text) {
  let candidateLines = 0, sameLineRw4Labels = 0, sameObjectRw4Labels = 0;
  function visit(value, depth = 0) {
    if (depth > 12 || value === null) return;
    if (typeof value === 'string' && /^[\[{]/.test(value.trim())) {
      try { visit(JSON.parse(value), depth + 1); } catch { /* No raw parse errors. */ }
    } else if (Array.isArray(value)) {
      for (const child of value) visit(child, depth + 1);
    } else if (typeof value === 'object') {
      const entries = Object.entries(value);
      const hasKey = entries.some(([field, v]) => authField.test(field) &&
        typeof v === 'string' && /^(?:0x)?[a-fA-F0-9]{32}$/.test(v));
      const hasLabel = entries.some(([field, v]) => identityField.test(field) &&
        typeof v === 'string' && rw4Label.test(v));
      if (hasKey && hasLabel) sameObjectRw4Labels++;
      // Never join sibling objects or different devices in an array.
      for (const [, child] of entries) visit(child, depth + 1);
    }
  }
  for (const line of text.split(/\r?\n/)) {
    if (candidateLine.test(line)) {
      candidateLines++;
      if (rw4Label.test(line)) sameLineRw4Labels++;
    }
    if (line.length > 2 * 1024 * 1024) continue;
    // Logs may prefix a JSON record with a timestamp/tag. Unparseable records
    // stay unknown, including non-JSON Java dumps and pretty multiline objects.
    const first = line.indexOf('{'), last = line.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try { visit(JSON.parse(line.slice(first, last + 1))); } catch { /* Unknown. */ }
    }
  }
  return {
    status: sameObjectRw4Labels ? 'same-object-rw4-label-found' :
      sameLineRw4Labels ? 'same-line-rw4-label-only' : 'no-explicit-label-found',
    candidateLines, sameLineRw4Labels, sameObjectRw4Labels,
    authenticationVerified: false,
    physicalUnitIdentityVerified: false
  };
}

export async function checkAssociation() {
  // Reuse size/encoding/symlink guards before a second bounded local read.
  const candidateCheck = await scanDirectory(privateDirectory);
  const totals = {candidateLines: 0, sameLineRw4Labels: 0, sameObjectRw4Labels: 0};
  for (const entry of await fs.readdir(privateDirectory, {withFileTypes: true})) {
    if (!/\.log(?:\.bak(?:\.\d+)?|\.\d+\.bak)?$/i.test(entry.name)) continue;
    const filename = path.join(privateDirectory, entry.name);
    const stat = await fs.lstat(filename);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 32 * 1024 * 1024) throw Error('invalid-input');
    const bytes = await fs.readFile(filename);
    if (bytes.length !== stat.size || bytes.includes(0)) throw Error('input-changed');
    const result = inspectAssociation(bytes.toString('utf8'));
    for (const field of Object.keys(totals)) totals[field] += result[field];
  }
  return {
    status: totals.sameObjectRw4Labels ? 'same-object-rw4-label-found' :
      totals.sameLineRw4Labels ? 'same-line-rw4-label-only' : 'no-explicit-label-found',
    filesScanned: candidateCheck.filesScanned,
    ...totals,
    authenticationVerified: false,
    physicalUnitIdentityVerified: false
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.length !== 2) throw Error('invalid-arguments');
    console.log(JSON.stringify(await checkAssociation(), null, 2));
  } catch {
    console.error('Association check failed; no private values or raw records printed.');
    process.exitCode = 1;
  }
}
