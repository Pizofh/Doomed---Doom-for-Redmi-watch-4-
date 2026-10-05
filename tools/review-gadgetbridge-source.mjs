// Inspect a fixed local source archive, then copy selected text only for review.
// Uses Windows' existing tar.exe with -t/-xO; never runs upstream build/scripts.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if (process.argv.length !== 2) throw Error('No arguments supported');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const archive = path.join(root, 'tools/local/gadgetbridge/nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz');
const out = path.join(root, 'artifacts/research/gadgetbridge-source');
const tar = path.join(process.env.SystemRoot || 'C:/Windows', 'System32/tar.exe');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const stat = fs.lstatSync(archive);
if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 160 * 1024 * 1024) throw Error('Invalid local archive');
const bytes = fs.readFileSync(archive), sha256 = hash(bytes);
// Pin of the user-provided download, not an independently published hash.
if (sha256 !== '700b2364858e6d26c4446c277d5c89ec7cba795d857d90a7a8d68533c1a69cb1') throw Error('Archive differs from reviewed download');
function read(args) {
  const result = spawnSync(tar, [...args, archive], {windowsHide: true, maxBuffer: 8 * 1024 * 1024});
  if (result.error || result.status !== 0) throw Error('Read-only tar inspection failed');
  return result.stdout.toString('utf8');
}
const names = read(['-tf']).split(/\r?\n/).filter(Boolean), metadata = read(['-tvf']).split(/\r?\n/);
if (names.length > 20000 || names.some(name => /(^[/\\]|^[A-Za-z]:|(^|[/\\])\.\.([/\\]|$)|\\|:)/.test(name))) throw Error('Unsafe archive index');
const prefix = 'nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz/';
if (names.some(name => !name.startsWith(prefix))) throw Error('Unexpected archive root');
const selected = names.filter(name => {
  const relative = name.slice(prefix.length);
  return relative === 'app/build.gradle' || relative === 'gradle.properties' ||
    /^app\/src\/main\/java\/nodomain\/freeyourgadget\/gadgetbridge\/(?:devices\/xiaomi\/(?:XiaomiCoordinator|XiaomiFWHelper|XiaomiInstallHandler)|devices\/xiaomi\/watches\/RedmiWatch4Coordinator|service\/devices\/xiaomi\/(?:XiaomiSupport|XiaomiAuthService|XiaomiPreferences|XiaomiBleSupport|XiaomiSppSupport|XiaomiConnectionSupport)|service\/devices\/xiaomi\/services\/\w+)\.java$/.test(relative) ||
    /^app\/src\/main\/java\/nodomain\/freeyourgadget\/gadgetbridge\/activities\/(?:AuthKeyActivity\.kt|discovery\/(?:DiscoveryActivityV2|DiscoveryPairingPreferenceActivity)\.java)$/.test(relative);
});
if (selected.length < 20 || selected.length > 40 || new Set(selected.map(p => path.basename(p))).size !== selected.length) throw Error('Unexpected selection');
// No archive-controlled destination paths, symlinks, special files or overwrites.
const sources = selected.map(name => {
  if (names.filter(n => n === name).length !== 1) throw Error('Duplicate selected entry');
  const modes = metadata.filter(line => line.trimEnd().endsWith(' ' + name));
  if (modes.length !== 1 || !modes[0].startsWith('-')) throw Error('Selected entry is not a regular file');
  const result = spawnSync(tar, ['-xOf', archive, name], {windowsHide: true, maxBuffer: 2 * 1024 * 1024});
  if (result.error || result.status !== 0 || !result.stdout.length || result.stdout.includes(0)) throw Error('Selected text read failed');
  return {archivePath: name, filename: path.basename(name), bytes: result.stdout};
});
fs.mkdirSync(out, {recursive: true});
for (const source of sources) {
  const filename = path.join(out, source.filename);
  if (fs.existsSync(filename)) {
    if (fs.lstatSync(filename).isSymbolicLink() || hash(fs.readFileSync(filename)) !== hash(source.bytes)) throw Error('Existing reviewed source differs');
  } else fs.writeFileSync(filename, source.bytes, {flag: 'wx'});
}
const report = {archiveSha256: sha256, archiveBytes: stat.size, archiveEncoding: bytes[0] === 0x1f && bytes[1] === 0x8b ? 'gzip' : 'uncompressed-tar',
  sourceUrl: 'https://f-droid.org/repo/nodomain.freeyourgadget.gadgetbridge_253_src.tar.gz',
  archiveEntries: names.length, selectedFiles: sources.length, upstreamCodeExecuted: false, firmwareOrHardwareTouched: false,
  files: sources.map(s => ({archivePath: s.archivePath, filename: s.filename, bytes: s.bytes.length, sha256: hash(s.bytes)}))};
fs.writeFileSync(path.join(root, 'artifacts/research/gadgetbridge-source-review.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({archiveSha256: sha256, archiveEncoding: report.archiveEncoding, archiveEntries: names.length, selectedFiles: sources.length, upstreamCodeExecuted: false}));
