// Reviewed-package transport capability. Closed before any worker is created.
import {PrivatePipe} from './pc-rfcomm-session.mjs';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';
const PHYSICAL_DEPLOYMENT_REVIEWED=false;
const PHYSICAL_RAM_PNG_REVIEWED=false;
const PHYSICAL_READERS_R318_REVIEWED=false;
const PHYSICAL_FAULT_R321_REVIEWED=false;
const PHYSICAL_REFS_R325_REVIEWED=false;
const PHYSICAL_LEASE_R327_REVIEWED=false;
const PHYSICAL_HOLD_R329_REVIEWED=false;
const PHYSICAL_FAST_R331_REVIEWED=false;
const PHYSICAL_PALETTE_R333_REVIEWED=false;
const PHYSICAL_BENCH_R335_REVIEWED=false;
const PHYSICAL_DEMAND_R337_REVIEWED=false;
const PHYSICAL_WIDE_R347_REVIEWED=false;
const PHYSICAL_TOUCH_R345_REVIEWED=false;
const PHYSICAL_DIRECT_R343_REVIEWED=false;
const PHYSICAL_RESUME_REVIEWED=false;
const PHYSICAL_CONTROL_RETRY_REVIEWED=false;
const endpoints=new WeakMap(),peers=new WeakSet(),fail=()=>{throw Error('DoomPhysicalGateClosed');};
export function physicalDoomDeploymentEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED;}
export function physicalDoomRamPngEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_RAM_PNG_REVIEWED;}
export function physicalDoomReadersEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_READERS_R318_REVIEWED;}
export function physicalDoomFaultEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_FAULT_R321_REVIEWED;}
export function physicalDoomRefsEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_REFS_R325_REVIEWED;}
export function physicalDoomLeaseEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_LEASE_R327_REVIEWED;}
export function physicalDoomHoldEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_HOLD_R329_REVIEWED;}
export function physicalDoomFastEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_FAST_R331_REVIEWED;}
export function physicalDoomPaletteEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_PALETTE_R333_REVIEWED;}
export function physicalDoomBenchEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_BENCH_R335_REVIEWED;}
export function physicalDoomDemandEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_DEMAND_R337_REVIEWED;}
export function physicalDoomWideEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_WIDE_R347_REVIEWED;}
export function physicalDoomTouchEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_TOUCH_R345_REVIEWED;}
export function physicalDoomDirectEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_DIRECT_R343_REVIEWED;}
export function physicalDoomResumeEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_RESUME_REVIEWED;}
export function physicalDoomControlRetryEnabled(){return PHYSICAL_DEPLOYMENT_REVIEWED&&PHYSICAL_CONTROL_RETRY_REVIEWED;}
export function isReviewedDoomPeer(peer){return PHYSICAL_DEPLOYMENT_REVIEWED&&peers.has(peer);}
export function createReviewedDoomEndpoint(address,{resume=false,retryWithoutData=false}={}){
 if(!PHYSICAL_DEPLOYMENT_REVIEWED||typeof resume!=='boolean'||typeof retryWithoutData!=='boolean'||resume&&retryWithoutData||resume&&!PHYSICAL_RESUME_REVIEWED||retryWithoutData&&!PHYSICAL_CONTROL_RETRY_REVIEWED)fail();
 if(typeof address!=='string'||!/^[A-Fa-f0-9]{12}$/.test(address)||/^0{12}$/.test(address))fail();
 let pipe=null,busy=false,closing=false,closePromise=null;
 async function operation(fn,ms){
  if(busy||closing)fail();busy=true;
  const timer=setTimeout(()=>pipe?.force('SupervisorDeadline'),ms);
  try{return await fn();}finally{clearTimeout(timer);busy=false;}
 }
 const link=Object.freeze({
  opened:()=>operation(async()=>{
   if(pipe)fail();
   // Lazy creation is essential: journal lock and intent exist before open.
   pipe=new PrivatePipe(reviewedLargeExecutable(),address,{workerProfile:'large-r281',limitMs:675000});
   await pipe.opened();
  },25000),
  send:b=>operation(()=>{if(!pipe)fail();return pipe.send(b);},20000),
  read:()=>operation(()=>{if(!pipe)fail();return pipe.read();},20000),
  close:()=>{
   if(closePromise)return closePromise;
   closing=true;
   closePromise=(async()=>{
    if(!pipe)return{closeConfirmed:true,workerExitConfirmed:true,workerExitCode:0};
    if(busy)pipe.force('Cancelled');
    const timer=setTimeout(()=>pipe.force('SupervisorDeadline'),2000);
    try{return await pipe.close();}finally{clearTimeout(timer);}
   })();return closePromise;
  }
 });
 const endpoint=Object.freeze({kind:'reviewed-doom-deployment'});
 const peer=Object.freeze({link,physical:true,resumeReviewed:resume,retryWithoutDataReviewed:retryWithoutData,journalTarget:'rw4:'+address.toLowerCase(),clock:()=>performance.now(),wait:ms=>new Promise(resolve=>setTimeout(resolve,ms))});
 peers.add(peer);endpoints.set(endpoint,peer);
 return endpoint;
}
export function claimReviewedDoomEndpoint(endpoint,{resume=false,retryWithoutData=false}={}){
 if(!PHYSICAL_DEPLOYMENT_REVIEWED)fail();const peer=endpoints.get(endpoint);if(!peer||peer.resumeReviewed!==resume||peer.retryWithoutDataReviewed!==retryWithoutData)fail();endpoints.delete(endpoint);return peer;
}
