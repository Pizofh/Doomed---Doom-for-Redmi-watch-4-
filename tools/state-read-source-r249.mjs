import fs from 'node:fs';import path from 'node:path';import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root,sha256};
export function stateReadSource(){
 const observation=fs.readFileSync(path.join(root,'experiments/native-step/proc-own-record-r248.lua'),'utf8'),normalizer=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/path-r201.lua'),'utf8');
 if(sha256(Buffer.from(observation))!=='19d01972e4da124c634569c71c36f75d8034ce7f550865428449abb5111403b5'||sha256(Buffer.from(normalizer))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('DependencyChanged');
 let backend=fs.readFileSync(path.join(root,'experiments/native-step/state-read-r249.lua'),'utf8');
 if(backend.split('__OBSERVATION_SOURCE__').length!==2)throw Error('BackendTemplateChanged');backend=backend.replace('__OBSERVATION_SOURCE__',()=>observation);
 let source=fs.readFileSync(path.join(root,'experiments/native-step/state-read-main-r249.lua'),'utf8');
 for(const [token,value]of [['__PATH_SOURCE__',normalizer],['__BACKEND_SOURCE__',backend]]){if(source.split(token).length!==2)throw Error('MainTemplateChanged');source=source.replace(token,()=>value);}
 if(Buffer.byteLength(source)>24576||/__[A-Z_]+__|\b(?:execute|remove|insmod|rmmod|register_driver|unregister_driver|loadfile|dofile)\s*\(/.test(source))throw Error('ScopeChanged');
 return {source,backend};
}
