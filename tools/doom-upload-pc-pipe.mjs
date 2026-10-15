// Compiled C# worker over local stdio only; native dispatch stays gated.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {PrivatePipe} from './pc-rfcomm-session.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scenarios=new Set(['ok','partial','bridge','send-zero','send-error','idle-timeout','session-timeout','send-hang','receive-eof','close-failure']);
const fail=()=>{throw Error('LargePcPipeRefused');};
function hash(file){const st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink())fail();return createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
export function reviewedLargeExecutable(){
 const directory=path.join(root,'artifacts/pc-rfcomm'),file=path.join(directory,'Rw4PcRfcomm.exe');
 const meta=JSON.parse(fs.readFileSync(path.join(directory,'build.json'),'utf8'));
 const sources=['Probe.cs','WinSockTransport.cs','PhysicalWorker.cs','SessionWorker.cs','LargeSessionWorker.cs','SelfTests.cs'];
 if(meta.physicalEnabled!==false||meta.executableSha256!==hash(file)||Object.keys(meta.sourceHashes).length!==sources.length)fail();
 for(const source of sources)if(meta.sourceHashes[source]!==hash(path.join(root,'experiments/pc-rfcomm',source)))fail();
 return file;
}
export class LargeUploadPcPipe{
 constructor(scenario='ok',{operationMs=20000,openMs=25000,closeMs=2000,limitMs=675000}={}){
  if(!scenarios.has(scenario)||![operationMs,openMs,closeMs,limitMs].every(n=>Number.isInteger(n)&&n>=20&&n<=675000)||operationMs>20000||openMs>25000||closeMs>2000)fail();
  this.scenario=scenario;this.operationMs=operationMs;this.openMs=openMs;this.closeMs=closeMs;
  this.pipe=new PrivatePipe(reviewedLargeExecutable(),'PC_ONLY_R281',{workerProfile:'large-pc-r281',simulationScenario:scenario,limitMs});
  this.busy=false;this.closing=false;this.txHash=createHash('sha256');this.txBytes=0;
 }
 async operation(fn,ms){
  if(this.busy||this.closing)fail();this.busy=true;
  const timer=setTimeout(()=>this.pipe.force('SupervisorDeadline'),ms);
  try{return await fn();}finally{clearTimeout(timer);this.busy=false;}
 }
 opened(){return this.operation(()=>this.pipe.opened(),this.openMs);}
 send(frame){return this.operation(async()=>{await this.pipe.send(frame);this.txHash.update(frame);this.txBytes+=frame.length;},this.operationMs);}
 read(){return this.operation(()=>this.pipe.read(),this.operationMs);}
 readSynthetic(bytes){
  if(this.scenario!=='bridge'||!Buffer.isBuffer(bytes)||bytes.length>4096)fail();
  return this.operation(async()=>{
   const pending=this.pipe.read();
   this.pipe.child.stdin.write(bytes.length?'RX:'+bytes.toString('hex')+'\n':'RX:WAIT\n');
   return await pending;
  },this.operationMs);
 }
 async summary(){
  return this.operation(async()=>{
   const pending=this.pipe.read();if(this.scenario==='bridge')this.pipe.child.stdin.write('RX:SUMMARY\n');
   const bytes=await pending;
   return bytes.length===40&&bytes.readBigInt64LE(32)===BigInt(this.txBytes)&&bytes.subarray(0,32).equals(this.txHash.copy().digest());
  },this.operationMs);
 }
 async close(){
  if(this.closePromise)return this.closePromise;
  this.closePromise=(async()=>{
   if(this.busy)this.pipe.force('Cancelled');this.closing=true;
   const timer=setTimeout(()=>this.pipe.force('SupervisorDeadline'),this.closeMs);
   try{return await this.pipe.close();}finally{clearTimeout(timer);}
  })();
  return this.closePromise;
 }
 cancel(){this.pipe.force('Cancelled');}
}
