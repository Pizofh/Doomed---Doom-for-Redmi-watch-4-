// Materialize fixed candidate and static factories only; no transport.
import fs from 'node:fs';
import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root as firstCRoot,sha256};
const insert=(text,token,value)=>{
 if(text.split(token).length!==2)throw Error('TemplateChanged');return text.replace(token,value);
};
export function firstCSource(){
 const base=path.join(root,'experiments/hello-native-rw4'),read=n=>fs.readFileSync(path.join(base,n),'utf8');
 const controller=read('log-controller-r211.lua'),normalizer=read('path-r201.lua');
 const oldUi=read('ui-r199.lua');
 if(sha256(Buffer.from(oldUi))!=='807119943a71900d5a73e9da4c27045f59e06ae266ff6e97dce2b7ebc3aa9592')throw Error('ReviewedUiChanged');
 const ui=insert(oldUi,'result.load_observed == true,','result.load_observed == true and result.message_verified == true,');
 const adapterTemplate=read('log-adapter-r211.lua'),template=read('main-r211.lua');
 const elf=fs.readFileSync(path.join(root,'build/hello-native-rw4/r214/log.elf'));
 if(elf.length!==1500||sha256(elf)!=='9dff873fd6d41669de0d336528a35c7c281fa1e03ee1eb5ebcddd6d6907ca652')throw Error('ElfChanged');
 const adapter=insert(adapterTemplate,'__PATH_NORMALIZER_SOURCE__',normalizer);
 let source=template;
 for(const [token,value] of [['__UI_SOURCE__',ui],['__CONTROLLER_SOURCE__',controller],['__ADAPTER_SOURCE__',adapter],['__RW4_ELF_HEX__',elf.toString('hex')]])source=insert(source,token,value);
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source)||/\b(?:load|loadfile|dofile)\s*\(/.test(source.replace(/^\s*--.*$/gm,'')))throw Error('UnreviewedDynamicSource');
 return {source,controller,adapter,adapterTemplate,template,ui,oldUi,normalizer,elf};
}
