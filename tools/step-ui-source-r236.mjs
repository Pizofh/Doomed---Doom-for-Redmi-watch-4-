// Source composition only. Fixed native candidate bytes; no deployment.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,stepCarrierSource} from './step-carrier-source-r235.mjs';
export {root,sha256};
export function rw4StepUiSource(){
 const parts=stepCarrierSource(),ui=fs.readFileSync(path.join(root,'experiments/native-step/ui-r236.lua'),'utf8');
 let source=fs.readFileSync(path.join(root,'experiments/native-step/main-r236.lua'),'utf8');
 const evidence=JSON.parse(fs.readFileSync(path.join(root,'artifacts/emulator/step-carrier-r235-reviewed/summary.json'),'utf8'));
 if(evidence.scenariosPassed!==37||evidence.clientSha256!==sha256(Buffer.from(parts.client))||evidence.adapterSha256!==sha256(Buffer.from(parts.adapter))||!evidence.ownGuestFilesRemoved)throw Error('CarrierEvidenceChanged');
 const anchor='function b.check_file() local bytes,state=read(elf,2621);return state=="present" and bytes==expected end';
 const materialize=fs.readFileSync(path.join(root,'experiments/native-step/materialize-r236.lua'),'utf8');
 if(parts.adapter.split(anchor).length!==2)throw Error('AdapterAnchorChanged');
 parts.adapter=parts.adapter.replace(anchor,materialize.trim());
 const writeAnchor='with_file(node,"wb",function(f)';
 if(parts.adapter.split(writeAnchor).length!==2)throw Error('NodeWriteAnchorChanged');
 // r+b never creates/truncates a regular file if the owned node disappears.
 parts.adapter=parts.adapter.replace(writeAnchor,'with_file(node,"r+b",function(f)');
 for(const [token,value]of [['__CLIENT_SOURCE__',parts.client],['__ADAPTER_SOURCE__',parts.adapter],['__UI_SOURCE__',ui],['__ELF_HEX__',parts.elf.toString('hex')]]){
  if(source.split(token).length!==2)throw Error('TemplateChanged');source=source.replace(token,value);
 }
 // Same whitespace-only compaction used by NativeFrames. No token rewriting.
 source=source.replace(/^[ \t]*--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source)||/\b(?:load|loadfile|dofile)\s*\(/.test(source.replace(/^\s*--.*$/gm,'')))throw Error('SourceRefused');
 return {...parts,ui,source};
}
