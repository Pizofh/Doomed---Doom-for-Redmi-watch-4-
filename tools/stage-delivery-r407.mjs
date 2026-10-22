// SPDX-License-Identifier: GPL-2.0-only
// Stages an offline preparation toolkit. No WAD bytes or connection secrets.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {root,sha256,deliveryLauncher} from './doom-delivery-r407.mjs';
const p=deliveryLauncher(),dir=path.join(root,'build/doom-delivery-r407/package'),r=JSON.parse(fs.readFileSync(path.join(dir,'review.json'))),template=fs.readFileSync(path.join(dir,'DoomDeliveryTemplate-id-only.face'));
assert.equal(sha256(template),r.sha256);assert.equal(r.sourceSha256,p.sourceSha256);assert(r.firstInstall&&!r.initialCarrierRequired&&r.zeroGamePlaceholder);assert.equal(r.config.id,'365220017');
for(const e of r.entries){const b=fs.readFileSync(path.join(dir,'app/lua',e.name));assert.equal(sha256(b),e.sha256);assert(template.subarray(e.offset,e.offset+e.size).equals(b));}
const entry=r.entries.find(e=>e.name==='doom2-r384.wad');assert(entry);assert(template.subarray(entry.offset,entry.offset+entry.size).every(n=>n===0));assert(!template.includes(Buffer.from('import.lua')));
const packed=fs.readFileSync(path.join(root,'build/doom2-r384/doom.rwc')),identity=JSON.parse(fs.readFileSync(path.join(root,'build/doom2-r384/packed.json')));assert.equal(sha256(packed),identity.packedSha256);assert.equal(packed.length,entry.size);
const privateFace=Buffer.from(template);packed.copy(privateFace,entry.offset);
const manifest={schema:1,version:'0.2.0-preparation-r407',id:r.id,model:'M2315W1',firmware:'2.2.86',faceBytes:template.length,templateSha256:sha256(template),wadOffset:entry.offset,packedBytes:entry.size,packedSha256:identity.packedSha256,privateFaceSha256:sha256(privateFace),sourceSha256:p.sourceSha256,firstInstall:true,previousFaceRequired:false,hardwareValidated:false,installationEnabled:false};
const out=path.join(root,'build/releases/Doomed-prepare-r407');assert(!fs.existsSync(out),'Preserve previous toolkit output');fs.mkdirSync(out,{recursive:true});
const files=new Map([['prepare.mjs',fs.readFileSync(path.join(root,'tools/delivery/prepare.mjs'))],['template.face',template],['release.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n')],['LICENSE',fs.readFileSync(path.join(root,'LICENSE'))],['LEEME.md',fs.readFileSync(path.join(root,'docs/delivery.md'))],['Preparar.cmd',Buffer.from('@echo off\r\nsetlocal\r\nwhere node >nul 2>nul\r\nif errorlevel 1 (\r\n echo Instala Node.js 22 o posterior y vuelve a abrir Preparar.cmd.\r\n pause\r\n exit /b 1\r\n)\r\nnode "%~dp0prepare.mjs" %*\r\nset "prepareExit=%errorlevel%"\r\npause\r\nexit /b %prepareExit%\r\n')]]);
for(const [name,b]of files)fs.writeFileSync(path.join(out,name),b,{flag:'wx'});
fs.writeFileSync(path.join(out,'SHA256SUMS.txt'),[...files].map(([name,b])=>sha256(b)+'  '+name).join('\n')+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'OfflineToolkitStaged',output:out,files:[...files.keys()],bytes:[...files.values()].reduce((n,b)=>n+b.length,0),wadIncluded:false,connectionDataIncluded:false,installed:false,hardwareValidated:false}));
