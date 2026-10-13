// Verify cached primary source bytes, never execute/compile them or use ADB.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectRoot} from './verify-emulator.mjs';
if(process.argv.length!==2)throw Error('NoArguments');
const manifest=JSON.parse(fs.readFileSync(path.join(projectRoot,'docs/lua-font-sources-r183.json'),'utf8'));
if(manifest.checkpoint!=='R183'||manifest.cacheDirectory!=='artifacts/research/lua-fonts-r183'||manifest.files.length!==10)throw Error('UnexpectedManifest');
const folder=path.join(projectRoot,manifest.cacheDirectory);
if(fs.lstatSync(folder).isSymbolicLink())throw Error('UnexpectedCache');
for(const file of manifest.files){
  if(!/^[A-Za-z0-9.-]+$/.test(file.name)||file.bytes>65536)throw Error('UnexpectedEntry');
  const target=path.join(folder,file.name),stat=fs.lstatSync(target);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==file.bytes)throw Error('UnexpectedFile');
  const bytes=fs.readFileSync(target);
  const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  if(blob!==file.gitBlobSha1||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('SourceChanged');
}
console.log(JSON.stringify({checkpoint:'R183',sourceFilesVerified:10,executed:false,physicalTransport:false}));
