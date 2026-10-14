// Assemble factories only. No package, physical profile or transport.
import fs from 'node:fs';import path from 'node:path';
import {firstCRoot as root,sha256} from './first-c-source.mjs';
export {root,sha256};
export function stepCarrierSource(){
 const read=n=>fs.readFileSync(path.join(root,n),'utf8');
 const client=read('experiments/native-step/client-rw4-r235.lua');
 const normalizer=read('experiments/hello-native-rw4/path-r201.lua');
 let adapter=read('experiments/native-step/adapter-rw4-r235.lua');
 if(adapter.split('__PATH_NORMALIZER_SOURCE__').length!==2)throw Error('TemplateChanged');
 adapter=adapter.replace('__PATH_NORMALIZER_SOURCE__',normalizer);
 const elf=fs.readFileSync(path.join(root,'build/native-step-rw4-r234/step.elf'));
 const report=JSON.parse(read('build/native-step-rw4-r234/review.json'));
 if(elf.length!==2620||sha256(elf)!=='713fe535880f2cbae928efe5199d15b0c39a01bc455aab819f8a534cbab4d424'||report.elfSha256!==sha256(elf)||
    report.sourceSha256!==sha256(fs.readFileSync(path.join(root,'experiments/native-step/bridge-rw4-r234.c')))||
    report.coreSha256!==sha256(fs.readFileSync(path.join(root,'experiments/native-step/core-r229.h'))))throw Error('CandidateChanged');
 for(const text of [client,adapter])if(text.includes(']====]')||/__[A-Z_]+__/.test(text)||/\b(?:load|dofile|loadfile)\s*\(/.test(text.replace(/^\s*--.*$/gm,'')))throw Error('DynamicSource');
 return {client,adapter,normalizer,elf};
}
