// Fixed PC-only alternative. Not accepted by the physical adapter's SHA pin.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {prepareStatic} from './static-watchface-transfer.mjs';
if (process.argv.length !== 2) throw Error('Only offline preparation accepted');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input = path.join(root,'artifacts/static-watchface-r167/RW4Probe-id-only.face');
const stat = fs.lstatSync(input);
if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== 25224) throw Error('Input refused');
const original = fs.readFileSync(input), plan = prepareStatic(original);
const before = JSON.parse(fs.readFileSync(path.join(root,'tools/local/pc-rfcomm/static-watchface-r169.json'),'utf8')).before;
const id = '365219990';
if (!Array.isArray(before) || before.some(row => row.id === id)) throw Error('Snapshot collision/refusal');
const compiled = fs.readFileSync(path.join(root,'artifacts/static-watchface-r167/output/RW4Probe.face'));
const compilerId = compiled.subarray(40,49).toString('ascii');
if (compilerId !== '167210065') throw Error('Unexpected compiler ID');
const candidate = plan.copy();Buffer.from(id,'ascii').copy(candidate,40);
const changedOffsets = [];
for (let at = 0; at < candidate.length; at++) if (candidate[at] !== original[at]) changedOffsets.push(at);
if (changedOffsets.length !== 3 || changedOffsets.some(at => at < 40 || at >= 49) || candidate[49] !== 0 || candidate[5] !== 0)
  throw Error('Unexpected non-ID change');
const output = path.join(root,'artifacts/static-watchface-r173');fs.mkdirSync(output);
fs.writeFileSync(path.join(output,'RW4Probe-id-alternative.face'),candidate,{flag:'wx'});
const report = {checkpoint:'R173',pcOnly:true,id,size:candidate.length,
  sha256:createHash('sha256').update(candidate).digest('hex'),changedOffsets,
  originalId:plan.id,compilerId,snapshotCount:before.length,
  observedPrefixCounts:Object.fromEntries([...new Set(before.map(row => row.id.slice(0,5)))].map(prefix =>
    [prefix,before.filter(row => row.id.startsWith(prefix)).length])),
  collisionInSnapshot:false,formatAcceptedOnRw4:false,physicalAdapterAcceptsCandidate:false,
  emulatorValidated:false,physicalEnabled:false,bluetoothOperationRequested:false,filesTransferred:false};
fs.writeFileSync(path.join(output,'review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
