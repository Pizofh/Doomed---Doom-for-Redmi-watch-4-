// Successor source uses static Lua factories and the same pinned tiny ELF.
import fs from 'node:fs';
import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root as firstCRoot,sha256};
const insert=(text,token,value)=>{
 if(text.split(token).length!==2)throw Error('TemplateChanged');return text.replace(token,value);
};
export function firstCSource(){
 const base=path.join(root,'experiments/hello-native-rw4');
 const read=name=>fs.readFileSync(path.join(base,name),'utf8');
 const controller=read('controller.lua'),ui=read('ui-r199.lua'),normalizer=read('path-r201.lua');
 const adapterTemplate=read('shell-adapter-r202.lua'),template=read('main-r202.lua');
 const elf=fs.readFileSync(path.join(root,'build/hello-native-rw4/r194/minimal.elf'));
 if(elf.length!==784||sha256(elf)!=='8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d')throw Error('ElfChanged');
 const adapter=insert(adapterTemplate,'__PATH_NORMALIZER_SOURCE__',normalizer);
 let source=template;
 for(const [token,value] of [['__UI_SOURCE__',ui],['__CONTROLLER_SOURCE__',controller],['__ADAPTER_SOURCE__',adapter],['__RW4_ELF_HEX__',elf.toString('hex')]])source=insert(source,token,value);
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source)||/\b(?:load|loadfile|dofile)\s*\(/.test(source.replace(/^\s*--.*$/gm,'')))throw Error('UnreviewedDynamicSource');
 return {source,controller,adapter,adapterTemplate,template,ui,normalizer,elf};
}
