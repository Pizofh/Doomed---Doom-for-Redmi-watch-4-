// SPDX-License-Identifier: GPL-2.0-only
// Source-only snapshot. Never follows ignored files or connects to hardware.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'build/public-source');
if(process.argv.length!==2)throw Error('No arguments supported');
if(fs.existsSync(output))throw Error('Output exists; preserve or move it before exporting again');
const hash=b=>createHash('sha256').update(b).digest('hex');
const run=spawnSync(process.execPath,['tools/audit-git-publish.mjs'],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
if(run.error||run.status!==0)throw Error('Publication audit failed; see artifacts/publish/git-audit.json');
const audit=JSON.parse(run.stdout);
const tracked=spawnSync('git',['-c','safe.directory='+root.replaceAll('\\','/').replace(/\/$/,''),'ls-files','-z','--cached'],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
if(tracked.status!==0)throw Error('Source inventory failed');
const guides=new Set(['README.md','CHANGELOG.md','LICENSE','LICENSING.md','.gitignore','.gitattributes',
 'docs/delivery.md','docs/getting-started.md','docs/playing.md','docs/architecture.md','docs/project-results.md','docs/local-storage.md',
 'third_party/README.md','third_party/dependencies.lock.json','third_party/openvela-emulator-binaries.lock.json','doom/platform-rw4/README.md']);
const allowed=filename=>guides.has(filename)||
 /^(doom|tools|scripts|experiments)\//.test(filename)&&/\.(mjs|js|c|h|S|lua|ld|json|ps1|java|cs)$/.test(filename)||
 /^doom\/platform-rw4\/packed\/TINF-LICENSE\.txt$/.test(filename)||
 /^\.github\/workflows\/[a-z0-9-]+\.yml$/.test(filename);
const denied=/(^|\/)(local|build|artifacts|\.git)(\/|$)|\.(wad|elf|face|bin|apk|exe|dll|zip|7z|log|key|pem|dsg|rw4)$/i;
const names=[...new Set(tracked.stdout.split('\0').filter(Boolean))].filter(allowed).sort();
const buffers=new Map();
for(const name of names){
 if(denied.test(name)||name.split('/').includes('..'))throw Error('Excluded path: '+name);
 const filename=path.join(root,name),st=fs.lstatSync(filename);
 if(st.isSymbolicLink()||!st.isFile()||st.size>2*1024*1024)throw Error('Invalid source: '+name);
 const bytes=fs.readFileSync(filename);
 if(bytes.includes(0)||/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})\b/.test(bytes.toString('utf8')))throw Error('Source audit refused: '+name);
 buffers.set(name,bytes);
}
// Check all guide links before writing the export.
for(const [name,bytes]of buffers){
 if(!name.endsWith('.md'))continue;
 for(const match of bytes.toString('utf8').matchAll(/\]\(([^)]+)\)/g)){
  const target=match[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(name),target));
  if(!buffers.has(resolved))throw Error('Missing public link: '+name+' -> '+resolved);
 }
}
fs.mkdirSync(output,{recursive:true});
for(const [name,bytes]of buffers){const file=path.join(output,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});if(hash(fs.readFileSync(file))!==hash(bytes))throw Error('Copy verification failed');}
const manifest={format:1,kind:'source-only',files:[...buffers].map(([name,b])=>({name,bytes:b.length,sha256:hash(b)})),
 totalBytes:[...buffers.values()].reduce((sum,b)=>sum+b.length,0),documentation:'curated; intermediate research notes omitted',
 gameDataIncluded:false,credentialsIncluded:false,gitHistoryIncluded:false,cleanBuildValidated:false,
 historyAudit:{passed:audit.passed,reachableBlobs:audit.reachableBlobs}};
fs.writeFileSync(path.join(output,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(output,'SHA256SUMS.txt'),manifest.files.map(f=>f.sha256+'  '+f.name).join('\n')+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'PublicSourcePrepared',output,files:manifest.files.length,bytes:manifest.totalBytes,docs:[...buffers.keys()].filter(n=>n.endsWith('.md')),watchOperationPerformed:false}));
