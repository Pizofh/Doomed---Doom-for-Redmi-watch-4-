// Local export preflight. Scans reachable Git blobs, not ignored dependencies.
// Findings show paths/categories only, never secret values or matching lines.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const requirePrivate=process.argv[2]==='--require-private';
if(process.argv.length!==2&&!(process.argv.length===3&&requirePrivate))throw Error('Unexpected arguments');
function git(args,input){
 const run=spawnSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),...args],{cwd:root,input,windowsHide:true,shell:false,maxBuffer:96*1024*1024});
 if(run.error||run.status!==0)throw Error('GitAuditFailed');return run.stdout;
}
const references=git(['rev-list','--objects','--all']).toString('utf8').trim().split('\n');
const paths=new Map(references.map(line=>{const at=line.indexOf(' ');return at<0?[line,'']:[line.slice(0,at),line.slice(at+1)];}));
const metadata=git(['cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize)'],[...paths.keys()].join('\n')+'\n').toString('utf8').trim().split('\n');
const blobs=metadata.map(line=>line.split(' ')).filter(row=>row[1]==='blob');
const secrets=[];
const seenSecrets=new Set();
function remember(kind,value){
 if(typeof value!=='string'||value.length<6)return;
 const normalized=value.toLowerCase();if(seenSecrets.has(normalized))return;
 seenSecrets.add(normalized);secrets.push({kind,value:normalized});
}
function rememberAddress(value){
 const compact=value.replace(/[:-]/g,'').toLowerCase();
 if(!/^[a-f\d]{12}$/.test(compact))throw Error('PrivateAddressFormatRefused');
 for(const variant of [compact,compact.match(/../g).join(':'),compact.match(/../g).join('-')])remember('private-device-address',variant);
}
function privateText(text){
 // Include previous authorization keys, not just the current auth.json.
 const keyPattern=/(?<![\w])(?:encryptKey|encrypt_key|authKey|auth_key|huamiAuthKey|token)[\\'"\s]{0,16}[:=][\\'"\s]{0,16}(?:0x)?([a-fA-F0-9]{32})(?![\w])/g;
 for(const match of text.matchAll(keyPattern))remember('private-authorization-value',match[1]);
 for(const match of text.matchAll(/\b(?:[a-f\d]{2}:){5}[a-f\d]{2}\b|\b(?:[a-f\d]{2}-){5}[a-f\d]{2}\b/gi)){
  if(!/^(?:00[:-]){5}00$|^(?:ff[:-]){5}ff$/i.test(match[0]))rememberAddress(match[0]);
 }
 for(const match of text.matchAll(/\b(?:serialNumber|serial_number|deviceSerial|serialNo)[\\'"\s]{0,16}[:=][\\'"\s]{0,16}([A-Za-z\d_-]{8,64})\b/gi))remember('private-device-serial',match[1]);
}
const auth=path.join(root,'tools/local/pc-rfcomm/auth.json'),target=path.join(root,'tools/local/pc-rfcomm/target.json');
if(fs.existsSync(auth)){
 const key=JSON.parse(fs.readFileSync(auth,'utf8')).authKey;
 if(typeof key!=='string'||!/^(?:0x)?[a-f\d]{32}$/i.test(key))throw Error('PrivateKeyFormatRefused');
 remember('current-watch-key',key.replace(/^0x/,''));
}
if(fs.existsSync(target)){
 const address=JSON.parse(fs.readFileSync(target,'utf8')).address;
 if(typeof address!=='string'||!/^[a-f\d:-]{12,17}$/i.test(address))throw Error('PrivateAddressFormatRefused');
 rememberAddress(address);
}
if(requirePrivate&&(!fs.existsSync(auth)||!fs.existsSync(target)))throw Error('LocalPrivacyInputsRequired');
let privateFilesScanned=0,privateBytes=0;
const local=path.join(root,'tools/local');
if(fs.existsSync(local))for(const entry of fs.readdirSync(local,{withFileTypes:true})){
 if(!entry.isDirectory()||!(/^(?:pc-rfcomm|mi-fitness-logs(?:-[a-z\d-]+)?)$/i.test(entry.name)))continue;
 const folder=path.join(local,entry.name);if(fs.lstatSync(folder).isSymbolicLink())throw Error('PrivateInputSymlinkRefused');
 for(const file of fs.readdirSync(folder,{withFileTypes:true})){
  if(!file.isFile()||!(entry.name==='pc-rfcomm'?/\.json$/i.test(file.name):/\.(?:log|bak|txt)(?:\.[\d]+)?$/i.test(file.name)))continue;
  const filename=path.join(folder,file.name),st=fs.lstatSync(filename);privateBytes+=st.size;
  if(st.isSymbolicLink()||st.size>33554432||privateBytes>268435456)throw Error('PrivateInputLimit');
  const raw=fs.readFileSync(filename);if(raw.includes(0))throw Error('PrivateInputEncodingRefused');
  privateText(raw.toString('utf8'));privateFilesScanned++;
 }
}
const findings=[],add=(_sha,file,category)=>findings.push({path:file,category});
const payload=git(['cat-file','--batch'],blobs.map(row=>row[0]).join('\n')+'\n');
let at=0,bytes=0;
for(const [sha,,sizeText]of blobs){
 const end=payload.indexOf(10,at),header=payload.subarray(at,end).toString('ascii').split(' '),size=Number(sizeText);
 if(header[0]!==sha||Number(header[2])!==size)throw Error('GitAuditFramingFailed');
 const body=payload.subarray(end+1,end+1+size);at=end+size+2;bytes+=size;
 const file=paths.get(sha)??'';
 if(/(?:^|\/)(?:artifacts|build|local)(?:\/|$)/i.test(file)||/\.(?:wad|elf|rpk|bin|apk|exe|dll|msi|zip|7z|log|bak|pem|key|keystore)$/i.test(file))add(sha,file,'private-or-binary-path');
 const lower=body.toString('utf8').toLowerCase();
 for(const secret of secrets)if(lower.includes(secret.value))add(sha,file,secret.kind);
 if(body.includes(0)){
  if(file!=='docs/images/native-framebuffer-pattern.png')add(sha,file,'unreviewed-binary');
  continue;
 }
 const text=body.toString('utf8');
 if(/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))add(sha,file,'credential-pattern');
}
if(at!==payload.length)throw Error('GitAuditTrailingData');
const report={passed:findings.length===0,commits:Number(git(['rev-list','--count','HEAD']).toString()),reachableBlobs:blobs.length,totalBlobBytes:bytes,privateValuesChecked:secrets.length,privateFilesScanned,findings,
 scope:'reachable Git history; known current/historical authorization values, device addresses and serials from local private inputs plus selected credential/binary patterns; not a complete secret detector'};
fs.mkdirSync(path.join(root,'artifacts/publish'),{recursive:true});
fs.writeFileSync(path.join(root,'artifacts/publish/git-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));process.exitCode=report.passed?0:1;
