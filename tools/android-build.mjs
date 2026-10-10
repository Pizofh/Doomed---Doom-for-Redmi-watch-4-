// Prepare a local Android build. No device discovery, install, Bluetooth or ADB.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const local = path.join(root, 'tools/local/android-build');
const work = path.join(root, 'build/android-diagnostic-worktree');
const sdk = path.join(local, 'sdk');
const sourceRoot = path.join(work, 'gadgetbridge');
const tar = path.join(process.env.SystemRoot || 'C:/Windows', 'System32/tar.exe');
const jdk = 'C:/Program Files/Java/jdk-21';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const packages = [
  {file: 'commandlinetools-win-15859902_latest.zip', prefix: 'cmdline-tools/',
    sha256: '90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a',
    checksumSource: 'https://developer.android.com/studio#command-tools'},
  {file: 'gradle-9.7.1-bin.zip', prefix: 'gradle-9.7.1/',
    sha256: 'acd53f1edaf02f1a8ff99879f8a34b302661a057d9b063ae9e35b552f804d20a',
    checksumSource: 'https://gradle.org/release-checksums/'}
];
function contained(filename) {
  const rel = path.relative(root, path.resolve(filename));
  if (!rel || path.isAbsolute(rel) || rel === '..' || rel.startsWith('..' + path.sep)) throw Error('Destination escapes project');
  for (let current = path.resolve(filename); current !== root; current = path.dirname(current)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Linked destination refused');
  }
}
function inspectArchive(filename, prefix, expectedHash, excludedLink = null) {
  const st = fs.lstatSync(filename);
  if (!st.isFile() || st.isSymbolicLink() || st.size > 256 * 1024 * 1024) throw Error('Invalid archive');
  if (hash(fs.readFileSync(filename)) !== expectedHash) throw Error('Archive checksum mismatch');
  const listing = spawnSync(tar, ['-tf', filename], {encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024});
  const detail = spawnSync(tar, ['-tvf', filename], {encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024});
  if (listing.error || detail.error || listing.status !== 0 || detail.status !== 0) throw Error('Archive inspection failed');
  const entries = listing.stdout.split(/\r?\n/).filter(Boolean);
  const seen = new Set();
  for (const name of entries) {
    const folded = name.replace(/\/$/, '').toLowerCase();
    if (!name.startsWith(prefix) || /(^[/\\]|\\|:|(^|\/)\.\.?(\/|$))/.test(name) || seen.has(folded)) throw Error('Unsafe or duplicate archive path');
    seen.add(folded);
  }
  const specials = detail.stdout.split(/\r?\n/).filter(line => line && !/^[-d]/.test(line));
  if (specials.some(line => !excludedLink || !line.startsWith('l') || !line.includes(' ' + excludedLink + ' -> '))) throw Error('Archive has unexpected special entries');
  if (entries.length > 20000) throw Error('Archive too large');
  return entries;
}
function extractFresh(filename, destination, excludedLink = null) {
  contained(destination);
  if (fs.existsSync(destination)) throw Error('Extraction destination already exists; inspect it instead of overwriting');
  fs.mkdirSync(destination, {recursive: true});
  const args = ['-xf', filename, '-C', destination];
  if (excludedLink) args.push('--exclude=' + excludedLink);
  const run = spawnSync(tar, args, {windowsHide: true, encoding: 'utf8', maxBuffer: 1024 * 1024});
  if (run.error || run.status !== 0) throw Error('Archive extraction failed; partial directory left for inspection');
}
function prepare() {
  contained(local); contained(work);
  if (fs.existsSync(path.join(local, 'prepared.json'))) throw Error('Already prepared; use doctor');
  // Verify every archive before beginning extraction.
  for (const pkg of packages) inspectArchive(path.join(local, pkg.file), pkg.prefix, pkg.sha256);
  const sourceArchive = path.join(root, 'tools/local/gadgetbridge/nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz');
  const sourcePrefix = 'nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz/';
  const sourceHash = '700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1';
  const excluded = sourcePrefix + 'src/banglejs/fastlane/metadata/android/en-US/changelogs';
  inspectArchive(sourceArchive, sourcePrefix, sourceHash, excluded);
  const previewDir = path.join(root, 'build/android-diagnostic-preview-r83');
  const preview = JSON.parse(fs.readFileSync(path.join(previewDir, 'manifest.json')));
  const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/research/gadgetbridge-source-review.json')));
  if (preview.sourceArchiveSha256 !== sourceHash || reviewed.archiveSha256 !== sourceHash || preview.hardwareGateOpen !== false) throw Error('Unexpected preview provenance');
  for (const record of preview.files) {
    if (hash(fs.readFileSync(path.join(previewDir, record.name))) !== record.previewSha256) throw Error('Preview changed');
  }
  extractFresh(path.join(local, packages[0].file), path.join(sdk, 'cmdline-tools'));
  fs.renameSync(path.join(sdk, 'cmdline-tools/cmdline-tools'), path.join(sdk, 'cmdline-tools/latest'));
  extractFresh(path.join(local, packages[1].file), path.join(local, 'runtime'));
  extractFresh(sourceArchive, work, excluded);
  fs.renameSync(path.join(work, sourcePrefix.slice(0, -1)), sourceRoot);
  const files = [];
  for (const record of preview.files) {
    const original = reviewed.files.find(file => file.filename === record.name);
    const relative = original ? original.archivePath.slice(sourcePrefix.length) :
      'app/src/main/java/nodomain/freeyourgadget/gadgetbridge/service/devices/xiaomi/' + record.name;
    const destination = path.join(sourceRoot, relative);
    contained(destination);
    if (original && hash(fs.readFileSync(destination)) !== record.sourceSha256) throw Error('Staged source changed before patch');
    if (!original && fs.existsSync(destination)) throw Error('New source already exists');
    fs.writeFileSync(destination, fs.readFileSync(path.join(previewDir, record.name)));
    files.push({relative, sha256: record.previewSha256});
  }
  fs.writeFileSync(path.join(sourceRoot, 'local.properties'), 'sdk.dir=' + sdk.replace(/\\/g, '/') + '\n');
  const record = {packages, sourceArchiveSha256: sourceHash, omittedSymlink: excluded,
    files, sourceRoot, sdkRoot: sdk, jdk, apkProduced: false, hardwareGateOpen: false};
  fs.writeFileSync(path.join(local, 'prepared.json'), JSON.stringify(record, null, 2) + '\n', {flag: 'wx'});
  console.log(JSON.stringify({status: 'prepared', patchedFiles: files.length, apkProduced: false, hardwareGateOpen: false}));
}
function doctor() {
  const prepared = fs.existsSync(path.join(local, 'prepared.json'));
  let patchesMatch = false;
  if (prepared) {
    const state = JSON.parse(fs.readFileSync(path.join(local, 'prepared.json')));
    patchesMatch = state.files.every(file => hash(fs.readFileSync(path.join(sourceRoot, file.relative))) === file.sha256);
  }
  console.log(JSON.stringify({prepared, patchesMatch,
    java21: fs.existsSync(path.join(jdk, 'bin/java.exe')),
    sdkmanager: fs.existsSync(path.join(sdk, 'cmdline-tools/latest/bin/sdkmanager.bat')),
    gradle: fs.existsSync(path.join(local, 'runtime/gradle-9.7.1/bin/gradle.bat')),
    platform37: fs.existsSync(path.join(sdk, 'platforms/android-37.0/android.jar')),
    platformPackage: 'platforms;android-37.0',
    buildTools36: fs.existsSync(path.join(sdk, 'build-tools/36.0.0/aapt2.exe')),
    platformToolsPresent: fs.existsSync(path.join(sdk, 'platform-tools/adb.exe')),
    ownApkExists: fs.existsSync(path.join(sourceRoot, 'app/build/outputs/apk/mainline/rw4diagnostic/app-mainline-rw4diagnostic.apk')),
    hardwareGateOpen: false}));
}
function refresh() {
  const filename = path.join(local, 'prepared.json');
  const old = JSON.parse(fs.readFileSync(filename));
  const previewDir = path.join(root, 'build/android-diagnostic-preview-r83');
  const preview = JSON.parse(fs.readFileSync(path.join(previewDir, 'manifest.json')));
  const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/research/gadgetbridge-source-review.json')));
  if (preview.sourceArchiveSha256 !== old.sourceArchiveSha256 || reviewed.archiveSha256 !== old.sourceArchiveSha256 || preview.hardwareGateOpen !== false) throw Error('Preview provenance changed');
  // Validate all old files first; never overwrite manual changes to the worktree.
  for (const file of old.files) {
    const dest = path.join(sourceRoot, file.relative);
    contained(dest);
    if (hash(fs.readFileSync(dest)) !== file.sha256) throw Error('Worktree changed outside preparation');
  }
  if (new Set(preview.files.map(row => row.name)).size !== preview.files.length) throw Error('Duplicate preview names');
  if (old.files.some(file => !preview.files.some(row => row.name === path.basename(file.relative)))) throw Error('Removal of staged files requires separate review');
  const nextFiles = preview.files.map(record => {
    if (path.basename(record.name) !== record.name) throw Error('Unsafe preview filename');
    const bytes = fs.readFileSync(path.join(previewDir, record.name));
    if (hash(bytes) !== record.previewSha256) throw Error('Preview changed');
    const prior = old.files.find(file => path.basename(file.relative) === record.name);
    const original = reviewed.files.find(file => file.filename === record.name);
    const sourcePrefix = 'nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz/';
    if (original && (!original.archivePath.startsWith(sourcePrefix) || original.sha256 !== record.sourceSha256)) throw Error('Source provenance changed');
    if (!original && !['Rw4DiagnosticPolicy.java', 'Rw4DiagnosticSession.java', 'Rw4DiagnosticAttempt.java', 'Rw4DiagnosticTrace.java', 'Rw4DiagnosticStatus.java', 'Rw4BluetoothCache.java', 'Rw4DiagnosticDetails.java', 'Rw4DiagnosticUi.java', 'Rw4ServiceInventory.java', 'Rw4InventoryStatus.java', 'Rw4InventoryActivity.java'].includes(record.name)) throw Error('Unreviewed new source');
    const relative = original ? original.archivePath.slice(sourcePrefix.length) :
      'app/src/main/java/nodomain/freeyourgadget/gadgetbridge/service/devices/xiaomi/' + record.name;
    if (prior && prior.relative !== relative) throw Error('Staged path changed');
    const dest = path.join(sourceRoot, relative);
    contained(dest);
    if (!prior) {
      if (original && hash(fs.readFileSync(dest)) !== original.sha256) throw Error('New patch target differs from reviewed original');
      if (!original && fs.existsSync(dest)) throw Error('New source target already exists');
    }
    return {relative, sha256: record.previewSha256, bytes};
  });
  for (const file of nextFiles) fs.writeFileSync(path.join(sourceRoot, file.relative), file.bytes);
  old.files = nextFiles.map(({relative, sha256}) => ({relative, sha256}));
  old.apkMatchesPreparedSources = false; // Existing APK must be rebuilt/reviewed after refresh.
  fs.writeFileSync(filename, JSON.stringify(old, null, 2) + '\n');
  console.log(JSON.stringify({status: 'refreshed', patchedFiles: old.files.length, hardwareGateOpen: false}));
}
const action = process.argv[2];
const toolActions = ['versions', 'sdk-list', 'sdk-licenses', 'sdk-install', 'build', 'build-diagnose', 'path-probe'];
if (process.argv.length !== 3 || !['prepare', 'refresh', 'doctor', ...toolActions].includes(action)) throw Error('Unknown action; no device operations');
if (action === 'prepare') prepare();
else if (action === 'refresh') refresh();
else if (action === 'doctor') doctor();
else {
  // Run the reviewed script as command text; do not change machine/user ExecutionPolicy.
  const quote = value => "'" + value.replace(/'/g, "''") + "'";
  const script = path.join(root, 'scripts/android-build.ps1');
  const command = '& ([scriptblock]::Create([IO.File]::ReadAllText(' + quote(script) + '))) -Action ' + quote(action === 'build-diagnose' ? 'build' : action) + ' -ProjectRoot ' + quote(root) + (action === 'build-diagnose' ? ' -Stacktrace' : '');
  const run = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], {stdio: 'inherit', windowsHide: true});
  if (run.error) throw Error('Could not launch Android development tool');
  if (run.status !== 0) process.exitCode = run.status || 1;
}
