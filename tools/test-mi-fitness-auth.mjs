// Synthetic privacy/recognition tests only; never read real phone logs.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {scanDirectory} from './check-mi-fitness-auth.mjs';

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rw4-auth-test-'));
try {
  const keyA = '0123456789abcdef'.repeat(2), keyB = 'fedcba9876543210'.repeat(2);
  await fs.writeFile(path.join(directory, 'own.device.log'),
    JSON.stringify({authKey: keyA, token: keyB}) + '\n' +
    `encryptKey="${keyA.toUpperCase()}"\n` +
    `other_authKey=${keyA}\nauthKey=${keyA}a\nauthKey=${keyA.slice(1)}\n`);
  await fs.writeFile(path.join(directory, 'own.device.log.bak'),
    `{"encrypt_key":"0x${keyA}"}\n{\\"huamiAuthKey\\":\\"${keyB}\\"}`);
  await fs.writeFile(path.join(directory, 'ignored.txt'), `authKey=${keyA}`);
  const result = await scanDirectory(directory);
  assert.deepEqual(result, {
    status: 'candidate-found', filesScanned: 2, backupFilesScanned: 1,
    filesWithCandidates: 2, distinctCandidateCount: 2,
    matchedFields: ['authKey', 'encryptKey', 'encrypt_key', 'huamiAuthKey', 'token'],
    deviceAssociationVerified: false, authenticationVerified: false
  });
  const output = JSON.stringify(result);
  for (const secret of [keyA, keyB, keyA.toUpperCase(), 'own.device.log']) assert(!output.includes(secret));
  await fs.writeFile(path.join(directory, 'own.device.log'), `authKey=${keyA}a\nother_authKey=${keyA}\nauthKey=${keyA.slice(1)}`);
  await fs.writeFile(path.join(directory, 'own.device.log.bak'), 'token=not-a-key');
  assert.equal((await scanDirectory(directory)).status, 'no-candidate-found');
  await fs.writeFile(path.join(directory, 'own.device.log'), Buffer.from('authKey=example', 'utf16le'));
  await assert.rejects(scanDirectory(directory));
  const script = fileURLToPath(new URL('./check-mi-fitness-auth.mjs', import.meta.url));
  const errorRun = spawnSync(process.execPath, [script, keyA], {encoding: 'utf8'});
  assert.equal(errorRun.status, 1);
  assert(!errorRun.stdout);
  assert(!errorRun.stderr.includes(keyA));
  assert(!errorRun.stderr.includes(directory));
  console.log('PASS: synthetic recognition, invalid lengths, UTF-16 rejection and redacted output/error checks. No real logs read.');
} finally {
  // Only this explicitly created temporary test directory is removed.
  await fs.rm(directory, {recursive: true, force: true});
}
