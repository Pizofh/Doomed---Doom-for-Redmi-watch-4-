import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';export {root,sha256};
export function procViewSource(){
 const pathSource=fs.readFileSync(path.join(root,'experiments/hello-native-rw4/path-r201.lua'),'utf8');
 if(sha256(Buffer.from(pathSource))!=='4edc7473370f3ce624a67df1b5fa77b42ca0bb4e867aca9ad554e0e01558ddbf')throw Error('NormalizerChanged');
 let source=fs.readFileSync(path.join(root,'experiments/native-step/proc-view-r246.lua'),'utf8');
 if(source.split('__PATH_SOURCE__').length!==2)throw Error('TemplateChanged');
 source=source.replace('__PATH_SOURCE__',()=>pathSource);
 if(Buffer.byteLength(source)>20000||/__PATH_SOURCE__|\b(?:execute|remove|insmod|rmmod|register_driver|unregister_driver|loadfile|dofile)\s*\(|\/dev\//.test(source))throw Error('ScopeChanged');
 return source;
}
