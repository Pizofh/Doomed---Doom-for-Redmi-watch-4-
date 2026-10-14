// Assemble a Lua-only diagnostic, with no module operation or node access.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,stepCarrierSource} from './step-carrier-source-r235.mjs';
export {root,sha256};
export function stepDiagnosticSource(){
 const {elf}=stepCarrierSource(),diagnostic=fs.readFileSync(path.join(root,'experiments/native-step/diagnostic-r238.lua'),'utf8');
 let source=fs.readFileSync(path.join(root,'experiments/native-step/diagnostic-main-r238.lua'),'utf8');
 for(const [token,value]of [['__DIAGNOSTIC_SOURCE__',diagnostic],['__ELF_HEX__',elf.toString('hex')]]){
  if(source.split(token).length!==2)throw Error('TemplateChanged');source=source.replace(token,value);
 }
 source=source.replace(/^[ \t]*--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source)||/\b(?:insmod|rmmod|register_driver|unregister_driver|loadfile|dofile)\b|\/dev\//.test(source))throw Error('DiagnosticScopeChanged');
 return {source,diagnostic,elfComparisonBytes:elf};
}
