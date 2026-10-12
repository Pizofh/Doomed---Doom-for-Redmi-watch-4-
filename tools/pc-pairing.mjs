// Default/build/test are offline. Explicit pair requires review of R163 plan.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateTarget} from './pc-rfcomm-supervisor.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'experiments/pc-rfcomm/DirectedPairing.cs');
const directory=path.join(root,'artifacts/pc-pairing');
const executable=path.join(directory,'Rw4DirectedPairing.exe');
const metadata=path.join(directory,'build.json');
const compiler='C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';
const compilerPin='46809206887326d2d24db1eff1f3064de972c3451abe766b49111450a5e08e00';
const statuses=new Set(['GateClosed','LocalFailure','LayoutRefused','NoRadio','MultipleRadios',
  'CacheReadFailed','IdentityRefused','AlreadyAuthenticatedCached','PairingApiSucceeded','UserCancelled','AccessDenied','NativeRejected']);
const hash=file=>{
  const stat=fs.lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink())throw Error();
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
};
const inputs=()=>({source:hash(source),wrapper:hash(fileURLToPath(import.meta.url)),
  targetValidator:hash(path.join(root,'tools/pc-rfcomm-supervisor.mjs'))});
export function sanitizePairing(text){
  if(typeof text!=='string'||text.length>8192)throw Error();
  const lines=text.trim().split(/\r?\n/), requested=lines[0]==='PAIRING_REQUESTED';
  if(lines.length!==(requested?2:1))throw Error();
  const value=JSON.parse(lines.at(-1));
  if(Object.keys(value).sort().join(',')!=='authenticationRequests,bluetoothOperationRequested,checkpoint,handlesClosed,nativeResult,status,watchCommandRequested'||
    value.checkpoint!=='R163'||!statuses.has(value.status)||![0,1].includes(value.authenticationRequests)||
    value.authenticationRequests!==(requested?1:0)||value.bluetoothOperationRequested!==requested||value.watchCommandRequested!==false||
    typeof value.handlesClosed!=='boolean'||
    !(value.nativeResult===null||(Number.isInteger(value.nativeResult)&&value.nativeResult>=0&&value.nativeResult<=4294967295))||
    (!requested&&value.nativeResult!==null)||
    (value.status==='PairingApiSucceeded'&&(!requested||value.nativeResult!==0)))throw Error();
  return value;
}
export async function supervisePairing(exe,address,{spawnWorker=spawn,deadlineMs=60000,fallbackMs=1000}={}){
  const child=spawnWorker(exe,['pair-reviewed-r163'],{stdio:['pipe','pipe','pipe'],windowsHide:true,shell:false});
  return await new Promise(resolve=>{
    let text='',forced=null,settled=false,timer,fallback;
    const finish=report=>{
      if(settled)return;settled=true;clearTimeout(timer);clearTimeout(fallback);process.removeListener('SIGINT',cancel);
      resolve({...report,bondCurrentlyUsableVerified:false,filesTransferred:false,rawOutputSaved:false});
    };
    const failed=(reason,exited)=>({checkpoint:'R163',supervisor:reason,workerExitConfirmed:exited,
      handlesClosed:false,pairingApiCompleted:false,bluetoothOperationRequested:/^PAIRING_REQUESTED\r?\n/.test(text)?true:null,
      watchCommandRequested:false,...(!exited?{workerPid:child.pid??null}:{})});
    const abort=reason=>{
      if(settled||forced)return;forced=reason;
      try{child.kill('SIGKILL');}catch{}
      fallback=setTimeout(()=>finish(failed(reason,false)),fallbackMs);
    };
    const cancel=()=>abort('Cancelled');process.on('SIGINT',cancel);
    child.stdout.on('data',data=>{if(settled||forced)return;text+=data.toString('utf8');if(text.length>8192)abort('OutputRefused');});
    child.stderr.resume();child.stderr.on('error',()=>{});
    child.stdout.on('error',()=>abort('OutputRefused'));child.stdin.on('error',()=>abort('InputFailed'));
    child.on('error',()=>abort('LaunchFailed'));
    child.on('close',code=>{
      if(forced)return finish(failed(forced,true));
      try{
        const value=sanitizePairing(text),expected=value.status==='PairingApiSucceeded'&&value.handlesClosed?0:1;
        if(code!==expected)throw Error();
        finish({...value,workerExitConfirmed:true,pairingApiCompleted:value.nativeResult!==null,supervisor:null});
      }catch{finish(failed('ReportRefused',true));}
    });
    timer=setTimeout(()=>abort('Deadline'),deadlineMs);
    child.stdin.end(address+'\n');
  });
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  try{
    const args=process.argv.slice(2),action=args[0]??'plan';
    if(args.length>1)throw Error();
    if(action==='plan')console.log(JSON.stringify({checkpoint:'R163',physicalEnabled:false,
      actions:['build','test','pair (review docs/windows-directed-pairing-plan-r163.md)'],bluetoothOperationRequested:false}));
    else if(action==='build'){
      if(hash(compiler)!==compilerPin)throw Error();
      fs.mkdirSync(directory,{recursive:true});
      const run=spawnSync(compiler,['/nologo','/target:exe','/platform:x64','/optimize+','/warn:4','/warnaserror+','/out:'+executable,source],
        {cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:30000,maxBuffer:32768});
      if(run.error||run.status!==0){if(run.stdout)process.stdout.write(run.stdout);throw Error();}
      fs.writeFileSync(metadata,JSON.stringify({inputs:inputs(),executable:hash(executable)},null,2)+'\n');
      console.log(JSON.stringify({checkpoint:'R163',built:true,bluetoothOperationRequested:false}));
    }else if(['test','pair'].includes(action)){
      const prior=JSON.parse(fs.readFileSync(metadata,'utf8'));
      if(JSON.stringify(prior.inputs)!==JSON.stringify(inputs())||prior.executable!==hash(executable))throw Error();
      if(action==='test'){
        const run=spawnSync(executable,['test'],{cwd:root,windowsHide:true,shell:false,encoding:'utf8',timeout:10000,maxBuffer:32768});
        if(run.error||run.status!==0)throw Error();process.stdout.write(run.stdout);
      }else{
        const targetFile=path.join(root,'tools/local/pc-rfcomm/target.json'),stat=fs.lstatSync(targetFile);
        if(!stat.isFile()||stat.isSymbolicLink()||stat.size>4096)throw Error();
        const address=validateTarget(JSON.parse(fs.readFileSync(targetFile,'utf8')));
        const report=await supervisePairing(executable,address);console.log(JSON.stringify(report));
        process.exitCode=report.status==='PairingApiSucceeded'&&report.handlesClosed&&report.workerExitConfirmed?0:1;
      }
    }else throw Error();
  }catch{console.error('Directed pairing refused or failed; no raw errors, addresses or keys exported.');process.exitCode=1;}
}
