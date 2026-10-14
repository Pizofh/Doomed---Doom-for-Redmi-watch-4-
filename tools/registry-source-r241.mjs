// Fixed Lua-only registry UI. R240 reader remains unchanged as prior evidence.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root,sha256};
export function registrySource(){
 let reader=fs.readFileSync(path.join(root,'experiments/native-step/registry-r240.lua'),'utf8');
 if(sha256(Buffer.from(reader))!=='dce2b453b8eda83d1a648bc31a5dcce8858655ad00da3d2f45823472efecdc4d')throw Error('ReaderChanged');
 const token='    local closed,ok=pcall(function()return f:close()end)';
 if(reader.split(token).length!==2)throw Error('ReaderTemplateChanged');
 reader=reader.replace(token,'    report.openConfirmed=true\n    report.readConfirmed=readOk and text~=nil\n'+token);
 let source=fs.readFileSync(path.join(root,'experiments/native-step/registry-main-r241.lua'),'utf8');
 if(source.split('__READER_SOURCE__').length!==2)throw Error('MainTemplateChanged');
 source=source.replace('__READER_SOURCE__',()=>reader).replace(/^[ \t]*--[^\r\n]*\r?\n/gm,'').replace(/^[ \t]+/gm,'').replace(/^\r?\n/gm,'');
 if(Buffer.byteLength(source)>20000||/__[A-Z_]+__|\b(?:execute|remove|insmod|rmmod|register_driver|unregister_driver|loadfile|dofile)\s*\(|\/dev\//.test(source))throw Error('RegistryScopeChanged');
 return {reader,source};
}
