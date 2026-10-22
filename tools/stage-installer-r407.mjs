// SPDX-License-Identifier: GPL-2.0-only
// Exact offline toolkit plus minimal transport runtime; no owner inputs copied.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {reviewedLargeExecutable} from './doom-upload-pc-pipe.mjs';import {physicalDoomDelivery407Enabled} from './doom-deployment-physical.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'build/releases/Doomed-setup-r407'),prepared=path.join(root,'build/releases/Doomed-prepare-r407'),hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(process.argv.length,2);assert(!fs.existsSync(out),'Preserve previous staged setup');assert(!physicalDoomDelivery407Enabled());
const dependencies=new Map();
function collect(relative){
 relative=relative.replaceAll('\\','/');assert(!relative.startsWith('../')&&!path.isAbsolute(relative));if(dependencies.has(relative))return;
 const file=path.join(root,relative),st=fs.lstatSync(file);assert(st.isFile()&&!st.isSymbolicLink()&&st.size<2*1024*1024);const b=fs.readFileSync(file);dependencies.set(relative,b);
 const s=b.toString('utf8');for(const re of [/\bfrom\s*['"](\.[^'"]+)['"]/g,/\bimport\s*['"](\.[^'"]+)['"]/g,/\bimport\(\s*['"](\.[^'"]+)['"]\s*\)/g])for(const m of s.matchAll(re))collect(path.posix.normalize(path.posix.join(path.posix.dirname(relative),m[1])));
}
for(const file of ['tools/delivery/configure.mjs','tools/delivery/install.mjs','tools/pc-doom-delivery-r407.mjs'])collect(file);
const native=reviewedLargeExecutable(),meta=JSON.parse(fs.readFileSync(path.join(root,'artifacts/pc-rfcomm/build.json')));
for(const file of Object.keys(meta.sourceHashes)){const rel='experiments/pc-rfcomm/'+file,b=fs.readFileSync(path.join(root,rel));assert.equal(hash(b),meta.sourceHashes[file]);if(file==='Probe.cs')for(const flag of ['StaticPhysicalReviewed','LargePhysicalReviewed','RetailPhysicalReviewed'])assert(b.toString().includes('private static readonly bool '+flag+' = false;'));dependencies.set(rel,b);}
dependencies.set('artifacts/pc-rfcomm/Rw4PcRfcomm.exe',fs.readFileSync(native));dependencies.set('artifacts/pc-rfcomm/build.json',Buffer.from(JSON.stringify(meta,null,2)+'\n'));
const files=new Map();for(const name of ['prepare.mjs','template.face','release.json','LICENSE','Preparar.cmd'])files.set(name,fs.readFileSync(path.join(prepared,name)));
files.set('LEEME.md',fs.readFileSync(path.join(root,'docs/delivery.md')));
for(const [name,b]of dependencies)files.set('runtime/'+name,b);
const wrapper=entry=>Buffer.from('@echo off\r\nsetlocal\r\nwhere node >nul 2>nul\r\nif errorlevel 1 (\r\n echo Instala Node.js 22 o posterior.\r\n pause\r\n exit /b 1\r\n)\r\nnode "%~dp0runtime\\tools\\delivery\\'+entry+'.mjs" %*\r\nset "deliveryExit=%errorlevel%"\r\npause\r\nexit /b %deliveryExit%\r\n');
files.set('Configurar.cmd',wrapper('configure'));files.set('Instalar.cmd',wrapper('install'));files.set('.gitignore',Buffer.from('/mi-paquete/\n/runtime/tools/local/\n/runtime/artifacts/doom-deployment-*/\n'));
for(const [name,b]of files){assert(!/runtime\/tools\/local\//.test(name));const file=path.join(out,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,b,{flag:'wx'});assert.equal(hash(fs.readFileSync(file)),hash(b));}
const manifest={schema:1,status:'hardware-validation-pending',physicalInstallationEnabled:false,ownerCredentialsIncluded:false,wadIncluded:false,files:[...files].map(([name,b])=>({name,bytes:b.length,sha256:hash(b)}))};fs.writeFileSync(path.join(out,'toolkit-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),manifest.files.map(f=>f.sha256+'  '+f.name).join('\n')+'\n',{flag:'wx'});console.log(JSON.stringify({status:'SetupToolkitStaged',output:out,files:files.size,runtimeSources:dependencies.size,physicalGateClosed:true,ownerInputsCopied:false,deviceOperationPerformed:false}));
