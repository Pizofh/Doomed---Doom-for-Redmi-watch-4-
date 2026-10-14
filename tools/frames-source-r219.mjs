import fs from 'node:fs';
import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root,sha256};
export const frameId='365219980';
function insert(text,token,value){if(text.split(token).length!==2)throw Error('TemplateChanged');return text.replace(token,value);}
export function framesSource(){
 const base=path.join(root,'experiments/hello-native-rw4'),read=n=>fs.readFileSync(path.join(base,n),'utf8');
 const controller=read('log-controller-r211.lua'),normalizer=read('path-r201.lua'),ui=read('frames-ui-r219.lua'),template=read('frames-main-r219.lua');
 if(sha256(Buffer.from(controller))!=='ae7d632d6a089ba46696fcf1bf575ef32266086380e7da484f1c6f4aa19815fd')throw Error('ReviewedControllerChanged');
 const old=read('log-adapter-r211.lua');
 let inventory=old.slice(old.indexOf('local M = {}'),old.indexOf('function M.new('))+'return M\n';
 inventory=insert(inventory,'"rw4logr211"','"rw4framesr218"');
 inventory=insert(inventory,'words[1] == "rw4minr202"','words[1] == "rw4minr202" or words[1] == "rw4logr211"');
 const adapter=insert(insert(read('frames-adapter-r219.lua'),'__PATH_NORMALIZER_SOURCE__',normalizer),'__INVENTORY_SOURCE__',inventory);
 const elf=fs.readFileSync(path.join(root,'build/hello-native-rw4/r218-rw4/frames.elf'));
 if(elf.length!==2780||sha256(elf)!=='80b75ebe516a80a931ac30e93a4d30cc76eb137e8bc7d57195091a680ad5f636')throw Error('ElfChanged');
 let source=template;
 for(const [token,value] of [['__UI_SOURCE__',ui],['__CONTROLLER_SOURCE__',controller],['__ADAPTER_SOURCE__',adapter],['__RW4_ELF_BASE64__',elf.toString('base64')]])source=insert(source,token,value);
 // Strip only standalone comments, indentation and empty lines; keep tokens,
 // inline comments and string contents intact. This fits the reviewed TX budget.
 source=source.replace(/^[ \t]*--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source)||/\b(?:load|loadfile|dofile)\s*\(/.test(source.replace(/^\s*--.*$/gm,'')))throw Error('UnreviewedSource');
 return {source,controller,normalizer,ui,template,adapter,inventory,elf};
}
