// Materialize immutable source text obtained through the GitHub connector.
// Never runs upstream scripts. No firmware or game assets in this snapshot.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('No arbitrary source inputs accepted');
const revision='dcb7a8dbc7a16ce3dda29382ac9aae9d77d21284';
const bundle=JSON.parse(fs.readFileSync(path.join(projectRoot,'tools/local/doomgeneric-source-bundle.json'),'utf8'));
if(bundle.revision!==revision||bundle.repository!=='ozkl/doomgeneric'||bundle.entries.length!==181)throw Error('Unexpected source bundle');
const lock=JSON.parse(fs.readFileSync(path.join(projectRoot,'doom/doomgeneric-source.lock.json')));
if(lock.revision!==revision||JSON.stringify(lock.files)!==JSON.stringify(bundle.entries.map(({path,gitBlobSha1,size})=>({path,gitBlobSha1,size}))))throw Error('Bundle differs from tracked immutable blob lock');
const root=path.join(projectRoot,'third_party/doomgeneric');
const seen=new Set();
for(const e of bundle.entries){
  if(!/^(?:LICENSE|README\.TXT|README\.md|doomgeneric\/(?:[a-z0-9_]+\.[ch]|Makefile))$/.test(e.path)||seen.has(e.path))throw Error('Unsafe/duplicate source path');
  seen.add(e.path);
  const bytes=Buffer.from(e.content,'utf8');
  const actual=crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if(bytes.length!==e.size||actual!==e.gitBlobSha1)throw Error('Git blob identity differs: '+e.path);
}
if(!seen.has('LICENSE')||!seen.has('doomgeneric/Makefile'))throw Error('License/build recipe missing');
if(fs.existsSync(root)&&fs.lstatSync(root).isSymbolicLink())throw Error('Source root is a link');
// All fetched bytes verified before any source is written.
for(const e of bundle.entries){
  const destination=path.join(root,e.path),parent=path.dirname(destination);
  fs.mkdirSync(parent,{recursive:true});
  if(fs.lstatSync(parent).isSymbolicLink())throw Error('Source directory is a link');
  const bytes=Buffer.from(e.content,'utf8');
  if(fs.existsSync(destination)){
    if(fs.lstatSync(destination).isSymbolicLink()||!fs.readFileSync(destination).equals(bytes))throw Error('Existing source differs: '+e.path);
  }else fs.writeFileSync(destination,bytes,{flag:'wx'});
}
const record={revision,repository:bundle.repository,transport:bundle.sourceTransport,files:bundle.entries.map(({path,gitBlobSha1,size})=>({path,gitBlobSha1,size})),
  gitCheckout:false,licensePreserved:true,upstreamScriptsExecuted:false,sourceCompiled:false};
fs.mkdirSync(path.join(projectRoot,'artifacts/package-review'),{recursive:true});
fs.writeFileSync(path.join(projectRoot,'artifacts/package-review/doomgeneric-source.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({revision,files:record.files.length,allGitBlobsMatch:true,gitCheckout:false,licensePreserved:true}));
