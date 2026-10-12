// R169 review/build inspection only. Physical writes deliberately have no entry.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {prepareStatic,chunks} from './static-watchface-transfer.mjs';
import {StaticJournal} from './static-watchface-journal.mjs';
import {createStaticPipe,runStaticSession} from './static-watchface-session.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';
import {validateAuth} from './pc-rfcomm-session.mjs';
// Not an environment/CLI switch. User review + new pinned build are required.
const PHYSICAL_WRITES_REVIEWED = false;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args = process.argv.slice(2), action = args[0] ?? 'plan';
function read(file,maxSize) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxSize) throw Error();
  return fs.readFileSync(file);
}
const digest = data => createHash('sha256').update(data).digest('hex');
function prepared() {
  const plan = prepareStatic(read(path.join(root,'artifacts/static-watchface-r167/RW4Probe-id-only.face'),25224));
  const metadata = JSON.parse(read(path.join(root,'artifacts/pc-rfcomm/build.json'),65536));
  const sources = ['Probe.cs','WinSockTransport.cs','PhysicalWorker.cs','SessionWorker.cs','SelfTests.cs'];
  const modules = ['pc-rfcomm-supervisor.mjs','pc-rfcomm-session.mjs','rw4-xiaomi-protocol.mjs',
    'static-watchface-transfer.mjs','static-watchface-journal.mjs','static-watchface-session.mjs','pc-static-watchface.mjs'];
  const executable = path.join(root,'artifacts/pc-rfcomm/Rw4PcRfcomm.exe');
  if (metadata.physicalEnabled !== false || Object.keys(metadata.sourceHashes).length !== sources.length ||
      Object.keys(metadata.protocolHashes).length !== modules.length ||
      sources.some(file => metadata.sourceHashes[file] !== digest(read(path.join(root,'experiments/pc-rfcomm',file),1048576))) ||
      modules.some(file => metadata.protocolHashes[file] !== digest(read(path.join(root,'tools',file),1048576))) ||
      metadata.executableSha256 !== digest(read(executable,1048576))) throw Error();
  return {plan,metadata,executable};
}
try {
  if (args.length > 1 || !['plan','prepare','install','remove'].includes(action)) throw Error();
  if (action === 'install' || action === 'remove') {
    if (!PHYSICAL_WRITES_REVIEWED) {
      console.log(JSON.stringify({checkpoint:'R169',status:'PhysicalGateClosed',
        physicalEnabled:false,bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false}));
      process.exitCode = 2;
    } else {
      const {plan,executable} = prepared();
      const privateDir = path.join(root,'tools/local/pc-rfcomm');
      const address = validateTarget(JSON.parse(read(path.join(privateDir,'target.json'),4096)));
      const key = validateAuth(JSON.parse(read(path.join(privateDir,'auth.json'),4096)));
      let journal;
      try {
        journal = new StaticJournal(path.join(privateDir,'static-watchface-r169.json'),address,plan);
        const report = await runStaticSession(() => createStaticPipe(executable,address),plan,key,journal,{action});
        console.log(JSON.stringify({checkpoint:'R169',...report,physicalEnabled:true}));
        process.exitCode = ['RegisteredInactive','RemovedVerified'].includes(report.status) &&
          report.closeConfirmed && report.workerExitConfirmed ? 0 : 1;
      } finally { key.fill(0);journal?.close(); }
    }
  } else if (action === 'plan') {
    console.log(JSON.stringify({checkpoint:'R169',status:'ReviewPreparationOnly',physicalEnabled:false,
      actions:['plan','prepare'],physicalWritesRequireReview:true,
      bluetoothOperationRequested:false,watchCommandRequested:false}));
  } else {
    const {plan,metadata} = prepared();
    console.log(JSON.stringify({checkpoint:'R169',status:'OfflinePrepared',id:plan.id,size:plan.size,sha256:plan.sha256,
      defaultParts:chunks(plan).length,staticTxBudget:32768,readonlyTxBudget:16384,
      executableSha256:metadata.executableSha256,buildInputsVerified:true,
      persistentJournalImplemented:true,physicalEntry:'GateClosed',physicalEnabled:false,
      bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false}));
  }
} catch {
  console.error('Static package preparation refused; inspect local build and pinned package. No physical operation attempted.');
  process.exitCode = 1;
}
