import fs from 'node:fs';import path from 'node:path';import {root,sha256} from './control-source-r263.mjs';
export {root,sha256};
export function exitSource(){
 const observation=fs.readFileSync(path.join(root,'experiments/native-step/proc-own-record-r261.lua'),'utf8'),normalizer=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/path-r201.lua'),'utf8');
 if(sha256(Buffer.from(observation))!=='a6a3ebbe1d2466a361cde2cad71c1116d7f39ca85c0bf20f3becbc3e11611e0f'||sha256(Buffer.from(normalizer))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('DependencyChanged');
 let backend=fs.readFileSync(path.join(root,'experiments/native-step/exit-r265.lua'),'utf8');if(backend.split('__OBSERVATION_SOURCE__').length!==2)throw Error('BackendTemplateChanged');backend=backend.replace('__OBSERVATION_SOURCE__',()=>observation);
 let source=fs.readFileSync(path.join(root,'experiments/native-step/exit-main-r265.lua'),'utf8');for(const[token,value]of[['__PATH_SOURCE__',normalizer],['__BACKEND_SOURCE__',backend]]){if(source.split(token).length!==2)throw Error('MainTemplateChanged');source=source.replace(token,()=>value);}
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__|\b(?:remove|insmod|register_driver|unregister_driver|loadfile|dofile)\s*\(/.test(source)||source.includes("'r+b'"))throw Error('ScopeChanged');
 return {source,backend};
}
