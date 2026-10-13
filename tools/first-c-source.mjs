// Materialize only our reviewed source and our fixed integer-only ELF.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const firstCRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
export function firstCSource(){
  const base=path.join(firstCRoot,'experiments/hello-native-rw4');
  const controller=fs.readFileSync(path.join(base,'controller.lua'),'utf8');
  const adapter=fs.readFileSync(path.join(base,'shell-adapter.lua'),'utf8');
  const template=fs.readFileSync(path.join(base,'main.lua'),'utf8');
  const elf=fs.readFileSync(path.join(firstCRoot,'build/hello-native-rw4/r194/minimal.elf'));
  if(elf.length!==784||sha256(elf)!=='8248f76bdabd9c44aee6df46e8ba4d8c999acc9ca1d0c8367e1652ce0675da6d'||controller.includes(']==]')||adapter.includes(']==]'))throw Error('InputChanged');
  let source=template;
  for(const [token,value] of [['__CONTROLLER_SOURCE__',controller],['__ADAPTER_SOURCE__',adapter],['__RW4_ELF_HEX__',elf.toString('hex')]]){
    if(source.split(token).length!==2)throw Error('TemplateChanged');source=source.replace(token,value);
  }
  if(Buffer.byteLength(source)>24576||/__[A-Z_]+__/.test(source))throw Error('SourceLimit');
  return {source,controller,adapter,template,elf};
}
