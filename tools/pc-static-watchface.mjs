// Pinned watchface packages. Lua has its own explicit profile and review gate.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {prepareStatic,chunks} from './static-watchface-transfer.mjs';
import {StaticJournal} from './static-watchface-journal.mjs';
import {createStaticPipe,runStaticSession} from './static-watchface-session.mjs';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';
import {validateAuth} from './pc-rfcomm-session.mjs';
import {staticSpec} from './static-watchface-spec.mjs';
// Not an environment/CLI switch. User review + new pinned build are required.
const PHYSICAL_WRITES_REVIEWED = false;
const REVIEWED_VARIANT = 'r167';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args = process.argv.slice(2), action = args[0] ?? 'plan';
function read(file,maxSize) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxSize) throw Error();
  return fs.readFileSync(file);
}
const digest = data => createHash('sha256').update(data).digest('hex');
function prepared(spec) {
  const bytes = read(path.join(root,spec.artifact),spec.size);
  const plan = prepareStatic(bytes,{variant:spec.variant});
  if(spec.contentKind !== 'static-image'){
    const source = read(path.join(root,spec.sourceArtifact),65536);
    if(digest(source)!==spec.sourceSha256 || !bytes.includes(source))throw Error();
  }
  const metadata = JSON.parse(read(path.join(root,'artifacts/pc-rfcomm/build.json'),65536));
  const sources = ['Probe.cs','WinSockTransport.cs','PhysicalWorker.cs','SessionWorker.cs','SelfTests.cs'];
  const modules = ['pc-rfcomm-supervisor.mjs','pc-rfcomm-session.mjs','rw4-xiaomi-protocol.mjs',
    'static-watchface-transfer.mjs','static-watchface-journal.mjs','static-watchface-session.mjs','pc-static-watchface.mjs','static-watchface-spec.mjs'];
  const executable = path.join(root,'artifacts/pc-rfcomm/Rw4PcRfcomm.exe');
  if (metadata.physicalEnabled !== false || Object.keys(metadata.sourceHashes).length !== sources.length ||
      Object.keys(metadata.protocolHashes).length !== modules.length ||
      sources.some(file => metadata.sourceHashes[file] !== digest(read(path.join(root,'experiments/pc-rfcomm',file),1048576))) ||
      modules.some(file => metadata.protocolHashes[file] !== digest(read(path.join(root,'tools',file),1048576))) ||
      metadata.executableSha256 !== digest(read(executable,1048576))) throw Error();
  return {plan,metadata,executable};
}
try {
  if (args.length > 2 || !['plan','prepare','install','remove','install-after-space','remove-after-space'].includes(action)) throw Error();
  const spec = staticSpec(args[1] ?? 'r167');
  const afterSpace = action.endsWith('-after-space');
  if (afterSpace && spec.variant !== 'r173') throw Error();
  const operation = action.startsWith('install') ? 'install' : 'remove';
  const enabled = PHYSICAL_WRITES_REVIEWED && spec.variant === REVIEWED_VARIANT;
  const checkpoint = spec.variant === 'r236' ? 'R237' : spec.variant === 'r224' ? 'R225' : spec.variant === 'r220' ? 'R221' : spec.variant === 'r215' ? 'R216' : spec.variant === 'r202' ? 'R203' : spec.variant === 'r197' ? 'R198' : spec.variant === 'r188' ? 'R189' : spec.variant === 'r184' ? 'R185' : spec.variant === 'r180' ? 'R181' : spec.variant === 'r177' ? 'R178' : spec.variant === 'r173' ? 'R174' : 'R169';
  if (['install','remove','install-after-space','remove-after-space'].includes(action)) {
    if (!enabled) {
      console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,status:'PhysicalGateClosed',
        physicalEnabled:false,bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false}));
      process.exitCode = 2;
    } else {
      const {plan,executable} = prepared(spec);
      const privateDir = path.join(root,'tools/local/pc-rfcomm');
      const address = validateTarget(JSON.parse(read(path.join(privateDir,'target.json'),4096)));
      const key = validateAuth(JSON.parse(read(path.join(privateDir,'auth.json'),4096)));
      let journal;
      try {
        journal = new StaticJournal(path.join(privateDir,afterSpace ? 'static-watchface-r173-after-space.json' : spec.journal),address,plan);
        const report = await runStaticSession(() => createStaticPipe(executable,address),plan,key,journal,
          {action:operation,...(afterSpace && operation === 'install' ? {initialCountBelow:21} : {})});
        console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,id:spec.id,afterSpace,...report,physicalEnabled:true}));
        process.exitCode = ['RegisteredInactive','RemovedVerified'].includes(report.status) &&
          report.closeConfirmed && report.workerExitConfirmed ? 0 : 1;
      } finally { key.fill(0);journal?.close(); }
    }
  } else if (action === 'plan') {
    console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,status:'ReviewPreparationOnly',physicalEnabled:enabled,
      actions:enabled ? ['plan','prepare','install','remove'] : ['plan','prepare'],physicalWritesRequireReview:true,
      bluetoothOperationRequested:false,watchCommandRequested:false}));
  } else {
    const {plan,metadata} = prepared(spec);
    console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,status:'OfflinePrepared',id:plan.id,size:plan.size,sha256:plan.sha256,
      scriptsIncluded:spec.contentKind!=='static-image',nativeCodeIncluded:spec.nativeCodeIncluded===true,
      defaultParts:chunks(plan).length,staticTxBudget:32768,readonlyTxBudget:16384,
      executableSha256:metadata.executableSha256,buildInputsVerified:true,
      persistentJournalImplemented:true,physicalEntry:enabled ? 'ReviewedWatchfaceOnly' : 'GateClosed',physicalEnabled:enabled,
      bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false}));
  }
} catch {
  console.error('Watchface package refused or failed; inspect build and private journal. Do not retry automatically; no fallback attempted.');
  process.exitCode = 1;
}
