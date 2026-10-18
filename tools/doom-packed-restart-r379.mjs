// SPDX-License-Identifier: GPL-2.0-only
// Narrow exception for the single observed R378 partial attempt. The caller
// verifies every HMAC, identity, package pin and hash-chain link first.
export function reviewedPackedInterruption(history){
 if(!Array.isArray(history)||history.length!==112)return false;
 if(history.some(r=>r.attempt!==1||r.id!=='365220002'||r.size!==6165808||r.sha256!=='069e1a1dfdd676de6382565ba177cad411c07647929b8158dbe8d131cc9a490a'))return false;
 if(history.slice(0,4).map(r=>r.status).join(',')!=='Created,InstallIntent,UploadIntent,Uploading'||history.slice(0,4).some(r=>r.upload!==null))return false;
 const baseline=history[1].before;
 if(!Array.isArray(baseline)||baseline.length!==10||baseline.some(r=>r.id==='365220002'))return false;
 if(history.slice(1).some(r=>JSON.stringify(r.before)!==JSON.stringify(baseline)))return false;
 for(let batch=0;batch<52;batch++)for(let step=0;step<2;step++){
  const r=history[4+batch*2+step],u=r.upload;
  if(r.status!=='Uploading'||!u||u.status!==(step?'LocallyWritten':'Intent')||u.locallyWritten!==(batch+step)*32||u.batchFirst!==batch*32+1||u.batchLast!==(batch+1)*32)return false;
 }
 for(let i=108;i<112;i++){
  const r=history[i],u=r.upload;
  if(r.status!==(i<110?'Uploading':'Uncertain')||!u||u.status!==(i===108?'Intent':'Uncertain')||u.locallyWritten!==(i===108?1664:1687)||u.batchFirst!==1665||u.batchLast!==1696)return false;
 }
 return history.slice(4).every(r=>r.upload.offset===0&&r.upload.chunkSize===2048&&r.upload.totalParts===3017&&r.upload.remoteInstallationVerified===false)&&
  history.slice(108).every(r=>r.upload.highestPossibleOffset===3466602)&&history.slice(109).every(r=>r.upload.wireBytes===3480281);
}

// R379 sent no new MASS data: the device requested an existing offset.
export function reviewedPackedResumeHistory(history){
 if(!Array.isArray(history)||history.length!==116||!reviewedPackedInterruption(history.slice(0,112)))return false;
 const tail=history.slice(112),baseline=history[111].before;
 return tail.map(r=>r.status).join(',')==='Created,InstallIntent,UploadIntent,Uncertain'&&tail.every((r,i)=>
  r.attempt===2&&r.attemptKind==='restart-packed-r379'&&r.upload===null&&r.id==='365220002'&&r.size===6165808&&
  r.sha256===history[0].sha256&&(i===0?r.before===null:JSON.stringify(r.before)===JSON.stringify(baseline)));
}
