// Corrected path handling, preserving the prior fixed payload as evidence.
import fs from 'node:fs';import path from 'node:path';
import {root,sha256,registrySource as priorSource} from './registry-source-r241.mjs';
export {root,sha256};
export function registrySource(){
 const prior=priorSource();
 if(sha256(Buffer.from(prior.source))!=='0abc68497640495a6189fcb50dae35fcefeb5a6a5c55a3b31b2945f1745f462a')throw Error('PriorSourceChanged');
 const normalizer=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/path-r201.lua'),'utf8');
 if(sha256(Buffer.from(normalizer))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('NormalizerChanged');
 let source=prior.source.replaceAll('365219975','365219974').replaceAll('r241','r243').replaceAll('R241','R243');
 for(const [from,to]of [
  ['assert(SCRIPT_PATH==own)',"local canonical=(function()\n"+normalizer+"\nend)().normalize(SCRIPT_PATH,'365219974')\nassert(canonical==own)"],
  ['src=SCRIPT_PATH..name','src=canonical..name']
 ]){if(source.split(from).length!==2)throw Error('TemplateChanged');source=source.replace(from,()=>to);}
 if(/365219975|r241|R241|assert\(SCRIPT_PATH==own\)|src=SCRIPT_PATH/.test(source)||Buffer.byteLength(source)>20000)throw Error('ScopeChanged');
 return {reader:prior.reader,source,priorSource:prior.source};
}
