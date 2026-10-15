// Real local C# process and pipes, synthetic sockets only, no phone/watch data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {LargeUploadPcPipe} from './doom-upload-pc-pipe.mjs';
import {syntheticDoomUpload,uploadLayout,packageCopy,massFrame} from './doom-large-upload.mjs';
import {createHash} from 'node:crypto';
import {createDoomUploadIpcPeer,pcPeerSummary} from './doom-upload-pc-simulator.mjs';
import {runDoomUploadPc} from './doom-upload-pc-session.mjs';
if(process.argv.length!==2)throw Error('No arguments accepted');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),results=[];
// Gate dispatch must return before cached-target lookup or socket startup.
const gate=spawnSync(path.join(root,'artifacts/pc-rfcomm/Rw4PcRfcomm.exe'),['session-large-r281'],{input:'',encoding:'utf8',shell:false,windowsHide:true,timeout:3000});
assert.equal(gate.status,2);assert.equal(gate.stdout.trim(),'E:GateClosed');assert.equal(gate.stderr,'');
const plan=syntheticDoomUpload(),md5=createHash('md5').update(packageCopy(plan)).digest();
const layout=uploadLayout(plan,{status:0,md5,chunkSize:2048,resumePosition:0});
// Full 4.8MB framed/encrypted stream through partial writes + would-block in C#.
{
 const pipe=new LargeUploadPcPipe('partial');
 try{
  await pipe.opened();
  for(let i=1;i<=layout.total;i++)await pipe.send(massFrame(layout.part(i),Buffer.alloc(16,19),Buffer.alloc(4,23),i));
  assert(await pipe.summary());
 }finally{const closed=await pipe.close();assert(closed.closeConfirmed&&closed.workerExitConfirmed);assert.equal(closed.workerExitCode,0);}
 results.push({scenario:'partial-full',parts:layout.total,hashAndLengthVerified:true});
}
// Entire auth/install/upload/catalog session, including synthetic replies over
// C# recv/D: output; the executable SHA256 proves byte delivery through Send.
{
 const peer=createDoomUploadIpcPeer(plan),secret=Buffer.alloc(16,37);
 const result=await runDoomUploadPc(peer,plan,secret),stats=pcPeerSummary(peer);
 assert.equal(result.status,'RegisteredInactive');assert.equal(result.workerExitConfirmed,true);assert.equal(result.workerExitCode,0);
 assert.equal(result.workerWireVerified,true);assert.equal(stats.workerWireVerified,true);assert.equal(stats.wireVerified,true);assert(secret.every(b=>b===0));
 results.push({scenario:'authenticated-full',parts:stats.massFrames,status:result.status,workerWireVerified:result.workerWireVerified});
}
for(const scenario of ['send-zero','send-error','idle-timeout','session-timeout','send-hang','receive-eof','close-failure']){
 const pipe=new LargeUploadPcPipe(scenario,{operationMs:scenario==='send-hang'?100:20000});let rejected=false,closed;
 try{
  await pipe.opened();
  if(scenario==='receive-eof')await pipe.read();else if(scenario!=='close-failure')await pipe.send(Buffer.from([1,2,3]));
 }catch{rejected=true;}finally{closed=await pipe.close();}
 assert.equal(rejected,scenario!=='close-failure');assert.equal(closed.workerExitConfirmed,true);
 if(scenario==='send-hang'){assert.equal(closed.supervisor,'SupervisorDeadline');assert.equal(closed.closeConfirmed,false);}
 else if(scenario==='close-failure'){assert.equal(closed.closeConfirmed,false);assert.equal(closed.workerExitCode,1);}
 else {assert.equal(closed.closeConfirmed,true);assert.equal(closed.workerExitCode,1);}
 assert(!JSON.stringify(closed).includes('PRIVATE-CANARY'));
 results.push({scenario,rejected,closeConfirmed:closed.closeConfirmed,workerExitConfirmed:closed.workerExitConfirmed});
}
// Cancellation interrupts a blocked write; concurrent API calls never write a
// second request into the first one's response stream.
{
 const pipe=new LargeUploadPcPipe('send-hang');await pipe.opened();
 const pending=pipe.send(Buffer.from([1])).then(()=>false,()=>true);
 await assert.rejects(()=>pipe.read());pipe.cancel();assert(await pending);
 const closed=await pipe.close();assert.equal(closed.supervisor,'Cancelled');assert(closed.workerExitConfirmed);assert(!closed.closeConfirmed);
 results.push({scenario:'cancel-and-concurrent-call',workerExitConfirmed:true});
}
assert.throws(()=>new LargeUploadPcPipe('PRIVATE-CANARY'));
assert.equal(process.listenerCount('SIGINT'),0);
const output=path.join(root,'artifacts/doom-upload-session-r280/worker-r281-'+Date.now()+'.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({checkpoint:'R281',passed:true,scenarios:results,nativeSocketCalls:0,bluetoothOperationRequested:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({checkpoint:'R281',passed:true,scenarios:results.length,fullParts:layout.total,compiledWorker:true,authenticationOverIpc:true,nativeSocketCalls:0,bluetoothOperationRequested:false,result:path.relative(root,output).replaceAll('\\','/')}));
