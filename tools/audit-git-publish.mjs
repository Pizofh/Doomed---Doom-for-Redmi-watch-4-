// Local export preflight. Scans reachable Git blobs, not ignored dependencies.
// Findings show paths/categories only, never secret values or matching lines.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(process.argv.length!==2)throw Error('No arguments accepted');
function git(args,input){
 const run=spawnSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),...args],{cwd:root,input,windowsHide:true,shell:false,maxBuffer:96*1024*1024});
 if(run.error||run.status!==0)throw Error('GitAuditFailed');return run.stdout;
}
const references=git(['rev-list','--objects','--all']).toString('utf8').trim().split('\n');
const paths=new Map(references.map(line=>{const at=line.indexOf(' ');return at<0?[line,'']:[line.slice(0,at),line.slice(at+1)];}));
const metadata=git(['cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize)'],[...paths.keys()].join('\n')+'\n').toString('utf8').trim().split('\n');
const blobs=metadata.map(line=>line.split(' ')).filter(row=>row[1]==='blob');
const secrets=[];
const auth=path.join(root,'tools/local/pc-rfcomm/auth.json'),target=path.join(root,'tools/local/pc-rfcomm/target.json');
if(fs.existsSync(auth)){
 const key=JSON.parse(fs.readFileSync(auth,'utf8')).authKey;
 if(typeof key==='string'&&/^(?:0x)?[a-f\d]{32}$/i.test(key))secrets.push({kind:'current-watch-key',value:key.replace(/^0x/,'').toLowerCase()});
}
if(fs.existsSync(target)){
 const address=JSON.parse(fs.readFileSync(target,'utf8')).address;
 if(typeof address==='string'&&/^[a-f\d:-]{12,17}$/i.test(address)){
  const compact=address.replace(/[:-]/g,'').toLowerCase();
  for(const value of [compact,compact.match(/../g).join(':'),compact.match(/../g).join('-')])secrets.push({kind:'current-watch-address',value});
 }
}
const findings=[],add=(sha,file,category)=>findings.push({blob:sha,path:file,category});
const payload=git(['cat-file','--batch'],blobs.map(row=>row[0]).join('\n')+'\n');
let at=0,bytes=0;
for(const [sha,,sizeText]of blobs){
 const end=payload.indexOf(10,at),header=payload.subarray(at,end).toString('ascii').split(' '),size=Number(sizeText);
 if(header[0]!==sha||Number(header[2])!==size)throw Error('GitAuditFramingFailed');
 const body=payload.subarray(end+1,end+1+size);at=end+size+2;bytes+=size;
 const file=paths.get(sha)??'';
 if(/(?:^|\/)(?:artifacts|build|local)(?:\/|$)/i.test(file)||/\.(?:wad|elf|rpk|bin|apk|exe|dll|msi|zip|7z|log|bak|pem|key|keystore)$/i.test(file))add(sha,file,'private-or-binary-path');
 if(body.includes(0)){
  if(file!=='docs/images/native-framebuffer-pattern.png')add(sha,file,'unreviewed-binary');
  continue;
 }
 const text=body.toString('utf8'),lower=text.toLowerCase();
 for(const secret of secrets)if(lower.includes(secret.value))add(sha,file,secret.kind);
 if(/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))add(sha,file,'credential-pattern');
}
if(at!==payload.length)throw Error('GitAuditTrailingData');
const report={passed:findings.length===0,commits:Number(git(['rev-list','--count','HEAD']).toString()),reachableBlobs:blobs.length,totalBlobBytes:bytes,currentPrivateValuesChecked:secrets.length,findings,
 scope:'reachable Git history; known current watch credentials and selected credential/binary patterns; not a complete secret detector'};
fs.mkdirSync(path.join(root,'artifacts/publish'),{recursive:true});
fs.writeFileSync(path.join(root,'artifacts/publish/git-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));process.exitCode=report.passed?0:1;
