// Offline inspection only. Runs official SDK readers, never APK code or ADB.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const local = path.join(root, 'tools/local/mi-fitness');
const apk = path.join(local, 'MiFitness-base.apk');
const out = path.join(root, 'artifacts/research/mi-fitness-apk');
const sdk = path.join(root, 'tools/local/android-build/sdk');
const java = 'C:/Program Files/Java/jdk-21/bin/java.exe';
const cli = path.join(sdk, 'cmdline-tools/latest');
const expected = '56e7bdbe139b369a72839b48d2f29e67e3df25984dd33a9b80abbbc44b511fdd';
const hash = b => createHash('sha256').update(b).digest('hex');
const stat = fs.lstatSync(apk);
if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== 141427237) throw Error('Unexpected input');
if (hash(fs.readFileSync(apk)) !== expected) throw Error('APK checksum changed');
fs.mkdirSync(out, {recursive: true});

function run(name, args, executable = java) {
  if (!/^[a-z0-9-]+$/.test(name)) throw Error('Invalid output name');
  const result = spawnSync(executable, args, {cwd: root, encoding: 'utf8', windowsHide: true,
    timeout: 180000, maxBuffer: 48 * 1024 * 1024});
  // Proprietary bytecode and detailed SDK output stay private/ignored.
  fs.writeFileSync(path.join(out, name + '.txt'), result.stdout || '');
  fs.writeFileSync(path.join(out, name + '-stderr.txt'), result.stderr || '');
  if (result.error || result.status !== 0) throw Error('SDK reader failed: ' + name + '; inspect private output');
  return result.stdout;
}
function analyze(name, args) {
  return run(name, ['-Dcom.android.sdklib.toolsdir=' + cli, '-classpath',
    path.join(cli, 'lib/apkanalyzer-classpath.jar'), 'com.android.tools.apk.analyzer.ApkAnalyzerCli', ...args, apk]);
}
const mode = process.argv[2] || 'review';
function readClass(cls, label, method) {
  if (!cls || !/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(cls)) throw Error('Invalid class');
  const args = ['dex', 'code', '--class', cls];
  if (method) args.push('--method', method);
  analyze(label, args);
  console.log(JSON.stringify({classInspected: cls, outputLabel: label, apkExecuted: false}));
}
if (mode === 'code') {
  readClass(process.argv[3], process.argv[4], process.argv[5]);
} else if (mode === 'code-batch') {
  const args = process.argv.slice(3);
  if (!args.length || args.length % 2 || args.length > 16) throw Error('Use class/label pairs (max eight classes)');
  for (let i = 0; i < args.length; i += 2) readClass(args[i], args[i + 1]);
} else if (mode === 'review') {
  const signature = run('signature', ['-jar', path.join(sdk, 'build-tools/36.0.0/lib/apksigner.jar'),
    'verify', '--verbose', '--print-certs', apk]);
  // apkanalyzer's XML conversion fails on this APK (unescaped '&'). AAPT2
  // reads binary manifest attributes directly; no XML repair or APK rewriting.
  const aapt2 = path.join(sdk, 'build-tools/36.0.0/aapt2.exe');
  const badging = run('badging', ['dump', 'badging', apk], aapt2);
  const identity = badging.match(/^package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'/m);
  if (!identity) throw Error('Missing package identity');
  const manifest = run('manifest', ['dump', 'xmltree', '--file', 'AndroidManifest.xml', apk], aapt2);
  analyze('files', ['files', 'list']);
  const review = {
    apkSha256: expected, sizeBytes: stat.size, baseOnly: true,
    applicationId: identity[1], versionCode: identity[2], versionName: identity[3],
    minSdk: badging.match(/^(?:minSdkVersion|sdkVersion):'([^']+)'/m)?.[1] || null,
    targetSdk: badging.match(/^targetSdkVersion:'([^']+)'/m)?.[1] || null,
    signatureVerified: true,
    signerCertificateSha256: [...signature.matchAll(/^Signer[^\r\n]* certificate SHA-256 digest: ([a-f0-9]+)/gm)].map(m => m[1]),
    schemes: Object.fromEntries([...signature.matchAll(/Verified using (v\d+(?:\.\d+)?)[^\r\n]*: (true|false)/g)].map(m => [m[1], m[2] === 'true'])),
    manifestVerified: identity[1] === 'com.xiaomi.wearable' && /E: manifest\b/.test(manifest),
    manufacturerCertificateIndependentlyVerified: false,
    apkExecuted: false, adbExecuted: false, phoneOrWatchOperationRequested: false
  };
  if (!review.manifestVerified || !review.signerCertificateSha256.length) throw Error('Unexpected manifest/signer');
  fs.writeFileSync(path.join(out, 'review.json'), JSON.stringify(review, null, 2) + '\n');
  console.log(JSON.stringify(review));
} else throw Error('Use review or code <class> <output-label> [method-descriptor]');
