// Private write-ahead journal; no transport, processes, target discovery or CLI.
import fs from 'node:fs';import path from 'node:path';
import {createHash,createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {firstCRoot as root} from './first-c-source.mjs';import {packageCopy} from './doom-large-upload.mjs';
import {uploadLimits} from './doom-retail-limits-r374.mjs';
const identities=new WeakMap(),owned=new WeakSet(),fail=()=>{throw Error('DoomJournalRefused');};
const clone=x=>JSON.parse(JSON.stringify(x)),hash=b=>createHash('sha256').update(b).digest('hex');
const mac=(key,value)=>createHmac('sha256',key).update(value).digest();
const statuses=new Set(['Created','InstallIntent','UploadIntent','Uploading','SentNotVerified','RegisteredInactive','UnexpectedActivation','UnexpectedSelection','RegisteredNotRemovable','Uncertain']);
const defaultDirectory=path.join(root,'tools/local/pc-rfcomm/doom-deployment');
export function deploymentIdentity(target,key){
 if(typeof target!=='string'||! /^(rw4:[A-Fa-f0-9]{12}|pc:[a-f0-9]{64})$/.test(target)||!Buffer.isBuffer(key)||key.length!==16)fail();
 const normalized=target.toLowerCase(),id=Object.freeze({model:'M2315W1',firmware:'2.2.86'});
 const tag=mac(key,'RW4-DOOM-IDENTITY-v1\0'+normalized+'\0M2315W1\u00002.2.86').toString('hex');
 identities.set(id,{tag,key:mac(key,'RW4-DOOM-JOURNAL-v1\0'+normalized+'\0M2315W1\u00002.2.86')});return id;
}
export function disposeDeploymentIdentity(id){const p=identities.get(id);if(p){p.key.fill(0);identities.delete(id);}}
function directory(value){
 const resolved=path.resolve(value),rel=path.relative(root,resolved).replaceAll('\\','/');
 if(resolved!==defaultDirectory&&!/^artifacts\/doom-deployment-r286-[a-f0-9-]{36}$/.test(rel))fail();
 let p=root;for(const segment of rel.split('/')){p=path.join(p,segment);if(fs.existsSync(p)){const s=fs.lstatSync(p);if(!s.isDirectory()||s.isSymbolicLink())fail();}}
 fs.mkdirSync(resolved,{recursive:true});return resolved;
}
function regular(file,max){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.size>max)fail();}
function rows(value){
 if(!Array.isArray(value)||value.length>64||value.filter(r=>r.active===true).length!==1)fail();
 const seen=new Set();for(const r of value){if(!r||!/^\d{9}$/.test(r.id)||seen.has(r.id)||typeof r.active!=='boolean'||typeof r.canDelete!=='boolean')fail();seen.add(r.id);}
}
function upload(value,plan){
 if(value===null)return;
 if(!value||value.schema!==1||value.id!==plan.id||value.sha256!==plan.sha256||value.size!==plan.size||!['Intent','LocallyWritten','SentNotVerified','Uncertain'].includes(value.status)||![2048,4080].includes(value.chunkSize)||!Number.isInteger(value.totalParts)||value.totalParts<1||value.totalParts>uploadLimits(plan).parts||!Number.isInteger(value.locallyWritten)||value.locallyWritten<0||value.locallyWritten>value.totalParts||!Number.isInteger(value.offset)||value.offset<0||value.offset>=plan.size||!Number.isInteger(value.highestPossibleOffset)||value.highestPossibleOffset<value.offset||value.highestPossibleOffset>plan.size||!Number.isInteger(value.wireBytes)||value.wireBytes<0||value.wireBytes>uploadLimits(plan).wireBytes||value.remoteInstallationVerified!==false)fail();
}
const transitions={Created:['InstallIntent'],InstallIntent:['UploadIntent'],UploadIntent:['Uploading'],Uploading:['SentNotVerified'],SentNotVerified:['SentNotVerified','RegisteredInactive','UnexpectedActivation','UnexpectedSelection','RegisteredNotRemovable']};
export class DoomDeploymentJournal{
 #fd=null;#lock=null;#token=randomUUID();#key;#tag;#plan;#record;#lastHash='0'.repeat(64);#file;#lockFile;#resume=null;
 constructor(plan,identity,{directory:where=defaultDirectory,resume=false,retryWithoutData=false}={}){
  packageCopy(plan);const binding=identities.get(identity);if(!binding||typeof resume!=='boolean'||typeof retryWithoutData!=='boolean'||resume&&retryWithoutData)fail();
  const dir=directory(where);this.#file=path.join(dir,plan.kind==='review-ready-r351-manual'?'ready-r351.jsonl':plan.kind==='review-pads-r349-manual'?'pads-r349.jsonl':plan.kind==='review-wide-r347-manual'?'wide-r347.jsonl':plan.kind==='review-touch-r345-manual'?'touch-r345.jsonl':plan.kind==='review-direct-r343-manual'?'direct-r343.jsonl':plan.kind==='review-demand-r337-manual'?'demand-r337.jsonl':plan.kind==='review-bench-r335-manual'?'bench-r335.jsonl':plan.kind==='review-palette-r333-manual'?'palette-r333.jsonl':plan.kind==='review-fast-r331-manual'?'fast-r331.jsonl':plan.kind==='review-hold-r329-manual'?'hold-r329.jsonl':plan.kind==='review-lease-r327-manual'?'lease-r327.jsonl':plan.kind==='review-refs-r325-manual'?'refs-r325.jsonl':plan.kind==='review-fault-r321-manual'?'fault-r321.jsonl':plan.kind==='review-readers-r318-manual'?'readers-r318.jsonl':plan.kind==='review-ram-png-manual'?'ram-png-r304.jsonl':'transfer.jsonl');this.#lockFile=path.join(dir,'watch.lock');
  if(plan.kind==='review-sound-r365-manual')this.#file=path.join(dir,'sound-r365.jsonl');
  if(plan.kind==='review-audio-r367-manual')this.#file=path.join(dir,'audio-r367.jsonl');
  if(plan.kind==='review-voice-r369-manual')this.#file=path.join(dir,'voice-r369.jsonl');
  if(plan.kind==='review-menu-r370-manual')this.#file=path.join(dir,'menu-r370.jsonl');
  if(plan.kind==='review-ultimate-r374-manual')this.#file=path.join(dir,'ultimate-r374.jsonl');
  this.#key=Buffer.from(binding.key);this.#tag=binding.tag;this.#plan=plan;
  try{
   this.#lock=fs.openSync(this.#lockFile,'wx',0o600);
   fs.writeFileSync(this.#lock,JSON.stringify({token:this.#token,pid:process.pid})+'\n');fs.fsyncSync(this.#lock);
   const exists=fs.existsSync(this.#file);if(exists&&!resume&&!retryWithoutData||!exists&&(resume||retryWithoutData))fail();
   if(exists){
    regular(this.#file,2097152);const data=fs.readFileSync(this.#file,'utf8');if(!data.endsWith('\n'))fail();
    let previous=null;const history=[];
    for(const line of data.slice(0,-1).split('\n')){
     const entry=JSON.parse(line),r=entry.record,signature=Buffer.from(entry.mac??'','hex');
     if(!r||signature.length!==32||!timingSafeEqual(signature,mac(this.#key,JSON.stringify(r))))fail();
     this.#validate(r);
     if(r.seq!==(previous?.seq??0)+1||r.previous!==this.#lastHash)fail();
     if(previous&&r.attempt!==previous.attempt&&!(r.attempt===previous.attempt+1&&r.status==='Created'&&previous.status==='Uncertain'))fail();
     previous=r;history.push(r);this.#lastHash=hash(line+'\n');
    }
    if(!previous||previous.status!=='Uncertain')fail();
    let retryBaseline=null;
    if(retryWithoutData){
     const attempt=history.filter(r=>r.attempt===previous.attempt);
     const stages=attempt.map(r=>r.status).join(',');
     const firstControl=previous.attempt===1&&stages==='Created,InstallIntent,UploadIntent,Uncertain'&&previous.before!==null;
     const first=history.filter(r=>r.attempt===1);
     const soundLocalOnly=plan.kind==='review-sound-r365-manual'&&previous.attempt===1&&['Created,Uncertain','Created,Uncertain,Uncertain'].includes(stages)&&previous.before===null&&history.every(r=>r.before===null&&r.upload===null);
     const preflightOnly=previous.attempt===2&&stages==='Created,Uncertain'&&previous.before===null&&history.every(r=>r.upload===null)&&first.map(r=>r.status).join(',')==='Created,InstallIntent,UploadIntent,Uncertain';
     const reviewedRemovals=previous.attempt===3&&previous.before===null&&history.every(r=>r.upload===null)&&first.map(r=>r.status).join(',')==='Created,InstallIntent,UploadIntent,Uncertain'&&[2,3].every(n=>history.filter(r=>r.attempt===n).map(r=>r.status).join(',')==='Created,Uncertain');
     if(!(firstControl||preflightOnly||reviewedRemovals||soundLocalOnly)||attempt.some(r=>r.upload!==null))fail();
     retryBaseline=previous.before??[...first].reverse().find(r=>r.before!==null)?.before;
     if(!soundLocalOnly&&(retryBaseline===null||retryBaseline===undefined))fail();
    }else if(previous.before===null||previous.upload?.status!=='Uncertain'||previous.upload.highestPossibleOffset<=previous.upload.offset)fail();
    this.#resume=clone({...previous,...(retryBaseline?{before:retryBaseline}:{})});this.#record=previous;
    this.#fd=fs.openSync(this.#file,'a');
    this.#append({...previous,attempt:previous.attempt+1,status:'Created',upload:null,before:null,attemptKind:retryWithoutData?'retry-no-data':'resume'});
   }else{
    this.#fd=fs.openSync(this.#file,'wx',0o600);
    this.#append({schema:2,targetTag:this.#tag,model:'M2315W1',firmware:'2.2.86',id:plan.id,sha256:plan.sha256,size:plan.size,seq:0,attempt:1,status:'Created',before:null,upload:null,previous:this.#lastHash});
   }
   owned.add(this);
  }catch{this.close();fail();}
 }
 #validate(r){
  const p=this.#plan;
  if(r.schema!==2||r.targetTag!==this.#tag||r.model!=='M2315W1'||r.firmware!=='2.2.86'||r.id!==p.id||r.sha256!==p.sha256||r.size!==p.size||!statuses.has(r.status)||!Number.isSafeInteger(r.seq)||r.seq<1||!Number.isSafeInteger(r.attempt)||r.attempt<1||!/^[a-f0-9]{64}$/.test(r.previous))fail();
  if(r.before!==null)rows(r.before);upload(r.upload,p);
  if(r.status==='RegisteredInactive'&&r.upload?.status!=='SentNotVerified')fail();
 }
 #append(value){
  const next=clone({...value,seq:(this.#record?.seq??0)+1,previous:this.#lastHash});this.#validate(next);
  const entry=JSON.stringify({record:next,mac:mac(this.#key,JSON.stringify(next)).toString('hex')})+'\n',b=Buffer.from(entry);
  if(fs.fstatSync(this.#fd).size+b.length>2097152)fail();
  let at=0;while(at<b.length){const n=fs.writeSync(this.#fd,b,at,b.length-at);if(n<=0)fail();at+=n;}fs.fsyncSync(this.#fd);
  this.#record=next;this.#lastHash=hash(b);
 }
 save(patch){
  if(!owned.has(this)||!patch||Object.keys(patch).some(k=>!['status','before','upload'].includes(k)))fail();
  const next=clone({...this.#record,...patch});
  if(next.status!==this.#record.status&&next.status!=='Uncertain'&&!(transitions[this.#record.status]??[]).includes(next.status))fail();
  if(patch.before!==undefined&&(this.#record.before!==null||next.status!=='InstallIntent'))fail();
  this.#append(next);
 }
 get file(){return this.#file;}
 get record(){return clone(this.#record);}
 get resumeRecord(){return this.#resume?clone(this.#resume):null;}
 close(){
  owned.delete(this);if(this.#fd!==null){fs.closeSync(this.#fd);this.#fd=null;}
  this.#key?.fill(0);
  if(this.#lock!==null){
   fs.closeSync(this.#lock);this.#lock=null;regular(this.#lockFile,1024);
   if(JSON.parse(fs.readFileSync(this.#lockFile,'utf8')).token!==this.#token)fail();
   fs.unlinkSync(this.#lockFile);
  }
 }
}
