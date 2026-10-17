// Local archival bundle only: no compiler, installer, private logs or radio.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

assert.equal(process.argv.length, 2, 'No arguments supported');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'build/releases/Doomed-0.1.0');
const expectedHash = 'fa2146fde2cb9bba9a7637779c747fdbbb24faf62e7b56386c66e575f3ead5c8';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function read(relative) {
  const file = path.join(root, relative);
  const stat = fs.lstatSync(file);
  assert(stat.isFile() && !stat.isSymbolicLink(), 'Regular input required');
  return fs.readFileSync(file);
}

const face = read('build/doom-ready-r351/package/DoomReady-id-only.face');
const review = JSON.parse(read('build/doom-ready-r351/package/review.json'));
assert.equal(face.length, 660896);
assert.equal(hash(face), expectedHash);
assert.equal(review.sha256, expectedHash);
assert.equal(review.id, '365219940');
assert.equal(review.wadIncluded, false);
assert.equal(review.manualStartOnly, true);
assert.equal(review.elfSha256, 'e403b6ccc4b35a056699acefb8dc6a88f99414618d55aa3e3c72d9066816e5ee');
assert(!fs.existsSync(output), 'Release output already exists');

// Explicit allowlist: never collect a directory or copy any credentials/saves.
const files = new Map([
  ['DoomReady.face', face],
  ['LEEME.md', read('docs/first-playable-release.md')],
  ['playing.md', read('docs/playing.md')],
  ['doom-build-audit.md', read('docs/doom-build-audit.md')],
]);
const manifest = {
  version: '0.1.0', status: 'First playable release accepted',
  gameplayBaseline: 'R351/R352', faceId: review.id,
  compatibility: {model: 'M2315W1', firmware: '2.2.86'},
  capabilities: {saveLoad: true, persistentSave: true, sound: false,
    simultaneousTouchButtons: 1, cooperativeSessionLimitMinutes: 30},
  validation: {physicalGameplay: true, physicalSaveLoadAcrossFaces: true,
    physicalContinuous10to15Minutes: true,
    userReportedSessionMinutesApproximate: 30, physicalLoadAfterDeath: true,
    physical30MinuteCap: false,
    physicalFullCampaign: false},
  files: [...files].map(([name, bytes]) => ({name, bytes: bytes.length, sha256: hash(bytes)})),
  deviceOperationPerformed: false, wadIncluded: false, savesIncluded: false,
};
files.set('release.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
files.set('SHA256SUMS.txt', Buffer.from([...files].map(([name, bytes]) =>
  `${hash(bytes)}  ${name}`).join('\n') + '\n'));
fs.mkdirSync(output, {recursive: true});
for (const [name, bytes] of files) {
  const target = path.join(output, name);
  fs.writeFileSync(target, bytes, {flag: 'wx'});
  assert.equal(hash(fs.readFileSync(target)), hash(bytes), 'Copy mismatch');
}
console.log(JSON.stringify({status: 'LocalReleaseStaged', output,
  files: [...files.keys()], packageSha256: expectedHash,
  acceptance: 'User reported approximately 30 minutes, load after death and CLOSED',
  deviceOperationPerformed: false}));
