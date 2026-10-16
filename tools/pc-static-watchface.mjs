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
const REVIEWED_PACED_RETRY = false;
const REVIEWED_EXIT_RESUME = false;
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
  const sources = ['Probe.cs','WinSockTransport.cs','PhysicalWorker.cs','SessionWorker.cs','LargeSessionWorker.cs','SelfTests.cs'];
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
  if (args.length > 2 || !['plan','prepare','install','remove','install-after-space','remove-after-space','plan-paced-retry','prepare-paced-retry','install-paced-retry','plan-resume-once','prepare-resume-once','install-resume-once'].includes(action)) throw Error();
  const spec = staticSpec(args[1] ?? 'r167');
  const pacedRetry=action.endsWith('-paced-retry');
  const exitResume=action.endsWith('-resume-once');
  if((pacedRetry||exitResume)&&spec.variant!=='r265')throw Error();
  const afterSpace = action.endsWith('-after-space');
  if (afterSpace && spec.variant !== 'r173') throw Error();
  const operation = action.startsWith('install') ? 'install' : 'remove';
  const enabled = PHYSICAL_WRITES_REVIEWED && spec.variant === REVIEWED_VARIANT &&(!pacedRetry||REVIEWED_PACED_RETRY)&&(!exitResume||REVIEWED_EXIT_RESUME);
  const checkpoint = spec.variant === 'r298' ? 'R298' : spec.variant === 'r294' ? 'R294' : spec.variant === 'r291' ? 'R291' : spec.variant === 'r283' ? 'R283' : exitResume ? 'R270' : pacedRetry ? 'R268' : spec.variant === 'r265' ? 'R266' : spec.variant === 'r263' ? 'R264' : spec.variant === 'r261' ? 'R262' : spec.variant === 'r259' ? 'R260' : spec.variant === 'r257' ? 'R258' : spec.variant === 'r255' ? 'R256' : spec.variant === 'r253' ? 'R254' : spec.variant === 'r251' ? 'R252' : spec.variant === 'r249' ? 'R250' : spec.variant === 'r246' ? 'R247' : spec.variant === 'r243' ? 'R244' : spec.variant === 'r241' ? 'R242' : spec.variant === 'r238' ? 'R239' : spec.variant === 'r236' ? 'R237' : spec.variant === 'r224' ? 'R225' : spec.variant === 'r220' ? 'R221' : spec.variant === 'r215' ? 'R216' : spec.variant === 'r202' ? 'R203' : spec.variant === 'r197' ? 'R198' : spec.variant === 'r188' ? 'R189' : spec.variant === 'r184' ? 'R185' : spec.variant === 'r180' ? 'R181' : spec.variant === 'r177' ? 'R178' : spec.variant === 'r173' ? 'R174' : 'R169';
  if (['install','remove','install-after-space','remove-after-space','install-paced-retry','install-resume-once'].includes(action)) {
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
        if(pacedRetry||exitResume){
          const prior=JSON.parse(read(path.join(privateDir,'native-exit-r266.json'),65536));
          if(prior.variant!=='r265'||prior.id!==spec.id||prior.sha256!==spec.sha256||prior.size!==spec.size||prior.model!=='M2315W1'||prior.firmware!=='2.2.86'||prior.phase!=='Uncertain'||prior.registeredVerified!==false||prior.partsWritten!==12||prior.targetTag!==digest(Buffer.from('rw4-static-target:'+address.toUpperCase()))||fs.existsSync(path.join(privateDir,'native-exit-r266.json.lock')))throw Error();
        }
        if(exitResume){
          const prior=JSON.parse(read(path.join(privateDir,'native-exit-r268-paced.json'),65536));
          if(prior.variant!=='r265'||prior.id!==spec.id||prior.sha256!==spec.sha256||prior.size!==spec.size||prior.phase!=='Uncertain'||prior.previousPhase!=='InstallAck'||prior.registeredVerified!==false||prior.partsWritten!==0||prior.targetTag!==digest(Buffer.from('rw4-static-target:'+address.toUpperCase()))||fs.existsSync(path.join(privateDir,'native-exit-r268-paced.json.lock')))throw Error();
        }
        journal = new StaticJournal(path.join(privateDir,exitResume ? 'native-exit-r270-resume.json' : pacedRetry ? 'native-exit-r268-paced.json' : afterSpace ? 'static-watchface-r173-after-space.json' : spec.journal),address,plan);
        const report = await runStaticSession(() => createStaticPipe(executable,address),plan,key,journal,
          {action:operation,pacingProfile:exitResume?'exit-resume-r270':pacedRetry?'exit-r268':'default',...(afterSpace && operation === 'install' ? {initialCountBelow:21} : {})});
        console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,id:spec.id,afterSpace,...report,physicalEnabled:true}));
        process.exitCode = ['RegisteredInactive','RemovedVerified'].includes(report.status) &&
          report.closeConfirmed && report.workerExitConfirmed ? 0 : 1;
      } finally { key.fill(0);journal?.close(); }
    }
  } else if (action === 'plan'||action==='plan-paced-retry'||action==='plan-resume-once') {
    console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,status:'ReviewPreparationOnly',physicalEnabled:enabled,
      actions:exitResume ? enabled?['plan-resume-once','prepare-resume-once','install-resume-once']:['plan-resume-once','prepare-resume-once'] : pacedRetry ? enabled?['plan-paced-retry','prepare-paced-retry','install-paced-retry']:['plan-paced-retry','prepare-paced-retry'] : enabled ? ['plan','prepare','install','remove'] : ['plan','prepare'],physicalWritesRequireReview:true,
      bluetoothOperationRequested:false,watchCommandRequested:false}));
  } else {
    const {plan,metadata} = prepared(spec);
    console.log(JSON.stringify({checkpoint,variant:spec.variant,contentKind:spec.contentKind,status:'OfflinePrepared',id:plan.id,size:plan.size,sha256:plan.sha256,
      scriptsIncluded:spec.contentKind!=='static-image',nativeCodeIncluded:spec.nativeCodeIncluded===true,
      defaultParts:chunks(plan).length,staticTxBudget:32768,readonlyTxBudget:16384,
      executableSha256:metadata.executableSha256,buildInputsVerified:true,
      persistentJournalImplemented:true,physicalEntry:enabled ? 'ReviewedWatchfaceOnly' : 'GateClosed',physicalEnabled:enabled,
      ...(pacedRetry?{pacingProfile:'exit-r268',betweenPartsMs:100,settleBeforeVerificationMs:1000,retryJournal:'native-exit-r268-paced.json',priorJournalPreserved:true}:{}),
      ...(exitResume?{pacingProfile:'exit-resume-r270',expectedResumePosition:22462,fileBytesRemaining:1886,resumedParts:chunks(plan,2048,22462).length,settleBeforeVerificationMs:1000,retryJournal:'native-exit-r270-resume.json',priorJournalsPreserved:true}:{}),
      bluetoothOperationRequested:false,watchCommandRequested:false,filesTransferred:false}));
  }
} catch {
  console.error('Watchface package refused or failed; inspect build and private journal. Do not retry automatically; no fallback attempted.');
  process.exitCode = 1;
}
